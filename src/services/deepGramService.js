import { createClient, LiveTranscriptionEvents } from '@deepgram/sdk';
import { logger } from '../utils/logger';

const createLiveConnection = (onTranscript) => {
  // Create the Deepgram client using your public API key.
  console.log('API Key exists:', !!process.env.NEXT_PUBLIC_DEEPGRAM_API_KEY);
  logger.log('API Key exists:', !!process.env.NEXT_PUBLIC_DEEPGRAM_API_KEY);

  let isConnected = false;

  const deepgram = createClient(process.env.NEXT_PUBLIC_DEEPGRAM_API_KEY);
  
  // Create a live transcription connection with desired options.
  const liveConnection = deepgram.listen.live({
    model: 'nova-2',
    interim_results: true,
    punctuate: true,
    language: 'en-US',
  });

  let connectionTimer;
  liveConnection.on(LiveTranscriptionEvents.Open, () => {
    clearTimeout(connectionTimer);
    console.log("Deepgram connection established");
    // Send a keep-alive message every 5 seconds
    setInterval(() => {
      if (liveConnection.getReadyState() === WebSocket.OPEN) {
        liveConnection.keepAlive();
      }
    }, 5000);
  });

  // Handle connection timeout
  connectionTimer = setTimeout(() => {
    if (liveConnection.getReadyState() !== WebSocket.OPEN) {
      liveConnection.Close();
      console.error("Deepgram connection timed out");
    }
  }, 5000);

  liveConnection.on(LiveTranscriptionEvents.Transcript, (data) => {
    
    console.log("Raw data: ", data)

    try {
      const transcript = data.channel.alternatives[0].transcript;
      if (transcript && data.is_final) {
        onTranscript(prev => `${prev} ${transcript}`.trim());
      }
    } catch (error) {
      console.error('Error processing transcript:', error);
    }
  });

  liveConnection.on(LiveTranscriptionEvents.Error, (err) => {
    console.error("Deepgram Error:", err);
  });

  liveConnection.on(LiveTranscriptionEvents.Close, () => {
    isConnected = false;
    console.log("Deepgram connection closed.");
  });

  if (!isConnected) {
    logger.log("Warning: Returning connection before open state confirmed");
  }

  return liveConnection;
};

export { createLiveConnection };