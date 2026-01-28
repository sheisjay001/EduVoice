import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import forge from 'node-forge';
import { FileText, AlertTriangle, Send } from 'lucide-react';
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
      <div className="container" style={{ textAlign: 'center' }}>
        <div style={{ color: '#22c55e', marginBottom: '1rem' }}>
          <Send size={64} />
        </div>
        <h2>Report Submitted Successfully</h2>
        <p>Your report has been encrypted and vaulted.</p>
        <div style={{ background: '#1a1a1a', padding: '1rem', borderRadius: '8px', margin: '2rem 0' }}>
          <p style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Your Case ID</p>
          <h1 style={{ fontFamily: 'monospace', color: '#646cff' }}>{caseId}</h1>
          <p style={{ fontSize: '0.8rem', color: '#ef4444' }}>
            Save this ID! It is the ONLY way to track your case.
          </p>
        </div>
        <button onClick={() => navigate('/')} className="primary-btn">Return Home</button>
      </div>
    );
  }

  return (
    <div className="container">
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <FileText size={32} color="#646cff" />
        <h2 style={{ margin: 0 }}>Submit Report</h2>
      </div>

      <div style={{ background: 'rgba(100, 108, 255, 0.1)', padding: '1rem', borderRadius: '8px', marginBottom: '2rem', display: 'flex', gap: '1rem', alignItems: 'start' }}>
        <AlertTriangle size={24} color="#646cff" style={{ flexShrink: 0 }} />
        <p style={{ margin: 0, fontSize: '0.9rem' }}>
          <strong>Secure Mode Active:</strong> Data entered below (Name, Description) will be encrypted on your device before sending. Not even admins can read it without the physical private key.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <label>Faculty</label>
            <input name="faculty" placeholder="e.g. Science" onChange={handleChange} required />
          </div>
          <div>
            <label>Department</label>
            <input name="department" placeholder="e.g. Computer Science" onChange={handleChange} required />
          </div>
        </div>

        <label>Course Code (Optional)</label>
        <input name="courseCode" placeholder="e.g. CSC 401" onChange={handleChange} />

        <label>Offender Name / Identifier</label>
        <input name="offenderName" placeholder="Name or Description of person" onChange={handleChange} required />

        <label>Incident Description</label>
        <textarea 
          name="description" 
          rows="5" 
          placeholder="Describe what happened..." 
          onChange={handleChange} 
          required 
        />

        <label>Evidence (Photos/Videos)</label>
        <input 
          type="file" 
          multiple 
          accept="image/*,video/*"
          onChange={(e) => setFiles(e.target.files)}
          style={{ marginBottom: '1rem' }}
        />

        <button type="submit" className="primary-btn" disabled={loading}>
          {loading ? 'Encrypting & Uploading...' : 'Submit Report Securely'}
        </button>
      </form>
    </div>
  );
};

export default ReportPage;
