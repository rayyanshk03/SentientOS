import { useState, useEffect } from 'react';
import Button from '../components/ui/Button';
import { FormSkeleton } from '../components/ui/Skeleton';

export default function LLMSettingsPage() {
  const [model, setModel] = useState('EnterPro');
  const [temp, setTemp] = useState(0.2);
  const [systemPrompt, setSystemPrompt] = useState(
    'You are SentientOS, a premium AI system orchestrator. You have access to Parcle memory database. Always read from past decisions before making new claims. Avoid contradictions at all costs.'
  );
  const [showSavedToast, setShowSavedToast] = useState(false);
  const [loading, setLoading] = useState(true);

  const handleSave = () => {
    setShowSavedToast(true);
    setTimeout(() => setShowSavedToast(false), 2000);
  };

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div 
        className="main-content-page"
        style={{
          gridColumn: 2,
          gridRow: '2 / 4',
          padding: '40px 48px',
          overflowY: 'auto',
          background: 'var(--chat-bg)',
          display: 'flex',
          flexDirection: 'column',
          gap: 32,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 style={{ fontSize: 32, fontWeight: 700, color: 'var(--black)', margin: '0 0 8px 0', letterSpacing: '-0.8px' }}>AI Preferences</h1>
            <p style={{ fontSize: 15, color: 'var(--gray-mid)', margin: 0, fontWeight: 400 }}>Configure the core behavior of SentientOS.</p>
          </div>
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
        padding: '40px 48px',
        overflowY: 'auto',
        background: 'var(--chat-bg)',
        display: 'flex',
        flexDirection: 'column',
        gap: 32,
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontSize: 32, fontWeight: 700, color: 'var(--black)', margin: '0 0 8px 0', letterSpacing: '-0.8px' }}>AI Preferences</h1>
          <p style={{ fontSize: 15, color: 'var(--gray-mid)', margin: 0, fontWeight: 400 }}>Configure the core behavior of SentientOS.</p>
        </div>
        <Button 
          variant="primary" 
          onClick={handleSave}
          style={{
            background: 'linear-gradient(135deg, #0071E3 0%, #0A84FF 100%)',
            border: 'none',
            borderRadius: '980px',
            padding: '10px 20px',
            fontSize: '14px',
            fontWeight: 600,
            boxShadow: '0 4px 14px rgba(0,113,227,0.25)',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease',
          }}
        >
          Save Configuration
        </Button>
      </div>

      {showSavedToast && (
        <div style={{
          background: 'var(--white)', color: 'var(--black)', padding: '12px 20px', borderRadius: '16px',
          position: 'fixed', bottom: 32, right: 32, zIndex: 1000, 
          boxShadow: '0 8px 30px rgba(0,0,0,0.12)', border: '1px solid rgba(0,0,0,0.05)',
          fontSize: 14, fontWeight: 600, animation: 'toastSlideIn 0.3s cubic-bezier(0.22, 1, 0.36, 1)',
          display: 'flex', alignItems: 'center', gap: 10
        }}>
          <div style={{ background: '#34C759', width: 20, height: 20, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 12 }}>✓</div>
          Preferences saved successfully
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 32, alignItems: 'start', maxWidth: 1200 }}>
        
        {/* Left Side: Parameters Form (Apple Grouped Layout) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
          
          {/* Foundation Model */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--gray-mid)', textTransform: 'uppercase', letterSpacing: '0.5px', marginLeft: 16 }}>Foundation Model</label>
            <div style={{ background: 'var(--white)', border: '1px solid rgba(0,0,0,0.04)', borderRadius: 24, padding: '8px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
              {[
                { id: 'Gemini', label: 'Gemini', desc: 'Google Gemini (Flash)' },
                { id: 'Groq', label: 'Groq', desc: 'Llama 3.1 8B via Groq' },
                { id: 'EnterPro', label: 'EnterPro', desc: 'Premium reasoning via EnterPro (Claude)' }
              ].map((opt, idx) => (
                <div 
                  key={opt.id}
                  onClick={() => setModel(opt.id)}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '16px 20px',
                    borderBottom: idx === 2 ? 'none' : '1px solid rgba(0,0,0,0.04)',
                    cursor: 'pointer',
                    background: model === opt.id ? 'var(--gray-light)' : 'transparent',
                    borderRadius: 16,
                    transition: 'background 0.2s ease',
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <span style={{ fontSize: 16, fontWeight: 500, color: 'var(--black)' }}>{opt.label}</span>
                    <span style={{ fontSize: 13, color: 'var(--gray-mid)' }}>{opt.desc}</span>
                  </div>
                  <div style={{ 
                    width: 22, height: 22, borderRadius: '50%', border: model === opt.id ? '6px solid var(--blue)' : '2px solid var(--border)',
                    transition: 'all 0.2s ease', display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }} />
                </div>
              ))}
            </div>
          </div>

          {/* Core Directives */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--gray-mid)', textTransform: 'uppercase', letterSpacing: '0.5px', marginLeft: 16 }}>System Prompts & Behavior</label>
            <div style={{ background: 'var(--white)', border: '1px solid rgba(0,0,0,0.04)', borderRadius: 24, padding: '24px 24px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', display: 'flex', flexDirection: 'column', gap: 24 }}>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 16, fontWeight: 500, color: 'var(--black)' }}>Creativity (Temperature)</span>
                  <span style={{ fontSize: 16, fontWeight: 600, color: 'var(--blue)', background: 'var(--blue-light)', padding: '4px 12px', borderRadius: '980px' }}>{temp.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={temp}
                  onChange={e => setTemp(parseFloat(e.target.value))}
                  style={{ width: '100%', height: 6, background: '#E5E5EA', borderRadius: 3, cursor: 'pointer', outline: 'none', appearance: 'none' }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--gray-mid)', fontWeight: 500 }}>
                  <span>Precise & Analytical</span>
                  <span>Creative & Free</span>
                </div>
              </div>

              <div style={{ height: 1, background: 'rgba(0,0,0,0.04)' }} />

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <span style={{ fontSize: 16, fontWeight: 500, color: 'var(--black)' }}>Architect System Directive</span>
                <textarea
                  value={systemPrompt}
                  onChange={e => setSystemPrompt(e.target.value)}
                  rows={4}
                  style={{
                    padding: '16px', border: '1px solid rgba(0,0,0,0.08)', borderRadius: 16,
                    fontSize: 14.5, outline: 'none', background: 'var(--chat-bg)', color: 'var(--black)',
                    resize: 'none', lineHeight: 1.5, fontFamily: 'inherit',
                    boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)',
                    transition: 'border-color 0.2s',
                  }}
                  onFocus={e => e.target.style.borderColor = 'var(--blue)'}
                  onBlur={e => e.target.style.borderColor = 'rgba(0,0,0,0.08)'}
                />
              </div>

            </div>
          </div>
        </div>

        {/* Right Side: Parameter Info */}
        <div style={{ 
          background: 'var(--white)', 
          border: '1px solid rgba(0,0,0,0.04)', 
          borderRadius: 24, 
          padding: 32, 
          display: 'flex', 
          flexDirection: 'column', 
          gap: 20,
          boxShadow: '0 4px 20px rgba(0,0,0,0.03)'
        }}>
          <h2 style={{ fontSize: 18, fontWeight: 600, color: 'var(--black)', margin: 0 }}>Parameter Guidelines</h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24, fontSize: 14, lineHeight: 1.5, color: 'var(--gray-mid)' }}>
            <div>
              <strong style={{ color: 'var(--black)', display: 'block', marginBottom: 6, fontSize: 15 }}>Low Temperature (0.0 - 0.3)</strong>
              <div>Ideal for code architecture and logical decisions. Forces the model to select highest probability outputs, guaranteeing consistency.</div>
            </div>
            <div>
              <strong style={{ color: 'var(--black)', display: 'block', marginBottom: 6, fontSize: 15 }}>System Directives</strong>
              <div>These form the core instructions of your AI agent. Altering this controls the persona, tone, and strictness of memory compliance checks.</div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
