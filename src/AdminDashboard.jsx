import { useState, useEffect } from 'react';
import { supabase } from './supabase';

export default function AdminDashboard() {
  const [session, setSession] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const [participants, setParticipants] = useState([]);
  const [selectedParticipant, setSelectedParticipant] = useState('');
  const [selectedEventSession, setSelectedEventSession] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState('Challenge');
  const [points, setPoints] = useState(0);
  const [status, setStatus] = useState({ type: '', message: '' });

  useEffect(() => {
    // Check active login session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchParticipants();
    });

    // Listen for login/logout events
    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) fetchParticipants();
    });
  }, []);

  async function fetchParticipants() {
    const { data, error } = await supabase.from('participants').select('*').order('name');
    if (!error && data) {
      setParticipants(data);
      if (data.length > 0) setSelectedParticipant(data[0].id);
    }
  }

  async function handleLogin(e) {
    e.preventDefault();
    setStatus({ type: 'loading', message: 'Logging in...' });
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setStatus({ type: 'error', message: error.message });
    else setStatus({ type: '', message: '' });
  }

  async function handleLogout() {
    await supabase.auth.signOut();
  }

  async function handleSubmitPoints(e) {
    e.preventDefault();
    setStatus({ type: 'loading', message: 'Saving points...' });

    const { error } = await supabase.from('scores').insert({
      participant_id: selectedParticipant,
      session: parseInt(selectedEventSession),
      category: selectedCategory,
      points: parseInt(points)
    });

    if (error) {
      setStatus({ type: 'error', message: error.message });
    } else {
      setStatus({ type: 'success', message: 'Points successfully added!' });
      setPoints(0); // Reset points input
      setTimeout(() => setStatus({ type: '', message: '' }), 3000);
    }
  }

  // --- LOGIN SCREEN ---
  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-light/30 p-6">
        <form onSubmit={handleLogin} className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
          <h2 className="text-2xl font-bold text-brand-dark mb-6 text-center">Admin Login</h2>
          {status.message && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded text-sm">{status.message}</div>
          )}
          <input
            type="email"
            placeholder="Admin Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded mb-4 focus:outline-none focus:border-brand"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded mb-6 focus:outline-none focus:border-brand"
            required
          />
          <button type="submit" className="w-full bg-brand hover:bg-brand-dark text-white font-bold py-3 rounded transition-colors">
            Log In
          </button>
        </form>
      </div>
    );
  }

  // --- POINT MANAGEMENT SCREEN ---
  return (
    <div className="min-h-screen bg-brand-light/30 p-6">
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-brand text-white p-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Manage Points</h1>
          <button onClick={handleLogout} className="bg-brand-dark hover:bg-brand-light hover:text-brand-dark px-4 py-2 rounded text-sm font-semibold transition-colors">
            Log Out
          </button>
        </div>

        <form onSubmit={handleSubmitPoints} className="p-6 space-y-5">
          {status.message && (
            <div className={`p-3 rounded text-sm font-semibold ${status.type === 'success' ? 'bg-green-100 text-brand-dark' : 'bg-red-100 text-red-700'}`}>
              {status.message}
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Select Participant</label>
            <select 
              value={selectedParticipant} 
              onChange={(e) => setSelectedParticipant(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded focus:border-brand focus:outline-none"
              required
            >
              {participants.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Session</label>
              <select 
                value={selectedEventSession} 
                onChange={(e) => setSelectedEventSession(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded focus:border-brand focus:outline-none"
              >
                {[1, 2, 3, 4, 5, 6].map(num => (
                  <option key={num} value={num}>Session {num}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Category</label>
              <select 
                value={selectedCategory} 
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded focus:border-brand focus:outline-none"
              >
                <option value="Challenge">Challenge</option>
                <option value="Quiz">Quiz</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Points (Use negative to remove)</label>
            <input
              type="number"
              value={points}
              onChange={(e) => setPoints(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded focus:border-brand focus:outline-none"
              required
            />
          </div>

          <button type="submit" className="w-full bg-brand hover:bg-brand-dark text-white font-bold py-3 rounded transition-colors">
            Save Points
          </button>
        </form>
      </div>
    </div>
  );
}