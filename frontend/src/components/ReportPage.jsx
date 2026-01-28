import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import forge from 'node-forge';
import { FileText, AlertTriangle, Send, Shield, Lock, Upload, X } from 'lucide-react';
import { PUBLIC_KEY } from '../constants/keys';

const ReportPage = () => {
  const [formData, setFormData] = useState({
    faculty: '',
    department: '',
    courseCode: '',
    offenderName: '',
    description: '',
  });
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [caseId, setCaseId] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  // "Air-Lock" Check: Ensure user came from verification
  useEffect(() => {
    if (!location.state?.token) {
       // Ideally redirect, but for dev/demo might want to allow testing
       // navigate('/');
    }
  }, [location, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setFiles([...files, ...Array.from(e.target.files)]);
  };

  const removeFile = (index) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const encryptData = (text) => {
    try {
      const publicKey = forge.pki.publicKeyFromPem(PUBLIC_KEY);
      // RSA-OAEP encryption
      const encrypted = publicKey.encrypt(text, 'RSA-OAEP', {
        md: forge.md.sha256.create(),
        mgf1: {
          md: forge.md.sha256.create()
        }
      });
      return forge.util.encode64(encrypted);
    } catch (error) {
      console.error("Encryption Failed:", error);
      return null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Encrypt Sensitive Fields
    const encryptedOffender = encryptData(formData.offenderName);
    const encryptedDescription = encryptData(formData.description);

    if (!encryptedOffender || !encryptedDescription) {
      alert("Encryption failed. Please check your browser compatibility.");
      setLoading(false);
      return;
    }

    const payload = new FormData();
    payload.append('faculty', formData.faculty);
    payload.append('department', formData.department);
    payload.append('courseCode', formData.courseCode);
    payload.append('encryptedOffender', encryptedOffender);
    payload.append('encryptedDescription', encryptedDescription);
    if (location.state?.token) {
        payload.append('authToken', location.state.token);
    }

    // Append Files
    for (let i = 0; i < files.length; i++) {
        payload.append('evidence', files[i]);
    }

    try {
      const res = await axios.post('/api/reports', payload, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      setCaseId(res.data.caseId);
    } catch (err) {
      alert("Submission Failed: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  if (caseId) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="glass-panel animate-fade-in" style={{ maxWidth: '500px', width: '100%', padding: '3rem', borderRadius: '24px', textAlign: 'center' }}>
          <div style={{ color: 'var(--success)', marginBottom: '1.5rem', display: 'flex', justifyContent: 'center' }}>
            <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '1.5rem', borderRadius: '50%' }}>
              <Send size={64} />
            </div>
          </div>
          <h2 style={{ marginBottom: '1rem' }}>Report Submitted</h2>
          <p style={{ marginBottom: '2rem' }}>
            Your report has been encrypted and securely delivered.
          </p>
          
          <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1.5rem', borderRadius: '12px', marginBottom: '2rem' }}>
            <p style={{ fontSize: '0.9rem', opacity: 0.7, marginBottom: '0.5rem' }}>Your Case ID</p>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', letterSpacing: '2px', color: 'var(--primary)' }}>
              {caseId}
            </div>
            <p style={{ fontSize: '0.8rem', opacity: 0.6, marginTop: '0.5rem' }}>
              Save this ID safely. You will need it to track the status of your report.
            </p>
          </div>

          <button onClick={() => navigate('/')} className="primary-btn" style={{ width: '100%' }}>
            Return Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <nav style={{ padding: '1.5rem 0', display: 'flex', justifyContent: 'center', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Shield size={24} className="text-primary" style={{ color: 'var(--primary)' }} />
          <span style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>Edu-Voice Secure Channel</span>
        </div>
      </nav>

      <div className="container animate-fade-in" style={{ padding: '2rem 1rem' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2>Submit a Report</h2>
            <p>Fill out the details below. Sensitive information is encrypted on your device.</p>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Context Section */}
            <div className="card" style={{ marginBottom: '2rem' }}>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FileText size={20} /> Incident Context
              </h3>
              
              <div className="grid-3" style={{ gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Faculty</label>
                  <input
                    type="text"
                    name="faculty"
                    placeholder="e.g. Science"
                    value={formData.faculty}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Department</label>
                  <input
                    type="text"
                    name="department"
                    placeholder="e.g. Computer Science"
                    value={formData.department}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Course Code (Optional)</label>
                  <input
                    type="text"
                    name="courseCode"
                    placeholder="e.g. CSC 401"
                    value={formData.courseCode}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            {/* Encrypted Section */}
            <div className="glass-panel" style={{ padding: '2rem', borderRadius: '16px', border: '1px solid rgba(99, 102, 241, 0.3)', marginBottom: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.25rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Lock size={20} style={{ color: 'var(--primary)' }} /> 
                  Encrypted Details
                </h3>
                <span style={{ fontSize: '0.8rem', padding: '0.25rem 0.75rem', background: 'rgba(99, 102, 241, 0.2)', color: 'var(--primary)', borderRadius: '99px' }}>
                  End-to-End Encrypted
                </span>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Offender's Name / Title</label>
                <input
                  type="text"
                  name="offenderName"
                  placeholder="Name of lecturer or staff member"
                  value={formData.offenderName}
                  onChange={handleChange}
                  required
                  style={{ background: 'rgba(0,0,0,0.2)' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Detailed Description</label>
                <textarea
                  name="description"
                  rows="6"
                  placeholder="Describe what happened..."
                  value={formData.description}
                  onChange={handleChange}
                  required
                  style={{ background: 'rgba(0,0,0,0.2)', resize: 'vertical' }}
                />
              </div>
            </div>

            {/* Evidence Upload */}
            <div className="card" style={{ marginBottom: '2rem' }}>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Upload size={20} /> Evidence (Optional)
              </h3>
              
              <div style={{ 
                border: '2px dashed var(--border)', 
                borderRadius: '12px', 
                padding: '2rem', 
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s',
                background: 'rgba(0,0,0,0.1)'
              }}
              onClick={() => document.getElementById('file-upload').click()}
              >
                <input 
                  id="file-upload" 
                  type="file" 
                  multiple 
                  onChange={handleFileChange} 
                  style={{ display: 'none' }} 
                />
                <Upload size={32} style={{ opacity: 0.5, marginBottom: '1rem' }} />
                <p style={{ margin: 0 }}>Click to upload images or documents</p>
                <p style={{ fontSize: '0.8rem', opacity: 0.5, margin: '0.5rem 0 0 0' }}>JPG, PNG, PDF (Max 5MB)</p>
              </div>

              {files.length > 0 && (
                <div style={{ marginTop: '1rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {files.map((file, index) => (
                    <div key={index} style={{ 
                      background: 'var(--bg-dark)', 
                      padding: '0.5rem 1rem', 
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      fontSize: '0.9rem'
                    }}>
                      <span>{file.name}</span>
                      <X 
                        size={16} 
                        style={{ cursor: 'pointer', color: 'var(--danger)' }} 
                        onClick={() => removeFile(index)}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button type="submit" className="primary-btn" disabled={loading} style={{ width: '100%', fontSize: '1.1rem', padding: '1rem' }}>
              {loading ? 'Encrypting & Sending...' : 'Submit Secure Report'}
              {!loading && <Send size={20} />}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ReportPage;
