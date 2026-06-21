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

  return (
    <div style={{ ...panelBase, flex: 1, overflowY: 'auto', padding: '32px 40px' }}>
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        
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
          background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: 12,
          padding: 24, marginBottom: 32, boxShadow: 'var(--shadow-sm)'
        }}>
          <h3 style={{ margin: '0 0 16px', fontSize: 16, color: 'var(--black)' }}>🤖 Have we seen this bug before?</h3>
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
              marginTop: 20, padding: 20, background: '#F8F9FA', borderRadius: 8,
              borderLeft: '4px solid var(--purple)'
            }}>
              {isSearching ? (
                <div style={{ color: 'var(--gray-dark)', fontSize: 14 }}>
                  <span style={{ marginRight: 8 }}>🔍</span> Scanning Parcle Memory Bank...
                </div>
              ) : (
                <>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--purple)', textTransform: 'uppercase', marginBottom: 8, letterSpacing: '0.5px' }}>
                    AI Analysis Result
                  </div>
                  <div style={{ fontSize: 15, lineHeight: 1.6, color: 'var(--black)' }}>
                    <ReactMarkdown>{searchResult}</ReactMarkdown>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Timeline View */}
        <h3 style={{ margin: '0 0 20px', fontSize: 18, color: 'var(--black)' }}>Recent Fixes</h3>
        
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--gray-mid)' }}>Loading Bug History...</div>
        ) : bugs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px', background: 'var(--gray-light)', borderRadius: 12 }}>
            <span style={{ fontSize: 32 }}>🐛</span>
            <h3 style={{ margin: '16px 0 8px', color: 'var(--black)' }}>No bugs logged</h3>
            <p style={{ margin: 0, color: 'var(--gray-mid)' }}>Document your first bug fix so the AI can help you next time.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {bugs.map(bug => {
              const dateObj = new Date(bug.timestamp);
              const dateStr = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

              return (
                <div key={bug.id} style={{
                  background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: 12,
                  padding: 20, boxShadow: 'var(--shadow-sm)', display: 'flex', gap: 16
                }}>
                  <div style={{ fontSize: 24, padding: '4px 0' }}>🐛</div>
                  <div>
                    <h3 style={{ margin: '0 0 8px', fontSize: 17, color: 'var(--black)' }}>{bug.title}</h3>
                    <p style={{ margin: '0 0 12px', fontSize: 14, lineHeight: 1.5, color: 'var(--gray-dark)' }}>
                      {bug.description}
                    </p>
                    <div style={{ display: 'flex', gap: 16, fontSize: 13, color: 'var(--gray-mid)' }}>
                      <span>📅 {dateStr}</span>
                      <span>👤 {bug.author}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Log Bug Modal */}
      <Modal isOpen={isCreateOpen} onClose={() => !isCreating && setIsCreateOpen(false)} title="Log Bug Fix">
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
    </div>
  );
}
