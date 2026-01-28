import React, { useState, useEffect } from 'react';
import axios from 'axios';
import forge from 'node-forge';
import { Shield, Unlock, Map, FileText } from 'lucide-react';

const AdminDashboard = () => {
  const [reports, setReports] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [privateKeyPem, setPrivateKeyPem] = useState('');
  const [decryptedReports, setDecryptedReports] = useState({});
  const [activeTab, setActiveTab] = useState('list'); // 'list' or 'heatmap'

  useEffect(() => {
    if (isAuthenticated) {
        fetchReports();
    }
  }, [isAuthenticated]);

  const handleLogin = (e) => {
    e.preventDefault();
    // Simple MVP authentication
    if (password === 'admin123') {
        setIsAuthenticated(true);
    } else {
        alert('Invalid Password');
    }
  };

  const fetchReports = async () => {
    try {
      console.log("Fetching reports...");
      const res = await axios.get('/api/reports');
      console.log("Reports fetched:", res.data);
      if (Array.isArray(res.data)) {
        setReports(res.data);
      } else {
        console.error("API did not return an array:", res.data);
        setReports([]);
      }
    } catch (error) {
      console.error("Failed to fetch reports:", error);
      alert("Failed to fetch reports. Check console.");
    }
  };

  const decryptReport = (id, encryptedData) => {
    if (!privateKeyPem) {
      alert("Please enter the Private Key first.");
      return;
    }

    try {
      // Robust Key Formatting: Add headers if missing
      let formattedKey = privateKeyPem.trim();
      if (!formattedKey.includes('-----BEGIN RSA PRIVATE KEY-----')) {
        formattedKey = `-----BEGIN RSA PRIVATE KEY-----\n${formattedKey}\n-----END RSA PRIVATE KEY-----`;
      }

      const privateKey = forge.pki.privateKeyFromPem(formattedKey);
      
      // Decrypt logic matching the encryption (RSA-OAEP with SHA-256)
      const encryptedBytes = forge.util.decode64(encryptedData);
      const decrypted = privateKey.decrypt(encryptedBytes, 'RSA-OAEP', {
        md: forge.md.sha256.create(),
        mgf1: {
          md: forge.md.sha256.create()
        }
      });

      setDecryptedReports(prev => ({
        ...prev,
        [id]: decrypted
      }));
    } catch (error) {
      console.error("Decryption Failed:", error);
      alert("Decryption Failed. Ensure you are using the correct Private Key matching the Public Key used for submission.");
    }
  };

  // Simple aggregation for "Heat Map"
  const getLocationStats = () => {
    const stats = {};
    reports.forEach(r => {
      const loc = r.faculty || 'Unknown';
      stats[loc] = (stats[loc] || 0) + 1;
    });
    return Object.entries(stats).sort((a, b) => b[1] - a[1]);
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
    } catch (e) {
      console.error("Error parsing evidence:", e);
      return [];
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="container" style={{ textAlign: 'center', marginTop: '4rem' }}>
        <Shield size={64} color="#ef4444" style={{ marginBottom: '1rem' }} />
        <h2>Restricted Access</h2>
        <p>Authorized Personnel Only</p>
        <form onSubmit={handleLogin} style={{ marginTop: '2rem' }}>
          <input 
            type="password" 
            placeholder="Enter Admin Passkey" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            style={{ padding: '0.8rem', width: '250px', marginRight: '1rem' }}
          />
          <button type="submit" className="primary-btn">Unlock Portal</button>
        </form>
      </div>
    );
  }
  
  // Debug Rendering
  console.log("Rendering Dashboard with reports:", reports);

  return (
    <div className="container" style={{ maxWidth: '1200px' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Shield size={40} color="#646cff" />
          <h1>Admin Portal</h1>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button onClick={() => setActiveTab('list')} className={activeTab === 'list' ? 'primary-btn' : ''}>
            <FileText size={18} /> Reports
          </button>
          <button onClick={() => setActiveTab('heatmap')} className={activeTab === 'heatmap' ? 'primary-btn' : ''}>
            <Map size={18} /> Heat Map
          </button>
        </div>
      </header>

      {/* Private Key Input Section */}
      <div style={{ background: '#1a1a1a', padding: '1rem', borderRadius: '8px', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: '#fbbf24' }}>
          <Unlock size={20} />
          <h3>Decryption Key</h3>
        </div>
        <textarea
          rows="3"
          placeholder="-----BEGIN RSA PRIVATE KEY----- ..."
          value={privateKeyPem}
          onChange={(e) => setPrivateKeyPem(e.target.value)}
          style={{ width: '100%', fontFamily: 'monospace', fontSize: '0.8rem' }}
        />
      </div>

      {activeTab === 'list' ? (
        <div className="reports-grid" style={{ display: 'grid', gap: '1rem' }}>
          {reports.length === 0 && (
             <p style={{ opacity: 0.6, textAlign: 'center' }}>No reports found.</p>
          )}
          {reports.map(report => (
            <div key={report.caseId} style={{ background: 'rgba(255,255,255,0.05)', padding: '1.5rem', borderRadius: '8px', borderLeft: `4px solid ${report.status === 'Resolved' ? '#22c55e' : '#f59e0b'}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <span style={{ fontFamily: 'monospace', color: '#646cff' }}>#{report.caseId}</span>
                <span style={{ fontSize: '0.8rem', opacity: 0.7 }}>{new Date(report.createdAt).toLocaleDateString()}</span>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <small>Faculty</small>
                  <div>{report.faculty}</div>
                </div>
                <div>
                  <small>Department</small>
                  <div>{report.department}</div>
                </div>
              </div>

              {/* Decryption Section */}
              <div style={{ marginTop: '1rem', padding: '1rem', background: '#000', borderRadius: '4px' }}>
                <div style={{ marginBottom: '0.5rem' }}>
                  <small style={{ color: '#ef4444' }}>Offender:</small>
                  <div>
                    {decryptedReports[`offender-${report.caseId}`] || (
                      <button onClick={() => decryptReport(`offender-${report.caseId}`, report.encryptedOffender)} style={{ padding: '0.2rem 0.5rem', fontSize: '0.7rem' }}>
                        Decrypt
                      </button>
                    )}
                  </div>
                </div>
                <div>
                  <small style={{ color: '#ef4444' }}>Description:</small>
                  <div>
                    {decryptedReports[`desc-${report.caseId}`] || (
                      <button onClick={() => decryptReport(`desc-${report.caseId}`, report.encryptedDescription)} style={{ padding: '0.2rem 0.5rem', fontSize: '0.7rem' }}>
                        Decrypt
                      </button>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Evidence Links */}
              {(() => {
                const files = safelyParseEvidence(report.evidence);
                if (files.length === 0) return null;
                return (
                 <div style={{ marginTop: '1rem' }}>
                   <small>Evidence:</small>
                   <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                     {files.map((file, idx) => (
                       <a key={idx} href={`/${file.replace(/\\/g, '/')}`} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.8rem', textDecoration: 'underline' }}>
                         File {idx + 1}
                       </a>
                     ))}
                   </div>
                 </div>
                );
              })()}
            </div>
          ))}
        </div>
      ) : (
        <div className="heatmap-view">
          <h3>Incident Hotspots (By Faculty)</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {getLocationStats().map(([loc, count]) => (
              <div key={loc} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: '150px' }}>{loc}</div>
                <div style={{ flex: 1, background: '#333', borderRadius: '4px', height: '24px', overflow: 'hidden' }}>
                  <div style={{ width: `${(count / reports.length) * 100}%`, background: '#ef4444', height: '100%' }}></div>
                </div>
                <div>{count}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
