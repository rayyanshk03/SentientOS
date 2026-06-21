import { useEffect, useState, useCallback } from 'react';

/* ─── Type config ─────────────────────────────────────────────────────────── */
const TYPE_CONFIG = {
  success: {
    bg:     '#E9F9EE',
    border: 'rgba(52,199,89,0.35)',
    text:   '#1A7F3C',
    icon:   (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <circle cx="8" cy="8" r="7.5" fill="#34C759" />
        <path d="M4.5 8l2.5 2.5 4.5-5" stroke="var(--white)" strokeWidth="1.6"
          strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  error: {
    bg:     '#FFEEEC',
    border: 'rgba(255,59,48,0.35)',
    text:   '#C0281C',
    icon:   (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <circle cx="8" cy="8" r="7.5" fill="#FF3B30" />
        <path d="M5.5 5.5l5 5M10.5 5.5l-5 5" stroke="var(--white)" strokeWidth="1.6"
          strokeLinecap="round" />
      </svg>
    ),
  },
  warning: {
    bg:     '#FFF8E6',
    border: 'rgba(255,159,10,0.35)',
    text:   '#8A6200',
    icon:   (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <path d="M8 1.5L14.5 13.5H1.5L8 1.5Z" fill="#FF9F0A" stroke="#FF9F0A"
          strokeWidth="1" strokeLinejoin="round" />
        <path d="M8 6v4M8 11.5h.01" stroke="var(--white)" strokeWidth="1.6"
          strokeLinecap="round" />
      </svg>
    ),
  },
  info: {
    bg:     'var(--blue-light)',
    border: 'rgba(0,113,227,0.25)',
    text:   '#0055B3',
    icon:   (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <circle cx="8" cy="8" r="7.5" fill="var(--blue)" />
        <path d="M8 7v5M8 4.5h.01" stroke="var(--white)" strokeWidth="1.6"
          strokeLinecap="round" />
      </svg>
    ),
  },
};

/* ─── Single Toast ────────────────────────────────────────────────────────── */
function ToastItem({ message, type = 'info', onClose, duration = 3000 }) {
  const [visible, setVisible] = useState(false);   // for enter animation
  const [leaving, setLeaving] = useState(false);   // for exit animation

  const cfg = TYPE_CONFIG[type] ?? TYPE_CONFIG.info;

  const dismiss = useCallback(() => {
    setLeaving(true);
    setTimeout(onClose, 260);
  }, [onClose]);

  /* Entrance: delay 1 frame so CSS transition fires */
  useEffect(() => {
    const t = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(t);
  }, []);

  /* Auto-dismiss */
  useEffect(() => {
    const t = setTimeout(dismiss, duration);
    return () => clearTimeout(t);
  }, [dismiss, duration]);

  return (
    <div
      role="alert"
      aria-live="polite"
      style={{
        display:        'flex',
        alignItems:     'flex-start',
        gap:            10,
        padding:        '12px 16px',
        minWidth:       280,
        maxWidth:       380,
        background:     cfg.bg,
        border:         `1px solid ${cfg.border}`,
        borderRadius:   'var(--radius-md)',
        boxShadow:      'var(--shadow-lg)',
        color:          cfg.text,
        fontFamily:     'var(--font)',
        fontSize:       14,
        fontWeight:     500,
        lineHeight:     1.5,

        /* Slide-in / slide-out */
        opacity:        leaving ? 0 : visible ? 1 : 0,
        transform:      leaving
          ? 'translateX(20px) scale(0.96)'
          : visible
            ? 'translateX(0) scale(1)'
            : 'translateX(20px) scale(0.96)',
        transition: 'opacity 0.24s ease, transform 0.24s cubic-bezier(0.34,1.56,0.64,1)',
        pointerEvents: 'auto',
      }}
    >
      {/* Type icon */}
      <span style={{ flexShrink: 0, marginTop: 1 }}>{cfg.icon}</span>

      {/* Message */}
      <span style={{ flex: 1 }}>{message}</span>

      {/* Close button */}
      <button
        onClick={dismiss}
        aria-label="Dismiss notification"
        style={{
          flexShrink:  0,
          background:  'transparent',
          border:      'none',
          cursor:      'pointer',
          padding:     2,
          color:       cfg.text,
          opacity:     0.6,
          lineHeight:  1,
          fontFamily:  'inherit',
          fontSize:    16,
          transition:  'opacity 0.15s ease',
        }}
        onMouseEnter={e => e.currentTarget.style.opacity = 1}
        onMouseLeave={e => e.currentTarget.style.opacity = 0.6}
      >
        ✕
      </button>
    </div>
  );
}

/* ─── Toast Container (fixed position, manages stack) ────────────────────── */
/**
 * Toast — fixed top-right notification with auto-dismiss
 *
 * Typical usage — render once near the app root:
 *   <Toast toasts={toasts} onClose={id => removeToast(id)} />
 *
 * Or render a single toast:
 *   <Toast message="Saved!" type="success" onClose={() => {}} />
 *
 * @param {string}   message   single-toast shorthand
 * @param {string}   type      'success' | 'error' | 'warning' | 'info'
 * @param {Function} onClose   called when toast is dismissed
 * @param {number}   duration  ms before auto-dismiss (default 3000)
 * @param {Array}    toasts    array of { id, message, type } for stacking
 */
export default function Toast({
  message,
  type     = 'info',
  onClose,
  duration = 3000,
  toasts   = [],
}) {
  /* Support both single-toast and multi-toast array modes */
  const items = message
    ? [{ id: 'single', message, type }]
    : toasts;

  if (!items.length) return null;

  return (
    <div
      aria-live="polite"
      aria-atomic="false"
      style={{
        position:       'fixed',
        top:            24,
        right:          24,
        zIndex:         9999,
        display:        'flex',
        flexDirection:  'column',
        gap:            10,
        pointerEvents:  'none',   // container transparent to clicks
      }}
    >
      {items.map((t) => (
        <ToastItem
          key={t.id}
          message={t.message}
          type={t.type ?? type}
          duration={t.duration ?? duration}
          onClose={() => onClose?.(t.id)}
        />
      ))}
    </div>
  );
}
