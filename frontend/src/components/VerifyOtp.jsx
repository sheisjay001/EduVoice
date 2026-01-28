import React, { useState } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import { Lock } from 'lucide-react';

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
      
      // Store token in state/context (avoiding localStorage for "Air-Lock" hygiene, 
      // though typically you'd put it in memory for the session)
      // For this implementation, we pass it via navigation state to the report page
      navigate('/report', { state: { token } });
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid Code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '2rem' }}>
        <Lock size={64} color="#646cff" />
        <h2>Enter Verification Code</h2>
        <p>Sent to {email}</p>
      </div>

      <form onSubmit={handleVerify}>
        <input
          type="text"
          placeholder="Enter 6-digit OTP"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          maxLength="6"
          style={{ textAlign: 'center', fontSize: '1.5rem', letterSpacing: '0.5rem' }}
          required
        />
        {error && <div className="error">{error}</div>}
        <button type="submit" className="primary-btn" disabled={loading}>
          {loading ? 'Verifying...' : 'Access Safe Mode'}
        </button>
      </form>
    </div>
  );
};

export default VerifyOtp;
