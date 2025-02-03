import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("mydatabase");
    const resumesCollection = db.collection("resumes");

    const resumeData = await resumesCollection.findOne({ userId });
    if (!resumeData) {
      return NextResponse.json({ error: "No resume found" }, { status: 404 });
    }

    return new Response(resumeData.resume.buffer, {
      headers: {
        "Content-Type": resumeData.contentType,
      },
    });
  } catch (error) {
    console.error("Resume fetch error:", error);
    return NextResponse.json({ error: "Error retrieving resume" }, { status: 500 });
  }
}
