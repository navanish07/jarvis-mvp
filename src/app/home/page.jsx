'use client';

import React, { useState } from 'react';
import MicrophoneTranscription from '../../components/MicrophoneTranscription';
import ScreenSharing from '../../components/ScreenSharing';

export default function HomePage() {
  const [transcript, setTranscript] = useState('');
  const [geminiAnswer, setGeminiAnswer] = useState('');
  const [otherUserTranscript, setOtherUserTranscript] = useState('');

  return (
    <div className="min-h-screen p-4 bg-gray-100">
      <MicrophoneTranscription onTranscriptionUpdate={setOtherUserTranscript} />
      <div className="grid grid-cols-3 gap-4 h-[calc(100vh-2rem)]">
        {/* First Column */}
        <div className="flex flex-col space-y-4 min-h-0">
          <div className="flex-1 bg-black rounded overflow-hidden">
            <ScreenSharing onTranscriptionUpdate={setTranscript} />
          </div>
          <div className="bg-white rounded shadow p-4 overflow-y-auto">
            <h2 className="text-lg font-semibold mb-2">Your Transcript</h2>
            <p className="text-gray-700 whitespace-pre-wrap">
              {transcript || 'Your transcript will appear here...'}
            </p>
          </div>
        </div>

        {/* Middle Column */}
        <div className="bg-white rounded shadow p-4 overflow-y-auto flex flex-col">
          <h2 className="text-lg font-semibold mb-2 text-center">Gemini Answers</h2>
          <p className="text-gray-700 flex-1">
            {geminiAnswer || 'Gemini answer content goes here...'}
          </p>
        </div>

        {/* Third Column */}
        <div className="bg-white rounded shadow p-4 overflow-y-auto">
          <h2 className="text-lg font-semibold mb-2">Other User Transcript</h2>
          <p className="text-gray-700 whitespace-pre-wrap">
            {otherUserTranscript || "Other user's transcript content goes here..."}
          </p>
        </div>
      </div>
    </div>
  );
}