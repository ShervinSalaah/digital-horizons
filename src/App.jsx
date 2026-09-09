import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import GuestDashboard from './GuestDashboard';
import AdminDashboard from './AdminDashboard';

function App() {
  return (
    <BrowserRouter>
      {/* Optional minimal navigation bar */}
      <nav className="bg-white p-4 shadow-sm flex justify-center gap-6">
        <Link to="/" className="text-brand font-semibold hover:text-brand-dark">Leaderboard</Link>
        <Link to="/admin" className="text-brand font-semibold hover:text-brand-dark">Admin Panel</Link>
      </nav>

      <Routes>
        <Route path="/" element={<GuestDashboard />} />
        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;