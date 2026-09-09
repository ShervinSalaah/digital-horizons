import { useState, useEffect } from 'react';
import { supabase } from './supabase';

export default function GuestDashboard() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  const [session, setSession] = useState('all');
  const [category, setCategory] = useState('all');

  useEffect(() => {
    fetchLeaderboard();
  }, [session, category]);

  async function fetchLeaderboard() {
    setLoading(true);
    
    const rpcArgs = {};
    if (session !== 'all') rpcArgs.filter_session = parseInt(session);
    if (category !== 'all') rpcArgs.filter_category = category;

    const { data, error } = await supabase.rpc('get_leaderboard', rpcArgs);

    if (error) {
      console.error('Error fetching leaderboard:', error);
    } else {
      // FIX: Calculate true ranks before saving to state, handling ties perfectly
      let currentRank = 1;
      const rankedData = (data || []).map((participant, index, array) => {
        // If it's not the first person, and their points are lower than the person above them, 
        // their rank becomes their actual position in the list (index + 1)
        if (index > 0 && Number(participant.total_points) < Number(array[index - 1].total_points)) {
          currentRank = index + 1;
        }
        return { ...participant, rank: currentRank };
      });
      
      setLeaderboard(rankedData);
    }
    
    setLoading(false);
  }

  // The search filter now filters the already-ranked data
  const filteredParticipants = leaderboard.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#03150e] text-emerald-50 font-sans relative overflow-hidden pb-16">
      
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-yellow-500/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-emerald-500/15 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="max-w-4xl mx-auto px-6 pt-12 relative z-10">
        
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-serif text-[#eab308] font-bold tracking-wide mb-4 drop-shadow-lg">
            Digital Horizons
          </h1>
          <div className="flex items-center justify-center gap-4">
            <div className="h-[1px] w-12 bg-white/20"></div>
            <p className="text-emerald-200/80 text-sm md:text-base tracking-[0.2em] uppercase font-light">
              Session 1: 20-Day Personal Branding Challenge
            </p>
            <div className="h-[1px] w-12 bg-white/20"></div>
          </div>
        </div>

        <div className="bg-[#0a261a]/70 backdrop-blur-md border border-[#eab308]/30 p-5 rounded-xl shadow-2xl flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search participants..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#03150e]/60 border border-emerald-900/50 text-emerald-100 placeholder-emerald-700/60 rounded-lg px-4 py-3 focus:outline-none focus:border-[#eab308]/60 focus:ring-1 focus:ring-[#eab308]/60 transition-all"
            />
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <select 
              value={session} 
              onChange={(e) => setSession(e.target.value)}
              className="bg-[#03150e]/60 border border-emerald-900/50 text-emerald-100 rounded-lg px-4 py-3 focus:outline-none focus:border-[#eab308]/60 transition-all cursor-pointer"
            >
              <option value="all">All Sessions</option>
              {[1, 2, 3, 4, 5, 6].map(num => (
                <option key={num} value={num}>Session {num}</option>
              ))}
            </select>

            <select 
              value={category} 
              onChange={(e) => setCategory(e.target.value)}
              className="bg-[#03150e]/60 border border-emerald-900/50 text-emerald-100 rounded-lg px-4 py-3 focus:outline-none focus:border-[#eab308]/60 transition-all cursor-pointer"
            >
              <option value="all">All Categories</option>
              <option value="Challenge">Challenge</option>
              <option value="Quiz">Quiz</option>
            </select>
          </div>
        </div>

        <div className="bg-[#0a261a]/70 backdrop-blur-md border border-emerald-900/40 rounded-xl shadow-2xl overflow-hidden">
          {loading ? (
            <div className="text-center text-[#eab308] py-16 font-semibold animate-pulse">
              Loading Live Ranks...
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#03150e]/50 border-b border-[#eab308]/20">
                    <th className="p-5 font-semibold text-[#eab308] tracking-wider w-24 text-center uppercase text-sm">Rank</th>
                    <th className="p-5 font-semibold text-[#eab308] tracking-wider uppercase text-sm">Participant</th>
                    <th className="p-5 font-semibold text-[#eab308] tracking-wider text-right pr-8 uppercase text-sm">Total Points</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-emerald-900/30">
                  {filteredParticipants.length === 0 ? (
                    <tr>
                      <td colSpan="3" className="p-10 text-center text-emerald-700 font-medium">
                        No participants match your search.
                      </td>
                    </tr>
                  ) : (
                    filteredParticipants.map((participant) => {
                      // FIX: Use the calculated, static rank rather than the array index
                      const rank = participant.rank; 
                      
                      const isTop3 = rank <= 3;
                      const rankStyle = 
                        rank === 1 ? "text-yellow-300 drop-shadow-[0_0_10px_rgba(253,224,71,0.8)] text-2xl" :
                        rank === 2 ? "text-slate-300 drop-shadow-[0_0_8px_rgba(203,213,225,0.8)] text-xl" :
                        rank === 3 ? "text-amber-500 drop-shadow-[0_0_8px_rgba(217,119,6,0.8)] text-xl" : 
                        "text-emerald-500 font-bold text-lg";

                      return (
                        <tr 
                          key={participant.id} 
                          className="hover:bg-white/5 transition-all duration-200 group"
                        >
                          <td className={`p-4 text-center font-black ${rankStyle}`}>
                            {rank}
                          </td>
                          <td className={`p-4 font-medium tracking-wide ${isTop3 ? 'text-white font-bold' : 'text-emerald-100'} group-hover:text-white transition-colors`}>
                            {participant.name}
                          </td>
                          <td className={`p-4 text-right pr-8 font-mono text-xl font-bold ${isTop3 ? 'text-[#eab308]' : 'text-emerald-400'}`}>
                            {participant.total_points}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}