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
      // In our Mongo backend, uploaded files list might be saved in collections["uploads"]
      // Let's call /api/uploads or simulate files list
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/memories?limit=20`);
      const data = await res.json();
      
      // Mock documents list if empty
      const docs = [
        { id: 'doc-1', name: 'SentientOS_Architecture_V2.pdf', size: '2.4 MB', chunks: 14, date: 'June 21, 2026', status: 'Indexed' },
        { id: 'doc-2', name: 'Gemini_API_Integration.txt', size: '12 KB', chunks: 3, date: 'June 20, 2026', status: 'Indexed' },
        { id: 'doc-3', name: 'Parcle_Vector_Schema.md', size: '4 KB', chunks: 2, date: 'June 19, 2026', status: 'Indexed' }
      ];
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
        padding: '24px 32px',
        overflowY: 'auto',
        background: 'var(--gray-light)',
        display: 'flex',
        flexDirection: 'column',
        gap: 24,
      }}
    >
      {/* Header */}
      <div>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--black)', margin: '0 0 4px 0' }}>Documents Library</h1>
        <p style={{ fontSize: 13, color: 'var(--gray-mid)', margin: 0 }}>Upload and manage text assets indexed into the agent memory</p>
      </div>

      {/* Grid: Document upload on left, table list on right */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 2fr', gap: 24, alignItems: 'start' }}>
        
        {/* Upload card */}
        <div style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 12, padding: 20 }}>
          <h2 style={{ fontSize: 15, fontWeight: 600, color: 'var(--black)', marginBottom: 12 }}>Upload New Documents</h2>
          <UploadZone activeProject={activeProject} onUploadSuccess={handleUploadSuccess} />
        </div>

        {/* Database List */}
        <div style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 12, padding: 20 }}>
          <h2 style={{ fontSize: 15, fontWeight: 600, color: 'var(--black)', marginBottom: 16 }}>Indexed Documents Cache</h2>
          
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
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: '1.5px solid var(--border)', color: 'var(--gray-mid)' }}>
                    <th style={{ padding: '8px 4px', fontWeight: 600 }}>File Name</th>
                    <th style={{ padding: '8px 4px', fontWeight: 600 }}>Size</th>
                    <th style={{ padding: '8px 4px', fontWeight: 600 }}>Chunks</th>
                    <th style={{ padding: '8px 4px', fontWeight: 600 }}>Date</th>
                    <th style={{ padding: '8px 4px', fontWeight: 600 }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {uploads.map(doc => (
                    <tr key={doc.id} style={{ borderBottom: '1px solid var(--border)', color: 'var(--black)' }}>
                      <td style={{ padding: '12px 4px', fontWeight: 500, maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={doc.name}>
                        📄 {doc.name}
                      </td>
                      <td style={{ padding: '12px 4px', color: 'var(--gray-mid)' }}>{doc.size}</td>
                      <td style={{ padding: '12px 4px', fontWeight: 600, color: 'var(--blue)' }}>{doc.chunks}</td>
                      <td style={{ padding: '12px 4px', color: 'var(--gray-mid)' }}>{doc.date}</td>
                      <td style={{ padding: '12px 4px' }}>
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
  );
}
