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
  const [passStatus, setPassStatus] = useState({ type: '', message: '' });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchParticipants();
    });

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
      setPoints(0);
      setTimeout(() => setStatus({ type: '', message: '' }), 3000);
    }
  }

  async function handleUpdatePassword(e) {
    e.preventDefault();
    const newPassword = e.target.newPassword.value;
    setPassStatus({ type: 'loading', message: 'Updating password...' });

    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      setPassStatus({ type: 'error', message: error.message });
    } else {
      setPassStatus({ type: 'success', message: 'Password updated successfully!' });
      e.target.reset();
      setTimeout(() => setPassStatus({ type: '', message: '' }), 3000);
    }
  }

  // --- LOGIN SCREEN ---
  if (!session) {
    return (
      <div className="min-h-screen bg-[#03150e] flex items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-yellow-500/10 rounded-full blur-[120px] pointer-events-none"></div>
        <form onSubmit={handleLogin} className="bg-[#0a261a]/80 backdrop-blur-md border border-[#eab308]/30 p-8 rounded-xl shadow-2xl w-full max-w-md relative z-10">
          <h2 className="text-3xl font-serif text-[#eab308] font-bold mb-6 text-center">Admin Portal</h2>
          {status.message && (
            <div className="mb-4 p-3 bg-red-900/50 border border-red-500 text-red-200 rounded text-sm">{status.message}</div>
          )}
          <input
            type="email"
            placeholder="Admin Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-[#03150e]/60 border border-emerald-900/50 text-emerald-100 placeholder-emerald-700/60 p-3 rounded-lg mb-4 focus:outline-none focus:border-[#eab308]/60 transition-all"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-[#03150e]/60 border border-emerald-900/50 text-emerald-100 placeholder-emerald-700/60 p-3 rounded-lg mb-6 focus:outline-none focus:border-[#eab308]/60 transition-all"
            required
          />
          <button type="submit" className="w-full bg-[#eab308] hover:bg-yellow-400 text-slate-950 font-bold py-3 rounded-lg transition-colors shadow-lg">
            Log In
          </button>
        </form>
      </div>
    );
  }

  // --- ADMIN MANAGEMENT & PASSWORD SCREEN ---
  return (
    <div className="min-h-screen bg-[#03150e] text-emerald-50 font-sans p-6 pb-16 relative overflow-hidden">
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-emerald-500/15 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="max-w-2xl mx-auto space-y-6 relative z-10">
        
        {/* Top Header Card */}
        <div className="bg-[#0a261a]/70 backdrop-blur-md border border-[#eab308]/30 p-6 rounded-xl shadow-2xl flex justify-between items-center">
          <h1 className="text-2xl font-serif text-[#eab308] font-bold">Manage Points</h1>
          <button onClick={handleLogout} className="bg-emerald-900/50 hover:bg-emerald-800 text-emerald-200 border border-emerald-700/50 px-4 py-2 rounded-lg text-sm font-semibold transition-colors">
            Log Out
          </button>
        </div>

        {/* Points Submission Form */}
        <div className="bg-[#0a261a]/70 backdrop-blur-md border border-emerald-900/40 p-6 rounded-xl shadow-2xl">
          <form onSubmit={handleSubmitPoints} className="space-y-5">
            {status.message && (
              <div className={`p-3 rounded-lg text-sm font-semibold ${status.type === 'success' ? 'bg-emerald-900/50 text-emerald-200 border border-emerald-500' : 'bg-red-900/50 text-red-200 border border-red-500'}`}>
                {status.message}
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-emerald-200 mb-2">Select Participant</label>
              <select 
                value={selectedParticipant} 
                onChange={(e) => setSelectedParticipant(e.target.value)}
                className="w-full bg-[#03150e]/60 border border-emerald-900/50 text-emerald-100 p-3 rounded-lg focus:outline-none focus:border-[#eab308]/60 transition-all cursor-pointer"
                required
              >
                {participants.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-emerald-200 mb-2">Session</label>
                <select 
                  value={selectedEventSession} 
                  onChange={(e) => setSelectedEventSession(e.target.value)}
                  className="w-full bg-[#03150e]/60 border border-emerald-900/50 text-emerald-100 p-3 rounded-lg focus:outline-none focus:border-[#eab308]/60 transition-all cursor-pointer"
                >
                  {[1, 2, 3, 4, 5, 6].map(num => (
                    <option key={num} value={num}>Session {num}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-emerald-200 mb-2">Category</label>
                <select 
                  value={selectedCategory} 
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full bg-[#03150e]/60 border border-emerald-900/50 text-emerald-100 p-3 rounded-lg focus:outline-none focus:border-[#eab308]/60 transition-all cursor-pointer"
                >
                  <option value="Challenge">Challenge</option>
                  <option value="Quiz">Quiz</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-emerald-200 mb-2">Points (Use negative to remove)</label>
              <input
                type="number"
                value={points}
                onChange={(e) => setPoints(e.target.value)}
                className="w-full bg-[#03150e]/60 border border-emerald-900/50 text-emerald-100 p-3 rounded-lg focus:outline-none focus:border-[#eab308]/60 transition-all"
                required
              />
            </div>

            <button type="submit" className="w-full bg-[#eab308] hover:bg-yellow-400 text-slate-950 font-bold py-3 rounded-lg transition-colors shadow-lg">
              Save Points
            </button>
          </form>
        </div>

        {/* Change Password Section */}
        <div className="bg-[#0a261a]/70 backdrop-blur-md border border-emerald-900/40 p-6 rounded-xl shadow-2xl">
          <h3 className="text-xl font-serif text-[#eab308] font-bold mb-4">Change Your Password</h3>
          <form onSubmit={handleUpdatePassword} className="space-y-4">
            {passStatus.message && (
              <div className={`p-3 rounded-lg text-sm font-semibold ${passStatus.type === 'success' ? 'bg-emerald-900/50 text-emerald-200 border border-emerald-500' : 'bg-red-900/50 text-red-200 border border-red-500'}`}>
                {passStatus.message}
              </div>
            )}
            <input
              type="password"
              name="newPassword"
              placeholder="Enter new private password"
              className="w-full bg-[#03150e]/60 border border-emerald-900/50 text-emerald-100 placeholder-emerald-700/60 p-3 rounded-lg focus:outline-none focus:border-[#eab308]/60 transition-all"
              required
            />
            <button type="submit" className="w-full bg-emerald-700 hover:bg-emerald-600 text-white font-bold py-2.5 rounded-lg transition-colors">
              Update Password
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}