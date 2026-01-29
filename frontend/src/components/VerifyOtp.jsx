import React, { useState } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import { Lock, ArrowRight } from 'lucide-react';

const VerifyOtp = () => {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  
  const email = location.state?.email;

  // Redirect if no email provided
  if (!email) {
    navigate('/');
    return null;
  }

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await axios.post('/api/auth/verify-otp', { email, otp });
      const { token } = res.data;
      navigate('/report', { state: { token } });
    } catch (err) {
      setError(err.response?.data?.message || `Invalid Code (${err.response?.status || 'Error'}). Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div className="glass-panel animate-fade-in" style={{ maxWidth: '450px', width: '100%', padding: '3rem 2rem', borderRadius: '24px', textAlign: 'center' }}>
        
        <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'center' }}>
          <div style={{ background: 'rgba(99, 102, 241, 0.1)', padding: '1.5rem', borderRadius: '50%' }}>
            <Lock size={48} className="text-primary" style={{ color: 'var(--primary)' }} />
          </div>
        </div>

        <h2 style={{ marginBottom: '0.5rem' }}>Enter Verification Code</h2>
        <p style={{ fontSize: '0.95rem' }}>
          We've sent a 6-digit code to <br/>
          <span style={{ color: 'var(--text-light)', fontWeight: 500 }}>{email}</span>
        </p>

        <form onSubmit={handleVerify} style={{ marginTop: '2rem' }}>
          <input
            type="text"
            placeholder="000000"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            maxLength="6"
            style={{ 
              textAlign: 'center', 
              fontSize: '2rem', 
              letterSpacing: '0.5rem', 
              fontWeight: 700,
              padding: '1rem',
              background: 'rgba(15, 23, 42, 0.8)',
              borderColor: 'var(--border)',
              marginBottom: '1.5rem'
            }}
            required
            autoFocus
          />
          
          {error && <div className="error" style={{ marginBottom: '1.5rem' }}>{error}</div>}
          
          <button type="submit" className="primary-btn" disabled={loading} style={{ width: '100%' }}>
            {loading ? 'Verifying...' : 'Access Secure Channel'}
            {!loading && <ArrowRight size={20} />}
          </button>
        </form>

        <p style={{ marginTop: '2rem', fontSize: '0.8rem', opacity: 0.6 }}>
          This session is stateless. Refreshing will require re-verification.
        </p>
      </div>
    </div>
  );
};

export default VerifyOtp;
