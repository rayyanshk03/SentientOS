import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Modal from '../components/ui/Modal';

export default function AdrsPage() {
  const { panelBase, theme } = useOutletContext();
  const [adrs, setAdrs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Create Modal State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    decisionName: '', problem: '', solution: '', reasoning: '', alternatives: '', author: ''
  });

  // Explain State
  const [explainingId, setExplainingId] = useState(null);
  const [explanations, setExplanations] = useState({});

  useEffect(() => {
    fetchAdrs();
  }, []);

  const fetchAdrs = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/adr`);
      const data = await res.json();
      if (data.success) {
        setAdrs(data.data);
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const handleCreate = async () => {
    setIsCreating(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/adr`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success) {
        setIsCreateOpen(false);
        setFormData({ decisionName: '', problem: '', solution: '', reasoning: '', alternatives: '', author: '' });
        fetchAdrs();
      }
    } catch (e) {
      console.error(e);
    }
    setIsCreating(false);
  };

  const handleExplain = async (adr) => {
    if (explanations[adr.id] || explainingId === adr.id) return;
    setExplainingId(adr.id);
    
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/adr/explain`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: adr.title }),
      });
      const data = await res.json();
      if (data.success) {
        setExplanations(prev => ({ ...prev, [adr.id]: data.explanation }));
      }
    } catch (e) {
      console.error(e);
    }
    setExplainingId(null);
  };

  return (
    <div style={{ ...panelBase, flex: 1, overflowY: 'auto', padding: '32px 40px' }}>
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 700, margin: '0 0 8px 0', color: 'var(--black)' }}>
              Architecture Decisions
            </h1>
            <p style={{ margin: 0, color: 'var(--gray-mid)', fontSize: 15 }}>
              Permanent record of engineering decisions and their context.
            </p>
          </div>
          <Button variant="primary" onClick={() => setIsCreateOpen(true)}>
            + Create ADR
          </Button>
        </div>

        {/* Timeline View */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--gray-mid)' }}>Loading ADRs...</div>
        ) : adrs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px', background: 'var(--gray-light)', borderRadius: 12 }}>
            <span style={{ fontSize: 32 }}>📜</span>
            <h3 style={{ margin: '16px 0 8px', color: 'var(--black)' }}>No records yet</h3>
            <p style={{ margin: 0, color: 'var(--gray-mid)' }}>Document your first architecture decision to build project memory.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24, position: 'relative' }}>
            {/* Vertical timeline line */}
            <div style={{ position: 'absolute', left: 15, top: 20, bottom: 20, width: 2, background: 'var(--border)' }} />
            
            {adrs.map(adr => {
              const dateObj = new Date(adr.timestamp);
              const dateStr = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
              const isExplaining = explainingId === adr.id;
              const explanation = explanations[adr.id];

              return (
                <div key={adr.id} style={{ display: 'flex', gap: 20, position: 'relative' }}>
                  {/* Timeline Dot */}
                  <div style={{
                    width: 32, height: 32, borderRadius: '50%', background: 'var(--blue)', color: 'white',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0,
                    boxShadow: '0 0 0 4px var(--bg)'
                  }}>
                    🏗️
                  </div>

                  {/* ADR Card */}
                  <div style={{
                    background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: 12,
                    padding: 24, flex: 1, boxShadow: 'var(--shadow-sm)'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                      <div>
                        <h3 style={{ margin: '0 0 4px', fontSize: 18, color: 'var(--black)' }}>{adr.title}</h3>
                        <div style={{ display: 'flex', gap: 12, fontSize: 13, color: 'var(--gray-mid)' }}>
                          <span>📅 {dateStr}</span>
                          <span>👤 {adr.author}</span>
                        </div>
                      </div>
                      
                      {!explanation && (
                        <Button variant="ghost" onClick={() => handleExplain(adr)} disabled={isExplaining}>
                          {isExplaining ? 'Thinking...' : '✨ Explain Why'}
                        </Button>
                      )}
                    </div>

                    <p style={{ margin: '0 0 16px', fontSize: 15, lineHeight: 1.5, color: 'var(--gray-dark)' }}>
                      {adr.description}
                    </p>

                    {/* AI Explanation Area */}
                    {explanation && (
                      <div style={{
                        marginTop: 16, padding: 16, background: '#F8F9FA', borderRadius: 8,
                        borderLeft: '4px solid var(--blue)'
                      }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--blue)', textTransform: 'uppercase', marginBottom: 8, letterSpacing: '0.5px' }}>
                          AI Explanation
                        </div>
                        <div style={{ fontSize: 14, lineHeight: 1.6, color: 'var(--black)' }}>
                          <ReactMarkdown>{explanation}</ReactMarkdown>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Create ADR Modal */}
      <Modal isOpen={isCreateOpen} onClose={() => !isCreating && setIsCreateOpen(false)} title="Create Architecture Decision">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Input 
            label="Decision Name" 
            placeholder="e.g. Use PostgreSQL for Main Database" 
            value={formData.decisionName}
            onChange={e => setFormData({ ...formData, decisionName: e.target.value })}
          />
          <Input 
            label="Author" 
            placeholder="Your name" 
            value={formData.author}
            onChange={e => setFormData({ ...formData, author: e.target.value })}
          />
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--gray-dark)' }}>Problem Context</label>
            <textarea
              rows={3}
              value={formData.problem}
              onChange={e => setFormData({ ...formData, problem: e.target.value })}
              style={{
                padding: '10px 12px', border: '1px solid var(--border)', borderRadius: 'var(--radius-input)',
                fontFamily: 'inherit', fontSize: 14, resize: 'vertical'
              }}
              placeholder="What problem are we solving?"
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--gray-dark)' }}>Chosen Solution</label>
            <textarea
              rows={2}
              value={formData.solution}
              onChange={e => setFormData({ ...formData, solution: e.target.value })}
              style={{
                padding: '10px 12px', border: '1px solid var(--border)', borderRadius: 'var(--radius-input)',
                fontFamily: 'inherit', fontSize: 14, resize: 'vertical'
              }}
              placeholder="What is the solution?"
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--gray-dark)' }}>Reasoning</label>
            <textarea
              rows={3}
              value={formData.reasoning}
              onChange={e => setFormData({ ...formData, reasoning: e.target.value })}
              style={{
                padding: '10px 12px', border: '1px solid var(--border)', borderRadius: 'var(--radius-input)',
                fontFamily: 'inherit', fontSize: 14, resize: 'vertical'
              }}
              placeholder="Why was this chosen? (e.g. ACID compliance)"
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--gray-dark)' }}>Alternatives Considered</label>
            <textarea
              rows={2}
              value={formData.alternatives}
              onChange={e => setFormData({ ...formData, alternatives: e.target.value })}
              style={{
                padding: '10px 12px', border: '1px solid var(--border)', borderRadius: 'var(--radius-input)',
                fontFamily: 'inherit', fontSize: 14, resize: 'vertical'
              }}
              placeholder="What else did we look at? (e.g. MongoDB)"
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 8 }}>
            <Button variant="ghost" onClick={() => setIsCreateOpen(false)} disabled={isCreating}>Cancel</Button>
            <Button variant="primary" onClick={handleCreate} loading={isCreating} disabled={!formData.decisionName || !formData.solution}>
              Save ADR
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
