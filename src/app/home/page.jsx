'use client';

import React, { useState, useRef, useEffect } from 'react';
import MicrophoneTranscription from '../../components/MicrophoneTranscription';
import ScreenSharing from '../../components/ScreenSharing';
import { GoogleGenerativeAI } from '@google/generative-ai';

export default function HomePage() {
  const [transcript, setTranscript] = useState('');
  const [geminiAnswers, setGeminiAnswers] = useState([]);
  const [otherUserTranscript, setOtherUserTranscript] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Refs for auto-scroll
  const yourTranscriptRef = useRef(null);
  const geminiAnswerRef = useRef(null);
  const otherUserTranscriptRef = useRef(null);

  // Initialize Gemini
  const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY);

  const handleGeminiRequest = async () => {
    if (isLoading) return;
    
    try {
      setIsLoading(true);
      const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

      const combinedPrompt = `Act as an expert interviewer. Analyze this conversation:
      
      Interviewer: ${transcript}
      Candidate: ${otherUserTranscript}
      
      Provide a comprehensive response that:
      1. Analyzes conversation and provide summary in short
      2. Answer questions, if there are any
      3. Provides follow-up questions
      
      Format your response with clear headings. Be professional but helpful.`;

      const result = await model.generateContent(combinedPrompt);
      const response = await result.response;
      const text = response.text();

      setGeminiAnswers(prev => [
        ...prev,
        {
          text: text
            .replace(/\*\*(.*?)\*\*/g, '$1')
            .replace(/(\d+\.\s+)/g, '\n$1')
            .replace(/- /g, '\n• '),
          timestamp: new Date().toLocaleTimeString()
        }
      ]);
    } catch (error) {
      console.error('Gemini API error:', error);
      setGeminiAnswers(prev => [...prev, {
        text: 'Error processing request. Please try again.',
        timestamp: new Date().toLocaleTimeString()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

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
  }, [geminiAnswers.length]);

  useEffect(() => {
    if (otherUserTranscriptRef.current) {
      otherUserTranscriptRef.current.scrollTop = otherUserTranscriptRef.current.scrollHeight;
    }
  }, [otherUserTranscript]);

  return (
    <div className="min-h-screen p-4 bg-gray-100">
      <MicrophoneTranscription onTranscriptionUpdate={setOtherUserTranscript} />
      <div className="grid grid-cols-4 gap-4 h-[calc(100vh-2rem)]">
        {/* First Column */}
        <div className="flex flex-col space-y-4 min-h-0 col-span-1">
          <div className="flex-[1] bg-black rounded overflow-hidden">
            <ScreenSharing onTranscriptionUpdate={setTranscript} />
          </div>
          <div 
            ref={yourTranscriptRef}
            className="flex-[3] bg-white rounded shadow p-4 overflow-y-auto"
          >
            <h2 className="text-lg font-semibold mb-2 text-gray-800">Your Transcript</h2>
            <p className="text-gray-600 whitespace-pre-wrap">
              {transcript || 'Your transcript will appear here...'}
            </p>
          </div>
        </div>

        {/* Middle Column */}
        <div 
          ref={geminiAnswerRef}
          className="col-span-2 bg-white rounded shadow p-4 overflow-y-auto flex flex-col"
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Gemini Analysis</h2>
            <button
              onClick={handleGeminiRequest}
              disabled={isLoading}
              className={`px-4 py-2 rounded ${
                isLoading 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700'
              } text-white transition-colors`}
            >
              {isLoading ? 'Analyzing...' : 'Get Analysis'}
            </button>
          </div>
          <div className="flex-1 text-gray-700">
            {geminiAnswers.map((response, index) => (
              <div key={index} className="mb-4 border-b pb-4 border-gray-100">
                <div className="text-sm text-gray-500 mb-2">{response.timestamp}</div>
                {response.text.split('\n').map((line, lineIndex) => (
                  <p 
                    key={lineIndex}
                    className={`
                      ${line.startsWith('•') ? 'ml-4' : ''}
                      ${line.match(/^[A-Z][a-z]+:/) ? 'font-semibold text-gray-900 mt-2' : ''}
                      whitespace-pre-wrap
                    `}
                  >
                    {line}
                  </p>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Third Column */}
        <div 
          ref={otherUserTranscriptRef}
          className="col-span-1 bg-white rounded shadow p-4 overflow-y-auto"
        >
          <h2 className="text-lg font-semibold mb-2 text-gray-800">Other User Transcript</h2>
          <p className="text-gray-600 whitespace-pre-wrap">
            {otherUserTranscript || "Other user's transcript content goes here..."}
          </p>
        </div>
      </div>
    </div>
  );
}