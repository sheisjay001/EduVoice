import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import VerifyOtp from './components/VerifyOtp';
import ReportPage from './components/ReportPage';
import AdminDashboard from './components/AdminDashboard';
import StatusTracker from './components/StatusTracker';
import './App.css'

function App() {
  const handlePanic = () => {
    window.location.href = "https://en.wikipedia.org/wiki/Special:Random";
  };

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/verify" element={<VerifyOtp />} />
        <Route path="/report" element={<ReportPage />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/status" element={<StatusTracker />} />
      </Routes>
      
      {/* Panic Button available globally */}
      <button className="panic-btn" onClick={handlePanic} title="Panic Button">
        EXIT
      </button>
    </Router>
  )
}

export default App
