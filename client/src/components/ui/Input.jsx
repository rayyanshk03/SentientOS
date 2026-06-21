import { useState } from 'react';

/**
 * Input — styled text input with label, error state, and icon support
 *
 * @param {string}   value        controlled value
 * @param {Function} onChange     change handler
 * @param {string}   placeholder
 * @param {string}   label        floating label above input
 * @param {string}   error        error message (turns border red)
 * @param {ReactNode} icon        element rendered on the left inside the input
 * @param {string}   type         input type ('text' | 'password' | 'email' etc.)
 * @param {boolean}  disabled
 * @param {string}   id           for label htmlFor
 */
export default function Input({
  value,
  onChange,
  placeholder = '',
  label       = '',
  error       = '',
  icon        = null,
  type        = 'text',
  disabled    = false,
  id,
  style       = {},
  ...rest
}) {
  const [focused, setFocused] = useState(false);

  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  const hasError  = Boolean(error);
  const borderColor = hasError
    ? '#FF3B30'
    : focused
      ? 'var(--blue)'
      : 'var(--border)';

  const boxShadow = hasError
    ? (focused ? '0 0 0 3px rgba(255,59,48,0.15)' : 'none')
    : focused
      ? '0 0 0 3px rgba(0,113,227,0.15)'
      : 'none';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5, width: '100%', ...style }}>
      {/* Label */}
      {label && (
        <label
          htmlFor={inputId}
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: hasError ? '#FF3B30' : focused ? 'var(--blue)' : 'var(--gray-mid)',
            transition: 'color 0.15s ease',
            fontFamily: 'var(--font)',
            userSelect: 'none',
          }}
        >
          {label}
        </label>
      )}

      {/* Input wrapper (handles icon positioning) */}
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        {/* Left icon */}
        {icon && (
          <span
            aria-hidden="true"
            style={{
              position: 'absolute',
              left: 12,
              top: '50%',
              transform: 'translateY(-50%)',
              display: 'flex',
              alignItems: 'center',
              color: hasError ? '#FF3B30' : focused ? 'var(--blue)' : 'var(--gray-mid)',
              pointerEvents: 'none',
              transition: 'color 0.15s ease',
              zIndex: 1,
            }}
          >
            {icon}
          </span>
        )}

        <input
          id={inputId}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            width: '100%',
            padding: icon ? '10px 14px 10px 38px' : '10px 14px',
            fontSize: 15,
            fontFamily: 'var(--font)',
            color: disabled ? 'var(--gray-mid)' : 'var(--black)',
            background: disabled ? 'var(--gray-light)' : 'var(--white)',
            border: `1.5px solid ${borderColor}`,
            borderRadius: 'var(--radius-input)',
            outline: 'none',
            boxShadow,
            transition: 'border-color 0.18s ease, box-shadow 0.18s ease',
            cursor: disabled ? 'not-allowed' : 'text',
            lineHeight: 1.5,
          }}
          {...rest}
        />
      </div>

      {/* Error message */}
      {hasError && (
        <span
          role="alert"
          style={{
            fontSize: 12,
            color: '#FF3B30',
            fontWeight: 500,
            fontFamily: 'var(--font)',
            display: 'flex',
            alignItems: 'center',
            gap: 4,
          }}
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
            <circle cx="6" cy="6" r="5.5" stroke="#FF3B30" strokeWidth="1.2" />
            <path d="M6 3.5v3M6 8.5h.01" stroke="#FF3B30" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
          {error}
        </span>
      )}
    </div>
  );
}
