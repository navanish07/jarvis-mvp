"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/utils/supabase/client";

export default function UserPage() {
  const router = useRouter();
  const [session, setSession] = useState(null);
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const [resumeUrl, setResumeUrl] = useState("");

  useEffect(() => {
    async function getSession() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login");
      } else {
        setSession(session);
      }
    }
    getSession();
  }, [router]);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) {
      setMessage("Error: Please select a file first.");
      return;
    }

    const formData = new FormData();
    formData.append("resume", file);
    formData.append("userId", session.user.id);

    const res = await fetch("/api/resume/upload", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    if (res.ok) {
      setMessage("Resume uploaded successfully!");
    } else {
      setMessage(`Error: ${data.error}`);
    }
  };

  const handleGetResume = async () => {
    if (!session) return;
    const res = await fetch(`/api/resume/get?userId=${session.user.id}`);

    if (res.ok) {
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      setResumeUrl(url);
    } else {
      const data = await res.json();
      setMessage(`Error: ${data.error}`);
    }
  };

  const handleDeleteResume = async () => {
    if (!session) return;
    
    const res = await fetch(`/api/resume/delete?userId=${session.user.id}`, {
      method: "DELETE",
    });

    const data = await res.json();
    if (res.ok) {
      setMessage("Resume deleted successfully!");
      setResumeUrl(""); // Clear the preview
    } else {
      setMessage(`Error: ${data.error}`);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white p-4">
      <h1 className="text-3xl font-bold mb-4 text-black">User Resume</h1>
      <input type="file" onChange={handleFileChange} className="mb-4" />
      <button
        onClick={handleUpload}
        className="mb-4 px-4 py-2 bg-black text-white rounded hover:bg-gray-800"
      >
        Upload Resume
      </button>
      <button
        onClick={handleGetResume}
        className="mb-4 px-4 py-2 bg-black text-white rounded hover:bg-gray-800"
      >
        Retrieve Resume
      </button>
      <button
        onClick={handleDeleteResume}
        className="mb-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-800"
      >
        Delete Resume
      </button>
      {message && <p className="text-black mb-4">{message}</p>}
      {resumeUrl && (
        <div className="mt-4">
          <h2 className="text-xl font-bold text-black">Your Resume:</h2>
          <iframe src={resumeUrl} width="600" height="400" title="Resume Preview"></iframe>
        </div>
      )}
    </div>
  );
}
