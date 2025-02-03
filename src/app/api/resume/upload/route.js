import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get("resume");
    const userId = formData.get("userId");

    if (!file || !userId) {
      return NextResponse.json({ error: "File or User ID missing" }, { status: 400 });
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const client = await clientPromise;
    const db = client.db("mydatabase");
    const resumesCollection = db.collection("resumes");

    // Upsert the resume for the user
    await resumesCollection.updateOne(
      { userId },
      {
        $set: {
          resume: buffer,
          filename: file.name,
          contentType: file.type,
          uploadedAt: new Date(),
        },
      },
      { upsert: true }
    );

    return NextResponse.json({ message: "Resume uploaded successfully" });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Error saving file" }, { status: 500 });
  }
}
