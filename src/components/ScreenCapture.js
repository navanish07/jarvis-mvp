'use client';

import React, { useRef, useState, useEffect } from 'react';
import { createLiveConnection } from '../services/deepGramService';

export default function ScreenCaptureWithTranscript({ onTranscriptionUpdate }) {
  const [isRecording, setIsRecording] = useState(false);
  const videoRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const deepgramConnectionRef = useRef(null);
  const audioContextRef = useRef(null);

  // Initialize Deepgram connection on mount
  useEffect(() => {
    deepgramConnectionRef.current = createLiveConnection((newTranscript) => {
      // Merge new transcript snippets in parent state
      onTranscriptionUpdate(prev => `${prev} ${newTranscript}`.trim());
    });

    return () => stopCapture();
  }, []);

  const startCapture = async () => {
    try {
      // Capture screen and audio
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true,
      });
      mediaStreamRef.current = stream;
      videoRef.current.srcObject = stream;

      const audioStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: false
      });

      // Setup AudioContext and a ScriptProcessorNode to process audio data.
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const source = audioContext.createMediaStreamSource(stream);
      const processor = audioContext.createScriptProcessor(4096, 1, 1);

      source.connect(processor);
      processor.connect(audioContext.destination);

      processor.onaudioprocess = (e) => {
        const audioData = e.inputBuffer.getChannelData(0);
        // Convert float32 array to int16 array
        const int16Buffer = new Int16Array(audioData.length);
        for (let i = 0; i < audioData.length; i++) {
          let s = Math.max(-1, Math.min(1, audioData[i]));
          int16Buffer[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
        }
        // Send processed audio to Deepgram live connection
        if (deepgramConnectionRef.current) {
          deepgramConnectionRef.current.send(int16Buffer.buffer);
        }
      };

      audioContextRef.current = audioContext;
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting capture:', error);
    }
  };

  const stopCapture = () => {
    mediaStreamRef.current?.getTracks().forEach(track => track.stop());
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    setIsRecording(false);
  };

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
            isRecording ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'
          } text-white transition-colors`}
        >
          {isRecording ? 'Stop Recording' : 'Start Recording'}
        </button>
      </div>
    </div>
  );
}