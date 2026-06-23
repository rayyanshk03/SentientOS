import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Modal from '../components/ui/Modal';

export default function BugsPage() {
  const { panelBase } = useOutletContext();
  const [bugs, setBugs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    title: '', rootCause: '', solution: '', author: ''
  });

  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResult, setSearchResult] = useState(null);

  // Delete State
  const [deletingId, setDeletingId] = useState(null);
  const [viewingBug, setViewingBug] = useState(null);

  useEffect(() => {
    fetchBugs();
  }, []);

  const fetchBugs = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/bugs`);
      const data = await res.json();
      if (data.success) {
        setBugs(data.data);
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const handleCreate = async () => {
    setIsCreating(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/bugs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success) {
        setIsCreateOpen(false);
        setFormData({ title: '', rootCause: '', solution: '', author: '' });
        fetchBugs();
      }
    } catch (e) {
      console.error(e);
    }
    setIsCreating(false);
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    setSearchResult(null);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/bugs/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQuery }),
      });
      const data = await res.json();
      if (data.success) {
        setSearchResult(data.answer);
      }
    } catch (e) {
      console.error(e);
      setSearchResult("Failed to reach the AI memory core. Please try again.");
    }
    setIsSearching(false);
  };

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/memories/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setDeletingId(null);
        fetchBugs();
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div style={{ ...panelBase, gridColumn: 2, gridRow: '2 / 4', flex: 1, overflowY: 'auto', padding: '40px 48px', background: '#F5F5F7' }}>
      <div style={{ }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 700, margin: '0 0 8px 0', color: 'var(--black)' }}>
              Bug Fix Memory
            </h1>
            <p style={{ margin: 0, color: 'var(--gray-mid)', fontSize: 15 }}>
              A collective brain of past bugs, root causes, and solutions.
            </p>
          </div>
          <Button variant="primary" onClick={() => setIsCreateOpen(true)}>
            + Log Bug Fix
          </Button>
        </div>

        {/* AI Bug Search */}
        <div style={{ 
          background: 'var(--white)', border: '2px solid var(--border)', borderRadius: 'var(--radius-card)',
          padding: 32, marginBottom: 40, boxShadow: 'var(--shadow-md)'
        }}>
          <h3 style={{ margin: '0 0 20px', fontSize: 18, fontWeight: 600, color: '#1d1d1f', letterSpacing: '-0.3px' }}>🤖 Have we seen this bug before?</h3>
          <form onSubmit={handleSearch} style={{ display: 'flex', gap: 12 }}>
            <input
              type="text"
              placeholder="e.g. JWT Token Expired, CORS issue on staging..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                flex: 1, padding: '12px 16px', border: '1px solid var(--border)', borderRadius: 'var(--radius-input)',
                fontFamily: 'inherit', fontSize: 15, outline: 'none'
              }}
            />
            <Button variant="secondary" onClick={handleSearch} disabled={isSearching || !searchQuery.trim()}>
              {isSearching ? 'Thinking...' : 'Ask AI'}
            </Button>
          </form>

          {/* Search Results Area */}
          {(isSearching || searchResult) && (
            <div style={{
              marginTop: 24, padding: 24, background: 'rgba(120, 86, 255, 0.04)', borderRadius: 'var(--radius-card)',
              borderLeft: '4px solid var(--purple)'
            }}>
              {isSearching ? (
                <div style={{ color: '#515154', fontSize: 15, display: 'flex', alignItems: 'center' }}>
                  <span style={{ marginRight: 12 }}>🔍</span> Scanning Parcle Memory Bank...
                </div>
              ) : (
                <>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--purple)', textTransform: 'uppercase', marginBottom: 12, letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: 6 }}>
                    ✨ AI Analysis Result
                  </div>
                  <div style={{ fontSize: 15, lineHeight: 1.6, color: '#1d1d1f' }}>
                    <ReactMarkdown>{searchResult}</ReactMarkdown>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Timeline View */}
        <h3 style={{ margin: '0 0 24px', fontSize: 22, fontWeight: 700, color: '#1d1d1f', letterSpacing: '-0.5px' }}>Recent Fixes</h3>
        
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#86868b' }}>Loading Bug History...</div>
        ) : bugs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px', background: 'var(--white)', borderRadius: 'var(--radius-card)', boxShadow: 'var(--shadow-md)' }}>
            <span style={{ fontSize: 32 }}>🐛</span>
            <h3 style={{ margin: '16px 0 8px', color: '#1d1d1f', fontSize: 20, fontWeight: 600 }}>No bugs logged</h3>
            <p style={{ margin: 0, color: '#86868b' }}>Document your first bug fix so the AI can help you next time.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {bugs.map(bug => {
              const dateObj = new Date(bug.timestamp);
              const dateStr = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

              return (
                <div 
                  key={bug.id} 
                  onClick={() => setViewingBug(bug)}
                  style={{
                    background: 'var(--white)', border: '2px solid var(--border)', borderRadius: 'var(--radius-card)',
                    padding: 32, boxShadow: 'var(--shadow-md)', display: 'flex', gap: 24,
                    transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ fontSize: 28, padding: '4px 0', filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.1))' }}>🐛</div>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ margin: '0 0 10px', fontSize: 20, fontWeight: 700, color: '#1d1d1f', letterSpacing: '-0.5px' }}>{bug.title}</h3>
                    <p style={{ margin: '0 0 16px', fontSize: 15, lineHeight: 1.6, color: '#515154' }}>
                      {bug.description}
                    </p>
                    <div style={{ display: 'flex', gap: 12, fontSize: 13, color: '#86868b', fontWeight: 500, flexWrap: 'wrap', alignItems: 'center' }}>
                      <span style={{ background: '#F5F5F7', padding: '4px 10px', borderRadius: 12, whiteSpace: 'nowrap' }}>📅 {dateStr}</span>
                      <span style={{ background: '#F5F5F7', padding: '4px 10px', borderRadius: 12, whiteSpace: 'nowrap' }}>👤 {bug.author}</span>
                      <button 
                        onClick={(e) => { e.stopPropagation(); setDeletingId(bug.id); }} 
                        style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: '#ff3b30', opacity: 0.7, padding: '4px', marginLeft: 'auto' }} 
                        title="Delete"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Log Bug Modal */}
      <Modal open={isCreateOpen} onClose={() => !isCreating && setIsCreateOpen(false)} title="Log Bug Fix">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Input 
            label="Bug / Issue" 
            placeholder="e.g. JWT Token Expired" 
            value={formData.title}
            onChange={e => setFormData({ ...formData, title: e.target.value })}
          />
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--gray-dark)' }}>Root Cause</label>
            <textarea
              rows={3}
              value={formData.rootCause}
              onChange={e => setFormData({ ...formData, rootCause: e.target.value })}
              style={{
                padding: '10px 12px', border: '1px solid var(--border)', borderRadius: 'var(--radius-input)',
                fontFamily: 'inherit', fontSize: 14, resize: 'vertical'
              }}
              placeholder="What caused the issue?"
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--gray-dark)' }}>Solution</label>
            <textarea
              rows={3}
              value={formData.solution}
              onChange={e => setFormData({ ...formData, solution: e.target.value })}
              style={{
                padding: '10px 12px', border: '1px solid var(--border)', borderRadius: 'var(--radius-input)',
                fontFamily: 'inherit', fontSize: 14, resize: 'vertical'
              }}
              placeholder="How did you fix it?"
            />
          </div>

          <Input 
            label="Resolved By" 
            placeholder="Your name" 
            value={formData.author}
            onChange={e => setFormData({ ...formData, author: e.target.value })}
          />

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 8 }}>
            <Button variant="ghost" onClick={() => setIsCreateOpen(false)} disabled={isCreating}>Cancel</Button>
            <Button variant="primary" onClick={handleCreate} loading={isCreating} disabled={!formData.title || !formData.solution}>
              Save to Memory
            </Button>
          </div>
        </div>
      </Modal>

      {/* View Full Bug Modal */}
      <Modal open={!!viewingBug} onClose={() => setViewingBug(null)} title={viewingBug?.title || "Bug Fix Details"}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ fontSize: 14, color: '#86868b', fontWeight: 500 }}>
            {viewingBug && new Date(viewingBug.timestamp).toLocaleDateString()}
            {viewingBug && viewingBug.author && ` • By ${viewingBug.author}`}
          </div>
          <div style={{ 
            fontSize: 14.5, 
            lineHeight: 1.6, 
            color: '#1d1d1f',
            background: '#F5F5F7',
            padding: 20,
            borderRadius: 'var(--radius-card)',
            whiteSpace: 'pre-wrap',
            maxHeight: '60vh',
            overflowY: 'auto'
          }}>
            <ReactMarkdown>{viewingBug?.content || "*No detailed context available for this bug fix.*"}</ReactMarkdown>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button variant="ghost" onClick={() => setViewingBug(null)}>Close</Button>
          </div>
        </div>
      </Modal>

      {/* Delete confirmation modal */}
      {deletingId && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: 'var(--white)', borderRadius: 'var(--radius-card)', padding: 24, width: 340, display: 'flex', flexDirection: 'column', gap: 16, boxShadow: 'var(--shadow-lg)' }}>
            <span style={{ fontWeight: 700, fontSize: 15, color: '#FF3B30' }}>Delete Decision Rule?</span>
            <div style={{ fontSize: 13, color: 'var(--gray-mid)', lineHeight: 1.5 }}>
              This will remove this rule completely from the memory vault. The AI agent might contradict this rule in future.
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <Button variant="ghost" onClick={() => setDeletingId(null)}>Cancel</Button>
              <Button variant="danger" onClick={() => handleDelete(deletingId)}>Yes, delete</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
