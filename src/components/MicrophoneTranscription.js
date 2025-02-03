'use client';

import { useEffect, useRef, useState } from 'react';

const MicrophoneTranscription = ({ onTranscriptionUpdate }) => {
  const mediaRecorderRef = useRef(null);
  const socketRef = useRef(null);
  const streamRef = useRef(null);
  const [isRecording, setIsRecording] = useState(false);

  const startTranscription = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      mediaRecorderRef.current = mediaRecorder;
      
      const socket = new WebSocket('wss://api.deepgram.com/v1/listen', 
        ['token', process.env.NEXT_PUBLIC_DEEPGRAM_API_KEY]);
      socketRef.current = socket;

      // Wait for WebSocket connection to open
      socket.onopen = () => {
        // Add dataavailable listener AFTER socket opens
        mediaRecorder.addEventListener('dataavailable', event => {
          if (socket.readyState === WebSocket.OPEN) {
            socket.send(event.data);
          }
        });
        
        // Start recording AFTER socket is open
        mediaRecorder.start(150);
        setIsRecording(true);
      };

      // Handle incoming messages
      socket.onmessage = (message) => {
        const received = JSON.parse(message.data);
        const transcript = received.channel.alternatives[0]?.transcript;
        if (transcript) {
          onTranscriptionUpdate(prev => `${prev} ${transcript}`.trim());
        }
      };

      // Handle errors
      socket.onerror = (error) => {
        console.error('WebSocket error:', error);
        stopTranscription();
      };

    } catch (error) {
      console.error('Error starting transcription:', error);
      alert('Microphone access denied. Please enable microphone permissions.');
    }
  };

  const stopTranscription = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current = null;
    }
    if (socketRef.current) {
      if (socketRef.current.readyState === WebSocket.OPEN) {
        socketRef.current.close();
      }
      socketRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsRecording(false);
  };

  return (
    <div className="fixed bottom-4 right-4">
      <button
        onClick={isRecording ? stopTranscription : startTranscription}
        className={`p-3 rounded-full ${
          isRecording 
            ? 'bg-red-500 hover:bg-red-600' 
            : 'bg-blue-500 hover:bg-blue-600'
        } text-white shadow-lg transition-all`}
      >
        {isRecording ? (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
        ) : (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"/>
          </svg>
        )}
      </button>
    </div>
  );
};

export default MicrophoneTranscription;