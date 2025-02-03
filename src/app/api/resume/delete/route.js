import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("mydatabase");
    const resumesCollection = db.collection("resumes");

    // Delete the resume for the user
    const deleteResult = await resumesCollection.deleteOne({ userId });

    if (deleteResult.deletedCount === 0) {
      return NextResponse.json({ error: "No resume found to delete" }, { status: 404 });
    }

    return NextResponse.json({ message: "Resume deleted successfully" });
  } catch (error) {
    console.error("Resume delete error:", error);
    return NextResponse.json({ error: "Error deleting resume" }, { status: 500 });
  }
}
