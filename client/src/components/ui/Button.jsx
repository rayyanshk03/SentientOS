import { useState } from 'react';

/* ─── Spinner SVG ────────────────────────────────────────────────────────── */
function Spinner({ size = 16 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      style={{ animation: 'btn-spin 0.7s linear infinite', flexShrink: 0 }}
      aria-hidden="true"
    >
      <style>{`@keyframes btn-spin { to { transform: rotate(360deg); } }`}</style>
      <circle cx="8" cy="8" r="6" stroke="currentColor" strokeOpacity="0.25" strokeWidth="2.5" />
      <path d="M8 2a6 6 0 0 1 6 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

/* ─── Variant styles ─────────────────────────────────────────────────────── */
const VARIANTS = {
  primary: {
    background: 'var(--blue)',
    color: 'var(--white)',
    border: 'none',
    '--hover-bg': 'var(--blue-hover)',
  },
  secondary: {
    background: 'var(--white)',
    color: 'var(--blue)',
    border: '1.5px solid var(--blue)',
    '--hover-bg': 'var(--blue-light)',
  },
  ghost: {
    background: 'transparent',
    color: 'var(--gray-mid)',
    border: 'none',
    '--hover-bg': 'var(--gray-light)',
  },
  danger: {
    background: '#FF3B30',
    color: 'var(--white)',
    border: 'none',
    '--hover-bg': '#E0342A',
  },
};

/* ─── Size styles ────────────────────────────────────────────────────────── */
const SIZES = {
  sm: { padding: '6px 12px',  fontSize: '13px', gap: '5px',  iconSize: 13 },
  md: { padding: '9px 16px',  fontSize: '14px', gap: '6px',  iconSize: 15 },
  lg: { padding: '12px 24px', fontSize: '16px', gap: '8px',  iconSize: 17 },
};

/* ─── Button ─────────────────────────────────────────────────────────────── */
/**
 * Button — primary interactive element
 *
 * @param {string}   variant   'primary' | 'secondary' | 'ghost' | 'danger'
 * @param {string}   size      'sm' | 'md' | 'lg'
 * @param {boolean}  loading   shows spinner, disables interaction
 * @param {boolean}  disabled  opacity + not-allowed cursor
 * @param {ReactNode} icon     optional element rendered before children
 * @param {boolean}  fullWidth stretch to container width
 */
export default function Button({
  children,
  variant  = 'primary',
  size     = 'md',
  onClick,
  disabled = false,
  loading  = false,
  icon     = null,
  fullWidth = false,
  type     = 'button',
  style    = {},
  ...rest
}) {
  const [hovered, setHovered]   = useState(false);
  const [pressed, setPressed]   = useState(false);

  const v = VARIANTS[variant] ?? VARIANTS.primary;
  const s = SIZES[size]       ?? SIZES.md;

  const isDisabled = disabled || loading;

  const bgColor = hovered && !isDisabled ? v['--hover-bg'] : v.background;

  const baseStyle = {
    /* layout */
    display:        'inline-flex',
    alignItems:     'center',
    justifyContent: 'center',
    gap:            s.gap,
    width:          fullWidth ? '100%' : 'auto',

    /* appearance */
    background:     bgColor,
    color:          v.color,
    border:         v.border ?? 'none',
    borderRadius:   'var(--radius-button)',
    padding:        s.padding,
    fontSize:       s.fontSize,
    fontWeight:     600,
    fontFamily:     'var(--font)',
    lineHeight:     1,
    whiteSpace:     'nowrap',
    userSelect:     'none',

    /* interaction */
    cursor:     isDisabled ? 'not-allowed' : 'pointer',
    opacity:    isDisabled ? 0.5 : 1,
    transform:  isDisabled
      ? 'none'
      : pressed
        ? 'translateY(0px) scale(0.97)'
        : hovered
          ? 'translateY(-1px)'
          : 'translateY(0px) scale(1)',
    outline:    'none',

    /* transition */
    transition: 'background 0.1s ease, color 0.1s ease, transform 0.12s ease, opacity 0.15s ease, box-shadow 0.2s ease',

    /* shadow — lifts on hover for primary, subtle for secondary */
    boxShadow: isDisabled ? 'none'
      : pressed ? 'none'
      : hovered && variant === 'primary'  ? '0 4px 16px rgba(0,113,227,0.35)'
      : hovered && variant === 'secondary'? '0 2px 8px rgba(0,113,227,0.18)'
      : hovered && variant === 'danger'   ? '0 4px 14px rgba(255,59,48,0.30)'
      : 'none',

    ...style,
  };

  return (
    <button
      type={type}
      onClick={isDisabled ? undefined : onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setPressed(false); }}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      disabled={isDisabled}
      style={baseStyle}
      {...rest}
    >
      {loading ? (
        <Spinner size={parseInt(s.iconSize)} />
      ) : (
        icon && <span style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>{icon}</span>
      )}
      {loading ? 'Loading…' : children}
    </button>
  );
}
