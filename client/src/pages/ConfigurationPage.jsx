import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import Button from '../components/ui/Button';
import { FormSkeleton } from '../components/ui/Skeleton';

export default function ConfigurationPage() {
  const { memories = [], onRefresh } = useOutletContext();
  const [conflictWarning, setConflictWarning] = useState(true);
  const [autoIngest, setAutoIngest] = useState(true);
  const [parcleApiKey, setParcleApiKey] = useState('••••••••••••••••••••••••••••••••');
  
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const handleClearMemories = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/memories`, { method: 'DELETE' });
      if (res.ok) {
        setShowClearConfirm(false);
        if (onRefresh) onRefresh();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleResetIdentity = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/identity`, { method: 'DELETE' });
      if (res.ok) {
        setShowResetConfirm(false);
        window.location.reload();
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
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
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--black)', margin: '0 0 4px 0' }}>Configuration</h1>
          <p style={{ fontSize: 13, color: 'var(--gray-mid)', margin: 0 }}>Configure system directives, Parcle integration, and purge memory caches</p>
        </div>
        <FormSkeleton />
      </div>
    );
  }

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
      <div>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--black)', margin: '0 0 4px 0' }}>Configuration</h1>
        <p style={{ fontSize: 13, color: 'var(--gray-mid)', margin: 0 }}>Configure system directives, Parcle integration, and purge memory caches</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.2fr', gap: 24, alignItems: 'start' }}>
        
        {/* Left Side: Forms */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          
          {/* General Toggles */}
          <div style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 12, padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
            <h2 style={{ fontSize: 15, fontWeight: 600, color: 'var(--black)', margin: 0 }}>System Directives</h2>
            <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: 0 }} />

            {/* Toggle 1 */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2, maxWidth: '75%' }}>
                <span style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--black)' }}>Warning Contradictions</span>
                <span style={{ fontSize: 11, color: 'var(--gray-mid)' }}>Trigger UI prompts when agent responses contradict past decisions in Parcle.</span>
              </div>
              <div 
                onClick={() => setConflictWarning(!conflictWarning)}
                style={{
                  width: 38, height: 22, borderRadius: 12, background: conflictWarning ? '#34C759' : 'var(--border)',
                  position: 'relative', cursor: 'pointer', transition: 'background 0.2s'
                }}
              >
                <div style={{
                  width: 18, height: 18, borderRadius: '50%', background: 'var(--white)',
                  position: 'absolute', top: 2, left: conflictWarning ? 18 : 2,
                  transition: 'left 0.2s ease', boxShadow: '0 1px 3px rgba(0,0,0,0.15)'
                }} />
              </div>
            </div>

            {/* Toggle 2 */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2, maxWidth: '75%' }}>
                <span style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--black)' }}>Auto Ingest Sessions</span>
                <span style={{ fontSize: 11, color: 'var(--gray-mid)' }}>Ingest finished user conversations into Parcle indexing nodes automatically.</span>
              </div>
              <div 
                onClick={() => setAutoIngest(!autoIngest)}
                style={{
                  width: 38, height: 22, borderRadius: 12, background: autoIngest ? '#34C759' : 'var(--border)',
                  position: 'relative', cursor: 'pointer', transition: 'background 0.2s'
                }}
              >
                <div style={{
                  width: 18, height: 18, borderRadius: '50%', background: 'var(--white)',
                  position: 'absolute', top: 2, left: autoIngest ? 18 : 2,
                  transition: 'left 0.2s ease', boxShadow: '0 1px 3px rgba(0,0,0,0.15)'
                }} />
              </div>
            </div>
          </div>

          {/* Credentials Card */}
          <div style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 12, padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <h2 style={{ fontSize: 15, fontWeight: 600, color: 'var(--black)', margin: 0 }}>Parcle Integration Credentials</h2>
            <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: 0 }} />

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--black)' }}>PARCLE_API_KEY</label>
              <input
                type="text"
                value={parcleApiKey}
                onChange={e => setParcleApiKey(e.target.value)}
                style={{
                  height: 38, border: '1px solid var(--border)', borderRadius: 8,
                  fontSize: 13, padding: '0 10px', outline: 'none', background: 'var(--gray-light)', color: 'var(--black)'
                }}
              />
              <span style={{ fontSize: 11, color: 'var(--gray-mid)' }}>Retrieved from your Parcle developer dashboard. Keep this key private.</span>
            </div>
          </div>
        </div>

        {/* Right Side: Danger Zone */}
        <div style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 12, padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <h2 style={{ fontSize: 15, fontWeight: 600, color: 'var(--black)', margin: 0 }}>Danger Zone</h2>
          <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: 0 }} />
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <button
              onClick={() => setShowClearConfirm(true)}
              style={{
                width: '100%', padding: '10px 12px', border: '1px solid #FF3B30', background: 'transparent',
                color: '#FF3B30', fontSize: 12.5, fontWeight: 600, borderRadius: 8, cursor: 'pointer', transition: 'all 0.2s'
              }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = '#FFE5E5'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              Clear all memories
            </button>

            <button
              onClick={() => setShowResetConfirm(true)}
              style={{
                width: '100%', padding: '10px 12px', border: '1px solid #FF3B30', background: 'transparent',
                color: '#FF3B30', fontSize: 12.5, fontWeight: 600, borderRadius: 8, cursor: 'pointer', transition: 'all 0.2s'
              }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = '#FFE5E5'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              Reset Identity profile
            </button>
          </div>
        </div>

      </div>

      {/* Confirmation Overlays */}
      {showClearConfirm && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)',
          zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div style={{
            background: '#FFFFFF', borderRadius: 16, padding: '24px 20px', width: 340, maxWidth: '90vw',
            boxShadow: '0 8px 40px rgba(0,0,0,0.12)', display: 'flex', flexDirection: 'column', gap: 16
          }}>
            <span style={{ fontWeight: 700, fontSize: 15, color: '#FF3B30' }}>Clear all memories?</span>
            <div style={{ fontSize: 13, color: 'var(--gray-mid)', lineHeight: 1.5 }}>
              This will permanently delete all {memories.length} decisions saved in Parcle index. This cannot be undone.
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <Button variant="ghost" onClick={() => setShowClearConfirm(false)}>Cancel</Button>
              <Button variant="danger" onClick={handleClearMemories}>Yes, clear all</Button>
            </div>
          </div>
        </div>
      )}

      {showResetConfirm && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)',
          zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div style={{
            background: '#FFFFFF', borderRadius: 16, padding: '24px 20px', width: 340, maxWidth: '90vw',
            boxShadow: '0 8px 40px rgba(0,0,0,0.12)', display: 'flex', flexDirection: 'column', gap: 16
          }}>
            <span style={{ fontWeight: 700, fontSize: 15, color: '#FF3B30' }}>Reset identity profile?</span>
            <div style={{ fontSize: 13, color: 'var(--gray-mid)', lineHeight: 1.5 }}>
              This will purge your developer setup name, roles, stack, and active project context from MongoDB caches.
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <Button variant="ghost" onClick={() => setShowResetConfirm(false)}>Cancel</Button>
              <Button variant="danger" onClick={handleResetIdentity}>Yes, reset profile</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
