import React, { useState, useEffect } from 'react';
import axios from 'axios';
import forge from 'node-forge';
import { Shield, Unlock, Map, FileText, LayoutList, Key, ChevronDown, ChevronUp, AlertCircle, CheckCircle } from 'lucide-react';

const AdminDashboard = () => {
  const [reports, setReports] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState('email'); // 'email', 'otp', 'dashboard'
  const [loading, setLoading] = useState(false);
  const [privateKeyPem, setPrivateKeyPem] = useState('');
  const [decryptedReports, setDecryptedReports] = useState({});
  const [activeTab, setActiveTab] = useState('list'); // 'list' or 'heatmap'
  const [expandedReport, setExpandedReport] = useState(null);

  useEffect(() => {
    if (isAuthenticated) {
        fetchReports(email);
    }
  }, [isAuthenticated, email]);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post('/api/auth/send-otp', { email });
      setStep('otp');
      alert(`OTP sent to ${email}`);
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post('/api/auth/verify-otp', { email, otp });
      setIsAuthenticated(true);
      setStep('dashboard'); // Just to track state, though isAuthenticated handles view
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  const fetchReports = async (adminEmail) => {
    setLoading(true);
    try {
      console.log(`Fetching reports for: ${adminEmail}`);
      const res = await axios.get('/api/reports', {
        params: { adminEmail }
      });
      console.log("Reports fetched:", res.data);
      if (Array.isArray(res.data)) {
        setReports(res.data);
      } else {
        setReports([]);
      }
    } catch (error) {
      console.error("Failed to fetch reports:", error);
      const errorMsg = error.response?.data?.message || error.response?.data?.error || error.message || "Unknown error";
      const errorStack = error.response?.data?.detail || "No stack trace"; // Backend might send detailed stack
      alert(`Failed to fetch reports: ${errorMsg}\nDetails: ${errorStack}`);
    } finally {
      setLoading(false);
    }
  };

  const decryptReport = (id, encryptedData) => {
    if (!privateKeyPem) {
      alert("Please enter the Private Key first.");
      return;
    }

    try {
      let formattedKey = privateKeyPem.trim();
      if (!formattedKey.includes('-----BEGIN RSA PRIVATE KEY-----')) {
        formattedKey = `-----BEGIN RSA PRIVATE KEY-----\n${formattedKey}\n-----END RSA PRIVATE KEY-----`;
      }

      const privateKey = forge.pki.privateKeyFromPem(formattedKey);
      const encryptedBytes = forge.util.decode64(encryptedData);
      const decrypted = privateKey.decrypt(encryptedBytes, 'RSA-OAEP', {
        md: forge.md.sha256.create(),
        mgf1: { md: forge.md.sha256.create() }
      });

      setDecryptedReports(prev => ({
        ...prev,
        [id]: decrypted
      }));
    } catch (error) {
      console.error("Decryption Failed:", error);
      alert("Decryption Failed. Key mismatch.");
    }
  };

  const safelyParseEvidence = (evidence) => {
    try {
      if (!evidence) return [];
      if (Array.isArray(evidence)) return evidence;
      if (typeof evidence === 'string') {
         const parsed = JSON.parse(evidence);
         return Array.isArray(parsed) ? parsed : [];
      }
      return [];
    } catch {
      return [];
    }
  };

  const updateReportStatus = async (caseId, newStatus) => {
    try {
      await axios.patch(`/api/reports/${caseId}/status`, { status: newStatus });
      
      // Update local state
      setReports(prevReports => 
        prevReports.map(r => 
          r.caseId === caseId ? { ...r, status: newStatus } : r
        )
      );
    } catch (error) {
      console.error(`Failed to update status:`, error);
      alert(`Failed to update status`);
    }
  };

  const handleClearAllReports = async () => {
    if (!window.confirm("Are you sure you want to DELETE ALL reports? This action cannot be undone.")) {
      return;
    }

    try {
      setLoading(true);
      const res = await axios.delete('/api/reports/all', {
        params: { adminEmail: email }
      });
      alert(res.data.message);
      setReports([]); // Clear local state
    } catch (error) {
      console.error("Failed to clear reports:", error);
      alert(error.response?.data?.message || "Failed to clear reports");
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '1rem' }}>
        <div className="glass-panel animate-fade-in" style={{ maxWidth: '400px', width: '100%', padding: '3rem 2rem', borderRadius: '24px', textAlign: 'center' }}>
          <Shield size={48} className="text-primary" style={{ marginBottom: '1rem', color: 'var(--primary)' }} />
          <h2 style={{ marginBottom: '0.5rem' }}>Admin Access</h2>
          <p style={{ marginBottom: '2rem' }}>Restricted Area. Authorized Personnel Only.</p>
          
          {step === 'email' ? (
              <form onSubmit={handleSendOtp}>
                <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', textAlign: 'left', marginBottom: '0.5rem', fontSize: '0.9rem' }}>School Email</label>
                    <input
                        type="email"
                        placeholder="president@uni.edu.ng"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        style={{ textAlign: 'center', width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-dark)', color: 'white' }}
                        required
                    />
                </div>
                <button 
                    type="submit" 
                    className="primary-btn" 
                    style={{ width: '100%' }}
                    disabled={loading}
                >
                    {loading ? 'Sending...' : 'Get OTP'}
                </button>
              </form>
          ) : (
              <form onSubmit={handleVerifyOtp}>
                <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', textAlign: 'left', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Enter OTP</label>
                    <input
                        type="text"
                        placeholder="123456"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        style={{ textAlign: 'center', width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-dark)', color: 'white', letterSpacing: '4px', fontSize: '1.2rem' }}
                        required
                        maxLength={6}
                    />
                </div>
                <button 
                    type="submit" 
                    className="primary-btn" 
                    style={{ width: '100%' }}
                    disabled={loading}
                >
                    {loading ? 'Verifying...' : 'Login'}
                </button>
                <button 
                    type="button"
                    onClick={() => setStep('email')}
                    style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', marginTop: '1rem', cursor: 'pointer', fontSize: '0.9rem' }}
                >
                    Change Email
                </button>
              </form>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ padding: 'min(2rem, 4vw)' }}>
      <header className="container" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Shield size={32} className="text-primary" />
            <h2 style={{ margin: 0, fontSize: 'clamp(1.25rem, 5vw, 1.75rem)' }}>Admin Dashboard</h2>
            <span style={{ fontSize: '0.75rem', background: 'var(--bg-card)', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
               {reports.length} Reports
            </span>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            {email === 'joy.m2200251@st.futminna.edu.ng' && (
              <button 
                onClick={handleClearAllReports}
                className="secondary-btn"
                style={{ 
                  padding: '0.5rem 1rem', 
                  fontSize: '0.875rem', 
                  borderColor: 'rgba(239, 68, 68, 0.5)', 
                  color: '#ef4444',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                <AlertCircle size={16} />
                Clear All Reports
              </button>
            )}
            <button onClick={() => fetchReports(email)} className="secondary-btn" disabled={loading} style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>
              {loading ? '...' : 'Refresh'}
            </button>
            <button onClick={() => { setIsAuthenticated(false); setStep('email'); }} className="secondary-btn" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="container" style={{ padding: 0 }}>
        {/* Key Management Section */}
        <div className="card" style={{ marginBottom: '1.5rem', padding: '1.25rem', border: '1px solid var(--border)' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1rem', marginBottom: '0.75rem' }}>
            <Key size={18} /> Decryption Key
          </h3>
          <p style={{ fontSize: '0.8rem', marginBottom: '0.75rem' }}>Paste your Private Key to unlock report contents.</p>
          <textarea
            placeholder="-----BEGIN RSA PRIVATE KEY-----"
            value={privateKeyPem}
            onChange={(e) => setPrivateKeyPem(e.target.value)}
            rows={2}
            style={{ fontFamily: 'monospace', fontSize: '0.75rem', background: 'var(--bg-dark)', marginBottom: 0 }}
          />
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
          <button 
            onClick={() => setActiveTab('list')}
            style={{ 
              background: activeTab === 'list' ? 'var(--primary)' : 'transparent',
              color: activeTab === 'list' ? 'white' : 'var(--text-muted)',
              border: activeTab === 'list' ? 'none' : '1px solid var(--border)',
              padding: '0.5rem 1rem',
              fontSize: '0.875rem',
              whiteSpace: 'nowrap'
            }}
          >
            <LayoutList size={16} /> Reports
          </button>
          <button 
            onClick={() => setActiveTab('heatmap')}
            style={{ 
              background: activeTab === 'heatmap' ? 'var(--primary)' : 'transparent',
              color: activeTab === 'heatmap' ? 'white' : 'var(--text-muted)',
              border: activeTab === 'heatmap' ? 'none' : '1px solid var(--border)',
              padding: '0.5rem 1rem',
              fontSize: '0.875rem',
              whiteSpace: 'nowrap'
            }}
          >
            <Map size={16} /> Heat Map
          </button>
        </div>

        {activeTab === 'list' ? (
          <div style={{ display: 'grid', gap: '1rem' }}>
            {reports.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem 1rem', opacity: 0.5 }}>
                    <FileText size={40} style={{ marginBottom: '1rem' }} />
                    <p>No reports found in the system.</p>
                </div>
            ) : (
                reports.map((report) => (
                <div key={report.caseId} className="card" style={{ padding: '1.25rem', transition: 'all 0.2s' }}>
                    <div 
                    style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', gap: '1rem' }}
                    onClick={() => setExpandedReport(expandedReport === report.caseId ? null : report.caseId)}
                    >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ 
                        width: '36px', height: '36px', borderRadius: '50%', 
                        background: 'rgba(99, 102, 241, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'var(--primary)', fontWeight: 'bold', fontSize: '0.8rem'
                        }}>
                        {report.caseId.slice(0, 2)}
                        </div>
                        <div>
                        <div style={{ fontWeight: 'bold', fontSize: '1rem' }}>Case #{report.caseId}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            {new Date(report.createdAt).toLocaleDateString()}
                        </div>
                        </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: '1', justifyContent: 'flex-end' }}>
                        <span style={{ 
                        padding: '0.2rem 0.6rem', borderRadius: '99px', fontSize: '0.75rem', fontWeight: 600,
                        background: report.status === 'Resolved' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                        color: report.status === 'Resolved' ? 'var(--success)' : '#f59e0b'
                        }}>
                        {report.status}
                        </span>
                        {expandedReport === report.caseId ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </div>
                    </div>

                    {expandedReport === report.caseId && (
                    <div style={{ marginTop: '1.25rem', borderTop: '1px solid var(--border)', paddingTop: '1.25rem' }} className="animate-fade-in">
                        <div className="grid-3" style={{ marginBottom: '1.25rem', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem' }}>
                        <div>
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Institution</span>
                            <div style={{ fontWeight: 500, fontSize: '0.85rem' }}>{report.institution || 'N/A'}</div>
                        </div>
                        <div>
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Faculty</span>
                            <div style={{ fontWeight: 500, fontSize: '0.85rem' }}>{report.faculty}</div>
                        </div>
                        <div>
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Department</span>
                            <div style={{ fontWeight: 500, fontSize: '0.85rem' }}>{report.department}</div>
                        </div>
                        <div>
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Course Code</span>
                            <div style={{ fontWeight: 500, fontSize: '0.85rem' }}>{report.courseCode || 'N/A'}</div>
                        </div>
                        </div>

                        <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '12px' }}>
                        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: '1rem', marginBottom: '1rem' }}>
                            <h4 style={{ margin: 0, fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Unlock size={16} /> Encrypted Content
                            </h4>
                            {!decryptedReports[report._id] && (
                            <button 
                                onClick={() => decryptReport(report._id, report.encryptedDescription)}
                                style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem', marginTop: 0 }}
                            >
                                Decrypt Now
                            </button>
                            )}
                        </div>

                        {decryptedReports[report._id] ? (
                            <div className="animate-fade-in">
                            <div>
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Description</span>
                                <p style={{ color: 'var(--text-light)', fontSize: '0.9rem', lineHeight: '1.5' }}>{decryptedReports[report._id]}</p>
                            </div>
                            </div>
                        ) : (
                            <div style={{ filter: 'blur(4px)', userSelect: 'none', opacity: 0.5, fontSize: '0.85rem' }}>
                            <p>Lrem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
                            </div>
                        )}
                        </div>
                        
                        {/* Evidence */}
                         {safelyParseEvidence(report.evidence).length > 0 && (
                            <div style={{ marginTop: '1.25rem' }}>
                                <h4 style={{ fontSize: '0.9rem', marginBottom: '0.75rem' }}>Evidence Files</h4>
                                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                    {safelyParseEvidence(report.evidence).map((file, idx) => (
                                        <a 
                                            key={idx} 
                                            href={`http://localhost:5000/uploads/${file}`} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            style={{ 
                                                display: 'flex', alignItems: 'center', gap: '0.5rem',
                                                padding: '0.4rem 0.75rem', background: 'var(--bg-dark)', 
                                                borderRadius: '8px', textDecoration: 'none', color: 'var(--primary)',
                                                border: '1px solid var(--border)', fontSize: '0.8rem'
                                            }}
                                        >
                                            <FileText size={14} /> Evidence {idx + 1}
                                        </a>
                                    ))}
                                </div>
                            </div>
                         )}

                        {/* Status Controls */}
                        <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Update Status:</span>
                            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                                {['Pending', 'Investigating', 'Resolved', 'Dismissed'].map((status) => (
                                    <button 
                                        key={status}
                                        onClick={() => updateReportStatus(report.caseId, status)}
                                        style={{ 
                                            padding: '0.35rem 0.6rem',
                                            borderRadius: '6px',
                                            fontSize: '0.75rem',
                                            border: '1px solid var(--border)',
                                            background: report.status === status ? 'var(--primary)' : 'transparent',
                                            color: report.status === status ? 'white' : 'var(--text-muted)',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s',
                                            flex: '1',
                                            minWidth: '80px'
                                        }}
                                    >
                                        {status}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                    )}
                </div>
                ))
            )}
          </div>
        ) : (
          <div className="card">
            <h3>Incident Heat Map</h3>
            <p>Visualizing report frequency by faculty.</p>
            
            <div style={{ marginTop: '2rem' }}>
              {Object.entries(reports.reduce((acc, r) => {
                acc[r.faculty] = (acc[r.faculty] || 0) + 1;
                return acc;
              }, {})).map(([faculty, count], idx) => (
                <div key={idx} style={{ marginBottom: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span>{faculty}</span>
                    <span>{count} Reports</span>
                  </div>
                  <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px' }}>
                    <div style={{ 
                      width: `${(count / reports.length) * 100}%`, 
                      height: '100%', 
                      background: 'var(--gradient-main)', 
                      borderRadius: '4px',
                      transition: 'width 1s ease-out'
                    }} />
                  </div>
                </div>
              ))}
              
              {reports.length === 0 && <p style={{ opacity: 0.5 }}>No data available to generate heat map.</p>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
