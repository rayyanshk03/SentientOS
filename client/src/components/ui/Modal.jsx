import { useEffect, useState } from 'react';

/**
 * Modal — centered overlay dialog
 *
 * @param {boolean}   open
 * @param {Function}  onClose
 * @param {string}    title
 * @param {ReactNode} children
 * @param {ReactNode} footer    optional action buttons row
 * @param {string}    size      'sm' | 'md' | 'lg'
 */
export default function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  size = 'md',
}) {
  const [visible, setVisible] = useState(false);
  const [leaving, setLeaving] = useState(false);

  // Handle open/close animation states
  useEffect(() => {
    if (open) {
      setVisible(true);
      setLeaving(false);
    } else if (visible) {
      setLeaving(true);
      const t = setTimeout(() => {
        setVisible(false);
        setLeaving(false);
      }, 200); // match transition duration
      return () => clearTimeout(t);
    }
  }, [open, visible]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && open) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  if (!visible && !open) return null;

  const sizeMap = {
    sm: 400,
    md: 560,
    lg: 800,
  };

  const isAnimatingOut = leaving;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
      }}
    >
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(0,0,0,0.4)',
          backdropFilter: 'blur(4px)',
          WebkitBackdropFilter: 'blur(4px)',
          opacity: isAnimatingOut ? 0 : 1,
          transition: 'opacity 0.2s ease',
        }}
      />

      {/* Dialog container */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'modal-title' : undefined}
        style={{
          position: 'relative',
          background: 'var(--white)',
          borderRadius: 'var(--radius-modal)',
          boxShadow: 'var(--shadow-lg)',
          width: '100%',
          maxWidth: sizeMap[size] ?? sizeMap.md,
          maxHeight: 'calc(100vh - 40px)',
          display: 'flex',
          flexDirection: 'column',
          opacity: isAnimatingOut ? 0 : 1,
          transform: isAnimatingOut ? 'scale(0.96) translateY(10px)' : 'scale(1) translateY(0)',
          transition: 'opacity 0.2s ease, transform 0.2s cubic-bezier(0.34,1.56,0.64,1)',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        {title && (
          <div
            style={{
              padding: '16px 24px',
              borderBottom: '1px solid var(--border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexShrink: 0,
            }}
          >
            <h2 id="modal-title" style={{ margin: 0, fontSize: 18, fontWeight: 700, color: 'var(--black)' }}>
              {title}
            </h2>
            <button
              onClick={onClose}
              aria-label="Close dialog"
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--gray-mid)',
                padding: 4,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 'var(--radius-sm)',
                transition: 'background 0.15s ease, color 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--gray-light)';
                e.currentTarget.style.color = 'var(--black)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = 'var(--gray-mid)';
              }}
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M5 5L15 15M15 5L5 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        )}

        {/* Content */}
        <div
          style={{
            padding: 24,
            overflowY: 'auto',
            fontFamily: 'var(--font)',
            color: 'var(--black)',
            lineHeight: 1.5,
          }}
        >
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div
            style={{
              padding: '16px 24px',
              borderTop: '1px solid var(--border)',
              background: 'var(--gray-light)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: 12,
              flexShrink: 0,
            }}
          >
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
