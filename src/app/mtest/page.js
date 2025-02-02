'use client';

import { useEffect, useRef } from 'react';

const DeepgramLiveTranscription = () => {
  const mediaRecorderRef = useRef(null);
  const socketRef = useRef(null);

  useEffect(() => {
    const startTranscription = async () => {
      try {
        const stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
        const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });

        const combinedStream = new MediaStream([
          ...stream.getVideoTracks(),
          ...audioStream.getAudioTracks()
        ]);

        const mediaRecorder = new MediaRecorder(combinedStream, { mimeType: 'audio/webm' });
        mediaRecorderRef.current = mediaRecorder;

        const socket = new WebSocket('wss://api.deepgram.com/v1/listen', ['token', process.env.NEXT_PUBLIC_DG_KEY]);
        socketRef.current = socket;

        socket.onopen = () => {
          mediaRecorder.addEventListener('dataavailable', event => {
            if (socket.readyState === WebSocket.OPEN) {
              socket.send(event.data);
            }
          });
          mediaRecorder.start(250);
        };

        socket.onmessage = (message) => {
          const received = JSON.parse(message.data);
          const transcript = received.channel.alternatives[0]?.transcript;
          console.log('Transcription:', transcript);
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
  }, []);

  return <div>Screen Sharing with Live Transcription Active...</div>;
};

export default DeepgramLiveTranscription;
