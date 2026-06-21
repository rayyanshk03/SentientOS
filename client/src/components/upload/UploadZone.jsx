import { useState, useRef } from 'react';

export default function UploadZone({ activeProject, onUploadSuccess }) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [successResult, setSuccessResult] = useState(null);
  const [error, setError] = useState(null);
  
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const validateFile = (file) => {
    const validExtensions = ['pdf', 'txt', 'md', 'docx'];
    const ext = file.name.split('.').pop().toLowerCase();
    
    if (!validExtensions.includes(ext)) {
      setError(`Unsupported file type: .${ext}. Allowed: PDF, TXT, MD, DOCX`);
      return false;
    }
    
    if (file.size > 10 * 1024 * 1024) {
      setError(`File is too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Max 10MB.`);
      return false;
    }
    
    return true;
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file && validateFile(file)) {
      await uploadFile(file);
    }
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (file && validateFile(file)) {
      await uploadFile(file);
    }
    e.target.value = ''; // reset
  };

  const uploadFile = async (file) => {
    setIsUploading(true);
    setError(null);
    setSuccessResult(null);
    setProgress(10); // initial bump
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('projectId', activeProject || 'default-project');

    // Simulate progress while waiting for backend
    const interval = setInterval(() => {
      setProgress(prev => Math.min(prev + 5, 90));
    }, 500);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/upload`, {
        method: 'POST',
        body: formData,
      });
      
      clearInterval(interval);
      setProgress(100);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Upload failed');
      }
      
      const data = await response.json();
      setSuccessResult(data);
      if (onUploadSuccess) onUploadSuccess(data);
      
    } catch (err) {
      clearInterval(interval);
      setError(err.message);
    } finally {
      setTimeout(() => {
        setIsUploading(false);
        setProgress(0);
      }, 1000);
    }
  };

  return (
    <div 
      style={{
        margin: '16px',
        padding: '24px 16px',
        borderRadius: 'var(--radius-lg)',
        border: `2px dashed ${isDragging ? 'var(--blue)' : 'var(--border)'}`,
        backgroundColor: isDragging ? 'var(--blue-light)' : 'var(--gray-light)',
        transition: 'var(--transition)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        textAlign: 'center'
      }}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileSelect} 
        style={{ display: 'none' }} 
        accept=".pdf,.txt,.md,.docx"
      />
      
      {isUploading ? (
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center' }}>
          <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--black)' }}>
            Processing document...
          </span>
          <div style={{ width: '100%', height: 4, background: 'var(--border)', borderRadius: 2, overflow: 'hidden' }}>
            <div style={{ 
              height: '100%', 
              width: `${progress}%`, 
              background: 'var(--blue)',
              transition: 'width 0.3s ease'
            }} />
          </div>
        </div>
      ) : successResult ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'center' }}>
          <div style={{ 
            width: 32, height: 32, borderRadius: '50%', background: '#e8f5e9', 
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4caf50', marginBottom: 4 
          }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M13.5 4.5L6.5 11.5L2.5 7.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--black)' }}>Upload Complete</span>
          <span style={{ fontSize: 12, color: 'var(--gray-mid)' }}>
            ✓ {successResult.chunksStored} memories created
          </span>
          <button 
            onClick={() => setSuccessResult(null)}
            style={{ 
              background: 'none', border: 'none', color: 'var(--blue)', 
              fontSize: 12, fontWeight: 500, cursor: 'pointer', marginTop: 4 
            }}
          >
            Upload another
          </button>
        </div>
      ) : (
        <>
          <div style={{ color: 'var(--gray-mid)', marginBottom: 4 }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M12 16V8M12 8L8.5 11.5M12 8L15.5 11.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M4 16.5C4 18.433 5.567 20 7.5 20H16.5C18.433 20 20 18.433 20 16.5C20 14.567 18.433 13 16.5 13H15.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--black)' }}>Drop docs here</span>
          <span style={{ fontSize: 11, color: 'var(--gray-mid)', marginBottom: 8 }}>
            Supports PDF, TXT, MD, DOCX up to 10MB
          </span>
          <button 
            onClick={() => fileInputRef.current?.click()}
            style={{
              background: 'var(--white)', border: '1px solid var(--border)',
              padding: '6px 12px', borderRadius: 'var(--radius-pill)',
              fontSize: 12, fontWeight: 500, color: 'var(--gray-dark)', cursor: 'pointer'
            }}
          >
            Browse Files
          </button>
        </>
      )}

      {error && (
        <div style={{ marginTop: 8, fontSize: 11, color: '#e53935', fontWeight: 500, maxWidth: '100%', wordBreak: 'break-word' }}>
          {error}
        </div>
      )}
    </div>
  );
}
