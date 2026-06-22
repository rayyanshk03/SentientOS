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
    <div style={{ ...panelBase, flex: 1, overflowY: 'auto', padding: '40px 48px', background: '#F5F5F7' }}>
      <div style={{ maxWidth: 840, margin: '0 auto' }}>
        
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
          background: 'linear-gradient(145deg, #1d1d1f 0%, #151516 100%)', 
          borderRadius: 24, padding: '40px', marginBottom: 48, boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
          color: 'white'
        }}>
          <h3 style={{ margin: '0 0 12px', fontSize: 22, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 12, letterSpacing: '-0.5px' }}>
            <span style={{ fontSize: 24 }}>🧠</span> Ask the Collective Brain
          </h3>
          <p style={{ margin: '0 0 28px', fontSize: 15, color: '#A1A1A6' }}>
            Searches across all logged Bugs, ADRs, and Standards.
          </p>
          <form onSubmit={handleSearch} style={{ display: 'flex', gap: 12 }}>
            <input
              type="text"
              placeholder="e.g. What coding standards do we follow?"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                flex: 1, padding: '16px 24px', border: '1px solid rgba(255,255,255,0.1)', 
                borderRadius: 12, background: 'rgba(255,255,255,0.05)',
                fontFamily: 'inherit', fontSize: 16, outline: 'none', color: 'white',
                boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)'
              }}
            />
            <Button 
              variant="primary" 
              onClick={handleSearch} 
              disabled={isSearching || !searchQuery.trim()}
              style={{ padding: '0 32px', background: '#007aff', borderRadius: 12, border: 'none', fontWeight: 600, fontSize: 16 }}
            >
              {isSearching ? 'Synthesizing...' : 'Search'}
            </Button>
          </form>

          {/* Search Results Area */}
          {(isSearching || searchResult) && (
            <div style={{
              marginTop: 32, padding: 24, background: 'rgba(0, 122, 255, 0.1)', borderRadius: 16,
              borderLeft: '4px solid #007aff'
            }}>
              {isSearching ? (
                <div style={{ color: '#E5E5EA', fontSize: 15, display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ animation: 'spin 1s linear infinite' }}>⏳</span> Traversing Vector Space...
                </div>
              ) : (
                <>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#4da3ff', textTransform: 'uppercase', marginBottom: 12, letterSpacing: '0.5px' }}>
                    ✨ AI Synthesis
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
        <h3 style={{ margin: '0 0 24px', fontSize: 22, fontWeight: 700, color: '#1d1d1f', letterSpacing: '-0.5px' }}>Documented Standards</h3>
        
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#86868b' }}>Loading Knowledge Base...</div>
        ) : knowledgeList.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px', background: 'var(--white)', border: 'none', borderRadius: 20, boxShadow: '0 8px 30px rgba(0,0,0,0.04)' }}>
            <span style={{ fontSize: 40 }}>📚</span>
            <h3 style={{ margin: '20px 0 8px', color: '#1d1d1f', fontSize: 20, fontWeight: 600 }}>No standards documented yet</h3>
            <p style={{ margin: 0, color: '#86868b' }}>Start building the team's knowledge base.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: 24 }}>
            {knowledgeList.map(item => {
              const dateObj = new Date(item.timestamp);
              const dateStr = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
              
              let icon = '📄';
              if (item.category === 'Coding Standard') icon = '📐';
              if (item.category === 'Team Agreement') icon = '🤝';
              if (item.category === 'Deployment Rule') icon = '🚀';

              return (
                <div key={item.id} style={{
                  background: 'var(--white)', border: 'none', borderRadius: 20,
                  padding: 32, boxShadow: '0 8px 30px rgba(0,0,0,0.04)',
                  transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
                  display: 'flex', flexDirection: 'column'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
                    <div style={{ width: 48, height: 48, borderRadius: 14, background: '#F5F5F7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>
                      {icon}
                    </div>
                    <div>
                      <h3 style={{ margin: 0, fontSize: 18, color: '#1d1d1f', fontWeight: 600, letterSpacing: '-0.3px' }}>{item.title}</h3>
                      <span style={{ fontSize: 13, color: '#86868b', fontWeight: 500 }}>{item.category}</span>
                    </div>
                  </div>
                  
                  <p style={{ margin: '0 0 24px', fontSize: 15, lineHeight: 1.6, color: '#515154', flex: 1 }}>
                    {item.description}
                  </p>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13, color: '#86868b', fontWeight: 500, borderTop: '1px solid #E5E5EA', paddingTop: 20 }}>
                    <span style={{ background: '#F5F5F7', padding: '4px 10px', borderRadius: 12 }}>👤 {item.author}</span>
                    <span style={{ background: '#F5F5F7', padding: '4px 10px', borderRadius: 12 }}>📅 {dateStr}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Log Knowledge Modal */}
      <Modal open={isCreateOpen} onClose={() => !isCreating && setIsCreateOpen(false)} title="Log Engineering Knowledge">
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
