'use client';
import { useState, useRef, useEffect } from 'react';
import { createClient } from '@deepgram/sdk';

export default function ScreenCaptureWithTranscript({ onTranscriptionUpdate }) {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const videoRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const deepgramRef = useRef(null);
  const audioContextRef = useRef(null);

  const initializeDeepgram = async () => {
    const deepgram = createClient(process.env.NEXT_PUBLIC_DEEPGRAM_API_KEY);
    deepgramRef.current = deepgram;
  };

  const startCapture = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true
      });
      
      mediaStreamRef.current = stream;
      videoRef.current.srcObject = stream;
      
      // Setup audio processing
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const source = audioContext.createMediaStreamSource(stream);
      const processor = audioContext.createScriptProcessor(4096, 1, 1);
      
      source.connect(processor);
      processor.connect(audioContext.destination);
      
      processor.onaudioprocess = async (e) => {
        const audioData = e.inputBuffer.getChannelData(0);
        await processAudio(audioData);
      };

      audioContextRef.current = audioContext;
      setIsRecording(true);
      
    } catch (error) {
      console.error('Error starting capture:', error);
    }
  };

  const processAudio = async (audioBuffer) => {
    if (!deepgramRef.current) return;

    // Convert audio format for Deepgram
    const audioData = new Int16Array(
      audioBuffer.map(sample => sample * 32767)
    );

    // Create and manage Deepgram connection
    const connection = deepgramRef.current.transcription.live({
      model: 'nova-2',
      interim_results: true,
      punctuate: true
    });

    connection.on('transcriptReceived', (data) => {
      const transcript = data.channel.alternatives[0].transcript;
      if (transcript) {
        setTranscript(prev => {
          const newTranscript = `${prev} ${transcript}`.trim();
          if (onTranscriptionUpdate) onTranscriptionUpdate(newTranscript);
          return newTranscript;
        });
      }
    });

    connection.send(audioData.buffer);
  };

  const stopCapture = () => {
    mediaStreamRef.current?.getTracks().forEach(track => track.stop());
    audioContextRef.current?.close();
    setIsRecording(false);
  };

  useEffect(() => {
    initializeDeepgram();
    return () => stopCapture();
  }, []);

  return (
    <div className="relative h-full">
      <video 
        ref={videoRef} 
        autoPlay 
        muted 
        className="w-full h-full object-contain bg-black"
      />
      
      <div className="absolute bottom-4 left-4 flex gap-2">
        <button
          onClick={isRecording ? stopCapture : startCapture}
          className={`px-4 py-2 rounded-lg ${
            isRecording 
              ? 'bg-red-500 hover:bg-red-600' 
              : 'bg-blue-500 hover:bg-blue-600'
          } text-white transition-colors`}
        >
          {isRecording ? 'Stop Recording' : 'Start Recording'}
        </button>
      </div>
    </div>
  );
}