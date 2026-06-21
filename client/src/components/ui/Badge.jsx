/**
 * Badge — small rounded pill label
 *
 * @param {ReactNode} children
 * @param {'blue'|'green'|'yellow'|'red'|'gray'} color  default 'blue'
 * @param {'sm'|'md'}  size    default 'sm'
 */
export default function Badge({
  children,
  color = 'blue',
  size  = 'sm',
  style = {},
  ...rest
}) {
  const COLOR_MAP = {
    blue:   { bg: 'var(--blue-light)', text: '#0055B3', border: 'rgba(0,113,227,0.2)' },
    green:  { bg: '#E9F9EE', text: '#1A7F3C', border: 'rgba(52,199,89,0.25)' },
    yellow: { bg: '#FFF8E6', text: '#8A6200', border: 'rgba(255,204,0,0.35)' },
    red:    { bg: '#FFEEEC', text: '#C0281C', border: 'rgba(255,59,48,0.2)'  },
    gray:   { bg: 'var(--gray-light)', text: 'var(--gray-dark)', border: 'rgba(0,0,0,0.1)'     },
  };

  const SIZE_MAP = {
    sm: { padding: '2px 8px',  fontSize: '11px', fontWeight: 600, letterSpacing: '0.02em' },
    md: { padding: '4px 12px', fontSize: '13px', fontWeight: 600, letterSpacing: '0.01em' },
  };

  const c = COLOR_MAP[color] ?? COLOR_MAP.blue;
  const s = SIZE_MAP[size]   ?? SIZE_MAP.sm;

  return (
    <span
      style={{
        display:      'inline-flex',
        alignItems:   'center',
        borderRadius: 'var(--radius-pill)',
        border:       `1px solid ${c.border}`,
        background:   c.bg,
        color:        c.text,
        fontFamily:   'var(--font)',
        lineHeight:   1,
        userSelect:   'none',
        whiteSpace:   'nowrap',
        ...s,
        ...style,
      }}
      {...rest}
    >
      {children}
    </span>
  );
}
