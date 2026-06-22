import { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';

export default function StandupPanel({ open, onClose, messages = [] }) {
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState(null);
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const todayStr = new Date().toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric'
  });

  useEffect(() => {
    if (open) {
      fetchHistory();
    }
  }, [open]);

  const fetchHistory = async () => {
    setHistoryLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/standup/history`);
      const data = await res.json();
      setHistory(data.standups || []);
    } catch (e) {
      console.error("Failed to fetch standup history:", e);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleGenerate = async () => {
    setLoading(true);
    setSummary(null);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/standup/today`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages })
      });
      const data = await res.json();
      
      if (data.summary) {
        // Basic cleanup of [Memory] prefix if it got returned directly (though LLM should just return markdown)
        const text = data.summary.replace(/^\[Memory\] Standup Summary.*?\n/, '').trim();
        setSummary(text);
      }
      
      // refresh history after a short delay so parcle indexes it
      setTimeout(fetchHistory, 2000);
    } catch (e) {
      console.error("Failed to generate standup:", e);
      setSummary("Error generating standup. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!summary) return;
    navigator.clipboard.writeText(`*Daily Standup - ${todayStr}*\n\n${summary}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const renderSummaryText = (text) => {
    if (!text) return null;
    
    // Split text by markdown headings or common emojis used in the prompt
    // For simplicity, we just render it safely as text with whitespace preserved.
    return (
      <div style={{
        whiteSpace: 'pre-wrap', 
        fontSize: 14, 
        lineHeight: 1.6, 
        color: 'var(--black)',
        fontFamily: 'var(--font)'
      }}>
        {text}
      </div>
    );
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Today's Standup — ${todayStr}`}
      width={700}
      footer={
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
          <span style={{ fontSize: 12, color: 'var(--gray-mid)' }}>
            {summary ? "This summary was saved to Parcle memory." : ""}
          </span>
          <div style={{ display: 'flex', gap: 12 }}>
            <Button variant="ghost" onClick={onClose}>Close</Button>
            {summary && (
              <Button variant="outline" onClick={handleCopy}>
                {copied ? "Copied!" : "Copy to Slack"}
              </Button>
            )}
            <Button variant="primary" onClick={handleGenerate} disabled={loading}>
              {summary ? "Regenerate" : "Generate Summary"}
            </Button>
          </div>
        </div>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        
        {/* Loading State */}
        {loading && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 0', gap: 16 }}>
            <div style={{ fontSize: 40, animation: 'pulse 1.5s infinite' }}>🧠</div>
            <div style={{ color: 'var(--gray-mid)', fontWeight: 500 }}>Reviewing today's activity via Gemini...</div>
          </div>
        )}

        {/* Summary Display */}
        {!loading && summary && (
          <div style={{
            background: 'var(--gray-light)',
            padding: 20,
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border)'
          }}>
            {renderSummaryText(summary)}
          </div>
        )}

        {/* History Accordion */}
        {!loading && !summary && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 10 }}>
            <h4 style={{ margin: 0, color: 'var(--black)', fontSize: 16 }}>Previous Standups</h4>
            {historyLoading ? (
              <div style={{ fontSize: 14, color: 'var(--gray-mid)' }}>Loading history...</div>
            ) : history.length === 0 ? (
              <div style={{ fontSize: 14, color: 'var(--gray-mid)' }}>No previous standups found.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {history.map((h, i) => (
                  <details key={h.id || i} style={{
                    background: 'var(--white)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-md)',
                    padding: '12px 16px',
                    cursor: 'pointer'
                  }}>
                    <summary style={{ fontWeight: 600, fontSize: 14, color: 'var(--black)' }}>
                      Standup — {new Date(h.date).toLocaleDateString()}
                    </summary>
                    <div style={{ 
                      marginTop: 12, 
                      paddingTop: 12, 
                      borderTop: '1px solid var(--border)',
                      whiteSpace: 'pre-wrap', 
                      fontSize: 13,
                      lineHeight: 1.5,
                      color: 'var(--gray-dark)'
                    }}>
                      {h.summary.replace(/^\[Memory\] Standup Summary.*?\n/, '')}
                    </div>
                  </details>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </Modal>
  );
}
