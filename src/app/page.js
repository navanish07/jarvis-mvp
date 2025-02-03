'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabase/client';

export default function Home() {
  const router = useRouter();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check for an active session when the component mounts.
  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setLoading(false);
    };

    getSession();

    // Subscribe to auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error during logout:', error.message);
    } else {
      router.push('/login');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <p className="text-black">Loading...</p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white">
        <h1 className="text-3xl font-bold mb-4 text-black">You are not logged in.</h1>
        <button
          onClick={() => router.push('/login')}
          className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800"
        >
          Go to Login
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white space-y-4">
      <h1 className="text-3xl font-bold mb-4 text-black">Hello</h1>
      <div className="flex space-x-4">
        <button 
          onClick={() => router.push('/home')}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Home
        </button>
        <button 
          onClick={() => router.push('/user')}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          User
        </button>
        <button 
          onClick={() => router.push('/sessions')}
          className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
        >
          Sessions
        </button>
      </div>
      <button 
        onClick={handleLogout} 
        className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800"
      >
        Logout
      </button>
    </div>
  );
}