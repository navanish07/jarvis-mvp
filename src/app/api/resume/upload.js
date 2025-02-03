import formidable from 'formidable';
import fs from 'fs';
import clientPromise from '../../../lib/mongodb';

export const config = {
  api: {
    bodyParser: false, // Disables Next.js default body parsing to allow formidable to parse the multipart form data.
  },
};

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const form = new formidable.IncomingForm();
    form.parse(req, async (err, fields, files) => {
      if (err) {
        console.error('Error parsing form:', err);
        return res.status(500).json({ error: 'Error parsing form data' });
      }

      // Assume the file field is named "resume"
      const resumeFile = files.resume;
      if (!resumeFile) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      // Read the file from the temporary location.
      const fileData = fs.readFileSync(resumeFile.filepath);

      // Assume the user's id is sent in a field called "userId".
      const { userId } = fields;
      if (!userId) {
        return res.status(400).json({ error: 'User ID is missing' });
      }

      try {
        const client = await clientPromise;
        const db = client.db('mydatabase'); // Replace with your database name if different.
        const resumesCollection = db.collection('resumes');

        // Upsert the resume for the user.
        await resumesCollection.updateOne(
          { userId },
          {
            $set: {
              resume: fileData,
              filename: resumeFile.originalFilename,
              contentType: resumeFile.mimetype,
              uploadedAt: new Date(),
            },
          },
          { upsert: true }
        );
        res.status(200).json({ message: 'Resume uploaded successfully' });
      } catch (error) {
        console.error('MongoDB error:', error);
        res.status(500).json({ error: 'Error saving file to database' });
      }
    });
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
