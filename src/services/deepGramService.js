import { createClient, LiveTranscriptionEvents } from '@deepgram/sdk';

const createLiveConnection = (onTranscript) => {
  // Create the Deepgram client
  const deepgram = createClient(process.env.NEXT_PUBLIC_DEEPGRAM_API_KEY);

  // Create a live transcription connection
  const connection = deepgram.listen.live({
    model: 'nova-2',
    interim_results: true,
    punctuate: true,
  });

  connection.on(LiveTranscriptionEvents.Open, () => {
    connection.on(LiveTranscriptionEvents.Transcript, (data) => {
      const transcript = data.channel.alternatives[0].transcript;
      if (transcript) onTranscript(transcript);
    });
    connection.on(LiveTranscriptionEvents.Error, (err) => {
      console.error(err);
    });
    connection.on(LiveTranscriptionEvents.Close, () => {
      console.log('Deepgram connection closed.');
    });
  });

  return connection;
};

export { createLiveConnection };