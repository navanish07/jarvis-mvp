'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase/client';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [infoMsg, setInfoMsg] = useState('');
  const [session, setSession] = useState(null);

  // Check for an existing session and subscribe to auth state changes.
  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
    };

    getSession();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
    });

    // Cleanup subscription on unmount.
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const handleSendOtp = async () => {
    setErrorMsg('');
    setInfoMsg('');
    if (!email) {
      setErrorMsg('Please enter your email.');
      return;
    }

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: true },
    });

    if (error) {
      setErrorMsg(error.message);
    } else {
      setIsOtpSent(true);
      setInfoMsg('OTP sent to your email.');
    }
  };

  const handleVerifyOtp = async () => {
    setErrorMsg('');
    setInfoMsg('');
    if (!otp) {
      setErrorMsg('Please enter the OTP code.');
      return;
    }

    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token: otp,
      type: 'email',
    });

    if (error) {
      // This will cover the wrong OTP case by showing the error message.
      setErrorMsg(error.message);
    } else {
      setInfoMsg('Logged in successfully!');
      // The auth listener will update the session, which in turn will update the UI.
      setSession(data.session);
    }
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      setErrorMsg(error.message);
    } else {
      setSession(null);
      // Clear login form state after logout.
      setIsOtpSent(false);
      setEmail('');
      setOtp('');
      setInfoMsg('Logged out successfully.');
    }
  };

  // If user is logged in, show the logout interface.
  if (session) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white">
        <h1 className="text-3xl font-bold mb-4 text-black">Welcome!</h1>
        <button 
          onClick={handleLogout} 
          className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800"
        >
          Logout
        </button>
      </div>
    );
  }

  // If no active session, show the login form.
  return (
    <div className="flex min-h-screen items-center justify-center bg-white">
      <div className="w-80 p-8 bg-white border-2 border-black rounded shadow">
        <h2 className="text-center text-3xl font-bold mb-6 text-black">Login</h2>
        <div className="mb-4">
          <label className="block text-black mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            className="w-full px-3 py-2 border border-black rounded text-black bg-white placeholder-gray-500"
          />
        </div>
        {isOtpSent && (
          <div className="mb-4">
            <label className="block text-black mb-1">OTP Code</label>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="Enter OTP"
              className="w-full px-3 py-2 border border-black rounded text-black bg-white placeholder-gray-500"
            />
          </div>
        )}
        {errorMsg && <p className="text-red-600 text-sm mb-2">{errorMsg}</p>}
        {infoMsg && <p className="text-green-600 text-sm mb-2">{infoMsg}</p>}
        {!isOtpSent ? (
          <button
            onClick={handleSendOtp}
            className="w-full py-2 bg-black text-white rounded hover:bg-gray-800"
          >
            Send OTP
          </button>
        ) : (
          <button
            onClick={handleVerifyOtp}
            className="w-full py-2 bg-black text-white rounded hover:bg-gray-800"
          >
            Login
          </button>
        )}
      </div>
    </div>
  );
}
