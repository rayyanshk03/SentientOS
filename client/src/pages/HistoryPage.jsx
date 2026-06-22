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
          background: isActive ? '#ffffff' : '#ffffff',
          border: 'none',
          boxShadow: isActive ? '0 12px 40px rgba(0,122,255,0.12)' : '0 8px 30px rgba(0,0,0,0.04)',
          borderRadius: 20,
          padding: '24px',
          cursor: 'pointer',
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
          transition: 'all 0.2s ease',
          position: 'relative',
          overflow: 'hidden',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = isActive ? '0 16px 48px rgba(0,122,255,0.18)' : '0 12px 40px rgba(0,0,0,0.08)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.transform = 'none';
          e.currentTarget.style.boxShadow = isActive ? '0 12px 40px rgba(0,122,255,0.12)' : '0 8px 30px rgba(0,0,0,0.04)';
        }}
      >
        {isActive && (
          <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: 4, background: '#007aff', borderRadius: '20px 0 0 20px' }} />
        )}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: '#F5F5F7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
              💬
            </div>
            <span style={{ fontSize: 16, fontWeight: 700, color: '#1d1d1f', letterSpacing: '-0.3px' }}>Session Workspace</span>
            {isActive && <Badge color="blue">Active</Badge>}
          </div>
          <span style={{ fontSize: 12, fontWeight: 600, color: '#515154', background: '#F5F5F7', padding: '4px 10px', borderRadius: 99 }}>
            {s.msgCount || 0} msgs
          </span>
        </div>
        <p style={{ fontSize: 14, color: '#515154', margin: '4px 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', lineHeight: 1.5 }}>
          {s.preview || 'No messages'}
        </p>
        <span style={{ fontSize: 12, color: '#86868b', fontWeight: 500 }}>Updated {dateText}</span>
      </div>
    );
  };

  return (
    <div 
      className="main-content-page"
      style={{
        gridColumn: 2,
        gridRow: '2 / 4',
        padding: '40px 48px',
        overflowY: 'auto',
        background: '#F5F5F7',
      }}
    >
      <div style={{ maxWidth: 840, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 32, width: '100%' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 700, color: '#1d1d1f', margin: '0 0 8px 0', letterSpacing: '-0.5px' }}>Chat Sessions History</h1>
            <p style={{ fontSize: 15, color: '#86868b', margin: 0 }}>Browse past conversations and load history into your active workspace</p>
          </div>
          <button
            onClick={() => {
              const newId = `sess-${Date.now()}-${Math.floor(Math.random()*1000)}`;
              sessionStorage.setItem('sessionId', newId);
              if (onSessionSelect) onSessionSelect(newId);
              navigate('/app');
            }}
            style={{
              background: '#1d1d1f',
              color: '#ffffff',
              border: 'none',
              borderRadius: 99,
              padding: '10px 20px',
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'background 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#333336'}
            onMouseLeave={e => e.currentTarget.style.background = '#1d1d1f'}
          >
            + Start New Chat
          </button>
        </div>

        {sessions.length === 0 ? (
          <div style={{ padding: '80px 0', textAlign: 'center', color: '#86868b', background: '#ffffff', borderRadius: 20, border: 'none', boxShadow: '0 8px 30px rgba(0,0,0,0.04)' }}>
            <span style={{ fontSize: 40 }}>💬</span>
            <h3 style={{ margin: '16px 0 8px 0', fontSize: 18, fontWeight: 600, color: '#1d1d1f' }}>No past conversation history</h3>
            <p style={{ fontSize: 14, margin: 0 }}>Start asking the system orchestrator questions to see session histories here</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
            {grouped.today.length > 0 && (
              <div>
                <h2 style={{ fontSize: 12, fontWeight: 700, color: '#86868b', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 16 }}>Today</h2>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                  {grouped.today.map(renderSessionCard)}
                </div>
              </div>
            )}

            {grouped.yesterday.length > 0 && (
              <div>
                <h2 style={{ fontSize: 12, fontWeight: 700, color: '#86868b', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 16 }}>Yesterday</h2>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                  {grouped.yesterday.map(renderSessionCard)}
                </div>
              </div>
            )}

            {grouped.thisWeek.length > 0 && (
              <div>
                <h2 style={{ fontSize: 12, fontWeight: 700, color: '#86868b', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 16 }}>This Week & Older</h2>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                  {grouped.thisWeek.map(renderSessionCard)}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
