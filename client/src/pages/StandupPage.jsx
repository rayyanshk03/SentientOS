import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import Button from '../components/ui/Button';

export default function StandupPage() {
  const { panelBase } = useOutletContext();
  const [history, setHistory] = useState([]);
  const [todayStandup, setTodayStandup] = useState(null);
  
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    setLoadingHistory(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/standup/history`);
      const data = await res.json();
      if (data.standups) {
        setHistory(data.standups);
      }
    } catch (e) {
      console.error(e);
    }
    setLoadingHistory(false);
  };

  const handleGenerateStandup = async () => {
    setGenerating(true);
    setError(null);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/standup/today`);
      const data = await res.json();
      if (data.summary) {
        setTodayStandup(data.summary);
        // Refresh history to include the newly saved standup
        fetchHistory();
      } else if (data.error) {
        setError(data.error);
      }
    } catch (e) {
      setError("Failed to generate standup.");
      console.error(e);
    }
    setGenerating(false);
  };

  return (
    <div style={{ ...panelBase, flex: 1, overflowY: 'auto', padding: '32px 40px' }}>
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 700, margin: '0 0 8px 0', color: 'var(--black)' }}>
              Daily Standup Summarizer
            </h1>
            <p style={{ margin: 0, color: 'var(--gray-mid)', fontSize: 15 }}>
              Automatically synthesizes team activity, memory core updates, and agent logs into a daily digest.
            </p>
          </div>
        </div>

        {/* Generate Action */}
        <div style={{ 
          background: 'linear-gradient(to right, rgba(0, 113, 227, 0.05), rgba(0, 113, 227, 0.1))',
          border: '1px solid rgba(0, 113, 227, 0.2)', borderRadius: 16, padding: 32, 
          display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',
          marginBottom: 40
        }}>
          <h2 style={{ fontSize: 20, margin: '0 0 12px', color: 'var(--black)' }}>Ready to sync the team?</h2>
          <p style={{ fontSize: 14, color: 'var(--gray-dark)', margin: '0 0 24px', maxWidth: 400 }}>
            Click below to generate today's standup. The AI will ingest all agent logs and architectural decisions made today and draft a digest.
          </p>
          
          <Button 
            variant="primary" 
            onClick={handleGenerateStandup} 
            loading={generating}
            style={{ padding: '12px 32px', fontSize: 15, borderRadius: 24 }}
          >
            {generating ? 'Synthesizing...' : "Generate Today's Standup"}
          </Button>

          {error && <div style={{ color: 'var(--red)', marginTop: 16, fontSize: 14 }}>{error}</div>}
        </div>

        {/* Today's Standup Result */}
        {todayStandup && (
          <div style={{ marginBottom: 40, animation: 'fadeIn 0.5s ease-out' }}>
            <h3 style={{ margin: '0 0 16px', fontSize: 18, color: 'var(--black)', display: 'flex', alignItems: 'center', gap: 8 }}>
              ✨ Generated Digest
            </h3>
            <div style={{ 
              background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: 12,
              padding: '24px 32px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
            }}>
              <div className="markdown-body" style={{ background: 'transparent', color: 'var(--black)', fontSize: 15, lineHeight: 1.6 }}>
                <ReactMarkdown>{todayStandup}</ReactMarkdown>
              </div>
            </div>
          </div>
        )}

        {/* History Feed */}
        <h3 style={{ margin: '0 0 20px', fontSize: 18, color: 'var(--black)' }}>Standup History</h3>
        
        {loadingHistory ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--gray-mid)' }}>Loading History...</div>
        ) : history.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', background: 'var(--gray-light)', borderRadius: 12 }}>
            <span style={{ fontSize: 32, opacity: 0.5 }}>🌅</span>
            <p style={{ margin: '16px 0 0', color: 'var(--gray-mid)' }}>No standups generated yet.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {history.map((item, idx) => {
              const dateObj = new Date(item.date);
              const dateStr = dateObj.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

              return (
                <div key={item.id || idx} style={{
                  background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: 12,
                  padding: 24
                }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--gray-dark)', marginBottom: 12, borderBottom: '1px solid var(--border)', paddingBottom: 12 }}>
                    📅 {dateStr}
                  </div>
                  <div className="markdown-body" style={{ background: 'transparent', color: 'var(--black)', fontSize: 14, lineHeight: 1.6 }}>
                    <ReactMarkdown>{item.summary}</ReactMarkdown>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
