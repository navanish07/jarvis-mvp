import { createClient, LiveTranscriptionEvents } from '@deepgram/sdk';

const createLiveConnection = (onTranscript) => {
  // Create the Deepgram client using your public API key.
  const deepgram = createClient(process.env.NEXT_PUBLIC_DEEPGRAM_API_KEY);
  
  // Create a live transcription connection with desired options.
  const connection = deepgram.listen.live({
    model: 'nova-2',
    interim_results: true,
    punctuate: true,
    language: 'en-US',
  });

  connection.on(LiveTranscriptionEvents.Open, () => {
    console.log("Deepgram WebSocket Connected");
  });

  connection.on(LiveTranscriptionEvents.Transcript, (data) => {
    // Log the raw data to inspect its format
    console.log("Transcript Event Data:", data);
    // Check if data is string; if so try to parse it.
    let transcript = '';
    if (typeof data === 'string') {
      try {
        const parsed = JSON.parse(data);
        transcript = parsed.channel?.alternatives?.[0]?.transcript;
      } catch (e) {
        console.error("Error parsing transcript data:", e);
      }
    } else {
      transcript = data.channel?.alternatives?.[0]?.transcript;
    }
    if (transcript) {
      onTranscript(transcript);
    }
  });

  connection.on(LiveTranscriptionEvents.Error, (err) => {
    console.error("Deepgram Error:", err);
  });

  connection.on(LiveTranscriptionEvents.Close, () => {
    console.log("Deepgram connection closed.");
  });

  return connection;
};

export { createLiveConnection };