import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import UploadZone from '../components/upload/UploadZone';
import Badge from '../components/ui/Badge';
import { TableSkeleton } from '../components/ui/Skeleton';

export default function DocumentsPage() {
  const { activeProject, refreshMemories } = useOutletContext();
  const [uploads, setUploads] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUploads = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/uploaded-files`);
      const data = await res.json();
      
      const docs = data.uploads.map(u => ({
        id: u.filename,
        name: u.filename,
        size: u.totalWords ? `${(u.totalWords * 5 / 1024).toFixed(1)} KB` : 'Unknown',
        chunks: u.chunksStored || 0,
        date: new Date(u.uploadedAt).toLocaleDateString(),
        status: 'Indexed'
      }));
      setUploads(docs);
    } catch {
      setUploads([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUploads();
  }, []);

  const handleUploadSuccess = () => {
    fetchUploads();
    if (refreshMemories) refreshMemories();
  };

  return (
    <div 
      className="main-content-page"
      style={{
        gridColumn: 2,
        gridRow: '2 / 4',
        padding: '40px 48px',
        overflowY: 'auto',
        background: '#F5F5F7',
      }}
    >
      <div style={{ maxWidth: 840, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 32, width: '100%' }}>
      
        {/* Header */}
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: '#1d1d1f', margin: '0 0 8px 0', letterSpacing: '-0.5px' }}>Documents Library</h1>
          <p style={{ fontSize: 15, color: '#86868b', margin: 0 }}>Upload and manage text assets indexed into the agent memory</p>
        </div>

        {/* Stacked Layout: Upload on top, table on bottom */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
        
        {/* Upload card */}
        <div style={{ background: 'var(--white)', border: 'none', borderRadius: 20, padding: 32, boxShadow: '0 8px 30px rgba(0,0,0,0.04)' }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: '#1d1d1f', marginBottom: 20, letterSpacing: '-0.5px' }}>Upload New Documents</h2>
          <UploadZone activeProject={activeProject} onUploadSuccess={handleUploadSuccess} />
        </div>

        {/* Database List */}
        <div style={{ background: 'var(--white)', border: 'none', borderRadius: 20, padding: 32, boxShadow: '0 8px 30px rgba(0,0,0,0.04)' }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: '#1d1d1f', marginBottom: 20, letterSpacing: '-0.5px' }}>Indexed Documents Cache</h2>
          
          {isLoading ? (
            <TableSkeleton rows={4} />
          ) : uploads.length === 0 ? (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '40px 20px',
              textAlign: 'center',
              gap: 12
            }}>
              <div style={{ color: 'var(--gray-mid)', width: 48, height: 48, background: 'var(--gray-light)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                </svg>
              </div>
              <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--black)', margin: 0 }}>Documents Library</h3>
              <p style={{ fontSize: 13, color: 'var(--gray-mid)', margin: '0 0 8px 0', maxWidth: 280, lineHeight: 1.4 }}>
                Index documents to feed the assistant with domain knowledge.
              </p>
              <button
                onClick={() => document.querySelector('input[type="file"]')?.click()}
                style={{
                  background: 'var(--blue)', color: 'var(--white)', border: 'none',
                  padding: '8px 16px', borderRadius: 'var(--radius-pill)',
                  fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'var(--transition)'
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--blue-hover)'}
                onMouseLeave={e => e.currentTarget.style.background = 'var(--blue)'}
              >
                Upload Document
              </button>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 14 }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #E5E5EA', color: '#86868b', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    <th style={{ padding: '12px 4px', fontWeight: 600 }}>File Name</th>
                    <th style={{ padding: '12px 4px', fontWeight: 600 }}>Size</th>
                    <th style={{ padding: '12px 4px', fontWeight: 600 }}>Chunks</th>
                    <th style={{ padding: '12px 4px', fontWeight: 600 }}>Date</th>
                    <th style={{ padding: '12px 4px', fontWeight: 600 }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {uploads.map(doc => (
                    <tr key={doc.id} style={{ borderBottom: '1px solid #E5E5EA', color: '#1d1d1f', transition: 'background 0.2s' }}>
                      <td style={{ padding: '16px 4px', fontWeight: 600, maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={doc.name}>
                        <span style={{ marginRight: 8, fontSize: 16 }}>📄</span> {doc.name}
                      </td>
                      <td style={{ padding: '16px 4px', color: '#515154' }}>{doc.size}</td>
                      <td style={{ padding: '16px 4px', fontWeight: 700, color: '#007aff' }}>{doc.chunks}</td>
                      <td style={{ padding: '16px 4px', color: '#86868b', fontSize: 13 }}>{doc.date}</td>
                      <td style={{ padding: '16px 4px' }}>
                        <Badge color="green">{doc.status}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
      </div>
    </div>
  );
}
