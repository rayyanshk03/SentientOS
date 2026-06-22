import { useState } from 'react';
import Badge from '../ui/Badge';
import Button from '../ui/Button';

export default function Navbar({
  activeProject = 'SentientOS',
  totalMemories = 0,
  activePersona = { emoji: '🏛️', label: 'Eternal Architect' },
  onOpenShortcuts,
  onDemoClick,
  isDemoRunning,
  demoStep,
  onToggleSidebar,
  theme,
  onToggleTheme,
  onOpenStandup,
  identity,
}) {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const projects = [
    { name: 'SentientOS', color: '#34C759' },
  ];

  return (
    <header
      style={{
        height: '100%',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontFamily: 'var(--font)',
        letterSpacing: '-0.3px',
      }}
    >
      {/* LEFT SECTION */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {/* Mobile menu toggle button */}
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="mobile-menu-btn"
            style={{
              display: 'none',
              width: 32,
              height: 32,
              alignItems: 'center',
              justifyContent: 'center',
              border: 'none',
              background: 'rgba(0,0,0,0.05)',
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'var(--transition)'
            }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M2 4h12M2 8h12M2 12h12" stroke="var(--black)" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        )}

        {/* Logo group */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: 30,
              height: 30,
              background: 'linear-gradient(135deg, #0071E3 0%, #0051a8 100%)',
              borderRadius: '8px',
              padding: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              boxShadow: '0 4px 12px rgba(0, 113, 227, 0.25), inset 0 1px 1px rgba(255, 255, 255, 0.4)',
            }}
          >
            <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9.5 2h5M12 2v4M12 22v-4" />
              <path d="M12 6a4.5 4.5 0 0 0-4.5 4.5c0 1.5.8 2.7 2 3.5v2M12 6a4.5 4.5 0 0 1 4.5 4.5c0 1.5-.8 2.7-2 3.5v2" />
              <path d="M9.5 16h5" />
              <path d="M6 9.5H2" />
              <path d="M22 9.5h-4" />
              <path d="M4 14.5h2" />
              <path d="M18 14.5h2" />
              <path d="M6.5 19.5 4 22" />
              <path d="M17.5 19.5 20 22" />
            </svg>
          </div>
          <span style={{ fontWeight: 700, fontSize: '17px', color: '#1d1d1f', letterSpacing: '-0.5px' }}>
            SentientOS
          </span>
          <span
            style={{
              background: 'rgba(0,0,0,0.04)',
              borderRadius: '6px',
              padding: '3px 8px',
              fontWeight: 600,
              fontSize: '11px',
              color: '#86868b',
              letterSpacing: '0.2px'
            }}
          >
            v1.0
          </span>
        </div>
      </div>



      {/* RIGHT SECTION */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', zIndex: 10 }}>
        
        {/* Sleek Action Buttons Group */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(0,0,0,0.03)', padding: '4px', borderRadius: '980px', boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.02)' }}>
          {/* Demo Button */}
          <button
            onClick={onDemoClick}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '6px 14px',
              fontSize: '13px',
              fontWeight: 600,
              background: isDemoRunning ? '#FF3B30' : '#FFFFFF',
              color: isDemoRunning ? '#FFF' : '#1d1d1f',
              border: 'none',
              borderRadius: '980px',
              cursor: 'pointer',
              fontFamily: 'inherit',
              transition: 'all 0.2s ease',
              boxShadow: isDemoRunning ? '0 4px 12px rgba(255, 59, 48, 0.3)' : '0 2px 8px rgba(0,0,0,0.04)',
            }}
          >
            {isDemoRunning ? (
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                <rect x="2" y="2" width="6" height="6" rx="1" fill="currentColor" />
              </svg>
            ) : (
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                <path d="M3 2l5 3-5 3V2z" fill="currentColor" />
              </svg>
            )}
            {isDemoRunning ? `Demo (${demoStep}/5)` : 'Demo'}
          </button>

          {/* Standup Button */}
          <button
            onClick={onOpenStandup}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '6px 12px',
              fontSize: '13px',
              fontWeight: 600,
              background: 'transparent',
              border: 'none',
              borderRadius: '980px',
              color: '#515154',
              cursor: 'pointer',
              fontFamily: 'inherit',
              transition: 'background 0.2s ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,0,0,0.04)'; e.currentTarget.style.color = '#1d1d1f'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#515154'; }}
          >
            <span>📋</span> Standup
          </button>

          {/* Keyboard Shortcuts Button */}
          <button
            onClick={onOpenShortcuts}
            title="Keyboard shortcuts"
            style={{
              width: 32,
              height: 32,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'transparent',
              border: 'none',
              borderRadius: '50%',
              color: '#86868b',
              fontSize: 14,
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,0,0,0.04)'; e.currentTarget.style.color = '#1d1d1f'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#86868b'; }}
          >
            ?
          </button>

          {/* Theme Toggle Button */}
          <button
            onClick={onToggleTheme}
            title="Toggle light/dark mode"
            style={{
              width: 32,
              height: 32,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'transparent',
              border: 'none',
              borderRadius: '50%',
              color: '#86868b',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              position: 'relative',
              overflow: 'hidden'
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,0,0,0.04)'; e.currentTarget.style.color = '#1d1d1f'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#86868b'; }}
          >
            <svg 
              width="16" height="16" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2.2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
              style={{
                transform: theme === 'dark' ? 'rotate(-90deg) scale(0.9)' : 'rotate(0deg) scale(1)',
                transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                position: 'absolute',
              }}
            >
              {theme === 'dark' ? (
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              ) : (
                <>
                  <circle cx="12" cy="12" r="5" />
                  <line x1="12" y1="1" x2="12" y2="3" />
                  <line x1="12" y1="21" x2="12" y2="23" />
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                  <line x1="1" y1="12" x2="3" y2="12" />
                  <line x1="21" y1="12" x2="23" y2="12" />
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                </>
              )}
            </svg>
          </button>
        </div>

        {/* Separator */}
        <div style={{ width: 1, height: 24, background: 'rgba(0,0,0,0.08)' }} />

        {/* Profile Group */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Memory Count Pill */}
          <div
            style={{
              background: 'rgba(0, 113, 227, 0.08)',
              color: '#0071E3',
              borderRadius: '980px',
              padding: '6px 12px',
              fontWeight: 700,
              fontSize: '13px',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.5)',
            }}
          >
            <span style={{ filter: 'drop-shadow(0 2px 4px rgba(0,113,227,0.2))' }}>🧠</span> {totalMemories}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
               onMouseEnter={e => e.currentTarget.lastChild.style.transform = 'scale(1.05)'}
               onMouseLeave={e => e.currentTarget.lastChild.style.transform = 'scale(1)'}>
            {/* User Greeting */}
            <span style={{ fontWeight: 600, fontSize: '14px', color: '#1d1d1f', whiteSpace: 'nowrap' }}>
              {identity?.name ? `Hey, ${identity.name.split(' ')[0]} 👋` : 'Hey, Rayyan 👋'}
            </span>

            {/* User Avatar */}
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #0071E3 0%, #0051a8 100%)',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '14px',
                fontWeight: 700,
                transition: 'transform 0.2s cubic-bezier(0.25, 0.8, 0.25, 1)',
                boxShadow: '0 4px 12px rgba(0, 113, 227, 0.3), inset 0 1px 1px rgba(255, 255, 255, 0.4)',
              }}
            >
              {identity?.name 
                ? identity.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
                : 'R'}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
