import React, { useState } from 'react';
import axios from 'axios';
import { Search, CheckCircle, Clock, XCircle, AlertCircle, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const StatusTracker = () => {
  const [caseId, setCaseId] = useState('');
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleCheckStatus = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setReportData(null);

    try {
      const res = await axios.get(`/api/reports/${caseId}/status`);
      setReportData(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Case ID not found or server error.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Resolved': return <CheckCircle size={64} color="#10b981" />;
      case 'Investigating': return <Search size={64} color="#f59e0b" />;
      case 'Dismissed': return <XCircle size={64} color="#ef4444" />;
      case 'Pending': return <Clock size={64} color="#6366f1" />;
      default: return <AlertCircle size={64} color="#9ca3af" />;
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'Resolved': return 'rgba(16, 185, 129, 0.1)';
      case 'Investigating': return 'rgba(245, 158, 11, 0.1)';
      case 'Dismissed': return 'rgba(239, 68, 68, 0.1)';
      case 'Pending': return 'rgba(99, 102, 241, 0.1)';
      default: return 'rgba(156, 163, 175, 0.1)';
    }
  };

  return (
    <div className="min-h-screen" style={{ padding: '2rem' }}>
      <button 
        onClick={() => navigate('/')} 
        style={{ background: 'transparent', padding: 0, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem' }}
      >
        <ArrowLeft size={20} /> Back to Home
      </button>

      <div className="container" style={{ textAlign: 'center', maxWidth: '600px', marginTop: '4rem' }}>
        <h1 style={{ marginBottom: '1rem' }}>Track Case Status</h1>
        <p style={{ marginBottom: '3rem' }}>Enter your Case ID to check the progress of your report.</p>
        
        <div className="card" style={{ padding: '3rem 2rem' }}>
          <form onSubmit={handleCheckStatus} style={{ marginBottom: '2rem' }}>
            <div style={{ position: 'relative', maxWidth: '400px', margin: '0 auto' }}>
              <input 
                type="text" 
                placeholder="CASE ID (e.g. 8A2F1C)" 
                value={caseId}
                onChange={(e) => setCaseId(e.target.value.toUpperCase())}
                required
                style={{ 
                  textAlign: 'center', 
                  fontSize: '1.5rem', 
                  letterSpacing: '3px',
                  textTransform: 'uppercase',
                  padding: '1rem',
                  borderRadius: '12px',
                  fontWeight: 'bold',
                  background: 'var(--bg-dark)'
                }}
              />
            </div>
            <button type="submit" className="primary-btn" disabled={loading} style={{ marginTop: '1.5rem', minWidth: '200px' }}>
              {loading ? 'Searching Database...' : 'Track Case'}
            </button>
          </form>

          {error && (
            <div className="error animate-fade-in" style={{ padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '8px' }}>
              {error}
            </div>
          )}

          {reportData && (
            <div className="animate-fade-in">
                {/* Main Status */}
                <div style={{ 
                  background: getStatusColor(reportData.status), 
                  padding: '2rem', 
                  borderRadius: '16px',
                  marginTop: '2rem',
                  border: '1px solid rgba(255,255,255,0.05)'
                }}>
                  <div style={{ marginBottom: '1rem' }}>
                    {getStatusIcon(reportData.status)}
                  </div>
                  <h2 style={{ margin: '0 0 0.5rem 0', color: '#fff' }}>{reportData.status}</h2>
                  <p style={{ opacity: 0.8, margin: 0 }}>{getStatusMessage(reportData.status)}</p>
                </div>

                {/* Tracking Steps */}
                <div style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {/* Viewed Step */}
                    <div style={{ 
                        display: 'flex', alignItems: 'center', gap: '1rem', 
                        padding: '1rem', background: 'var(--bg-dark)', borderRadius: '12px',
                        opacity: reportData.viewed ? 1 : 0.5
                    }}>
                        {reportData.viewed ? <CheckCircle color="var(--success)" /> : <div style={{width: 24, height: 24, border: '2px solid var(--text-muted)', borderRadius: '50%'}} />}
                        <div style={{ textAlign: 'left' }}>
                            <div style={{ fontWeight: 'bold' }}>Viewed by Admin</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                {reportData.viewed ? 'Your report has been opened and reviewed.' : 'Pending review.'}
                            </div>
                        </div>
                    </div>

                    {/* Forwarded Step */}
                    <div style={{ 
                        display: 'flex', alignItems: 'center', gap: '1rem', 
                        padding: '1rem', background: 'var(--bg-dark)', borderRadius: '12px',
                        opacity: reportData.forwarded ? 1 : 0.5
                    }}>
                        {reportData.forwarded ? <CheckCircle color="var(--primary)" /> : <div style={{width: 24, height: 24, border: '2px solid var(--text-muted)', borderRadius: '50%'}} />}
                        <div style={{ textAlign: 'left' }}>
                            <div style={{ fontWeight: 'bold' }}>Forwarded to Authorities</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                {reportData.forwarded ? 'Escalated to appropriate university body.' : 'Not yet escalated.'}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StatusTracker;
