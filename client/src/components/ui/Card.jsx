import { useState } from 'react';

/**
 * Card — white surface container with optional hover + click behaviour
 *
 * @param {ReactNode} children
 * @param {string}    padding   CSS padding value (default '20px')
 * @param {string}    shadow    'none' | 'sm' | 'md' | 'lg'
 * @param {boolean}   hover     adds hover shadow lift + pointer cursor
 * @param {Function}  onClick   makes card interactive (adds active scale)
 * @param {string}    radius    'sm' | 'md' | 'lg' (default 'lg')
 */
export default function Card({
  children,
  padding = '20px',
  shadow  = 'sm',
  hover   = false,
  onClick,
  radius  = 'lg',
  style   = {},
  ...rest
}) {
  const [hovered, setHovered] = useState(false);
  const [pressed, setPressed] = useState(false);

  const isClickable = Boolean(onClick) || hover;

  const shadowMap = {
    none: 'none',
    sm:   'var(--shadow-sm)',
    md:   'var(--shadow-md)',
    lg:   'var(--shadow-lg)',
  };

  const radiusMap = {
    sm: 'var(--radius-card)',
    md: 'var(--radius-card)',
    lg: 'var(--radius-card)',
  };

  const boxShadow = hovered && isClickable
    ? 'var(--shadow-md)'
    : shadowMap[shadow] ?? 'var(--shadow-sm)';

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setPressed(false); }}
      onMouseDown={() => { if (onClick) setPressed(true); }}
      onMouseUp={() => setPressed(false)}
      style={{
        background:   'var(--white)',
        border:       '1px solid var(--border)',
        borderRadius: radiusMap[radius] ?? radiusMap.lg,
        padding,
        boxShadow,
        cursor:    onClick ? 'pointer' : 'default',
        transform: pressed && onClick ? 'scale(0.995)' : 'scale(1)',
        transition: 'box-shadow 0.2s ease, transform 0.12s ease, border-color 0.2s ease',
        borderColor: hovered && isClickable ? 'rgba(0,113,227,0.25)' : 'var(--border)',
        ...style,
      }}
      {...rest}
    >
      {children}
    </div>
  );
}
