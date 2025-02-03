import clientPromise from '../../../lib/mongodb';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const { userId } = req.query;
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }
    try {
      const client = await clientPromise;
      const db = client.db('mydatabase');
      const resumesCollection = db.collection('resumes');

      const resumeData = await resumesCollection.findOne({ userId });
      if (!resumeData) {
        return res.status(404).json({ error: 'No resume found for user' });
      }

      // Set the correct content type and send the file buffer.
      res.setHeader('Content-Type', resumeData.contentType);
      // resumeData.resume is stored as binary; if it’s not a Buffer already, try resumeData.resume.buffer.
      res.send(resumeData.resume.buffer ? resumeData.resume.buffer : resumeData.resume);
    } catch (error) {
      console.error('Error fetching resume:', error);
      res.status(500).json({ error: 'Error retrieving resume' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
