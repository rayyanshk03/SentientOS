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
    { name: 'Website Redesign', color: 'var(--blue)' },
    { name: 'Mobile App', color: '#FF9500' },
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
      }}
    >
      {/* LEFT SECTION */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {/* Mobile menu toggle button */}
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="mobile-menu-btn"
            style={{
              display: 'none', // Handled via media query in CSS
              width: 32,
              height: 32,
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid var(--border)',
              background: 'var(--gray-light)',
              borderRadius: 'var(--radius-input)',
              cursor: 'pointer',
              marginRight: 8,
            }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M2 4h12M2 8h12M2 12h12" stroke="var(--black)" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        )}

        {/* Logo group */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: 28,
              height: 28,
              background: 'linear-gradient(135deg, #0071E3, #00A3FF)',
              borderRadius: '8px',
              padding: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
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
          <span style={{ fontWeight: 600, fontSize: '16px', color: '#1D1D1F' }}>
            Eternal Architect
          </span>
          <span
            style={{
              background: '#F5F5F7',
              border: '1px solid #E5E5EA',
              borderRadius: '980px',
              padding: '2px 8px',
              fontWeight: 500,
              fontSize: '11px',
              color: '#6E6E73',
            }}
          >
            v1.0
          </span>
        </div>
      </div>

      {/* CENTER SECTION (Absolute center) */}
      <div
        style={{
          position: 'absolute',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10,
        }}
      >
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '6px 14px 6px 12px',
              border: '1px solid #E5E5EA',
              borderRadius: '980px',
              background: dropdownOpen ? '#EBEBEB' : '#F5F5F7',
              cursor: 'pointer',
              fontFamily: 'inherit',
              fontWeight: 500,
              fontSize: '13px',
              color: '#1D1D1F',
              transition: 'background 0.15s ease',
              outline: 'none',
            }}
            onMouseEnter={e => { if (!dropdownOpen) e.currentTarget.style.background = '#EBEBEB'; }}
            onMouseLeave={e => { if (!dropdownOpen) e.currentTarget.style.background = '#F5F5F7'; }}
          >
            <span>{activeProject}</span>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ transform: dropdownOpen ? 'rotate(180deg)' : 'none', transition: 'var(--transition)' }}>
              <path d="M3 4.5l3 3 3-3" stroke="#6E6E73" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          {/* Dropdown menu */}
          {dropdownOpen && (
            <div
              style={{
                position: 'absolute',
                top: '100%',
                left: '50%',
                transform: 'translateX(-50%)',
                marginTop: 8,
                minWidth: 220,
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: '1px solid rgba(0, 0, 0, 0.08)',
                borderRadius: '14px',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
                padding: '6px',
                zIndex: 101,
              }}
            >
              {projects.map(proj => {
                const isActive = proj.name === activeProject;
                return (
                  <button
                    key={proj.name}
                    onClick={() => setDropdownOpen(false)}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: '10px 12px',
                      border: 'none',
                      background: 'transparent',
                      borderRadius: '10px',
                      cursor: 'pointer',
                      textAlign: 'left',
                      fontFamily: 'inherit',
                      fontSize: '14px',
                      fontWeight: isActive ? 600 : 400,
                      color: isActive ? '#0071E3' : '#1D1D1F',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = '#F5F5F7'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    {isActive ? (
                      <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#0071E3' }} />
                    ) : (
                      <div style={{ width: 6, height: 6, borderRadius: '50%', background: proj.color }} />
                    )}
                    <span>{proj.name}</span>
                  </button>
                );
              })}
              <div style={{ height: 1, background: '#E5E5EA', margin: '6px 0' }} />
              <button
                onClick={() => setDropdownOpen(false)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '10px 12px',
                  border: 'none',
                  background: 'transparent',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  fontFamily: 'inherit',
                  color: '#0071E3',
                  fontSize: '14px',
                  fontWeight: 500,
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#F5F5F7'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                + New Project
              </button>
            </div>
          )}
        </div>
      </div>

      {/* RIGHT SECTION */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', zIndex: 10 }}>
        
        {/* Sleek Action Buttons Group */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginRight: '4px' }}>
          {/* Demo Button */}
          <Button
            variant={isDemoRunning ? 'danger' : 'secondary'}
            size="sm"
            onClick={onDemoClick}
            style={{
              padding: '6px 12px',
              fontSize: '12px',
              borderRadius: '980px',
              height: 28,
            }}
            icon={
              isDemoRunning ? (
                <svg width="8" height="8" viewBox="0 0 10 10" fill="none" style={{ marginRight: 2 }}>
                  <rect x="1" y="1" width="3" height="8" rx="1" fill="currentColor" />
                  <rect x="6" y="1" width="3" height="8" rx="1" fill="currentColor" />
                </svg>
              ) : (
                <svg width="8" height="8" viewBox="0 0 10 10" fill="none" style={{ marginRight: 2 }}>
                  <path d="M2 1l7 4-7 4V1z" fill="currentColor" />
                </svg>
              )
            }
          >
            {isDemoRunning ? `Demo (${demoStep}/5)` : 'Demo'}
          </Button>

          {/* Standup Button */}
          <button
            onClick={onOpenStandup}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              padding: '4px 10px',
              fontSize: '12px',
              fontWeight: 500,
              background: 'transparent',
              border: '1px solid var(--border)',
              borderRadius: '980px',
              color: 'var(--gray-dark)',
              cursor: 'pointer',
              height: 28,
              fontFamily: 'inherit',
              transition: 'var(--transition)',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--gray-light)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
          >
            <span>📋</span> Standup
          </button>

          {/* Keyboard Shortcuts Button */}
          <button
            onClick={onOpenShortcuts}
            title="Keyboard shortcuts"
            style={{
              width: 28,
              height: 28,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'transparent',
              border: '1px solid var(--border)',
              borderRadius: '50%',
              color: 'var(--gray-mid)',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'var(--transition)',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--gray-light)'; e.currentTarget.style.color = 'var(--black)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--gray-mid)'; }}
          >
            ?
          </button>

          {/* Theme Toggle Button */}
          <button
            onClick={onToggleTheme}
            title="Toggle light/dark mode"
            style={{
              width: 28,
              height: 28,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'transparent',
              border: '1px solid var(--border)',
              borderRadius: '50%',
              color: 'var(--gray-mid)',
              cursor: 'pointer',
              transition: 'var(--transition)',
              position: 'relative',
              overflow: 'hidden'
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--gray-light)'; e.currentTarget.style.color = 'var(--black)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--gray-mid)'; }}
          >
            {/* Animated SVG for sun/moon */}
            <svg 
              width="14" height="14" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
              style={{
                transform: theme === 'dark' ? 'rotate(-90deg) scale(0.9)' : 'rotate(0deg) scale(1)',
                transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                position: 'absolute',
              }}
            >
              {theme === 'dark' ? (
                // Moon icon
                <path 
                  d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"
                  style={{ opacity: 1, transition: 'opacity 0.3s ease' }}
                />
              ) : (
                // Sun icon
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
        <div style={{ width: 1, height: 20, background: '#E5E5EA' }} />

        {/* Memory Count Pill */}
        <div
          style={{
            background: '#E8F1FB',
            color: '#0071E3',
            borderRadius: '980px',
            padding: '4px 10px',
            fontWeight: 600,
            fontSize: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: 4,
          }}
        >
          <span>🧠</span> {totalMemories}
        </div>

        {/* Separator */}
        <div style={{ width: 1, height: 20, background: '#E5E5EA' }} />

        {/* User Greeting */}
        <span style={{ fontWeight: 500, fontSize: '13px', color: 'var(--black)', whiteSpace: 'nowrap' }}>
          {identity?.name ? `Hey, ${identity.name.split(' ')[0]} 👋` : 'Welcome 👋'}
        </span>

        {/* User Avatar */}
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #0071E3, #00A3FF)',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'transform 0.15s ease',
            boxShadow: '0 2px 8px rgba(0,113,227,0.3)',
          }}
          onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
        >
          {identity?.name 
            ? identity.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
            : 'U'}
        </div>
      </div>
    </header>
  );
}
