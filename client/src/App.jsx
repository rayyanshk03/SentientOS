import { useEffect, useRef, useState, useCallback } from 'react';

const PERSONAS = [
  { id: 'architect', label: 'Eternal Architect', emoji: '🏛️', subtitle: 'AI-powered system orchestrator' },
  { id: 'debugger', label: 'Zero-Sync Debugger', emoji: '🐛', subtitle: 'Finds and fixes complex bugs' },
  { id: 'docs', label: 'Docs Writer', emoji: '📝', subtitle: 'Writes documentation & READMEs' },
  { id: 'ui', label: 'UI Enforcer', emoji: '🎨', subtitle: 'Focuses on design consistency' }
];

/* ─── tiny helpers ─────────────────────────────────────────────────────────── */

function formatDate(raw) {
  if (!raw) return '';
  const d = new Date(raw);
  if (isNaN(d)) return '';
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function extractTitle(memory) {
  if (memory.title) return memory.title;
  if (memory.tag?.title) return memory.tag.title;
  if (memory.tag?.type) return memory.tag.type.charAt(0).toUpperCase() + memory.tag.type.slice(1);
  return 'Memory';
}

function extractDate(memory) {
  const ts = memory.tag?.timestamp || memory.updated_at || memory.created_at || '';
  return formatDate(ts);
}

function extractContent(memory) {
  if (memory.content) return memory.content.slice(0, 100);
  if (memory.messages?.[0]?.content) return memory.messages[0].content.slice(0, 100);
  const tagStr = Object.entries(memory.tag || {})
    .filter(([k]) => !['timestamp', 'project'].includes(k))
    .map(([k, v]) => `${k}: ${v}`)
    .join(' · ');
  return tagStr.slice(0, 100) || 'No preview available.';
}

/* ─── ErrorToast ────────────────────────────────────────────────────────────── */
function ErrorToast({ message, onDismiss }) {
  const [exiting, setExiting] = useState(false);

  const dismiss = useCallback(() => {
    setExiting(true);
    setTimeout(onDismiss, 220);
  }, [onDismiss]);

  // Auto-dismiss after 4 s
  useEffect(() => {
    const t = setTimeout(dismiss, 4000);
    return () => clearTimeout(t);
  }, [dismiss]);

  return (
    <div
      className={exiting ? 'toast-exit' : 'toast-enter'}
      style={{
        position: 'fixed',
        bottom: 28,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 999,
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '12px 18px',
        borderRadius: 14,
        background: '#1D1D1F',
        color: '#fff',
        fontSize: 13.5,
        fontWeight: 500,
        boxShadow: '0 8px 32px rgba(0,0,0,0.28)',
        maxWidth: 'calc(100vw - 40px)',
        whiteSpace: 'nowrap',
        pointerEvents: 'auto',
      }}
    >
      <span style={{ fontSize: 16 }}>⚠️</span>
      {message}
      <button
        onClick={dismiss}
        style={{
          marginLeft: 6,
          background: 'rgba(255,255,255,0.15)',
          border: 'none',
          borderRadius: 6,
          color: '#fff',
          fontSize: 12,
          fontWeight: 600,
          padding: '3px 8px',
          cursor: 'pointer',
          fontFamily: 'inherit',
        }}
      >
        Dismiss
      </button>
    </div>
  );
}

/* ─── LoadingSpinner ────────────────────────────────────────────────────────── */
function LoadingSpinner() {
  return (
    <div className="msg-enter" style={{ display: 'flex', alignItems: 'flex-end', gap: 10 }}>
      {/* Avatar */}
      <div style={{
        width: 32, height: 32, borderRadius: '50%',
        background: 'linear-gradient(135deg, #0071E3 0%, #34aadc 100%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0, fontSize: 14, fontWeight: 700, color: '#fff',
        boxShadow: '0 2px 8px rgba(0,113,227,0.35)',
      }}>
        A
      </div>
      {/* Spinner bubble */}
      <div style={{
        background: '#F5F5F7',
        borderRadius: '18px 18px 18px 4px',
        padding: '14px 18px',
        display: 'flex', alignItems: 'center', gap: 10,
        boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
      }}>
        {/* Arc spinner */}
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none"
          style={{ animation: 'spin 0.75s linear infinite', flexShrink: 0 }}>
          <circle cx="9" cy="9" r="7" stroke="#E5E5EA" strokeWidth="2.5" />
          <path d="M9 2A7 7 0 0 1 16 9" stroke="#0071E3" strokeWidth="2.5"
            strokeLinecap="round" />
        </svg>
        {/* Animated dots for text */}
        <span style={{ fontSize: 13.5, color: '#6E6E73', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 4 }}>
          Thinking + querying memory
          <span className="dot-1" style={{ display: 'inline-block', width: 4, height: 4, borderRadius: '50%', background: '#86868B' }} />
          <span className="dot-2" style={{ display: 'inline-block', width: 4, height: 4, borderRadius: '50%', background: '#86868B' }} />
          <span className="dot-3" style={{ display: 'inline-block', width: 4, height: 4, borderRadius: '50%', background: '#86868B' }} />
        </span>
      </div>
    </div>
  );
}

/* ─── MemoryContext ─────────────────────────────────────────────────────────── */
function MemoryContext({ memories }) {
  const [open, setOpen] = useState(false);
  if (!memories || memories.length === 0) return null;

  return (
    <div style={{ marginTop: 6, marginLeft: 42 }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 5,
          padding: '4px 10px', borderRadius: 99,
          border: '1px solid',
          borderColor: open ? '#0071E3' : '#D2D2D7',
          background: open ? '#E8F1FB' : '#F5F5F7',
          color: open ? '#0071E3' : '#6E6E73',
          fontSize: 11.5, fontWeight: 600,
          cursor: 'pointer', transition: 'all 0.15s ease',
          fontFamily: 'inherit', letterSpacing: '0.01em', userSelect: 'none',
        }}
      >
        <span style={{ fontSize: 12 }}>📎</span>
        {memories.length} {memories.length === 1 ? 'memory' : 'memories'} used
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none"
          style={{ transform: open ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s ease' }}>
          <path d="M2 3.5l3 3 3-3" stroke="currentColor" strokeWidth="1.4"
            strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <div className="msg-enter" style={{
          marginTop: 6, background: '#fff',
          border: '1px solid #E5E5EA', borderRadius: 12,
          overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.07)', maxWidth: 380,
        }}>
          <div style={{
            padding: '7px 12px', background: '#F5F5F7',
            borderBottom: '1px solid #E5E5EA',
            fontSize: 10.5, fontWeight: 700, color: '#86868B',
            textTransform: 'uppercase', letterSpacing: '0.06em',
          }}>
            Retrieved context from Parcle
          </div>
          {memories.map((m, i) => (
            <div key={i} style={{
              padding: '9px 12px',
              borderBottom: i < memories.length - 1 ? '1px solid #F2F2F7' : 'none',
              display: 'flex', alignItems: 'flex-start', gap: 8,
            }}>
              <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, paddingTop: 1 }}>
                <div style={{ width: 28, height: 4, borderRadius: 99, background: '#E5E5EA', overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', width: `${m.confidence ?? 0}%`,
                    background: m.confidence >= 70 ? '#34C759' : m.confidence >= 40 ? '#FF9500' : '#FF3B30',
                    borderRadius: 99, transition: 'width 0.4s ease',
                  }} />
                </div>
                <span style={{ fontSize: 9.5, color: '#86868B', fontWeight: 500 }}>{m.confidence ?? 0}%</span>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{
                  margin: 0, fontSize: 12.5, fontWeight: 600, color: '#1D1D1F',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>
                  {m.title || 'Past decision'}
                </p>
                {m.citationIds?.length > 0 && (
                  <p style={{ margin: '2px 0 0', fontSize: 11, color: '#86868B', fontWeight: 400 }}>
                    {m.citationIds.slice(0, 2).map(id => `ID: ${String(id).slice(0, 12)}…`).join(' · ')}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── MessageBubble ─────────────────────────────────────────────────────────── */
function MessageBubble({ msg }) {
  const isUser = msg.role === 'user';
  return (
    <div className="msg-enter" style={{ display: 'flex', flexDirection: 'column', alignItems: isUser ? 'flex-end' : 'flex-start' }}>
      <div style={{ display: 'flex', flexDirection: isUser ? 'row-reverse' : 'row', alignItems: 'flex-end', gap: 10, maxWidth: '100%' }}>
        {!isUser && (
          <div style={{
            width: 32, height: 32, borderRadius: '50%',
            background: 'linear-gradient(135deg, #0071E3 0%, #34aadc 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0, fontSize: 14, fontWeight: 700, color: '#fff',
            boxShadow: '0 2px 8px rgba(0,113,227,0.35)',
          }}>
            A
          </div>
        )}
        <div style={{
          maxWidth: '72%',
          padding: '12px 16px',
          borderRadius: isUser ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
          background: isUser ? '#0071E3' : '#F5F5F7',
          color: isUser ? '#fff' : '#1D1D1F',
          fontSize: 14.5, lineHeight: 1.6, fontWeight: 400,
          boxShadow: isUser ? '0 2px 12px rgba(0,113,227,0.30)' : '0 1px 3px rgba(0,0,0,0.08)',
          whiteSpace: 'pre-wrap', wordBreak: 'break-word',
        }}>
          {msg.content}
        </div>
        {isUser && (
          <div style={{
            width: 32, height: 32, borderRadius: '50%',
            background: '#E8F1FB',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0, fontSize: 13, fontWeight: 600, color: '#0071E3',
            border: '1.5px solid #0071E3',
          }}>
            Y
          </div>
        )}
      </div>
      {!isUser && <MemoryContext memories={msg.retrievedMemories} />}
    </div>
  );
}

/* ─── MemoryCard ────────────────────────────────────────────────────────────── */
function MemoryCard({ memory }) {
  const [hovered, setHovered] = useState(false);
  const title   = extractTitle(memory);
  const date    = extractDate(memory);
  const preview = extractContent(memory);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: '#fff', borderRadius: 14, padding: '14px 16px',
        border: '1px solid', borderColor: hovered ? '#0071E3' : '#E5E5EA',
        boxShadow: hovered ? '0 4px 16px rgba(0,113,227,0.12)' : '0 1px 3px rgba(0,0,0,0.06)',
        cursor: 'default',
        transition: 'border-color 0.18s ease, box-shadow 0.18s ease, transform 0.18s ease',
        transform: hovered ? 'translateY(-2px)' : 'translateY(0)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
        <span style={{
          fontSize: 10.5, fontWeight: 600, letterSpacing: '0.04em',
          textTransform: 'uppercase', color: '#0071E3',
          background: '#E8F1FB', padding: '2px 8px', borderRadius: 99,
        }}>
          {memory.tag?.type || 'decision'}
        </span>
        {date && <span style={{ fontSize: 11, color: '#86868B', fontWeight: 400 }}>{date}</span>}
      </div>
      <p style={{ fontSize: 13.5, fontWeight: 600, color: '#1D1D1F', margin: '0 0 5px', lineHeight: 1.4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {title}
      </p>
      <p style={{ fontSize: 12.5, color: '#6E6E73', margin: 0, lineHeight: 1.55, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
        {preview}
      </p>
    </div>
  );
}

/* ─── SearchResultCard ──────────────────────────────────────────────────────── */
function SearchResultCard({ result }) {
  const [hovered, setHovered] = useState(false);
  const preview = result.content
    ? result.content.split('\n').filter(Boolean)[0]?.slice(0, 120) || 'No preview.'
    : 'No preview.';
  const confColor = result.confidence >= 70 ? '#34C759' : result.confidence >= 40 ? '#FF9500' : '#FF3B30';

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: '#fff', borderRadius: 14, padding: '13px 15px',
        border: '1px solid', borderColor: hovered ? '#0071E3' : '#E5E5EA',
        boxShadow: hovered ? '0 4px 14px rgba(0,113,227,0.12)' : '0 1px 3px rgba(0,0,0,0.06)',
        transition: 'all 0.18s ease',
        transform: hovered ? 'translateY(-2px)' : 'translateY(0)',
      }}
    >
      {/* Top row: type pill + confidence */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 7 }}>
        <span style={{
          fontSize: 10.5, fontWeight: 600, letterSpacing: '0.04em',
          textTransform: 'uppercase', color: '#0071E3',
          background: '#E8F1FB', padding: '2px 8px', borderRadius: 99,
        }}>
          search result
        </span>
        {/* Confidence badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <div style={{ width: 36, height: 4, borderRadius: 99, background: '#E5E5EA', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${result.confidence}%`, background: confColor, borderRadius: 99, transition: 'width 0.4s ease' }} />
          </div>
          <span style={{ fontSize: 10.5, color: '#86868B', fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
            {result.confidence}%
          </span>
        </div>
      </div>

      {/* Title */}
      <p style={{
        margin: '0 0 5px', fontSize: 13.5, fontWeight: 600, color: '#1D1D1F',
        lineHeight: 1.4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
      }}>
        {result.title}
      </p>

      {/* Content preview */}
      <p style={{
        margin: 0, fontSize: 12, color: '#6E6E73', lineHeight: 1.55,
        display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
      }}>
        {preview}
      </p>

      {/* Citation IDs */}
      {result.citationIds?.length > 0 && (
        <p style={{ margin: '6px 0 0', fontSize: 10.5, color: '#86868B', fontWeight: 400, fontVariantNumeric: 'tabular-nums' }}>
          {result.citationIds.slice(0, 2).map(id => `ID: ${String(id).slice(0, 14)}…`).join(' · ')}
        </p>
      )}
    </div>
  );
}

/* ─── SidebarEmptyState ─────────────────────────────────────────────────────── */
function SidebarEmptyState() {
  return (
    <div style={{
      flex: 1, display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      gap: 12, padding: '32px 24px', textAlign: 'center',
    }}>
      {/* Icon */}
      <div style={{
        width: 56, height: 56, borderRadius: 16,
        background: 'linear-gradient(135deg, #E8F1FB 0%, #F5F5F7 100%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 2px 8px rgba(0,113,227,0.10)',
      }}>
        <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
          <rect x="2" y="2" width="22" height="22" rx="5" stroke="#0071E3" strokeWidth="1.5" strokeOpacity="0.6" />
          <path d="M7 10h12M7 13h12M7 16h7" stroke="#0071E3" strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.6" />
          <circle cx="20" cy="20" r="5" fill="#E8F1FB" stroke="#0071E3" strokeWidth="1.2" />
          <path d="M18.5 20h3M20 18.5v3" stroke="#0071E3" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
      </div>
      <div>
        <p style={{ margin: '0 0 5px', fontSize: 13.5, fontWeight: 700, color: '#1D1D1F' }}>
          No memories yet
        </p>
        <p style={{ margin: 0, fontSize: 12, color: '#86868B', lineHeight: 1.6, maxWidth: 200 }}>
          Start a conversation — every agent decision is saved here automatically.
        </p>
      </div>
      {/* Visual hint arrow */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M7 2v10M3 8l4 4 4-4" stroke="#0071E3" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.7" />
        </svg>
        <span style={{ fontSize: 11, color: '#0071E3', fontWeight: 500, opacity: 0.7 }}>
          Try asking a question →
        </span>
      </div>
    </div>
  );
}

/* ─── Main App ──────────────────────────────────────────────────────────────── */
export default function App() {
  const [memories, setMemories]           = useState([]);
  const [memoriesLoading, setMemoriesLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen]     = useState(false);
  const [toast, setToast]                 = useState(null);

  // Search state
  const [searchQuery, setSearchQuery]     = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching]     = useState(false);
  const [searchDone, setSearchDone]       = useState(false); // true after a search completes

  const [messages, setMessages] = useState([{
    id: 'welcome',
    role: 'agent',
    content: "Hello! I'm the Eternal Architect — your AI system orchestrator. I can answer questions, make architecture decisions, and save every decision to memory. What would you like to work on?",
  }]);
  const [input, setInput]       = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [statusFeed, setStatusFeed] = useState('');

  // Save Decision form state
  const [saveTitle, setSaveTitle] = useState('');
  const [saveContent, setSaveContent] = useState('');
  const [saveTags, setSaveTags] = useState([]);
  const [currentTagInput, setCurrentTagInput] = useState('');
  const [isSavingDecision, setIsSavingDecision] = useState(false);

  const [activePersonaId, setActivePersonaId] = useState('architect');

  const chatEndRef = useRef(null);
  const inputRef   = useRef(null);

  /* ── fetch memories ── */
  const fetchMemories = useCallback(async () => {
    setMemoriesLoading(true);
    try {
      const res  = await fetch('/api/memories');
      const data = await res.json();
      setMemories(data.memories || []);
    } catch {
      setMemories([]);
    } finally {
      setMemoriesLoading(false);
    }
  }, []);

  useEffect(() => { fetchMemories(); }, [fetchMemories]);

  /* ── debounced search ── */
  useEffect(() => {
    if (!searchQuery.trim()) {
      // Cleared — go back to recent memories
      setSearchResults([]);
      setSearchDone(false);
      fetchMemories();
      return;
    }
    const timer = setTimeout(async () => {
      setIsSearching(true);
      setSearchDone(false);
      try {
        const res  = await fetch('/api/memories/search', {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({ query: searchQuery.trim() }),
        });
        const data = await res.json();
        setSearchResults(data.results ?? []);
        setSearchDone(true);
      } catch {
        setSearchResults([]);
        setSearchDone(true);
      } finally {
        setIsSearching(false);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery, fetchMemories]);

  /* ── auto-scroll ── */
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  /* ── show toast ── */
  const showToast = useCallback((message) => {
    const id = Date.now();
    setToast({ id, message });
  }, []);

  /* ── send message ── */
  const handleSend = async () => {
    const task = input.trim();
    if (!task || isThinking) return;

    const userMsg = { id: Date.now(), role: 'user', content: task };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsThinking(true);
    setStatusFeed('Initializing...');
    setSidebarOpen(false); // close drawer on mobile when sending

    const encodedTask = encodeURIComponent(task);
    const eventSource = new EventSource(`/api/agent?task=${encodedTask}&persona=${activePersonaId}`);

    eventSource.addEventListener('step', (e) => {
      setStatusFeed(e.data);
    });

    eventSource.addEventListener('done', async (e) => {
      eventSource.close();
      const data = JSON.parse(e.data);
      const agentMsg = {
        id: Date.now() + 1,
        role: 'agent',
        content: data.response || data.error || 'No response received.',
        retrievedMemories: data.retrievedMemories ?? [],
      };
      setMessages(prev => [...prev, agentMsg]);
      await fetchMemories();
      setIsThinking(false);
      setStatusFeed('');
      setTimeout(() => inputRef.current?.focus(), 50);
    });

    eventSource.addEventListener('error', (e) => {
      eventSource.close();
      showToast('Agent unavailable, try again');
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        role: 'agent',
        content: '⚠️ Unable to reach the agent. Please check the server is running and try again.',
      }]);
      setIsThinking(false);
      setStatusFeed('');
    });
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  /* ── Save Decision Handlers ── */
  const handleSaveDecision = async () => {
    if (!saveTitle.trim() || !saveContent.trim() || isSavingDecision) return;
    setIsSavingDecision(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      const finalTags = [...saveTags, 'type:manual', `date:${today}`];
      
      const res = await fetch('/api/memory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: saveTitle.trim(),
          content: saveContent.trim(),
          tags: finalTags
        }),
      });
      if (!res.ok) throw new Error('Failed to save memory');
      showToast('✓ Saved to Parcle');
      setSaveTitle('');
      setSaveContent('');
      setSaveTags([]);
      setCurrentTagInput('');
      await fetchMemories();
    } catch (err) {
      showToast('Failed to save decision');
    } finally {
      setIsSavingDecision(false);
    }
  };

  const handleTagKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const newTag = currentTagInput.trim().replace(/^,+|,+$/g, '');
      if (newTag && !saveTags.includes(newTag)) {
        setSaveTags(prev => [...prev, newTag]);
      }
      setCurrentTagInput('');
    }
  };

  const removeTag = (tagToRemove) => {
    setSaveTags(prev => prev.filter(t => t !== tagToRemove));
  };

  /* ── shared inline styles ── */
  const panelBase = {
    background: '#fff',
    border: '1px solid #E5E5EA',
    boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
    display: 'flex', flexDirection: 'column',
    overflow: 'hidden',
  };

  /* ───────────────────────────────────────────────────────────────────────── */
  return (
    <div style={{
      height: '100vh', display: 'flex', flexDirection: 'column',
      background: '#F5F5F7',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif",
    }}>

      {/* ── Error Toast ─────────────────────────────────────────────────── */}
      {toast && (
        <ErrorToast
          key={toast.id}
          message={toast.message}
          onDismiss={() => setToast(null)}
        />
      )}

      {/* ── Top bar ─────────────────────────────────────────────────────── */}
      <header style={{
        height: 52,
        background: 'rgba(255,255,255,0.90)',
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        borderBottom: '1px solid rgba(0,0,0,0.08)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 18px',
        position: 'sticky', top: 0, zIndex: 100, flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* Mobile: hamburger to toggle sidebar */}
          <button
            id="sidebar-toggle-btn"
            onClick={() => setSidebarOpen(o => !o)}
            aria-label="Toggle memory sidebar"
            style={{
              display: 'none', // shown via CSS media query override below
              width: 34, height: 34, borderRadius: 9,
              background: '#F5F5F7', border: '1px solid #E5E5EA',
              alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', flexShrink: 0,
            }}
            className="mobile-menu-btn"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M2 4h12M2 8h12M2 12h12" stroke="#1D1D1F" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
          <div style={{
            width: 28, height: 28, borderRadius: 8,
            background: 'linear-gradient(135deg, #0071E3 0%, #34aadc 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(0,113,227,0.4)',
          }}>
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
              <path d="M7.5 1L9.5 5H14L10.5 8L12 13L7.5 10L3 13L4.5 8L1 5H5.5L7.5 1Z"
                fill="white" stroke="white" strokeWidth="0.5" strokeLinejoin="round" />
            </svg>
          </div>
          <span style={{ fontSize: 15, fontWeight: 600, color: '#1D1D1F', letterSpacing: '-0.01em' }}>
            SentientOS
          </span>
          <span style={{
            fontSize: 11, fontWeight: 500, color: '#0071E3',
            background: '#E8F1FB', padding: '2px 8px', borderRadius: 99,
            letterSpacing: '0.02em',
          }}>
            BETA
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#34C759' }} />
          <span style={{ fontSize: 12, color: '#6E6E73', fontWeight: 400 }}>System online</span>
        </div>
      </header>

      {/* ── Mobile sidebar overlay ───────────────────────────────────────── */}
      {/* Hidden by default on desktop; CSS shows it on mobile */}
      <div
        className="sidebar-overlay"
        onClick={() => setSidebarOpen(false)}
        style={{
          display: 'none',
          position: 'fixed', inset: 0, top: 52,
          background: 'rgba(0,0,0,0.35)',
          zIndex: 199,
          opacity: sidebarOpen ? 1 : 0,
          pointerEvents: sidebarOpen ? 'auto' : 'none',
          transition: 'opacity 0.25s ease',
        }}
      />

      {/* ── Two-panel layout ─────────────────────────────────────────────── */}
      <div className="layout-panels" style={{
        flex: 1, display: 'flex', overflow: 'hidden', minHeight: 0,
        padding: '16px', gap: 14,
      }}>

        {/* ═══════════════════ LEFT PANEL — Memory Sidebar ═══════════════ */}
        <aside
          className={`sidebar-panel${sidebarOpen ? ' open' : ''}`}
          style={{
            ...panelBase,
            width: '30%', minWidth: 260, maxWidth: 360,
            borderRadius: 18,
            flexShrink: 0,
          }}
        >
          {/* Header */}
          <div style={{
            padding: '16px 18px 12px',
            borderBottom: '1px solid #F2F2F7',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            flexShrink: 0,
          }}>
            <div>
              <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#1D1D1F', letterSpacing: '-0.02em' }}>
                Past Decisions
              </h2>
              <p style={{ margin: '2px 0 0', fontSize: 12, color: '#86868B', fontWeight: 400 }}>
                {memoriesLoading || isSearching
                  ? 'Searching…'
                  : searchDone
                    ? `${searchResults.length} ${searchResults.length === 1 ? 'memory' : 'memories'} found`
                    : `${memories.length} memories stored`}
              </p>
            </div>
            <button
              id="refresh-memories-btn"
              onClick={() => { setSearchQuery(''); fetchMemories(); }}
              disabled={memoriesLoading && !searchQuery}
              style={{
                display: 'flex', alignItems: 'center', gap: 5,
                padding: '6px 12px', borderRadius: 8, border: '1px solid',
                borderColor: memoriesLoading ? '#D2D2D7' : '#0071E3',
                background: memoriesLoading ? '#F5F5F7' : '#E8F1FB',
                color: memoriesLoading ? '#86868B' : '#0071E3',
                fontSize: 12, fontWeight: 600,
                cursor: memoriesLoading ? 'not-allowed' : 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none"
                style={{ animation: memoriesLoading ? 'spin 0.8s linear infinite' : 'none', transformOrigin: 'center' }}>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                <path d="M10 6A4 4 0 1 1 6 2M6 2L8.5 0M6 2L8.5 4"
                  stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Refresh
            </button>
          </div>

          {/* Search input */}
          <div style={{ padding: '10px 14px 2px', flexShrink: 0 }}>
            <div style={{ position: 'relative' }}>
              {/* Search icon */}
              <svg
                width="14" height="14" viewBox="0 0 14 14" fill="none"
                style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
              >
                <circle cx="6" cy="6" r="4.5" stroke="#86868B" strokeWidth="1.4" />
                <path d="M9.5 9.5l2.5 2.5" stroke="#86868B" strokeWidth="1.4" strokeLinecap="round" />
              </svg>
              <input
                id="memory-search-input"
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search past decisions…"
                style={{
                  width: '100%',
                  padding: '8px 32px 8px 30px',
                  borderRadius: 10,
                  border: '1.5px solid',
                  borderColor: searchQuery ? '#0071E3' : '#E5E5EA',
                  boxShadow: searchQuery ? '0 0 0 3px rgba(0,113,227,0.10)' : 'none',
                  fontSize: 13,
                  fontFamily: 'inherit',
                  color: '#1D1D1F',
                  background: '#F5F5F7',
                  outline: 'none',
                  transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
                  boxSizing: 'border-box',
                }}
              />
              {/* Clear button */}
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  style={{
                    position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)',
                    background: '#D2D2D7', border: 'none', borderRadius: '50%',
                    width: 16, height: 16, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    padding: 0,
                  }}
                  aria-label="Clear search"
                >
                  <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                    <path d="M1.5 1.5l5 5M6.5 1.5l-5 5" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* Memory list */}
          <div style={{
            flex: 1, overflowY: 'auto', padding: '10px 14px',
            display: 'flex', flexDirection: 'column', gap: 8,
          }}>
            <style>{`@keyframes pulse{0%,100%{opacity:.55}50%{opacity:1}}`}</style>
            {(memoriesLoading || isSearching) ? (
              /* Skeleton cards */
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} style={{
                  background: '#F5F5F7', borderRadius: 12,
                  padding: '14px 16px', border: '1px solid #F2F2F7',
                  animation: `pulse 1.6s ${i * 0.1}s ease-in-out infinite`,
                }}>
                  <div style={{ height: 10, width: '40%', background: '#E5E5EA', borderRadius: 99, marginBottom: 8 }} />
                  <div style={{ height: 13, width: '75%', background: '#E5E5EA', borderRadius: 99, marginBottom: 6 }} />
                  <div style={{ height: 11, width: '90%', background: '#E5E5EA', borderRadius: 99 }} />
                </div>
              ))
            ) : searchDone && searchResults.length === 0 ? (
              /* No results state */
              <div style={{
                flex: 1, display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                gap: 8, padding: '32px 20px', textAlign: 'center',
              }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 12,
                  background: '#F5F5F7', display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                    <circle cx="10" cy="10" r="7.5" stroke="#86868B" strokeWidth="1.4" />
                    <path d="M16 16l3.5 3.5" stroke="#86868B" strokeWidth="1.4" strokeLinecap="round" />
                    <path d="M7.5 10h5M10 7.5v5" stroke="#86868B" strokeWidth="1.4" strokeLinecap="round" opacity="0.4" />
                  </svg>
                </div>
                <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: '#3A3A3C' }}>No results found</p>
                <p style={{ margin: 0, fontSize: 12, color: '#86868B', lineHeight: 1.5 }}>
                  Try different keywords or{' '}
                  <button onClick={() => setSearchQuery('')}
                    style={{ background: 'none', border: 'none', color: '#0071E3', cursor: 'pointer', fontSize: 12, fontWeight: 600, padding: 0, fontFamily: 'inherit' }}>
                    view all memories
                  </button>
                </p>
              </div>
            ) : searchDone ? (
              /* Search results */
              searchResults.map((m, i) => <SearchResultCard key={m.id || i} result={m} />)
            ) : memories.length === 0 ? (
              <SidebarEmptyState />
            ) : (
              memories.map((m, i) => <MemoryCard key={m.id || i} memory={m} />)
            )}
          </div>

          {/* Save Decision Panel */}
          <div style={{
            padding: '14px', borderTop: '1px solid #E5E5EA', background: '#FAFAFA',
            display: 'flex', flexDirection: 'column', gap: 10, flexShrink: 0
          }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#1D1D1F' }}>Save Decision</div>
            <input
              type="text"
              placeholder="Decision title"
              value={saveTitle}
              onChange={e => setSaveTitle(e.target.value)}
              disabled={isSavingDecision}
              style={{
                width: '100%', padding: '8px 12px', borderRadius: 8,
                border: '1px solid #D2D2D7', fontSize: 13, outline: 'none',
                background: '#fff', boxSizing: 'border-box',
                transition: 'border-color 0.15s ease'
              }}
              onFocus={e => e.target.style.borderColor = '#0071E3'}
              onBlur={e => e.target.style.borderColor = '#D2D2D7'}
            />
            <textarea
              placeholder="Decision content"
              value={saveContent}
              onChange={e => setSaveContent(e.target.value)}
              disabled={isSavingDecision}
              rows={3}
              style={{
                width: '100%', padding: '8px 12px', borderRadius: 8,
                border: '1px solid #D2D2D7', fontSize: 13, outline: 'none',
                background: '#fff', boxSizing: 'border-box', resize: 'none',
                fontFamily: 'inherit', transition: 'border-color 0.15s ease'
              }}
              onFocus={e => e.target.style.borderColor = '#0071E3'}
              onBlur={e => e.target.style.borderColor = '#D2D2D7'}
            />
            <div style={{
              display: 'flex', flexWrap: 'wrap', gap: 6,
              alignItems: 'center', background: '#fff',
              border: '1px solid #D2D2D7', borderRadius: 8, padding: '4px 8px',
              minHeight: 34, boxSizing: 'border-box'
            }}>
              {saveTags.map(tag => (
                <div key={tag} style={{
                  background: '#E8F1FB', color: '#0071E3',
                  padding: '2px 8px', borderRadius: 12, fontSize: 12,
                  display: 'flex', alignItems: 'center', gap: 4
                }}>
                  {tag}
                  <button onClick={() => removeTag(tag)} disabled={isSavingDecision} style={{
                    background: 'none', border: 'none', color: '#0071E3', padding: 0,
                    cursor: 'pointer', display: 'flex', alignItems: 'center'
                  }}>
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2.5 2.5L7.5 7.5M7.5 2.5L2.5 7.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>
                  </button>
                </div>
              ))}
              <input
                type="text"
                placeholder={saveTags.length === 0 ? "Add tags..." : ""}
                value={currentTagInput}
                onChange={e => setCurrentTagInput(e.target.value)}
                onKeyDown={handleTagKeyDown}
                disabled={isSavingDecision}
                style={{
                  border: 'none', outline: 'none', background: 'transparent',
                  fontSize: 13, width: 80, flex: 1, minWidth: 60
                }}
              />
            </div>
            <button
              onClick={handleSaveDecision}
              disabled={isSavingDecision || !saveTitle.trim() || !saveContent.trim()}
              style={{
                width: '100%', padding: '10px', borderRadius: 8, border: 'none',
                background: (isSavingDecision || !saveTitle.trim() || !saveContent.trim()) ? '#D2D2D7' : '#0071E3',
                color: '#fff', fontSize: 13, fontWeight: 600,
                cursor: (isSavingDecision || !saveTitle.trim() || !saveContent.trim()) ? 'not-allowed' : 'pointer',
                transition: 'background 0.15s ease'
              }}
            >
              {isSavingDecision ? 'Saving...' : 'Save to Memory'}
            </button>
          </div>
        </aside>

        {/* ═══════════════════ RIGHT PANEL — Agent Chat ══════════════════ */}
        <main className="chat-panel" style={{ ...panelBase, flex: 1, borderRadius: 18, minWidth: 0 }}>

          {/* Chat header */}
          <div style={{
            padding: '14px 18px 12px',
            borderBottom: '1px solid #F2F2F7',
            display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0,
          }}>
            {/* Mobile: open sidebar button inside chat header */}
            <button
              onClick={() => setSidebarOpen(o => !o)}
              className="mobile-menu-btn"
              aria-label="Open memory sidebar"
              style={{
                display: 'none',
                width: 32, height: 32, borderRadius: 8,
                background: '#F5F5F7', border: '1px solid #E5E5EA',
                alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', flexShrink: 0,
              }}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M1 3.5h12M1 7h12M1 10.5h12" stroke="#1D1D1F" strokeWidth="1.4" strokeLinecap="round" />
              </svg>
            </button>

            <div style={{
              width: 40, height: 40, borderRadius: 12, flexShrink: 0,
              background: 'linear-gradient(135deg, #0071E3 0%, #34aadc 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 3px 10px rgba(0,113,227,0.35)',
              fontSize: 20
            }}>
              {PERSONAS.find(p => p.id === activePersonaId)?.emoji}
            </div>
            <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'flex-start' }}>
              <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
                <select
                  value={activePersonaId}
                  onChange={e => setActivePersonaId(e.target.value)}
                  style={{
                    appearance: 'none', background: 'transparent', border: 'none',
                    fontSize: 16, fontWeight: 700, color: '#1D1D1F', letterSpacing: '-0.02em',
                    padding: '0 16px 0 0', margin: 0, cursor: 'pointer', outline: 'none'
                  }}
                >
                  {PERSONAS.map(p => (
                    <option key={p.id} value={p.id}>{p.label}</option>
                  ))}
                </select>
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none" style={{ position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
                  <path d="M2.5 3.5L5 6L7.5 3.5" stroke="#1D1D1F" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <p style={{ margin: 0, fontSize: 12, color: '#86868B', fontWeight: 400, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {isThinking
                  ? <span style={{ color: '#0071E3', fontWeight: 500 }}>Thinking + querying memory…</span>
                  : PERSONAS.find(p => p.id === activePersonaId)?.subtitle
                }
              </p>
            </div>
          </div>

          {/* Messages area */}
          <div style={{
            flex: 1, overflowY: 'auto', padding: '20px 18px',
            display: 'flex', flexDirection: 'column', gap: 16, minHeight: 0,
          }}>
            {messages.map(msg => <MessageBubble key={msg.id} msg={msg} />)}
            {isThinking && <LoadingSpinner />}
            <div ref={chatEndRef} />
          </div>

          {/* Status Feed */}
          {statusFeed && (
            <div style={{
              padding: '8px 16px', background: '#F5F5F7', borderTop: '1px solid #E5E5EA',
              display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#0071E3',
              fontWeight: 500, flexShrink: 0,
            }}>
              <style>{`
                @keyframes pulseDot { 0%, 100% { opacity: 0.3; transform: scale(0.8); } 50% { opacity: 1; transform: scale(1); } }
              `}</style>
              <div style={{
                width: 6, height: 6, borderRadius: '50%', background: '#0071E3',
                animation: 'pulseDot 1.5s infinite ease-in-out'
              }} />
              {statusFeed}
            </div>
          )}

          {/* Input bar */}
          <div style={{
            padding: '12px 14px', borderTop: '1px solid #F2F2F7',
            background: '#FAFAFA', borderRadius: '0 0 18px 18px', flexShrink: 0,
          }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
              <textarea
                id="agent-input"
                ref={inputRef}
                value={input}
                onChange={e => {
                  setInput(e.target.value);
                  e.target.style.height = 'auto';
                  e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
                }}
                onKeyDown={handleKeyDown}
                placeholder="Ask the Eternal Architect anything…"
                disabled={isThinking}
                rows={1}
                style={{
                  flex: 1, resize: 'none',
                  border: '1.5px solid',
                  borderColor: input ? '#0071E3' : '#D2D2D7',
                  borderRadius: 12, padding: '10px 13px',
                  fontSize: 14, fontFamily: 'inherit',
                  color: '#1D1D1F', background: '#fff', outline: 'none',
                  lineHeight: 1.55, minHeight: 44, maxHeight: 120,
                  overflow: 'auto',
                  transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
                  boxShadow: input ? '0 0 0 3px rgba(0,113,227,0.10)' : 'none',
                  opacity: isThinking ? 0.55 : 1,
                }}
              />
              <button
                id="ask-agent-btn"
                onClick={handleSend}
                disabled={!input.trim() || isThinking}
                style={{
                  padding: '10px 18px', borderRadius: 11, border: 'none',
                  background: (!input.trim() || isThinking)
                    ? '#D2D2D7'
                    : 'linear-gradient(135deg, #0071E3 0%, #005bbf 100%)',
                  color: '#fff', fontSize: 14, fontWeight: 600,
                  cursor: (!input.trim() || isThinking) ? 'not-allowed' : 'pointer',
                  transition: 'all 0.15s ease', whiteSpace: 'nowrap',
                  boxShadow: (!input.trim() || isThinking) ? 'none' : '0 3px 10px rgba(0,113,227,0.40)',
                  flexShrink: 0, height: 44,
                  display: 'flex', alignItems: 'center', gap: 7,
                }}
                onMouseEnter={e => {
                  if (!input.trim() || isThinking) return;
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = '0 5px 16px rgba(0,113,227,0.45)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = (!input.trim() || isThinking)
                    ? 'none' : '0 3px 10px rgba(0,113,227,0.40)';
                }}
              >
                {isThinking ? (
                  <>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none"
                      style={{ animation: 'spin 0.75s linear infinite' }}>
                      <circle cx="7" cy="7" r="5.5" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" />
                      <path d="M7 1.5A5.5 5.5 0 0 1 12.5 7" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                    Thinking…
                  </>
                ) : (
                  <>
                    Ask Agent
                    <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                      <path d="M2 6.5h9M7 2.5l4 4-4 4" stroke="white" strokeWidth="1.6"
                        strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </>
                )}
              </button>
            </div>
            <p style={{ margin: '7px 0 0', fontSize: 11.5, color: '#86868B', textAlign: 'center', fontWeight: 400 }}>
              Press{' '}
              <kbd style={{ fontFamily: 'inherit', fontSize: 10.5, background: '#F2F2F7', padding: '1px 5px', borderRadius: 4, border: '1px solid #D2D2D7' }}>
                ↵ Enter
              </kbd>
              {' '}to send ·{' '}
              <kbd style={{ fontFamily: 'inherit', fontSize: 10.5, background: '#F2F2F7', padding: '1px 5px', borderRadius: 4, border: '1px solid #D2D2D7' }}>
                ⇧ Shift + Enter
              </kbd>
              {' '}for new line
            </p>
          </div>
        </main>
      </div>

      {/* ── Mobile-only CSS overrides ────────────────────────────────────── */}
      <style>{`
        @media (max-width: 720px) {
          .mobile-menu-btn { display: flex !important; }
          .sidebar-panel {
            position: fixed !important;
            top: 52px !important; left: 0 !important; bottom: 0 !important;
            width: 85vw !important; max-width: 340px !important;
            border-radius: 0 18px 18px 0 !important;
            z-index: 200;
            transform: translateX(-100%);
            transition: transform 0.28s cubic-bezier(0.4,0,0.2,1);
            box-shadow: 4px 0 24px rgba(0,0,0,0.14) !important;
          }
          .sidebar-panel.open { transform: translateX(0) !important; }
          .sidebar-overlay { display: block !important; }
          .layout-panels { padding: 10px !important; gap: 0 !important; }
          .chat-panel { border-radius: 14px !important; }
        }
      `}</style>
    </div>
  );
}
