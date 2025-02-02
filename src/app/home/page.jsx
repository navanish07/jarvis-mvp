'use client';

import React, { useState, useRef, useEffect } from 'react';
import MicrophoneTranscription from '../../components/MicrophoneTranscription';
import ScreenSharing from '../../components/ScreenSharing';

export default function HomePage() {
  const [transcript, setTranscript] = useState('');
  const [geminiAnswer, setGeminiAnswer] = useState('');
  const [otherUserTranscript, setOtherUserTranscript] = useState('');
  
  // Refs for auto-scroll
  const yourTranscriptRef = useRef(null);
  const geminiAnswerRef = useRef(null);
  const otherUserTranscriptRef = useRef(null);

  // Auto-scroll effects
  useEffect(() => {
    if (yourTranscriptRef.current) {
      yourTranscriptRef.current.scrollTop = yourTranscriptRef.current.scrollHeight;
    }
  }, [transcript]);

  useEffect(() => {
    if (geminiAnswerRef.current) {
      geminiAnswerRef.current.scrollTop = geminiAnswerRef.current.scrollHeight;
    }
  }, [geminiAnswer]);

  useEffect(() => {
    if (otherUserTranscriptRef.current) {
      otherUserTranscriptRef.current.scrollTop = otherUserTranscriptRef.current.scrollHeight;
    }
  }, [otherUserTranscript]);

  return (
    <div className="min-h-screen p-4 bg-gray-100">
      <MicrophoneTranscription onTranscriptionUpdate={setOtherUserTranscript} />
      <div className="grid grid-cols-4 gap-4 h-[calc(100vh-2rem)]"> {/* Changed grid layout */}
        {/* First Column - 1 part */}
        <div className="flex flex-col space-y-4 min-h-0 col-span-1">
          <div className="flex-[1] bg-black rounded overflow-hidden"> {/* 1:3 ratio */}
            <ScreenSharing onTranscriptionUpdate={setTranscript} />
          </div>
          <div 
            ref={yourTranscriptRef}
            className="flex-[3] bg-white rounded shadow p-4 overflow-y-auto" 
          >
            <h2 className="text-lg font-semibold mb-2">Your Transcript</h2>
            <p className="text-gray-700 whitespace-pre-wrap">
              {transcript || 'Your transcript will appear here...'}
            </p>
          </div>
        </div>

        {/* Middle Column - 3 parts */}
        <div 
          ref={geminiAnswerRef}
          className="col-span-2 bg-white rounded shadow p-4 overflow-y-auto flex flex-col"
        >
          <h2 className="text-lg font-semibold mb-2 text-center">Gemini Answers</h2>
          <p className="text-gray-700 flex-1">
            {geminiAnswer || 'Gemini answer content goes here...'}
          </p>
        </div>

        {/* Third Column - 1 part */}
        <div 
          ref={otherUserTranscriptRef}
          className="col-span-1 bg-white rounded shadow p-4 overflow-y-auto"
        >
          <h2 className="text-lg font-semibold mb-2">Other User Transcript</h2>
          <p className="text-gray-700 whitespace-pre-wrap">
            {otherUserTranscript || "Other user's transcript content goes here..."}
          </p>
        </div>
      </div>
    </div>
  );
}