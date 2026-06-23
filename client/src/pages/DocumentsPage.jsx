import { useState, useEffect, useRef } from 'react';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';

export default function DocumentsPage() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const fetchFiles = async () => {
    try {
      const res = await fetch('http://localhost:3002/api/uploaded-files');
      const data = await res.json();
      setFiles(data.uploads || []);
    } catch (e) {
      console.error('Failed to fetch files', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleUpload(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleUpload(e.target.files[0]);
    }
  };

  const handleUpload = async (file) => {
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('projectId', 'SentientOS'); // Default for now

    try {
      const res = await fetch('http://localhost:3002/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        // Refresh file list
        await fetchFiles();
      } else {
        alert(`Upload failed: ${data.detail || 'Unknown error'}`);
      }
    } catch (e) {
      console.error('Upload error', e);
      alert('Failed to upload file');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const formatSize = (words) => {
    if (!words) return '0 words';
    if (words > 1000) return `${(words / 1000).toFixed(1)}k words`;
    return `${words} words`;
  };

  return (
    <div 
      className="main-content-page"
      style={{
        gridColumn: 2,
        gridRow: '2 / 4',
        padding: '40px 60px',
        overflowY: 'auto',
        background: 'var(--white)',
        color: 'var(--black)',
        display: 'flex',
        flexDirection: 'column',
        gap: 32,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontSize: 32, fontWeight: 800, margin: '0 0 8px 0', letterSpacing: '-0.5px' }}>Documents Library</h1>
          <p style={{ fontSize: 15, color: 'var(--gray-mid)', margin: 0, maxWidth: 600 }}>
            Upload PDFs, Word documents, or text files. SentientOS will automatically extract, chunk, and embed the text into the permanent memory vault for instant semantic retrieval during chat.
          </p>
        </div>
      </div>

      {/* Upload Area */}
      <div 
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        style={{
          border: `2px dashed ${dragActive ? 'var(--blue)' : 'var(--border)'}`,
          background: dragActive ? 'var(--blue-light)' : 'var(--card-bg)',
          borderRadius: 16,
          padding: '60px 20px',
          textAlign: 'center',
          transition: 'all 0.2s ease',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 16,
          boxShadow: dragActive ? 'var(--shadow-sm)' : 'none',
          position: 'relative'
        }}
      >
        <div style={{ fontSize: 48, filter: uploading ? 'grayscale(1) opacity(0.5)' : 'none', transition: '0.3s' }}>
          📄
        </div>
        
        {uploading ? (
          <div>
            <h3 style={{ fontSize: 18, fontWeight: 600, margin: '0 0 8px' }}>Processing Document...</h3>
            <p style={{ fontSize: 14, color: 'var(--gray-mid)', margin: 0 }}>Extracting text and embedding into vector memory. This may take a few seconds.</p>
            <div style={{ marginTop: 16, width: 200, height: 4, background: 'var(--border)', borderRadius: 2, overflow: 'hidden', margin: '16px auto 0' }}>
              <div style={{ height: '100%', background: 'var(--blue)', width: '50%', animation: 'shimmer 1.5s infinite linear' }} />
            </div>
          </div>
        ) : (
          <div>
            <h3 style={{ fontSize: 18, fontWeight: 600, margin: '0 0 8px' }}>Drag & Drop your files here</h3>
            <p style={{ fontSize: 14, color: 'var(--gray-mid)', margin: '0 0 24px' }}>Supports .pdf, .docx, .txt, .md (Max 10MB)</p>
            
            <input 
              ref={fileInputRef}
              type="file" 
              accept=".pdf,.docx,.txt,.md,.png,.jpg,.jpeg"
              onChange={handleChange} 
              style={{ display: 'none' }} 
            />
            <Button onClick={() => fileInputRef.current.click()}>
              Select File to Upload
            </Button>
          </div>
        )}
      </div>

      {/* Uploaded Files Grid */}
      <div>
        <h2 style={{ fontSize: 20, fontWeight: 700, margin: '0 0 20px 0', display: 'flex', alignItems: 'center', gap: 10 }}>
          Knowledge Base
          <Badge color="blue">{files.length} Files</Badge>
        </h2>

        {loading ? (
          <div style={{ color: 'var(--gray-mid)', textAlign: 'center', padding: 40 }}>Loading documents...</div>
        ) : files.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: 16 }}>
            <p style={{ color: 'var(--gray-mid)', margin: 0 }}>No documents uploaded yet. Upload a file above to expand the AI's knowledge base.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
            {files.map((f, i) => (
              <div key={i} style={{ 
                background: 'var(--card-bg)', 
                border: '1px solid var(--border)', 
                borderRadius: 12, 
                padding: 20,
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
                boxShadow: 'var(--shadow-sm)',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = 'var(--shadow-md)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
              }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ 
                    width: 40, height: 40, borderRadius: 8, 
                    background: f.filename.endsWith('.pdf') ? '#ef444420' : f.filename.endsWith('.docx') ? '#3b82f620' : 'var(--blue-light)',
                    color: f.filename.endsWith('.pdf') ? '#ef4444' : f.filename.endsWith('.docx') ? '#3b82f6' : 'var(--blue)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18
                  }}>
                    {f.filename.endsWith('.pdf') ? '📕' : f.filename.endsWith('.docx') ? '📘' : '📄'}
                  </div>
                  <div style={{ flex: 1, overflow: 'hidden' }}>
                    <div style={{ fontWeight: 600, fontSize: 15, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={f.filename}>
                      {f.filename}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--gray-mid)', marginTop: 2 }}>
                      {new Date(f.uploadedAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 12, marginTop: 4, borderTop: '1px solid var(--border)', paddingTop: 12 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 11, color: 'var(--gray-mid)', textTransform: 'uppercase', letterSpacing: 0.5 }}>Size</div>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>{formatSize(f.totalWords)}</div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 11, color: 'var(--gray-mid)', textTransform: 'uppercase', letterSpacing: 0.5 }}>Memory Chunks</div>
                    <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--blue)' }}>{f.chunksStored} embedded</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
