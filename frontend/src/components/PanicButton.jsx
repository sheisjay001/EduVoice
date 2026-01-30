import React from 'react';
import { AlertTriangle } from 'lucide-react';

const PanicButton = () => {
  const handlePanic = () => {
    // Immediate redirect to a safe site
    window.location.href = "https://www.wikipedia.org/";
  };

  return (
    <button 
      className="panic-btn" 
      onClick={handlePanic} 
      title="Panic! Exit to Wikipedia"
    >
      <AlertTriangle size={24} />
      <span style={{ marginLeft: '8px', fontSize: '0.9rem' }}>EXIT</span>
    </button>
  );
};

export default PanicButton;
