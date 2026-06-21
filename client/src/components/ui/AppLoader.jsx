/* ─────────────────────────────────────────────────────────────────────────────
   AppLoader.jsx — Full-screen loader shown during initial app boot
   ───────────────────────────────────────────────────────────────────────────── */
export default function AppLoader({ message = 'Loading your memories…' }) {
  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'var(--white)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 20,
      zIndex: 99999,
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    }}>
      {/* Animated brain icon */}
      <div
        className="brain-pulse"
        style={{
          width: 56,
          height: 56,
          borderRadius: 16,
          background: 'linear-gradient(135deg, #0071E3, #00A3FF)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 8px 32px rgba(0,113,227,0.30)',
        }}
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z" />
          <path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z" />
          <path d="M12 5v14" />
          <path d="M12 12h5" />
          <path d="M12 12H7" />
        </svg>
      </div>

      {/* Loading label */}
      <p style={{
        fontSize: 14,
        fontWeight: 400,
        color: '#6E6E73',
        margin: 0,
        letterSpacing: '-0.1px',
      }}>
        {message}
      </p>

      {/* Progress bar */}
      <div style={{
        width: 200,
        height: 3,
        background: '#E5E5EA',
        borderRadius: 999,
        overflow: 'hidden',
      }}>
        <div
          className="loader-progress-bar"
          style={{
            height: '100%',
            background: 'linear-gradient(90deg, #0071E3, #00A3FF)',
            borderRadius: 999,
            width: 0,
          }}
        />
      </div>
    </div>
  );
}
