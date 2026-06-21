import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Modal from '../components/ui/Modal';

export default function KnowledgePage() {
  const { panelBase } = useOutletContext();
  const [knowledgeList, setKnowledgeList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    title: '', category: 'Coding Standard', content: '', author: ''
  });

  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResult, setSearchResult] = useState(null);

  useEffect(() => {
    fetchKnowledge();
  }, []);

  const fetchKnowledge = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/knowledge`);
      const data = await res.json();
      if (data.success) {
        setKnowledgeList(data.data);
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const handleCreate = async () => {
    setIsCreating(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/knowledge`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success) {
        setIsCreateOpen(false);
        setFormData({ title: '', category: 'Coding Standard', content: '', author: '' });
        fetchKnowledge();
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
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/knowledge/search`, {
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
      setSearchResult("Failed to search the knowledge base. Please try again.");
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
              Engineering Knowledge
            </h1>
            <p style={{ margin: 0, color: 'var(--gray-mid)', fontSize: 15 }}>
              Global search for coding standards, architecture decisions, and team agreements.
            </p>
          </div>
          <Button variant="primary" onClick={() => setIsCreateOpen(true)}>
            + Log Knowledge
          </Button>
        </div>

        {/* Global AI Search */}
        <div style={{ 
          background: 'linear-gradient(145deg, #1d1d1f 0%, #2d2d2f 100%)', 
          borderRadius: 16, padding: '32px', marginBottom: 32, boxShadow: 'var(--shadow-md)',
          color: 'white'
        }}>
          <h3 style={{ margin: '0 0 16px', fontSize: 18, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>🧠</span> Ask the Collective Brain
          </h3>
          <p style={{ margin: '0 0 24px', fontSize: 14, color: '#A1A1A6' }}>
            Searches across all logged Bugs, ADRs, and Standards.
          </p>
          <form onSubmit={handleSearch} style={{ display: 'flex', gap: 12 }}>
            <input
              type="text"
              placeholder="e.g. What coding standards do we follow?"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                flex: 1, padding: '14px 20px', border: '1px solid rgba(255,255,255,0.1)', 
                borderRadius: 'var(--radius-input)', background: 'rgba(255,255,255,0.05)',
                fontFamily: 'inherit', fontSize: 16, outline: 'none', color: 'white',
                boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)'
              }}
            />
            <Button 
              variant="primary" 
              onClick={handleSearch} 
              disabled={isSearching || !searchQuery.trim()}
              style={{ padding: '0 24px', background: 'var(--blue)', border: 'none', fontWeight: 600 }}
            >
              {isSearching ? 'Synthesizing...' : 'Search'}
            </Button>
          </form>

          {/* Search Results Area */}
          {(isSearching || searchResult) && (
            <div style={{
              marginTop: 24, padding: 24, background: 'rgba(0,0,0,0.2)', borderRadius: 12,
              borderLeft: '4px solid var(--blue)'
            }}>
              {isSearching ? (
                <div style={{ color: '#A1A1A6', fontSize: 15, display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ animation: 'spin 1s linear infinite' }}>⏳</span> Traversing Vector Space...
                </div>
              ) : (
                <>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--blue)', textTransform: 'uppercase', marginBottom: 12, letterSpacing: '0.5px' }}>
                    AI Synthesis
                  </div>
                  <div style={{ fontSize: 15, lineHeight: 1.6, color: 'white' }}>
                    <ReactMarkdown>{searchResult}</ReactMarkdown>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* List View */}
        <h3 style={{ margin: '0 0 20px', fontSize: 18, color: 'var(--black)' }}>Documented Standards</h3>
        
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--gray-mid)' }}>Loading Knowledge Base...</div>
        ) : knowledgeList.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px', background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: 12 }}>
            <span style={{ fontSize: 32 }}>📚</span>
            <h3 style={{ margin: '16px 0 8px', color: 'var(--black)' }}>No standards documented yet</h3>
            <p style={{ margin: 0, color: 'var(--gray-mid)' }}>Start building the team's knowledge base.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: 20 }}>
            {knowledgeList.map(item => {
              const dateObj = new Date(item.timestamp);
              const dateStr = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
              
              let icon = '📄';
              if (item.category === 'Coding Standard') icon = '📐';
              if (item.category === 'Team Agreement') icon = '🤝';
              if (item.category === 'Deployment Rule') icon = '🚀';

              return (
                <div key={item.id} style={{
                  background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: 12,
                  padding: 24, boxShadow: 'var(--shadow-sm)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--gray-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
                      {icon}
                    </div>
                    <div>
                      <h3 style={{ margin: 0, fontSize: 16, color: 'var(--black)' }}>{item.title}</h3>
                      <span style={{ fontSize: 13, color: 'var(--gray-dark)', fontWeight: 500 }}>{item.category}</span>
                    </div>
                  </div>
                  
                  <p style={{ margin: '0 0 20px', fontSize: 14, lineHeight: 1.5, color: 'var(--gray-dark)' }}>
                    {item.description}
                  </p>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12, color: 'var(--gray-mid)', borderTop: '1px solid var(--border)', paddingTop: 16 }}>
                    <span>👤 {item.author}</span>
                    <span>📅 {dateStr}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Log Knowledge Modal */}
      <Modal isOpen={isCreateOpen} onClose={() => !isCreating && setIsCreateOpen(false)} title="Log Engineering Knowledge">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Input 
            label="Title" 
            placeholder="e.g. Frontend Coding Standards" 
            value={formData.title}
            onChange={e => setFormData({ ...formData, title: e.target.value })}
          />
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--gray-dark)' }}>Category</label>
            <select
              value={formData.category}
              onChange={e => setFormData({ ...formData, category: e.target.value })}
              style={{
                padding: '10px 12px', border: '1px solid var(--border)', borderRadius: 'var(--radius-input)',
                fontFamily: 'inherit', fontSize: 14, background: 'white'
              }}
            >
              <option value="Coding Standard">Coding Standard</option>
              <option value="Team Agreement">Team Agreement</option>
              <option value="Deployment Rule">Deployment Rule</option>
              <option value="General Architecture">General Architecture</option>
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--gray-dark)' }}>Rules / Details</label>
            <textarea
              rows={5}
              value={formData.content}
              onChange={e => setFormData({ ...formData, content: e.target.value })}
              style={{
                padding: '10px 12px', border: '1px solid var(--border)', borderRadius: 'var(--radius-input)',
                fontFamily: 'inherit', fontSize: 14, resize: 'vertical'
              }}
              placeholder="e.g. We use TypeScript, ESLint, Prettier, and camelCase..."
            />
          </div>

          <Input 
            label="Author" 
            placeholder="Your name" 
            value={formData.author}
            onChange={e => setFormData({ ...formData, author: e.target.value })}
          />

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 8 }}>
            <Button variant="ghost" onClick={() => setIsCreateOpen(false)} disabled={isCreating}>Cancel</Button>
            <Button variant="primary" onClick={handleCreate} loading={isCreating} disabled={!formData.title || !formData.content}>
              Save to Brain
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
