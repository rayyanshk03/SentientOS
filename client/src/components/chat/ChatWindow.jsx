import { useEffect, useRef, useState } from 'react';
import MessageBubble from './MessageBubble';
import UploadZone from '../upload/UploadZone';

export default function ChatWindow({
  messages = [],
  isLoading = false,
  streamSteps = [],
  activePersonaId,
  personas = [],
  onPersonaChange,
  onSuggestionClick,
  activeProject,
  onUploadSuccess,
  identity,
}) {
  const messagesEndRef = useRef(null);
  const [dragActive, setDragActive] = useState(false);
  const [isOverlayUploading, setIsOverlayUploading] = useState(false);
  const [overlayProgress, setOverlayProgress] = useState(0);
  const [overlayError, setOverlayError] = useState(null);

  // Auto-scroll to bottom when messages or loading state changes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading, streamSteps]);

  const activePersona = personas.find(p => p.id === activePersonaId) || personas[0];

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      // Only deactivate if leaving the container
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX;
      const y = e.clientY;
      if (x < rect.left || x >= rect.right || y < rect.top || y >= rect.bottom) {
        setDragActive(false);
      }
    }
  };

  const uploadFile = async (file) => {
    setIsOverlayUploading(true);
    setOverlayError(null);
    setOverlayProgress(10);
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('projectId', activeProject || 'default-project');

    // Simulate progress while waiting for backend
    const interval = setInterval(() => {
      setOverlayProgress(prev => Math.min(prev + 5, 90));
    }, 400);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/upload`, {
        method: 'POST',
        body: formData,
      });
      
      clearInterval(interval);
      setOverlayProgress(100);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Upload failed');
      }
      
      const data = await response.json();
      if (onUploadSuccess) onUploadSuccess(data);
      
      setTimeout(() => {
        setDragActive(false);
        setIsOverlayUploading(false);
        setOverlayProgress(0);
      }, 800);
      
    } catch (err) {
      clearInterval(interval);
      setOverlayError(err.message);
      setIsOverlayUploading(false);
    }
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const file = e.dataTransfer.files[0];
    if (file) {
      // Validate
      const validExtensions = ['pdf', 'txt', 'md', 'docx'];
      const ext = file.name.split('.').pop().toLowerCase();
      if (!validExtensions.includes(ext)) {
        setOverlayError(`Unsupported file type: .${ext}. Allowed: PDF, TXT, MD, DOCX`);
        return;
      }
      
      if (file.size > 10 * 1024 * 1024) {
        setOverlayError(`File is too large. Max 10MB.`);
        return;
      }
      
      await uploadFile(file);
    } else {
      setDragActive(false);
    }
  };

  // Detect if agent is in demo/quota-exceeded mode
  const lastAgentMsg = [...messages].reverse().find(m => m.role === 'agent');
  const isDemoMode = lastAgentMsg?.content?.includes('[Demo Mode') || lastAgentMsg?.content?.includes('API Quota Exceeded');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', flex: 1, minWidth: 0, position: 'relative' }}>
      {/* CHAT HEADER */}
      <div style={{
        padding: '14px 20px',
        borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexShrink: 0, background: 'var(--white)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 'var(--radius-md)',
            background: 'linear-gradient(135deg, var(--blue) 0%, #34aadc 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 3px 10px rgba(0,113,227,0.35)',
            fontSize: 20
          }}>
            {activePersona?.emoji}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--black)' }}>
                {activePersona?.label}
              </span>
              {isDemoMode && (
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: 4,
                  background: '#FFF3CD', color: '#856404',
                  border: '1px solid #FFEAA7',
                  borderRadius: 'var(--radius-pill)',
                  fontSize: 10, fontWeight: 700,
                  padding: '2px 8px', letterSpacing: '0.3px',
                }}>
                  ⚠️ DEMO MODE
                </span>
              )}
            </div>
            <span style={{ fontSize: 12, color: isDemoMode ? '#FF9500' : 'var(--gray-mid)', fontWeight: 400 }}>
              {isDemoMode ? 'API quota exhausted — update GEMINI_API_KEY in .env' : activePersona?.subtitle}
            </span>
          </div>
        </div>

        {/* Persona Switcher Chips */}
        <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 2 }}>
          {personas.map(p => {
            const isActive = p.id === activePersonaId;
            return (
              <button
                key={p.id}
                onClick={() => onPersonaChange?.(p.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '6px 12px', borderRadius: 'var(--radius-pill)',
                  border: `1px solid ${isActive ? 'var(--blue)' : 'var(--border)'}`,
                  background: isActive ? 'var(--blue)' : 'var(--white)',
                  color: isActive ? 'var(--white)' : 'var(--gray-dark)',
                  fontSize: 12, fontWeight: 600, cursor: 'pointer',
                  transition: 'var(--transition)',
                  whiteSpace: 'nowrap'
                }}
              >
                <span>{p.emoji}</span>
                {p.label.split(' ')[0]} {/* Short name assumption */}
              </button>
            );
          })}
        </div>
      </div>

      {/* MESSAGE AREA */}
      <div 
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        style={{
          flex: 1, overflowY: 'auto', padding: '24px 20px',
          display: 'flex', flexDirection: 'column', gap: 16,
          background: 'var(--gray-light)',
          position: 'relative'
        }}
      >
        {messages.length === 0 ? (
          /* ── PREMIUM EMPTY STATE ─────────────────────────────────── */
          <div style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            padding: '40px 20px',
            margin: 'auto',
            width: '100%',
            maxWidth: 520,
            gap: 0,
          }}>
            {/* Animated gradient orb */}
            <div
              className="orb-pulse"
              style={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                background: 'radial-gradient(circle at 35% 35%, #00A3FF, #0071E3, #E8F1FB)',
                boxShadow: '0 0 40px rgba(0,113,227,0.20)',
                marginBottom: 20,
                flexShrink: 0,
              }}
            />

            {/* Headline */}
            <h2 style={{
              fontSize: 24,
              fontWeight: 700,
              color: 'var(--black)',
              margin: '0 0 8px 0',
              lineHeight: 1.2,
              letterSpacing: '-0.4px',
            }}>
              What are we building today?
            </h2>

            {/* Sub-headline */}
            <p style={{
              fontSize: 16,
              fontWeight: 400,
              color: 'var(--gray-mid)',
              margin: '0 0 16px 0',
              lineHeight: 1.5,
            }}>
              {identity?.name 
                ? `${identity.name}, I remember everything from our last session.` 
                : "Your AI engineer with permanent memory."}
            </p>

            {/* Last session card (if identity exists) */}
            {identity && (
              <div 
                className="last-session-card"
                onClick={() => onSuggestionClick?.("Review the architecture")}
                style={{
                  background: 'var(--card-bg)',
                  border: '1px solid var(--border)',
                  borderRadius: 10,
                  padding: '10px 16px',
                  fontSize: 14,
                  fontWeight: 400,
                  color: 'var(--gray-mid)',
                  marginTop: 0,
                  cursor: 'pointer',
                  transition: 'var(--transition)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <span>📋</span>
                <span>Last session: {identity.lastSessionTitle || "Continued architecture work"}</span>
              </div>
            )}

            {/* Suggestion chips */}
            <div style={{
              display: 'flex',
              gap: 8,
              flexWrap: 'wrap',
              justifyContent: 'center',
              marginTop: 20,
            }}>
              {[
                { emoji: '🔐', label: 'Add authentication' },
                { emoji: '🏗️', label: 'Review the architecture' },
                { emoji: '🐛', label: 'Fix a bug' },
              ].map(({ emoji, label }) => (
                <button
                  key={label}
                  onClick={() => onSuggestionClick?.(label)}
                  className="suggestion-chip"
                  style={{
                    height: 36,
                    padding: '0 14px',
                    fontSize: 13.5,
                    gap: 6,
                    display: 'inline-flex',
                    alignItems: 'center',
                  }}
                >
                  <span>{emoji}</span>
                  <span>{label}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            <MessageBubble msg={{ id: 'session-start', role: 'system', content: `Session started · ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}` }} />
            {messages.map(msg => <MessageBubble key={msg.id} msg={msg} />)}
            {isLoading && <MessageBubble msg={{ id: 'typing', role: 'agent', isTyping: true }} />}
          </>
        )}
        <div ref={messagesEndRef} />

        {/* DRAG AND DROP OVERLAY */}
        {dragActive && (
          <div 
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(255, 255, 255, 0.85)',
              backdropFilter: 'blur(12px) saturate(160%)',
              border: '2.5px dashed var(--blue)',
              borderRadius: '16px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
              gap: 16,
              padding: 24,
              margin: 16,
              boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
            }}
          >
            {isOverlayUploading ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--black)' }}>
                  Processing document...
                </span>
                <div style={{ width: 200, height: 6, background: 'var(--border)', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${overlayProgress}%`, background: 'var(--blue)', transition: 'width 0.2s ease' }} />
                </div>
              </div>
            ) : overlayError ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, textAlign: 'center' }}>
                <span style={{ fontSize: 15, fontWeight: 600, color: '#FF3B30' }}>{overlayError}</span>
                <button 
                  onClick={() => { setDragActive(false); setOverlayError(null); }}
                  style={{
                    background: 'var(--blue)', color: 'white', border: 'none',
                    padding: '8px 16px', borderRadius: 'var(--radius-pill)',
                    fontSize: 13, fontWeight: 600, cursor: 'pointer'
                  }}
                >
                  Close
                </button>
              </div>
            ) : (
              <>
                <div style={{ color: 'var(--blue)', marginBottom: 8 }}>
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ animation: 'bounce 1s infinite' }}>
                    <path d="M12 16V8M12 8L8.5 11.5M12 8L15.5 11.5"/>
                    <path d="M4 16.5A7.5 7.5 0 0 0 11.5 24H12.5A7.5 7.5 0 0 0 20 16.5"/>
                  </svg>
                </div>
                <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--black)' }}>
                  Drop documents here to index into memory
                </span>
                <span style={{ fontSize: 13, color: 'var(--gray-mid)' }}>
                  Supports PDF, TXT, MD, DOCX up to 10MB
                </span>
              </>
            )}
          </div>
        )}
      </div>

      {isLoading && streamSteps && streamSteps.length > 0 && (
        <div style={{
          padding: '12px 20px', background: 'var(--white)', borderTop: '1px solid var(--border)',
          display: 'flex', flexDirection: 'column', gap: 4, flexShrink: 0
        }}>
          {streamSteps.map((step, idx) => {
            const isLast = idx === streamSteps.length - 1;
            return (
              <div key={idx} className="step-fade-in" style={{
                display: 'flex', alignItems: 'center', gap: 8, fontSize: 13,
                color: isLast ? '#1D1D1F' : '#AEAEB2',
                fontWeight: isLast ? 600 : 400,
                transition: 'color 0.3s ease',
              }}>
                {isLast
                  ? <span className="activity-dot-pulse" />
                  : <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#AEAEB2', flexShrink: 0, display: 'inline-block' }} />
                }
                {step}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
