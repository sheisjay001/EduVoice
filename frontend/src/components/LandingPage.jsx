import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Shield, Lock, EyeOff, ArrowRight } from 'lucide-react';

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
      navigate('/verify', { state: { email } });
    } catch (err) {
      // Prioritize "detail" if available (for database errors), otherwise "message"
      const detail = err.response?.data?.detail;
      const message = err.response?.data?.message;
      
      let msg = message || `Failed to send OTP (${err.response?.status || 'Network Error'}). Please try again.`;
      if (detail) {
        msg += ` Details: ${detail}`;
      }
      
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Navbar Placeholder for future expansion */}
      <nav style={{ padding: '2rem 0', display: 'flex', justifyContent: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Shield size={32} className="text-primary" style={{ color: 'var(--primary)' }} />
          <span style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>Edu-Voice</span>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="container animate-fade-in" style={{ textAlign: 'center' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 1rem' }}>
          <h1 style={{ marginBottom: '1.5rem', wordBreak: 'break-word' }}>
            Speak Up. Stay Safe.<br />
            <span className="text-gradient">Totally Anonymous.</span>
          </h1>
          <p style={{ fontSize: 'clamp(1rem, 4vw, 1.25rem)', maxWidth: '600px', margin: '0 auto 3rem auto' }}>
            The decentralized whistleblower platform for Nigerian tertiary institutions. 
            Report incidents without revealing your identity.
          </p>
        </div>

        {/* Action Cards */}
        <div className="grid-3" style={{ 
          maxWidth: '900px', 
          margin: '0 auto' 
        }}>
          {/* Verify Card */}
          <div className="glass-panel" style={{ padding: 'min(2.5rem, 5vw)', borderRadius: '24px' }}>
            <h3 style={{ marginBottom: '0.5rem' }}>Verify Your Student Status</h3>
            <p style={{ fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              We use a "Stateless OTP" to verify you belong to an institution without linking the report to your ID.
            </p>
            
            <form onSubmit={handleSendOtp} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{ textAlign: 'left' }}>
                <label htmlFor="email" style={{ fontSize: '0.875rem', fontWeight: 600, marginLeft: '4px' }}>Institutional Email</label>
                <input
                  type="email"
                  id="email"
                  placeholder="student@university.edu.ng"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  style={{ marginTop: '0.5rem' }}
                />
              </div>
              
              {error && (
                <div className="error" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textAlign: 'left' }}>
                  <span style={{ fontSize: '1.2rem' }}>•</span> {error}
                </div>
              )}
              
              <button type="submit" className="primary-btn" disabled={loading} style={{ width: '100%', marginTop: '0.5rem' }}>
                {loading ? 'Sending Code...' : 'Verify Identity'}
                {!loading && <ArrowRight size={18} />}
              </button>
            </form>
          </div>

          {/* Status Tracker Card */}
          <div className="glass-panel" style={{ padding: 'min(2.5rem, 5vw)', borderRadius: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <h3 style={{ marginBottom: '0.5rem' }}>Track Report Status</h3>
            <p style={{ fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              Already submitted a report? Use your Case ID to check the investigation status anonymously.
            </p>
            <div style={{ marginTop: 'auto' }}>
               <button 
                  onClick={() => navigate('/status')}
                  className="primary-btn" 
                  style={{ 
                    width: '100%', 
                    background: 'rgba(255,255,255,0.1)', 
                    border: '1px solid var(--primary)',
                    boxShadow: 'none'
                  }}
               >
                Check Status
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section className="container" style={{ padding: '4rem 1rem' }}>
        <div className="grid-3">
          <div className="card">
            <EyeOff size={40} style={{ color: 'var(--accent)', marginBottom: '1rem' }} />
            <h3>Zero-Knowledge</h3>
            <p>We verify <i>that</i> you are a student, not <i>who</i> you are. Your report is cryptographically unlinkable to your email.</p>
          </div>
          <div className="card">
            <Lock size={40} style={{ color: 'var(--primary)', marginBottom: '1rem' }} />
            <h3>Client-Side Encryption</h3>
            <p>Reports are encrypted on your device using RSA-OAEP before they ever reach our servers. Only the admin key can decrypt them.</p>
          </div>

        </div>
      </section>

      {/* Footer */}
      <footer style={{ 
        textAlign: 'center', 
        padding: '3rem 1rem', 
        borderTop: '1px solid var(--border)',
        marginTop: '2rem',
        color: 'var(--text-muted)'
      }}>
        <div style={{ marginBottom: '1rem' }}>
          <a href="/status" style={{ color: 'var(--text-light)', textDecoration: 'none', margin: '0 1rem', fontWeight: 500 }}>Status Tracker</a>
        </div>
        <p style={{ fontSize: '0.875rem' }}>&copy; {new Date().getFullYear()} Edu-Voice Platform. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default LandingPage;
