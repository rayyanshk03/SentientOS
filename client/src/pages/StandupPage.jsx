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
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/standup/today`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [] })
      });
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
    <div style={{ ...panelBase, flex: 1, overflowY: 'auto', padding: '40px 48px', background: '#F5F5F7' }}>
      <div style={{ maxWidth: 840, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 32, width: '100%' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 700, margin: '0 0 8px 0', color: '#1d1d1f', letterSpacing: '-0.5px' }}>
              Daily Standup Summarizer
            </h1>
            <p style={{ margin: 0, color: '#86868b', fontSize: 15 }}>
              Automatically synthesizes team activity, memory core updates, and agent logs into a daily digest.
            </p>
          </div>
        </div>

        {/* Generate Action */}
        <div style={{ 
          background: '#ffffff',
          border: 'none', borderRadius: 20, padding: '48px 40px', 
          display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',
          boxShadow: '0 8px 30px rgba(0,0,0,0.04)'
        }}>
          <h2 style={{ fontSize: 24, margin: '0 0 12px', color: '#1d1d1f', fontWeight: 700, letterSpacing: '-0.3px' }}>Ready to sync the team?</h2>
          <p style={{ fontSize: 15, color: '#515154', margin: '0 0 32px', maxWidth: 440, lineHeight: 1.5 }}>
            Click below to generate today's standup. The AI will ingest all agent logs and architectural decisions made today and draft a digest.
          </p>
          
          <button 
            onClick={handleGenerateStandup} 
            disabled={generating}
            style={{ 
              background: '#007aff', color: '#ffffff', border: 'none',
              padding: '14px 32px', fontSize: 16, fontWeight: 600, borderRadius: 99,
              cursor: generating ? 'not-allowed' : 'pointer', opacity: generating ? 0.7 : 1,
              transition: 'all 0.2s ease', boxShadow: '0 4px 14px rgba(0,122,255,0.3)'
            }}
            onMouseEnter={e => !generating && (e.currentTarget.style.transform = 'translateY(-1px)')}
            onMouseLeave={e => !generating && (e.currentTarget.style.transform = 'none')}
          >
            {generating ? 'Synthesizing...' : "Generate Today's Standup"}
          </button>

          {error && <div style={{ color: '#FF3B30', marginTop: 20, fontSize: 14, fontWeight: 500 }}>{error}</div>}
        </div>

        {/* Today's Standup Result */}
        {todayStandup && (
          <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
            <h3 style={{ margin: '0 0 16px', fontSize: 20, color: '#1d1d1f', fontWeight: 700, letterSpacing: '-0.3px', display: 'flex', alignItems: 'center', gap: 8 }}>
              ✨ Generated Digest
            </h3>
            <div style={{ 
              background: '#ffffff', border: 'none', borderRadius: 20,
              padding: '32px 40px', boxShadow: '0 8px 30px rgba(0,0,0,0.04)'
            }}>
              <div className="markdown-body" style={{ background: 'transparent', color: '#1d1d1f', fontSize: 15, lineHeight: 1.6 }}>
                <ReactMarkdown>{todayStandup}</ReactMarkdown>
              </div>
            </div>
          </div>
        )}

        {/* History Feed */}
        <h3 style={{ margin: '0', fontSize: 20, color: '#1d1d1f', fontWeight: 700, letterSpacing: '-0.3px' }}>Standup History</h3>
        
        {loadingHistory ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#86868b' }}>Loading History...</div>
        ) : history.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 40px', background: '#ffffff', borderRadius: 20, boxShadow: '0 8px 30px rgba(0,0,0,0.04)' }}>
            <span style={{ fontSize: 40, opacity: 0.8 }}>🌅</span>
            <p style={{ margin: '16px 0 0', color: '#86868b', fontSize: 15 }}>No standups generated yet.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {history.map((item, idx) => {
              const dateObj = new Date(item.date);
              const dateStr = dateObj.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

              return (
                <div key={item.id || idx} style={{
                  background: '#ffffff', border: 'none', borderRadius: 20,
                  padding: 32, boxShadow: '0 8px 30px rgba(0,0,0,0.04)'
                }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#86868b', marginBottom: 16, borderBottom: '1px solid #E5E5EA', paddingBottom: 16, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    📅 {dateStr}
                  </div>
                  <div className="markdown-body" style={{ background: 'transparent', color: '#1d1d1f', fontSize: 15, lineHeight: 1.6 }}>
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
