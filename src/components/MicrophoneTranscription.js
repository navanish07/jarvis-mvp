'use client';

import { useEffect, useRef } from 'react';

const MicrophoneTranscription = ({ onTranscriptionUpdate }) => {
  const mediaRecorderRef = useRef(null);
  const socketRef = useRef(null);

  useEffect(() => {
    const startTranscription = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        
        const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
        mediaRecorderRef.current = mediaRecorder;
        
        const socket = new WebSocket('wss://api.deepgram.com/v1/listen', ['token', process.env.NEXT_PUBLIC_DEEPGRAM_API_KEY]);
        socketRef.current = socket;

        socket.onopen = () => {
          mediaRecorder.addEventListener('dataavailable', event => {
            if (socket.readyState === WebSocket.OPEN) {
              socket.send(event.data);
            }
          });
          mediaRecorder.start(150);
        };

        socket.onmessage = (message) => {
          const received = JSON.parse(message.data);
          const transcript = received.channel.alternatives[0]?.transcript;
          if (transcript) {
            onTranscriptionUpdate(prev => `${prev} ${transcript}`.trim());
          }
        };
      } catch (error) {
        console.error('Error starting transcription:', error);
      }
    };

    startTranscription();

    return () => {
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stop();
      }
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, [onTranscriptionUpdate]);

  return null;
};

export default MicrophoneTranscription;