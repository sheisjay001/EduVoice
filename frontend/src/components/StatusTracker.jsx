import React, { useState } from 'react';
import axios from 'axios';
import { Search, CheckCircle, Clock, XCircle, AlertCircle } from 'lucide-react';

const StatusTracker = () => {
  const [caseId, setCaseId] = useState('');
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCheckStatus = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setStatus(null);

    try {
      const res = await axios.get(`/api/reports/${caseId}/status`);
      setStatus(res.data.status);
    } catch (err) {
      setError(err.response?.data?.message || 'Case ID not found or server error.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Resolved': return <CheckCircle size={48} color="#22c55e" />;
      case 'Investigating': return <Search size={48} color="#f59e0b" />;
      case 'Dismissed': return <XCircle size={48} color="#ef4444" />;
      case 'Pending': return <Clock size={48} color="#646cff" />;
      default: return <AlertCircle size={48} color="#9ca3af" />;
    }
  };

  const getStatusMessage = (status) => {
    switch (status) {
      case 'Resolved': return 'This case has been resolved and closed.';
      case 'Investigating': return 'The Ethics Committee is currently reviewing this report.';
      case 'Dismissed': return 'This case was closed due to insufficient evidence or lack of jurisdiction.';
      case 'Pending': return 'Your report has been received and is queued for review.';
      default: return 'Unknown Status';
    }
  };

  return (
    <div className="container" style={{ textAlign: 'center', maxWidth: '600px' }}>
      <h2 style={{ marginBottom: '2rem' }}>Track Case Status</h2>
      
      <form onSubmit={handleCheckStatus} style={{ marginBottom: '2rem' }}>
        <input 
          type="text" 
          placeholder="Enter Case ID (e.g., 8A2F1C)" 
          value={caseId}
          onChange={(e) => setCaseId(e.target.value.toUpperCase())}
          required
          style={{ 
            textAlign: 'center', 
            fontSize: '1.2rem', 
            letterSpacing: '2px',
            textTransform: 'uppercase',
            marginBottom: '1rem'
          }}
        />
        <button type="submit" className="primary-btn" disabled={loading}>
          {loading ? 'Checking...' : 'Track Case'}
        </button>
      </form>

      {error && <div className="error">{error}</div>}

      {status && (
        <div style={{ 
          background: 'rgba(255, 255, 255, 0.05)', 
          padding: '2rem', 
          borderRadius: '16px',
          animation: 'fadeIn 0.5s ease'
        }}>
          <div style={{ marginBottom: '1rem' }}>
            {getStatusIcon(status)}
          </div>
          <h3 style={{ margin: '0 0 0.5rem 0', color: '#fff' }}>{status}</h3>
          <p style={{ opacity: 0.8 }}>{getStatusMessage(status)}</p>
        </div>
      )}
    </div>
  );
};

export default StatusTracker;
