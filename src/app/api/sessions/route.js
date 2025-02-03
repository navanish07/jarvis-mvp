import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function POST(req) {
  try {
    const { userId, transcriptions, summary, startTime, endTime } = await req.json();
    if (!userId) {
      return NextResponse.json({ error: 'No user id provided' }, { status: 400 });
    }
    const client = await clientPromise;
    const db = client.db('mydatabase');
    await db.collection('sessions').insertOne({
      userId,
      transcriptions,
      summary,
      startTime: startTime || null,
      endTime: endTime || null,
      createdAt: new Date()
    });
    return NextResponse.json({ message: 'Session saved successfully' });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    if (!userId) {
      return NextResponse.json({ error: 'No user id provided' }, { status: 400 });
    }
    const client = await clientPromise;
    const db = client.db('mydatabase');
    const sessions = await db
      .collection('sessions')
      .find({ userId })
      .sort({ createdAt: -1 })
      .toArray();
    return NextResponse.json(sessions);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}