import { useMemo } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';

export default function HistoryPage() {
  const { sessions = [], onSessionSelect } = useOutletContext();
  const navigate = useNavigate();

  const grouped = useMemo(() => {
    const list = { today: [], yesterday: [], thisWeek: [] };
    sessions.forEach(s => {
      const date = new Date(s.updatedAt || s.createdAt);
      if (isNaN(date.getTime())) {
        list.today.push(s);
        return;
      }
      const now = new Date();
      const diffMs = now - date;
      const diffHrs = diffMs / (1000 * 60 * 60);

      if (diffHrs < 24) {
        list.today.push(s);
      } else if (diffHrs < 48) {
        list.yesterday.push(s);
      } else {
        list.thisWeek.push(s);
      }
    });
    return list;
  }, [sessions]);

  const handleSelect = (sessId) => {
    if (onSessionSelect) onSessionSelect(sessId);
    navigate('/app'); // Navigate back to the chat view!
  };

  const renderSessionCard = (s) => {
    const isActive = s.sessionId === sessionStorage.getItem('sessionId');
    
    // Relative format
    const date = new Date(s.updatedAt);
    const dateText = isNaN(date.getTime()) ? '' : date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

    return (
      <div
        key={s.sessionId}
        onClick={() => handleSelect(s.sessionId)}
        style={{
          background: 'var(--white)',
          border: `1px solid ${isActive ? 'var(--blue)' : 'var(--border)'}`,
          borderLeft: isActive ? '4px solid var(--blue)' : '1px solid var(--border)',
          borderRadius: 10,
          padding: '16px 20px',
          cursor: 'pointer',
          display: 'flex',
          flexDirection: 'column',
          gap: 6,
          transition: 'all 0.15s ease',
        }}
        onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; }}
        onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 16 }}>🏛️</span>
            <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--black)' }}>Session Workspace</span>
            {isActive && <Badge color="blue">Active Session</Badge>}
          </div>
          <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--gray-mid)', background: 'var(--gray-light)', padding: '2px 8px', borderRadius: 99 }}>
            {s.msgCount || 0} messages
          </span>
        </div>
        <p style={{ fontSize: 13, color: 'var(--gray-mid)', margin: '4px 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {s.preview || 'No messages'}
        </p>
        <span style={{ fontSize: 11, color: 'var(--gray-mid)' }}>Updated {dateText}</span>
      </div>
    );
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--black)', margin: '0 0 4px 0' }}>Chat Sessions History</h1>
          <p style={{ fontSize: 13, color: 'var(--gray-mid)', margin: 0 }}>Browse past conversations and load history into your active workspace</p>
        </div>
        <Button variant="secondary" size="sm" onClick={() => {
          const newId = `sess-${Date.now()}-${Math.floor(Math.random()*1000)}`;
          sessionStorage.setItem('sessionId', newId);
          window.location.reload();
        }}>
          + Start New Chat
        </Button>
      </div>

      {sessions.length === 0 ? (
        <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--gray-mid)', background: 'var(--white)', borderRadius: 12, border: '1px solid var(--border)' }}>
          <span style={{ fontSize: 32 }}>💬</span>
          <h3 style={{ margin: '8px 0 4px 0', fontSize: 16, fontWeight: 600 }}>No past conversation history</h3>
          <p style={{ fontSize: 13, margin: 0 }}>Start asking the system orchestrator questions to see session histories here</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {grouped.today.length > 0 && (
            <div>
              <h2 style={{ fontSize: 11, fontWeight: 700, color: 'var(--gray-mid)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 12 }}>Today</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                {grouped.today.map(renderSessionCard)}
              </div>
            </div>
          )}

          {grouped.yesterday.length > 0 && (
            <div>
              <h2 style={{ fontSize: 11, fontWeight: 700, color: 'var(--gray-mid)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 12 }}>Yesterday</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                {grouped.yesterday.map(renderSessionCard)}
              </div>
            </div>
          )}

          {grouped.thisWeek.length > 0 && (
            <div>
              <h2 style={{ fontSize: 11, fontWeight: 700, color: 'var(--gray-mid)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 12 }}>This Week</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                {grouped.thisWeek.map(renderSessionCard)}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
