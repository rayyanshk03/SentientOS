import { useState, useEffect } from 'react';
import Button from './Button';

const CATEGORY_META = {
  'Architecture Decision':  { icon: '🏗️', color: '#0071E3' },
  'Bug Fix':                { icon: '🐛', color: '#FF3B30' },
  'Coding Standard':        { icon: '📐', color: '#AF52DE' },
  'Deployment History':     { icon: '🚀', color: '#FF9500' },
  'Feature Request':        { icon: '✨', color: '#34C759' },
  'Team Discussion':        { icon: '💬', color: '#5AC8FA' },
  'Documentation Update':   { icon: '📄', color: '#8E8E93' },
  'General':                { icon: '🧠', color: '#6E6E73' },
};

const CATEGORY_OPTIONS = Object.keys(CATEGORY_META);

/**
 * MemoryPreviewModal
 * Props:
 *  - extraction: { should_save, confidence, category, title, content, reason, categoryIcon, categoryColor, timestamp }
 *  - onSave(edited): user confirmed — save this memory
 *  - onSkip(): user dismissed
 *  - isSaving: bool
 */
export default function MemoryPreviewModal({ extraction, onSave, onSkip, isSaving }) {
  const [editTitle,    setEditTitle]    = useState(extraction?.title || '');
  const [editContent,  setEditContent]  = useState(extraction?.content || '');
  const [editCategory, setEditCategory] = useState(extraction?.category || 'General');
  const [visible,      setVisible]      = useState(false);

  // Animate in
  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
  }, []);

  const catMeta  = CATEGORY_META[editCategory] || CATEGORY_META['General'];
  const origMeta = CATEGORY_META[extraction?.category] || CATEGORY_META['General'];
  const confidence = Math.round((extraction?.confidence || 0) * 100);

  const handleSave = () => {
    onSave({ title: editTitle, content: editContent, category: editCategory });
  };

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 10000,
        background: `rgba(0,0,0,${visible ? 0.5 : 0})`,
        backdropFilter: `blur(${visible ? 6 : 0}px)`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'all 0.22s ease',
        padding: 24,
      }}
      onClick={e => { if (e.target === e.currentTarget) onSkip(); }}
    >
      <div
        style={{
          background: 'var(--white)', borderRadius: 20,
          width: '100%', maxWidth: 520,
          boxShadow: '0 32px 80px rgba(0,0,0,0.25)',
          transform: `translateY(${visible ? 0 : 24}px)`,
          opacity: visible ? 1 : 0,
          transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
          overflow: 'hidden',
        }}
      >
        {/* Header strip — color coded by category */}
        <div style={{
          background: `linear-gradient(135deg, ${catMeta.color}22 0%, transparent 60%)`,
          borderBottom: `3px solid ${catMeta.color}`,
          padding: '20px 24px 16px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 24 }}>{catMeta.icon}</span>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: catMeta.color, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Memory Preview
                </div>
                <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--black)', lineHeight: 1.3 }}>
                  Intelligent Extraction
                </div>
              </div>
            </div>
            <button
              onClick={onSkip}
              style={{
                background: 'var(--gray-light)', border: 'none', borderRadius: 8,
                color: 'var(--gray-mid)', fontSize: 16, cursor: 'pointer',
                width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'background 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--border)'}
              onMouseLeave={e => e.currentTarget.style.background = 'var(--gray-light)'}
            >✕</button>
          </div>

          {/* Confidence + reason row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 4,
              background: confidence >= 80 ? '#E8F5E9' : confidence >= 60 ? '#FFF8E1' : '#FFEBEE',
              color:      confidence >= 80 ? '#2E7D32' : confidence >= 60 ? '#F57F17' : '#C62828',
              borderRadius: 'var(--radius-pill)',
              padding: '2px 10px', fontSize: 11, fontWeight: 700,
            }}>
              {confidence >= 80 ? '🟢' : confidence >= 60 ? '🟡' : '🔴'} {confidence}% confidence
            </div>
            <span style={{ fontSize: 11.5, color: 'var(--gray-mid)', lineHeight: 1.4 }}>
              {extraction?.reason || ''}
            </span>
          </div>
        </div>

        {/* Body — editable fields */}
        <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Category selector */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--gray-mid)', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
              Category
            </label>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {CATEGORY_OPTIONS.map(cat => {
                const m = CATEGORY_META[cat];
                const isActive = editCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setEditCategory(cat)}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: 4,
                      padding: '4px 10px', borderRadius: 'var(--radius-pill)',
                      border: `1.5px solid ${isActive ? m.color : 'var(--border)'}`,
                      background: isActive ? `${m.color}18` : 'var(--white)',
                      color: isActive ? m.color : 'var(--gray-mid)',
                      fontSize: 11.5, fontWeight: isActive ? 700 : 500,
                      cursor: 'pointer', transition: 'all 0.12s ease',
                    }}
                  >
                    {m.icon} {cat}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Title */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--gray-mid)', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
              Title
            </label>
            <input
              value={editTitle}
              onChange={e => setEditTitle(e.target.value)}
              placeholder="Memory title..."
              style={{
                fontSize: 14.5, fontWeight: 600, padding: '9px 12px',
                border: '1.5px solid var(--border)', borderRadius: 10,
                color: 'var(--black)', background: 'var(--gray-light)',
                outline: 'none', width: '100%',
                transition: 'border-color 0.15s',
              }}
              onFocus={e => e.target.style.borderColor = catMeta.color}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
            />
          </div>

          {/* Content */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--gray-mid)', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
              Content to Save
            </label>
            <textarea
              value={editContent}
              onChange={e => setEditContent(e.target.value)}
              rows={5}
              style={{
                fontSize: 13.5, padding: '10px 12px',
                border: '1.5px solid var(--border)', borderRadius: 10,
                color: 'var(--black)', background: 'var(--gray-light)',
                outline: 'none', width: '100%', resize: 'vertical',
                fontFamily: 'inherit', lineHeight: 1.6,
                transition: 'border-color 0.15s',
              }}
              onFocus={e => e.target.style.borderColor = catMeta.color}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
            />
          </div>

          {/* Timestamp preview */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '8px 12px', borderRadius: 8,
            background: 'var(--gray-light)', fontSize: 11.5, color: 'var(--gray-mid)',
          }}>
            <span>🕐</span>
            <span>Will be saved at {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })} · {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
            <span style={{ marginLeft: 'auto' }}>Source: agent</span>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          display: 'flex', gap: 10, justifyContent: 'flex-end',
          padding: '14px 24px', borderTop: '1px solid var(--border)',
          background: 'var(--gray-light)',
        }}>
          <Button variant="ghost" onClick={onSkip} disabled={isSaving}>
            Skip
          </Button>
          <Button
            variant="primary"
            onClick={handleSave}
            disabled={isSaving || !editTitle.trim() || !editContent.trim()}
            loading={isSaving}
            style={{ background: catMeta.color, borderColor: catMeta.color }}
          >
            💾 Save Memory
          </Button>
        </div>
      </div>
    </div>
  );
}
