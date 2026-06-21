import { useState, useEffect } from 'react';
import Button from '../components/ui/Button';
import { FormSkeleton } from '../components/ui/Skeleton';

export default function LLMSettingsPage() {
  const [model, setModel] = useState('Gemini 1.5 Pro');
  const [temp, setTemp] = useState(0.2);
  const [systemPrompt, setSystemPrompt] = useState(
    'You are Eternal Architect, a premium AI system orchestrator designed for SentientOS. You have access to Parcle memory database. Always read from past decisions before making new claims. Avoid contradictions at all costs.'
  );
  const [showSavedToast, setShowSavedToast] = useState(false);
  const [loading, setLoading] = useState(true);

  const handleSave = () => {
    setShowSavedToast(true);
    setTimeout(() => setShowSavedToast(false), 2000);
  };

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--black)', margin: '0 0 4px 0' }}>LLM Settings</h1>
            <p style={{ fontSize: 13, color: 'var(--gray-mid)', margin: 0 }}>Configure the active AI inference engine, temperature values, and core instructions</p>
          </div>
          <Button variant="primary" size="sm" disabled>
            💾 Save Settings
          </Button>
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--black)', margin: '0 0 4px 0' }}>LLM Settings</h1>
          <p style={{ fontSize: 13, color: 'var(--gray-mid)', margin: 0 }}>Configure the active AI inference engine, temperature values, and core instructions</p>
        </div>
        <Button variant="primary" size="sm" onClick={handleSave}>
          💾 Save Settings
        </Button>
      </div>

      {showSavedToast && (
        <div style={{
          background: 'var(--black)', color: 'var(--white)', padding: '10px 16px', borderRadius: 8,
          position: 'fixed', bottom: 24, right: 24, zIndex: 1000, boxShadow: 'var(--shadow-md)',
          fontSize: 13, fontWeight: 600, animation: 'fadeIn 0.2s ease'
        }}>
          ✓ LLM configuration saved successfully
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24, alignItems: 'start' }}>
        
        {/* Left Side: Parameters Form */}
        <div style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 12, padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
          
          {/* Model selection */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--black)' }}>AI Foundation Model</label>
            <select
              value={model}
              onChange={e => setModel(e.target.value)}
              style={{
                height: 38, border: '1px solid var(--border)', borderRadius: 8,
                fontSize: 13.5, padding: '0 10px', outline: 'none', background: 'var(--white)', color: 'var(--black)'
              }}
            >
              <option value="Gemini 1.5 Pro">Gemini 1.5 Pro (Recommended)</option>
              <option value="Gemini 1.5 Flash">Gemini 1.5 Flash (Fast)</option>
              <option value="Claude 3.5 Sonnet">Claude 3.5 Sonnet</option>
              <option value="GPT-4o">GPT-4o</option>
            </select>
          </div>

          {/* Temperature Slider */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--black)' }}>Temperature (Creativity)</label>
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--blue)' }}>{temp}</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={temp}
              onChange={e => setTemp(parseFloat(e.target.value))}
              style={{ width: '100%', height: 4, background: 'var(--border)', borderRadius: 2, cursor: 'pointer', outline: 'none' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--gray-mid)' }}>
              <span>Precise / Analytical (0.0)</span>
              <span>Creative / Free (1.0)</span>
            </div>
          </div>

          {/* System prompt instructions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--black)' }}>Agent System Prompt Directive</label>
            <textarea
              value={systemPrompt}
              onChange={e => setSystemPrompt(e.target.value)}
              rows={5}
              style={{
                padding: '10px 12px', border: '1px solid var(--border)', borderRadius: 8,
                fontSize: 13.5, outline: 'none', background: 'var(--white)', color: 'var(--black)',
                resize: 'vertical', lineHeight: 1.5, fontFamily: 'inherit'
              }}
            />
          </div>
        </div>

        {/* Right Side: Parameters explanation info */}
        <div style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 12, padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <h2 style={{ fontSize: 15, fontWeight: 600, color: 'var(--black)', margin: 0 }}>Parameter Guidelines</h2>
          <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: 0 }} />
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: 12.5, lineHeight: 1.5, color: 'var(--gray-mid)' }}>
            <div>
              <strong style={{ color: 'var(--black)' }}>Lower Temperature (e.g. 0.0 - 0.3)</strong>
              <div>Ideal for code architecture and logical decisions. Forces the model to select highest probability outputs, guaranteeing consistency.</div>
            </div>
            <div>
              <strong style={{ color: 'var(--black)' }}>System Prompt Instructions</strong>
              <div>These form the core guidelines of your AI agent. Altering this controls the persona, tone, and strictness of memory compliance checks.</div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
