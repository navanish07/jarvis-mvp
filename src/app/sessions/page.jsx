"use client";
import React, { useEffect, useState } from 'react';
import { supabase } from "@/utils/supabase/client";

export default function SessionsPage() {
  const [sessions, setSessions] = useState([]);

  useEffect(() => {
    async function getUserSessions() {
      // Retrieve current user session info from Supabase.
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.user?.id) {
        // Fetch sessions from the API endpoint, passing userId.
        const res = await fetch(`/api/sessions?userId=${session.user.id}`);
        const data = await res.json();
        setSessions(data);
      }
    }
    getUserSessions();
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">My Sessions</h1>
      {sessions.length ? (
        sessions.map((session) => (
          <div key={session._id} className="border p-4 mb-2 rounded">
            <div>
              <strong>Create Date: </strong>
              {new Date(session.createdAt).toLocaleString()}
            </div>
            <div>
              <strong>Summary: </strong>
              {session.summary}
            </div>
          </div>
        ))
      ) : (
        <p>No sessions found.</p>
      )}
    </div>
  );
}