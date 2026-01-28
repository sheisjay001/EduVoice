import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Shield } from 'lucide-react';

const LandingPage = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!email.endsWith('.edu.ng')) {
      setError('Please use a valid .edu.ng school email.');
      setLoading(false);
      return;
    }

    try {
      await axios.post('/api/auth/send-otp', { email });
      // Navigate to verify page with email in state
      navigate('/verify', { state: { email } });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '2rem' }}>
        <Shield size={64} color="#646cff" />
        <h1>Edu-Voice</h1>
        <p>The Zero-Knowledge Campus Safety Platform</p>
      </div>
      
      <div style={{ textAlign: 'left', marginBottom: '2rem' }}>
        <h3>Report Safely & Anonymously</h3>
        <p style={{ fontSize: '0.9rem', opacity: 0.8 }}>
          Your identity is verified but never stored. We use a "Stateless OTP" mechanism to ensure
          you are a student without linking your report to your identity.
        </p>
      </div>

      <form onSubmit={handleSendOtp}>
        <label htmlFor="email">Institutional Email</label>
        <input
          type="email"
          id="email"
          placeholder="student@university.edu.ng"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        {error && <div className="error">{error}</div>}
        <button type="submit" className="primary-btn" disabled={loading}>
          {loading ? 'Sending Code...' : 'Verify Identity'}
        </button>
      </form>

      <footer style={{ marginTop: '4rem', opacity: 0.3, fontSize: '0.8rem', display: 'flex', gap: '1rem' }}>
        <a href="/status" style={{ color: 'inherit', textDecoration: 'none' }}>Status Tracker</a>
        <span>|</span>
        <a href="/admin" style={{ color: 'inherit', textDecoration: 'none' }}>Admin Access</a>
      </footer>
    </div>
  );
};

export default LandingPage;
