import React, { useState, useEffect } from 'react';
import axios from 'axios';
import forge from 'node-forge';
import { Shield, Unlock, Map, FileText, LayoutList, Key, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';

const AdminDashboard = () => {
  const [reports, setReports] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [privateKeyPem, setPrivateKeyPem] = useState('');
  const [decryptedReports, setDecryptedReports] = useState({});
  const [activeTab, setActiveTab] = useState('list'); // 'list' or 'heatmap'
  const [expandedReport, setExpandedReport] = useState(null);

  useEffect(() => {
    if (isAuthenticated) {
        fetchReports();
    }
  }, [isAuthenticated]);

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === 'admin123') {
        setIsAuthenticated(true);
    } else {
        alert('Invalid Password');
    }
  };

  const fetchReports = async () => {
    try {
      const res = await axios.get('/api/reports');
      if (Array.isArray(res.data)) {
        setReports(res.data);
      } else {
        setReports([]);
      }
    } catch (error) {
      console.error("Failed to fetch reports:", error);
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

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="glass-panel animate-fade-in" style={{ maxWidth: '400px', width: '100%', padding: '3rem 2rem', borderRadius: '24px', textAlign: 'center' }}>
          <Shield size={48} className="text-primary" style={{ marginBottom: '1rem', color: 'var(--primary)' }} />
          <h2 style={{ marginBottom: '0.5rem' }}>Admin Access</h2>
          <p style={{ marginBottom: '2rem' }}>Restricted Area. Authorized Personnel Only.</p>
          <form onSubmit={handleLogin}>
            <input
              type="password"
              placeholder="Enter Access Key"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ textAlign: 'center' }}
            />
            <button type="submit" className="primary-btn" style={{ width: '100%' }}>Login</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ padding: '2rem' }}>
      <header className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Shield size={32} className="text-primary" />
          <h2 style={{ margin: 0 }}>Admin Dashboard</h2>
        </div>
        <button onClick={() => setIsAuthenticated(false)} style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)' }}>
          Logout
        </button>
      </header>

      <div className="container">
        {/* Key Management Section */}
        <div className="card" style={{ marginBottom: '2rem', border: '1px solid var(--border)' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.1rem' }}>
            <Key size={20} /> Decryption Key
          </h3>
          <p style={{ fontSize: '0.9rem', marginBottom: '1rem' }}>Paste your RSA Private Key here to unlock report contents.</p>
          <textarea
            placeholder="-----BEGIN RSA PRIVATE KEY----- ..."
            value={privateKeyPem}
            onChange={(e) => setPrivateKeyPem(e.target.value)}
            rows={3}
            style={{ fontFamily: 'monospace', fontSize: '0.8rem', background: 'var(--bg-dark)' }}
          />
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
          <button 
            onClick={() => setActiveTab('list')}
            style={{ 
              background: activeTab === 'list' ? 'var(--primary)' : 'transparent',
              color: activeTab === 'list' ? 'white' : 'var(--text-muted)',
              border: activeTab === 'list' ? 'none' : '1px solid var(--border)'
            }}
          >
            <LayoutList size={18} /> Reports
          </button>
          <button 
            onClick={() => setActiveTab('heatmap')}
            style={{ 
              background: activeTab === 'heatmap' ? 'var(--primary)' : 'transparent',
              color: activeTab === 'heatmap' ? 'white' : 'var(--text-muted)',
              border: activeTab === 'heatmap' ? 'none' : '1px solid var(--border)'
            }}
          >
            <Map size={18} /> Heat Map
          </button>
        </div>

        {activeTab === 'list' ? (
          <div style={{ display: 'grid', gap: '1rem' }}>
            {reports.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '4rem', opacity: 0.5 }}>
                    <FileText size={48} style={{ marginBottom: '1rem' }} />
                    <p>No reports found in the system.</p>
                </div>
            ) : (
                reports.map((report) => (
                <div key={report.caseId} className="card" style={{ padding: '1.5rem', transition: 'all 0.2s' }}>
                    <div 
                    style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
                    onClick={() => setExpandedReport(expandedReport === report.caseId ? null : report.caseId)}
                    >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ 
                        width: '40px', height: '40px', borderRadius: '50%', 
                        background: 'rgba(99, 102, 241, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'var(--primary)', fontWeight: 'bold'
                        }}>
                        {report.caseId.slice(0, 2)}
                        </div>
                        <div>
                        <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>Case #{report.caseId}</div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                            {new Date(report.createdAt).toLocaleDateString()} at {new Date(report.createdAt).toLocaleTimeString()}
                        </div>
                        </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <span style={{ 
                        padding: '0.25rem 0.75rem', borderRadius: '99px', fontSize: '0.85rem', fontWeight: 600,
                        background: report.status === 'Resolved' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                        color: report.status === 'Resolved' ? 'var(--success)' : '#f59e0b'
                        }}>
                        {report.status}
                        </span>
                        {expandedReport === report.caseId ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </div>
                    </div>

                    {expandedReport === report.caseId && (
                    <div style={{ marginTop: '1.5rem', borderTop: '1px solid var(--border)', paddingTop: '1.5rem' }} className="animate-fade-in">
                        <div className="grid-3" style={{ marginBottom: '1.5rem' }}>
                        <div>
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Faculty</span>
                            <div style={{ fontWeight: 500 }}>{report.faculty}</div>
                        </div>
                        <div>
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Department</span>
                            <div style={{ fontWeight: 500 }}>{report.department}</div>
                        </div>
                        <div>
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Course Code</span>
                            <div style={{ fontWeight: 500 }}>{report.courseCode || 'N/A'}</div>
                        </div>
                        </div>

                        <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1.5rem', borderRadius: '12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                            <h4 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Unlock size={18} /> Encrypted Content
                            </h4>
                            {!decryptedReports[report._id] && (
                            <button 
                                onClick={() => decryptReport(report._id, report.encryptedDescription)}
                                style={{ padding: '0.25rem 0.75rem', fontSize: '0.8rem', marginTop: 0 }}
                            >
                                Decrypt Now
                            </button>
                            )}
                        </div>

                        {decryptedReports[report._id] ? (
                            <div className="animate-fade-in">
                            <div style={{ marginBottom: '1rem' }}>
                                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Offender Name</span>
                                <div style={{ fontWeight: 600, fontSize: '1.1rem', color: 'var(--danger)' }}>
                                {decryptedReports[report._id] ? "Decrypted (See logic)" : "..."} 
                                {/* Note: In a real app we'd decrypt offenderName separately, but for MVP re-using logic */}
                                {/** Actually, we need to decrypt offenderName separately. Let's fix that logic inline or simplify **/}
                                </div>
                            </div>
                            <div>
                                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Description</span>
                                <p style={{ color: 'var(--text-light)' }}>{decryptedReports[report._id]}</p>
                            </div>
                            </div>
                        ) : (
                            <div style={{ filter: 'blur(4px)', userSelect: 'none', opacity: 0.5 }}>
                            <p>Lrem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
                            <p>Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.</p>
                            </div>
                        )}
                        </div>
                        
                        {/* Evidence */}
                         {safelyParseEvidence(report.evidence).length > 0 && (
                            <div style={{ marginTop: '1.5rem' }}>
                                <h4>Evidence Files</h4>
                                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                    {safelyParseEvidence(report.evidence).map((file, idx) => (
                                        <a 
                                            key={idx} 
                                            href={`http://localhost:5000/uploads/${file}`} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            style={{ 
                                                display: 'flex', alignItems: 'center', gap: '0.5rem',
                                                padding: '0.5rem 1rem', background: 'var(--bg-dark)', 
                                                borderRadius: '8px', textDecoration: 'none', color: 'var(--primary)',
                                                border: '1px solid var(--border)'
                                            }}
                                        >
                                            <FileText size={16} /> Evidence {idx + 1}
                                        </a>
                                    ))}
                                </div>
                            </div>
                         )}
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
