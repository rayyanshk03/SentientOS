import { useState } from 'react';
import { NavLink } from 'react-router-dom';

/* ─── SVG Icons ──────────────────────────────────────────────────────────── */
const BrainIcon = ({ size = 16, ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z" />
    <path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z" />
    <path d="M12 5v14" />
    <path d="M12 12h5" />
    <path d="M12 12H7" />
  </svg>
);

const PipelineIcon = ({ size = 18, ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect x="3" y="3" width="7" height="7" rx="1" />
    <rect x="14" y="3" width="7" height="7" rx="1" />
    <rect x="14" y="14" width="7" height="7" rx="1" />
    <rect x="3" y="14" width="7" height="7" rx="1" />
  </svg>
);

const ChatIcon = ({ size = 18, ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

const DocumentsIcon = ({ size = 18, ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
  </svg>
);

const UserManagementIcon = ({ size = 18, ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const MetricsIcon = ({ size = 18, ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <line x1="18" y1="20" x2="18" y2="10" />
    <line x1="12" y1="20" x2="12" y2="4" />
    <line x1="6" y1="20" x2="6" y2="14" />
  </svg>
);

const HistoryIcon = ({ size = 18, ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M12 8v4l3 3" />
    <path d="M3.05 11a9 9 0 1 1 .5 4m-.5 5v-5h5" />
  </svg>
);

const LLMSettingsIcon = ({ size = 18, ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect x="4" y="4" width="16" height="16" rx="2" />
    <rect x="9" y="9" width="6" height="6" />
    <path d="M9 1v3" />
    <path d="M15 1v3" />
    <path d="M9 20v3" />
    <path d="M15 20v3" />
    <path d="M20 9h3" />
    <path d="M20 15h3" />
    <path d="M1 9h3" />
    <path d="M1 15h3" />
  </svg>
);

const ConfigurationIcon = ({ size = 18, ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);

const DemoIcon = ({ size = 18, ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <polygon points="5 3 19 12 5 21 5 3" />
  </svg>
);

const ArchitectureIcon = ({ size = 18, ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <polygon points="12 2 2 7 12 12 22 7 12 2" />
    <polyline points="2 17 12 22 22 17" />
    <polyline points="2 12 12 17 22 12" />
  </svg>
);

const BugIcon = ({ size = 18, ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M12 22v-5M12 7V2" />
    <path d="m20 18-3-3M4 6l3 3M20 6l-3 3M4 18l3-3" />
    <rect x="7" y="7" width="10" height="10" rx="2" />
  </svg>
);

const KnowledgeIcon = ({ size = 18, ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
  </svg>
);

const StandupIcon = ({ size = 18, ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M17 8h1a4 4 0 1 1 0 8h-1" />
    <path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z" />
    <line x1="6" y1="2" x2="6" y2="4" />
    <line x1="10" y1="2" x2="10" y2="4" />
    <line x1="14" y1="2" x2="14" y2="4" />
  </svg>
);

export default function Sidebar({
  open,
  className = '',
  // Accepted unused props to prevent compile errors
  memories = [],
  sessions = [],
  projects = [],
  activeProject = 'SentientOS',
  stats = {},
  isLoading,
  onRefresh,
  onSaveDecisionClick,
  onSearch,
  onMemorySaved,
  onSessionSelect,
  onProjectSwitch,
  onSettingsChange
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [hoveredTabId, setHoveredTabId] = useState(null);
  // Track which sections are open (all open by default)
  const [openSections, setOpenSections] = useState(() => new Set(['Orchestration', 'Memory Vault', 'Insights & Control']));

  const toggleSection = (title) => {
    setOpenSections(prev => {
      const next = new Set(prev);
      if (next.has(title)) next.delete(title);
      else next.add(title);
      return next;
    });
  };

  const sections = [
    {
      title: 'Orchestration',
      items: [
        { id: 'chat', label: 'Assistant Chat', path: '/app', icon: <ChatIcon />, end: true },
        { id: 'pipeline', label: 'Ingestion Pipeline', path: '/app/pipeline', icon: <PipelineIcon /> },
        { id: 'demo', label: 'DEMO PAGE', path: '/app/demo', icon: <DemoIcon /> },
      ]
    },
    {
      title: 'Memory Vault',
      items: [
        { id: 'vault', label: 'Memory Directory', path: '/app/vault', icon: <BrainIcon size={18} /> },
        { id: 'adr', label: 'Architecture Records', path: '/app/adr', icon: <ArchitectureIcon /> },
        { id: 'bugs', label: 'Bug Fixes', path: '/app/bugs', icon: <BugIcon /> },
        { id: 'knowledge', label: 'Engineering Knowledge', path: '/app/knowledge', icon: <KnowledgeIcon /> },
        { id: 'documents', label: 'Documents Library', path: '/app/documents', icon: <DocumentsIcon /> },
      ]
    },
    {
      title: 'Insights & Control',
      items: [
        { id: 'metrics', label: 'System Metrics', path: '/app/metrics', icon: <MetricsIcon /> },
        { id: 'history', label: 'Chat History', path: '/app/history', icon: <HistoryIcon /> },
        { id: 'standup', label: 'Daily Standup', path: '/app/standup', icon: <StandupIcon /> },
        { id: 'llm-settings', label: 'AI Settings', path: '/app/llm-settings', icon: <LLMSettingsIcon /> },
      ]
    }
  ];

  return (
    <aside
      className={`sidebar-panel ${open ? 'open' : ''} ${className}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: isCollapsed ? '56px' : '260px',
        height: '100%',
        background: 'var(--sidebar-bg)',
        borderRight: '2px solid var(--border)',
        transition: 'width 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        overflow: 'hidden',
        userSelect: 'none',
        color: 'var(--gray-mid)',
        fontFamily: "'Space Grotesk', -apple-system, BlinkMacSystemFont, sans-serif"
      }}
    >
      {/* ── HEADER ──────────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 16px 20px 16px', height: 56, flexShrink: 0 }}>
        {!isCollapsed ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 24,
              height: 24,
                            background: '#A3E635',
              border: '2px solid #1D1D1F',
              boxShadow: '2px 2px 0 #1D1D1F',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
            }}>
              <BrainIcon size={14} />
            </div>
            <span style={{ fontWeight: 600, fontSize: 13, color: 'var(--black)', letterSpacing: '-0.2px' }}>
              SentientOS
            </span>
          </div>
        ) : (
          <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
            <div style={{
              width: 24,
              height: 24,
                            background: '#A3E635',
              border: '2px solid #1D1D1F',
              boxShadow: '2px 2px 0 #1D1D1F',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
            }}>
              <BrainIcon size={14} />
            </div>
          </div>
        )}

        {!isCollapsed && (
          <button
            onClick={() => setIsCollapsed(true)}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--gray-mid)',
              padding: 4,
              display: 'flex',
              alignItems: 'center',
              borderRadius: '50%',
              transition: 'all 0.15s ease',
              outline: 'none'
            }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--black)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--gray-mid)'}
          >
            ◀
          </button>
        )}
      </div>

      {isCollapsed && (
        <div style={{ display: 'flex', justifyContent: 'center', paddingBottom: 16 }}>
          <button
            onClick={() => setIsCollapsed(false)}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--gray-mid)',
              padding: 4,
              display: 'flex',
              alignItems: 'center',
              borderRadius: '50%',
              transition: 'all 0.15s ease',
              outline: 'none'
            }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--black)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--gray-mid)'}
          >
            ▶
          </button>
        </div>
      )}

      {/* ── CATEGORIZED NAVIGATION LIST ─────────────────────────────────── */}
      <nav style={{ flex: 1, padding: '0 8px', display: 'flex', flexDirection: 'column', gap: 4, overflowY: 'auto' }}>
        {sections.map((section, secIdx) => {
          const isSectionOpen = openSections.has(section.title);
          return (
            <div key={section.title} style={{ display: 'flex', flexDirection: 'column' }}>
              {!isCollapsed ? (
                /* Clickable section header with animated chevron */
                <button
                  onClick={() => toggleSection(section.title)}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    width: '100%', background: 'transparent', border: 'none',
                    cursor: 'pointer', padding: '10px 8px 4px 8px',
                    fontFamily: 'inherit', outline: 'none',
                  }}
                >
                  <span style={{
                    fontSize: '10px', fontWeight: 700, color: 'var(--gray-mid)',
                    textTransform: 'uppercase', letterSpacing: '0.8px',
                  }}>
                    {section.title}
                  </span>
                  <svg
                    className={`chevron-icon ${isSectionOpen ? 'open' : 'closed'}`}
                    width="12" height="12" viewBox="0 0 12 12" fill="none"
                    stroke="var(--gray-mid)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                  >
                    <path d="M2 4.5l4 4 4-4" />
                  </svg>
                </button>
              ) : secIdx > 0 && (
                <div style={{ height: 1, background: 'var(--border)', margin: '4px 6px 12px 6px' }} />
              )}

              {/* Collapsible items list */}
              <div className={`sidebar-section-content${!isSectionOpen && !isCollapsed ? ' collapsed' : ''}`}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2, paddingTop: 2 }}>
                  {section.items.map(item => (
                    <div
                      key={item.id}
                      style={{ position: 'relative' }}
                      onMouseEnter={() => setHoveredTabId(item.id)}
                      onMouseLeave={() => setHoveredTabId(null)}
                    >
                      <NavLink
                        to={item.path}
                        end={item.end}
                        style={({ isActive }) => ({
                          display: 'flex',
                          alignItems: 'center',
                          gap: isCollapsed ? 0 : 10,
                          justifyContent: isCollapsed ? 'center' : 'flex-start',
                          padding: '8px 12px',
                          height: 38,
                          borderRadius: '8px',
                          color: isActive ? 'var(--black)' : 'var(--gray-mid)',
                          background: isActive ? 'var(--lime)' : 'transparent',
                          border: isActive ? '2px solid var(--border)' : '2px solid transparent',
                          boxShadow: isActive ? '2px 2px 0 var(--border)' : 'none',
                          transform: isActive ? 'translateY(-2px)' : 'translateY(0)',
                          textDecoration: 'none',
                          fontSize: '13.5px',
                          fontWeight: isActive ? 700 : 600,
                          transition: 'all 0.15s ease',
                          cursor: 'pointer'
                        })}
                        className={({ isActive }) => (isActive ? 'active-nav-link' : '')}
                        onMouseEnter={e => {
                          if (!e.currentTarget.classList.contains('active-nav-link')) {
                            e.currentTarget.style.background = 'var(--white)';
                            e.currentTarget.style.color = 'var(--black)';
                            e.currentTarget.style.border = '2px solid var(--border)';
                            e.currentTarget.style.boxShadow = '2px 2px 0 var(--border)';
                            e.currentTarget.style.transform = 'translateY(-2px)';
                          }
                        }}
                        onMouseLeave={e => {
                          if (!e.currentTarget.classList.contains('active-nav-link')) {
                            e.currentTarget.style.background = 'transparent';
                            e.currentTarget.style.color = 'var(--gray-mid)';
                            e.currentTarget.style.border = '2px solid transparent';
                            e.currentTarget.style.boxShadow = 'none';
                            e.currentTarget.style.transform = 'translateY(0)';
                          }
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          {item.icon}
                        </div>
                        {!isCollapsed && <span>{item.label}</span>}
                      </NavLink>

                      {/* Collapsed Tooltip */}
                      {isCollapsed && hoveredTabId === item.id && (
                        <div style={{
                          position: 'absolute',
                          left: '52px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          background: 'var(--black)',
                          color: 'var(--white)',
                          padding: '5px 10px',
                          borderRadius: '6px',
                          fontSize: '11px',
                          fontWeight: 500,
                          whiteSpace: 'nowrap',
                          zIndex: 9999,
                          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                          pointerEvents: 'none',
                          animation: 'stepFadeIn 0.15s ease-out both',
                        }}>
                          {item.label}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </nav>

      {/* ── USER PROFILE CARD ───────────────────────────────────────────── */}
      <div style={{ padding: '12px 8px', borderTop: '2px solid var(--border)', flexShrink: 0 }}>
        {!isCollapsed ? (
          <div style={{
            background: 'var(--gray-light)',
            borderRadius: '10px',
            padding: '10px 12px',
            display: 'flex',
            alignItems: 'center',
            gap: 10
          }}>
            <div style={{
              width: 32,
              height: 32,
                            background: '#A855F7',
              border: '2px solid #1D1D1F',
              boxShadow: '2px 2px 0 #1D1D1F',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              fontWeight: 700,
              fontSize: '12px'
            }}>
              RS
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              <span style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--black)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Rayyan</span>
              <span style={{ fontSize: '10px', color: 'var(--gray-mid)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Builder · IIIT Dharwad</span>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <div style={{
              width: 32,
              height: 32,
                            background: '#A855F7',
              border: '2px solid #1D1D1F',
              boxShadow: '2px 2px 0 #1D1D1F',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              fontWeight: 700,
              fontSize: '12px'
            }}>
              RS
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
