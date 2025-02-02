'use client';

import { useEffect, useRef, useState } from 'react';

const ScreenSharing = ({ onTranscriptionUpdate }) => {
  const mediaRecorderRef = useRef(null);
  const socketRef = useRef(null);
  const streamRef = useRef(null);
  const videoRef = useRef(null);
  const [isRecording, setIsRecording] = useState(false);

  const getSupportedMimeType = () => {
    const types = [
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/mpeg',
      'audio/ogg;codecs=opus'
    ];
    return types.find(type => MediaRecorder.isTypeSupported(type)) || '';
  };

  const startScreenShare = async () => {
    try {
      // Get screen capture stream with audio
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true
      });

      // Verify audio track availability
      if (stream.getAudioTracks().length === 0) {
        throw new Error('Please share audio when selecting your screen');
      }

      // Create separate audio stream for transcription
      const audioStream = new MediaStream(stream.getAudioTracks());
      
      // Get supported MIME type for audio recording
      const mimeType = getSupportedMimeType();
      if (!mimeType) {
        throw new Error('Browser does not support any available audio format');
      }

      // Store references
      streamRef.current = stream;
      videoRef.current.srcObject = stream;

      // Initialize media recorder with audio stream
      const mediaRecorder = new MediaRecorder(audioStream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;

      // Configure WebSocket connection to Deepgram
      const socket = new WebSocket(
        'wss://api.deepgram.com/v1/listen',
        ['token', process.env.NEXT_PUBLIC_DEEPGRAM_API_KEY]
      );
      socketRef.current = socket;

      // WebSocket open handler
      socket.onopen = () => {
        mediaRecorder.addEventListener('dataavailable', (event) => {
          if (socket.readyState === WebSocket.OPEN) {
            socket.send(event.data);
          }
        });
        mediaRecorder.start(150); // Collect 250ms chunks
      };

      // WebSocket message handler
      socket.onmessage = (message) => {
        try {
          const received = JSON.parse(message.data);
          const transcript = received.channel?.alternatives[0]?.transcript;
          if (transcript) {
            onTranscriptionUpdate(prev => `${prev} ${transcript}`.trim());
          }
        } catch (error) {
          console.error('Error processing transcript:', error);
        }
      };

      // Handle screen sharing stop from browser UI
      stream.getVideoTracks()[0].addEventListener('ended', () => {
        stopScreenShare();
      });

      setIsRecording(true);
    } catch (error) {
      console.error('Screen sharing error:', error);
      alert(error.message || 'Failed to start screen sharing');
      stopScreenShare();
    }
  };

  const stopScreenShare = () => {
    // Cleanup media resources
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current = null;
    }

    // Cleanup network resources
    if (socketRef.current) {
      if (socketRef.current.readyState === WebSocket.OPEN) {
        socketRef.current.close();
      }
      socketRef.current = null;
    }

    // Stop all media tracks
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    // Reset video element
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setIsRecording(false);
  };

  useEffect(() => {
    // Cleanup on component unmount
    return () => {
      stopScreenShare();
    };
  }, []);

  return (
    <div className="relative h-full">
      <video 
        ref={videoRef} 
        autoPlay 
        muted // Mute video to prevent audio feedback
        className="w-full h-full object-contain bg-black rounded"
      />
      <div className="absolute bottom-4 left-4">
        <button
          onClick={isRecording ? stopScreenShare : startScreenShare}
          className={`px-4 py-2 rounded ${
            isRecording 
              ? 'bg-red-500 hover:bg-red-600' 
              : 'bg-blue-500 hover:bg-blue-600'
          } text-white transition-colors`}
        >
          {isRecording ? 'Stop Sharing' : 'Start Sharing'}
        </button>
      </div>
    </div>
  );
};

export default ScreenSharing;