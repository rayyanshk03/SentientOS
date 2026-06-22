import { useEffect, useRef, useState, useCallback } from 'react';
import { Outlet } from 'react-router-dom';
import { useTheme } from './hooks/useTheme';
import Navbar    from './components/layout/Navbar';
import Sidebar   from './components/layout/Sidebar';
import ChatWindow from './components/chat/ChatWindow';
import InputBar   from './components/chat/InputBar';
import Modal  from './components/ui/Modal';
import Button from './components/ui/Button';
import Input  from './components/ui/Input';
import StandupPanel from './components/standup/StandupPanel';
import AppLoader from './components/ui/AppLoader';
import MemoryPreviewModal from './components/ui/MemoryPreviewModal';

/* ─── Persona definitions ───────────────────────────────────────────────────── */
const PERSONAS = [
  { id: 'architect', label: 'Eternal Architect', emoji: '🏛️', subtitle: 'AI-powered system orchestrator' },
  { id: 'debugger',  label: 'Zero-Sync Debugger', emoji: '🐛', subtitle: 'Finds and fixes complex bugs' },
  { id: 'docs',      label: 'Docs Writer',         emoji: '📝', subtitle: 'Writes documentation & READMEs' },
  { id: 'ui',        label: 'UI Enforcer',          emoji: '🎨', subtitle: 'Focuses on design consistency' },
];

/* ─── Memory helpers ────────────────────────────────────────────────────────── */
function formatDate(raw) {
  if (!raw) return '';
  const d = new Date(raw);
  if (isNaN(d)) return '';
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function extractTitle(memory) {
  if (memory.title)         return memory.title;
  if (memory.tag?.title)    return memory.tag.title;
  if (memory.tag?.type)     return memory.tag.type.charAt(0).toUpperCase() + memory.tag.type.slice(1);
  return 'Memory';
}

function extractDate(memory) {
  const ts = memory.tag?.timestamp || memory.updated_at || memory.created_at || '';
  return formatDate(ts);
}

function extractContent(memory) {
  if (memory.content)                return memory.content.slice(0, 100);
  if (memory.messages?.[0]?.content) return memory.messages[0].content.slice(0, 100);
  const tagStr = Object.entries(memory.tag || {})
    .filter(([k]) => !['timestamp', 'project'].includes(k))
    .map(([k, v]) => `${k}: ${v}`)
    .join(' · ');
  return tagStr.slice(0, 100) || 'No preview available.';
}

/* ══════════════════════════════════════════════════════════════════════════════
   ToastContainer — multi-toast stack at bottom-center
══════════════════════════════════════════════════════════════════════════════ */
const TOAST_ICONS = { success: '✅', error: '⚠️', info: 'ℹ️', warning: '🟡' };

function ToastItem({ toast, onDismiss }) {
  const [exiting, setExiting] = useState(false);
  const duration = toast.duration ?? 3500;

  const dismiss = useCallback(() => {
    setExiting(true);
    setTimeout(onDismiss, 280);
  }, [onDismiss]);

  useEffect(() => {
    const t = setTimeout(dismiss, duration);
    return () => clearTimeout(t);
  }, [dismiss, duration]);

  const accentColor = toast.type === 'error'   ? '#FF3B30'
                    : toast.type === 'success' ? '#34C759'
                    : toast.type === 'warning' ? '#FF9500'
                    : '#0071E3';

  return (
    <div
      className={exiting ? 'toast-exit' : 'toast-enter'}
      style={{
        display: 'flex', flexDirection: 'column',
        borderRadius: 12, overflow: 'hidden',
        background: '#1D1D1F', color: '#FFFFFF',
        fontSize: 13.5, fontWeight: 500,
        boxShadow: '0 8px 32px rgba(0,0,0,0.35)',
        maxWidth: 360, minWidth: 240,
        pointerEvents: 'auto',
        borderLeft: `3px solid ${accentColor}`,
      }}
    >
      {/* Main row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 14px 10px 14px' }}>
        <span style={{ fontSize: 15, flexShrink: 0 }}>{TOAST_ICONS[toast.type] ?? '💬'}</span>
        <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', lineHeight: 1.4 }}>
          {toast.message}
        </span>
        <button
          onClick={dismiss}
          style={{
            marginLeft: 4, background: 'rgba(255,255,255,0.10)',
            border: 'none', borderRadius: 5, color: '#FFFFFF',
            fontSize: 11, fontWeight: 600, padding: '2px 7px',
            cursor: 'pointer', fontFamily: 'inherit', flexShrink: 0,
            transition: 'background 0.15s ease',
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.10)'}
        >✕</button>
      </div>
      {/* Auto-dismiss progress bar */}
      <div style={{ height: 2, background: 'rgba(255,255,255,0.08)' }}>
        <div style={{
          height: '100%',
          background: accentColor,
          animation: `toastProgress ${duration}ms linear forwards`,
          transformOrigin: 'left',
        }} />
      </div>
    </div>
  );
}

function ToastContainer({ toasts, onDismiss }) {
  if (!toasts.length) return null;
  return (
    <div style={{
      position: 'fixed', bottom: 24, right: 24,
      display: 'flex', flexDirection: 'column', gap: 10,
      zIndex: 9999, pointerEvents: 'none',
      alignItems: 'flex-end',
    }}>
      {toasts.map(t => (
        <ToastItem key={t.id} toast={t} onDismiss={() => onDismiss(t.id)} />
      ))}
    </div>
  );
}


/* ══════════════════════════════════════════════════════════════════════════════
   OnboardingModal — shown once on first visit
══════════════════════════════════════════════════════════════════════════════ */
function OnboardingModal({ onComplete }) {
  const [step, setStep] = useState(0);

  const steps = [
    {
      emoji: '🧠',
      title: 'Welcome to SentientOS',
      body: 'Your AI-powered system orchestrator that remembers every architectural decision you make — forever.',
    },
    {
      emoji: '💬',
      title: 'Chat with context',
      body: 'Ask anything. The agent searches your entire decision history before answering, so it never contradicts past choices.',
    },
    {
      emoji: '📌',
      title: 'Decisions are permanent',
      body: 'Every response is automatically saved to memory. Use the sidebar to browse, search, and revisit past decisions at any time.',
    },
    {
      emoji: '⚡',
      title: 'You\'re all set!',
      body: 'Switch personas to change the agent\'s expertise. Try the Demo button to see it in action.',
    },
  ];

  const current = steps[step];
  const isLast  = step === steps.length - 1;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 10000,
      background: 'rgba(0,0,0,0.55)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      backdropFilter: 'blur(4px)',
    }}>
      <div className="toast-enter" style={{
        background: 'var(--white)', borderRadius: 24,
        padding: '40px 36px', maxWidth: 440, width: '90vw',
        boxShadow: '0 24px 64px rgba(0,0,0,0.22)',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        textAlign: 'center', gap: 20,
      }}>
        {/* Progress dots */}
        <div style={{ display: 'flex', gap: 6, alignSelf: 'flex-start' }}>
          {steps.map((_, i) => (
            <div key={i} style={{
              width: i === step ? 20 : 6, height: 6, borderRadius: 99,
              background: i === step ? 'var(--blue)' : 'var(--border)',
              transition: 'all 0.3s ease',
            }} />
          ))}
        </div>

        {/* Emoji */}
        <div style={{
          width: 72, height: 72, borderRadius: 20,
          background: 'linear-gradient(135deg, var(--blue-light) 0%, var(--gray-light) 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 36,
          boxShadow: '0 4px 16px rgba(0,113,227,0.15)',
        }}>
          {current.emoji}
        </div>

        <div>
          <h2 style={{ margin: '0 0 10px', fontSize: 22, fontWeight: 700, color: 'var(--black)', lineHeight: 1.3 }}>
            {current.title}
          </h2>
          <p style={{ margin: 0, fontSize: 15, color: 'var(--gray-mid)', lineHeight: 1.65 }}>
            {current.body}
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10, width: '100%' }}>
          {step > 0 && (
            <Button variant="ghost" onClick={() => setStep(s => s - 1)} size="md">
              ← Back
            </Button>
          )}
          <Button
            variant="primary"
            size="md"
            onClick={() => isLast ? onComplete() : setStep(s => s + 1)}
            style={{ flex: 1 }}
          >
            {isLast ? 'Get Started →' : 'Next →'}
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════════
   KeyboardShortcutsModal
══════════════════════════════════════════════════════════════════════════════ */
const SHORTCUTS = [
  { keys: ['⌘', 'K'],      desc: 'Focus search / input' },
  { keys: ['⌘', '↵'],      desc: 'Submit message' },
  { keys: ['⌘', 'D'],      desc: 'Run / stop demo' },
  { keys: ['⌘', 'S'],      desc: 'Save decision' },
  { keys: ['⌘', 'E'],      desc: 'Export report' },
  { keys: ['⌘', '1–4'],    desc: 'Switch persona' },
  { keys: ['Esc'],          desc: 'Close modal / clear input' },
  { keys: ['?'],            desc: 'Open this help menu' },
];

function ShortcutsModal({ onClose }) {
  return (
    <Modal open onClose={onClose} title="Keyboard Shortcuts">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {SHORTCUTS.map(({ keys, desc }) => (
          <div key={desc} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '8px 2px', borderBottom: '1px solid var(--border)',
          }}>
            <span style={{ fontSize: 13.5, color: 'var(--gray-dark)' }}>{desc}</span>
            <div style={{ display: 'flex', gap: 4 }}>
              {keys.map((k, i) => (
                <kbd key={i} style={{
                  background: 'var(--gray-light)', border: '1px solid var(--border)',
                  borderRadius: 6, padding: '2px 7px', fontSize: 12,
                  fontWeight: 600, color: 'var(--black)', fontFamily: 'inherit',
                }}>{k}</kbd>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Modal>
  );
}

/* ══════════════════════════════════════════════════════════════════════════════
   Main App
══════════════════════════════════════════════════════════════════════════════ */
export default function App() {

  /* ── Core chat state ── */
  const [sessionId, setSessionId] = useState(() => {
    const saved = sessionStorage.getItem('sessionId');
    if (saved) return saved;
    const newId = `sess-${Date.now()}-${Math.floor(Math.random()*1000)}`;
    sessionStorage.setItem('sessionId', newId);
    return newId;
  });
  const [messages, setMessages]         = useState([{
    id: 'welcome', role: 'agent',
    content: "Hello! I'm SentientOS — your AI system orchestrator. I can answer questions, make architecture decisions, and save every decision to memory. What would you like to work on?",
  }]);
  const [isLoading, setIsLoading]       = useState(false);
  const [streamSteps, setStreamSteps]   = useState([]);

  /* ── Sidebar / memory state ── */
  const [memories, setMemories]           = useState([]);
  const [memoriesLoading, setMemoriesLoading] = useState(true);
  const [isAppLoading, setIsAppLoading]   = useState(false);
  const [sidebarOpen, setSidebarOpen]     = useState(false);
  const [sidebarGlow, setSidebarGlow]     = useState(false);
  const [searchQuery, setSearchQuery]     = useState('');
  const [isSearching, setIsSearching]     = useState(false);

  /* ── Sessions & Projects list states ── */
  const [sessions, setSessions] = useState([]);
  const [projects, setProjects] = useState([]);

  /* ── Persona / project ── */
  const [activePersonaId, setActivePersonaId] = useState('architect');
  const [activeProject, setActiveProject]     = useState('SentientOS');

  /* ── Toasts ── */
  const [toasts, setToasts] = useState([]);

  /* ── Modals & Theme ── */
  const [showOnboarding, setShowOnboarding]     = useState(() => !localStorage.getItem('onboarded'));
  const [showShortcuts, setShowShortcuts]       = useState(false);
  const [isStandupOpen, setIsStandupOpen]       = useState(false);
  const [isSaveModalOpen, setIsSaveModalOpen]   = useState(false);
  
  const { theme, setTheme } = useTheme();

  /* ── Identity ── */
  const [identity, setIdentity] = useState(null);

  const fetchIdentity = useCallback(async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/identity`);
      const data = await res.json();
      setIdentity(data.identity);
    } catch {
      setIdentity(null);
    }
  }, []);

  /* ── Save Decision form ── */
  const [saveTitle, setSaveTitle]           = useState('');
  const [saveContent, setSaveContent]       = useState('');
  const [saveTags, setSaveTags]             = useState([]);
  const [currentTagInput, setCurrentTagInput] = useState('');
  const [isSavingDecision, setIsSavingDecision] = useState(false);

  /* ── Export ── */
  const [isExporting, setIsExporting]     = useState(false);
  const [exportMemories, setExportMemories] = useState([]);

  /* ── Demo mode ── */
  const [isDemoRunning, setIsDemoRunning] = useState(false);
  const [demoStep, setDemoStep]           = useState(0);
  const demoTimeoutsRef    = useRef([]);
  const demoEventSourceRef = useRef(null);
  const demoInputRef       = useRef(''); // tracks demo input visually

  /* ── Stats (for Navbar memory count pill) ── */
  const [stats, setStats] = useState({ totalMemories: 0 });

  /* ── Auto-Save Toggle + Memory Preview ── */
  const [autoSave, setAutoSave] = useState(() => localStorage.getItem('autoSave') !== 'false');
  const [chatTag, setChatTag] = useState('Auto');
  const [memoryPreview, setMemoryPreview] = useState(null);   // { extraction, userMessage, agentResponse }
  const [isSavingPreview, setIsSavingPreview] = useState(false);
  const lastMessageRef = useRef({ user: '', agent: '' });

  /* ─────────────────────────────────────────────────────────────────────────
     addToast — adds a toast with auto-remove
  ───────────────────────────────────────────────────────────────────────── */
  const addToast = useCallback((message, type = 'info', duration = 3500) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type, duration }]);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const toggleAutoSave = useCallback((val) => {
    const next = val !== undefined ? val : !autoSave;
    setAutoSave(next);
    localStorage.setItem('autoSave', String(next));
    addToast(next ? '🧠 Auto-Save ON — memories saved automatically' : '⏸️ Auto-Save OFF — you\'ll preview before saving', 'info', 3000);
  }, [autoSave, addToast]);

  /* ─────────────────────────────────────────────────────────────────────────
     refreshMemories — GET /api/memories
  ───────────────────────────────────────────────────────────────────────── */
  const refreshMemories = useCallback(async () => {
    setMemoriesLoading(true);
    try {
      const controller = new AbortController();
      const timeoutId  = setTimeout(() => controller.abort(), 8000);
      const res  = await fetch(`${import.meta.env.VITE_API_URL}/api/memories`, { signal: controller.signal });
      clearTimeout(timeoutId);
      const data = await res.json();
      setMemories(data.memories || []);
    } catch {
      setMemories([]);
    } finally {
      setMemoriesLoading(false);
    }
  }, []);

  /* ─────────────────────────────────────────────────────────────────────────
     extractMemory — calls /api/memory/extract with the last conversation turn
  ───────────────────────────────────────────────────────────────────────── */
  const extractMemory = useCallback(async (userMsg, agentMsg, shouldAutoSave, customTag = 'Auto') => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/memory/extract`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userMessage: userMsg,
          agentResponse: agentMsg,
          projectId: activeProject,
          autoSave: shouldAutoSave,
          customTag: customTag,
        }),
      });
      const data = await res.json();

      if (!data.should_save) {
        // LLM decided this is not worth saving
        return;
      }

      if (shouldAutoSave && data.saved) {
        // Already saved on the backend — show rich success toast
        const catIcon  = data.categoryIcon  || '🧠';
        const catColor = data.categoryColor || '#0071E3';
        addToast(`${catIcon} Saved: "${data.title}" · ${data.category}`, 'success', 4500);
        refreshMemories();
        return;
      }

      // autoSave is OFF — show preview modal for user to confirm
      setMemoryPreview({ extraction: data, userMessage: userMsg, agentResponse: agentMsg });
    } catch (e) {
      console.warn('[MemoryExtract]', e);
    }
  }, [addToast, refreshMemories]);

  /* ─────────────────────────────────────────────────────────────────────────
     fetchStats — GET /api/stats (for Navbar memory count)
  ───────────────────────────────────────────────────────────────────────── */
  const fetchStats = useCallback(async () => {
    try {
      const res  = await fetch(`${import.meta.env.VITE_API_URL}/api/stats`);
      const data = await res.json();
      setStats(data);
    } catch { /* silent */ }
  }, []);

  const refreshProjects = useCallback(async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/projects`);
      const data = await res.json();
      setProjects(data.projects || []);
    } catch {
      setProjects([]);
    }
  }, []);

  const refreshSessions = useCallback(async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/conversations/${activeProject}`);
      const data = await res.json();
      setSessions(data.conversations || []);
    } catch {
      setSessions([]);
    }
  }, [activeProject]);

  const handleSessionSelect = useCallback(async (sessId) => {
    setIsLoading(true);
    addToast('Loading conversation history...', 'info');
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/conversations/session/${sessId}`);
      const data = await res.json();
      if (data.messages && data.messages.length > 0) {
        setMessages(data.messages);
        setSessionId(sessId);
        sessionStorage.setItem('sessionId', sessId);
        addToast('Conversation loaded successfully', 'success');
      } else {
        setMessages([{ id: 'welcome', role: 'agent', content: "No history found for this session." }]);
        setSessionId(sessId);
        sessionStorage.setItem('sessionId', sessId);
      }
    } catch {
      addToast('Failed to load conversation history', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [addToast]);

  const handleProjectSwitch = useCallback((projectId) => {
    setActiveProject(projectId);
    addToast(`Switched active project to ${projectId}`, 'success');
  }, [addToast]);

  const handleSettingsChange = useCallback((key, value) => {
    if (key === 'theme') {
      setTheme(value);
    } else if (key === 'defaultPersona') {
      setActivePersonaId(value);
      addToast(`Default persona set to ${value}`, 'success');
    }
  }, [addToast]);

  /* ─────────────────────────────────────────────────────────────────────────
     handleSearch — debounced via Sidebar internally; called on query change
  ───────────────────────────────────────────────────────────────────────── */
  const handleSearch = useCallback(async (query) => {
    setSearchQuery(query);
    if (!query.trim()) {
      refreshMemories();
      return;
    }
    setIsSearching(true);
    try {
      const res  = await fetch(`${import.meta.env.VITE_API_URL}/api/memories/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: query.trim() }),
      });
      const data = await res.json();
      setMemories(data.results ?? []);
    } catch {
      /* keep existing */
    } finally {
      setIsSearching(false);
    }
  }, [refreshMemories]);

  /* ─────────────────────────────────────────────────────────────────────────
     handleMemorySelect — injects a memory reference into chat
  ───────────────────────────────────────────────────────────────────────── */
  const handleMemorySelect = useCallback((memory) => {
    const title = extractTitle(memory);
    addToast(`📎 Referencing: "${title}"`, 'info');
  }, [addToast]);

  /* ─────────────────────────────────────────────────────────────────────────
     handleSubmit — SSE agent streaming
  ───────────────────────────────────────────────────────────────────────── */
  const handleSubmit = useCallback(async (task) => {
    if (!task?.trim() || isLoading) return;

    const userMsg = { id: Date.now(), role: 'user', content: task };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);
    setStreamSteps(['Initializing…']);
    setSidebarOpen(false);

    const encoded = encodeURIComponent(task);
    const eventSrc  = new EventSource(`${import.meta.env.VITE_API_URL}/api/agent?task=${encoded}&persona=${activePersonaId}&sessionId=${sessionId}&projectId=${activeProject}`);

    eventSrc.addEventListener('step', (e) => {
      setStreamSteps(prev => [...prev, e.data]);
    });

    eventSrc.addEventListener('done', async (e) => {
      eventSrc.close();
      const data = JSON.parse(e.data);
      const agentContent = data.response || data.error || 'No response received.';
      const agentMsg = {
        id: Date.now() + 1,
        role: 'agent',
        content: agentContent,
        retrievedMemories: data.retrievedMemories ?? [],
      };
      setMessages(prev => [...prev, agentMsg]);
      await refreshMemories();
      fetchStats();
      setIsLoading(false);
      setStreamSteps([]);

      // ── Trigger intelligent memory extraction (non-blocking) ──
      const currentAutoSave = autoSave;
      const currentChatTag = chatTag;
      setTimeout(() => {
        extractMemory(task, agentContent, currentAutoSave, currentChatTag);
      }, 800); // slight delay so UI settles first
    });

    eventSrc.addEventListener('error', (e) => {
      eventSrc.close();
      clearTimeout(timeoutId);
      let errMsg = '⚠️ Unable to reach the agent. Please check the server is running and try again.';
      if (e.data) {
        try {
          const parsed = JSON.parse(e.data);
          errMsg = '⚠️ ' + (parsed.error || 'Agent Error');
        } catch (err) {}
        addToast('Agent returned an error', 'error');
      } else {
        addToast('Agent unavailable — check the server is running', 'error');
      }

      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        role: 'agent',
        content: errMsg,
      }]);
      setIsLoading(false);
      setStreamSteps([]);
    });

    // Safety net: if no response in 45s, close the connection and show an error
    const timeoutId = setTimeout(() => {
      if (eventSrc.readyState !== EventSource.CLOSED) {
        eventSrc.close();
        addToast('Agent timed out — try again', 'error');
        setMessages(prev => [...prev, {
          id: Date.now() + 1,
          role: 'agent',
          content: '⏱️ The agent took too long to respond. This usually means the LLM API key is missing or the server is overloaded. Please check your .env file and try again.',
        }]);
        setIsLoading(false);
        setStreamSteps([]);
      }
    }, 120000);
  }, [isLoading, activePersonaId, refreshMemories, fetchStats, addToast, sessionId, chatTag, autoSave]);

  /* ─────────────────────────────────────────────────────────────────────────
     handleSuggestion — from ChatWindow empty-state chips
  ───────────────────────────────────────────────────────────────────────── */
  const handleSuggestion = useCallback((text) => {
    handleSubmit(text);
  }, [handleSubmit]);

  /* ─────────────────────────────────────────────────────────────────────────
     Demo helpers
  ───────────────────────────────────────────────────────────────────────── */
  const demoDelay = useCallback((ms) => {
    return new Promise((resolve) => {
      const id = setTimeout(resolve, ms);
      demoTimeoutsRef.current.push(id);
    });
  }, []);

  const sendDemoMessage = useCallback((task, personaId = 'architect') => {
    return new Promise((resolve) => {
      const userMsg = { id: Date.now(), role: 'user', content: task };
      setMessages(prev => [...prev, userMsg]);
      setIsLoading(true);
      setStreamSteps(['Initializing…']);

      const encoded   = encodeURIComponent(task);
      const eventSrc  = new EventSource(`${import.meta.env.VITE_API_URL}/api/agent?task=${encoded}&persona=${personaId}&sessionId=${sessionId}`);
      demoEventSourceRef.current = eventSrc;

      eventSrc.addEventListener('step',  (e) => setStreamSteps(prev => [...prev, e.data]));

      eventSrc.addEventListener('done', async (e) => {
        eventSrc.close();
        demoEventSourceRef.current = null;
        const data = JSON.parse(e.data);
        const agentMsg = {
          id: Date.now() + 1,
          role: 'agent',
          content: data.response || data.error || 'No response received.',
          retrievedMemories: data.retrievedMemories ?? [],
        };
        setMessages(prev => [...prev, agentMsg]);
        await refreshMemories();
        setIsLoading(false);
        setStreamSteps([]);
        resolve(data);
      });

      eventSrc.addEventListener('error', () => {
        eventSrc.close();
        demoEventSourceRef.current = null;
        setIsLoading(false);
        setStreamSteps([]);
        resolve({ error: 'connection error' });
      });
    });
  }, [refreshMemories]);

  const stopDemo = useCallback(() => {
    demoTimeoutsRef.current.forEach(clearTimeout);
    demoTimeoutsRef.current = [];
    if (demoEventSourceRef.current) {
      demoEventSourceRef.current.close();
      demoEventSourceRef.current = null;
    }
    setIsDemoRunning(false);
    setDemoStep(0);
    setIsLoading(false);
    setStreamSteps([]);
    setSidebarGlow(false);
  }, []);

  /* ─────────────────────────────────────────────────────────────────────────
     runDemo — automated 5-step showcase
  ───────────────────────────────────────────────────────────────────────── */
  const runDemo = useCallback(async () => {
    if (isDemoRunning) { stopDemo(); return; }

    setIsDemoRunning(true);
    demoTimeoutsRef.current = [];

    setMessages([{
      id: 'welcome', role: 'agent',
      content: "Hello! I'm SentientOS — your AI system orchestrator. Let me demonstrate how I remember architectural decisions...",
    }]);

    /* Step 1 */
    setDemoStep(1);
    await demoDelay(800);
    await sendDemoMessage("Set up the project with React and Tailwind, no Bootstrap");

    /* Step 2 */
    setDemoStep(2);
    await demoDelay(2000);
    await sendDemoMessage("Add a navigation bar with logo and 3 links");

    /* Step 3 — conflict detection */
    setDemoStep(3);
    await demoDelay(2000);
    await sendDemoMessage("Now add Bootstrap to style the navbar", 'architect');

    /* Step 4 — sidebar glow highlight */
    setDemoStep(4);
    await demoDelay(1500);
    setSidebarGlow(true);
    addToast('📌 Every decision above is stored here forever', 'success', 5000);

    /* Step 5 — finale */
    setDemoStep(5);
    await demoDelay(3500);
    setSidebarGlow(false);
    addToast('✅ Demo complete — I remembered Bootstrap was banned!', 'success', 5000);

    setIsDemoRunning(false);
    setDemoStep(0);
  }, [isDemoRunning, stopDemo, demoDelay, sendDemoMessage, addToast]);

  /* ─────────────────────────────────────────────────────────────────────────
     Save Decision handlers
  ───────────────────────────────────────────────────────────────────────── */
  const handleSaveDecision = async () => {
    if (!saveTitle.trim() || !saveContent.trim() || isSavingDecision) return;
    setIsSavingDecision(true);
    try {
      const today     = new Date().toISOString().split('T')[0];
      const finalTags = [...saveTags, 'type:manual', `date:${today}`];
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/memory`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: saveTitle.trim(), content: saveContent.trim(), tags: finalTags }),
      });
      if (!res.ok) throw new Error('Failed');
      addToast('✓ Decision saved to memory', 'success');
      setSaveTitle('');
      setSaveContent('');
      setSaveTags([]);
      setCurrentTagInput('');
      await refreshMemories();
      fetchStats();
    } catch {
      addToast('Failed to save decision', 'error');
    } finally {
      setIsSavingDecision(false);
    }
  };

  const handleTagKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const newTag = currentTagInput.trim().replace(/^,+|,+$/g, '');
      if (newTag && !saveTags.includes(newTag)) setSaveTags(prev => [...prev, newTag]);
      setCurrentTagInput('');
    }
  };

  const removeTag = (tag) => setSaveTags(prev => prev.filter(t => t !== tag));

  /* ─────────────────────────────────────────────────────────────────────────
     Export report
  ───────────────────────────────────────────────────────────────────────── */
  const handleExportReport = async () => {
    if (isExporting) return;
    setIsExporting(true);
    try {
      const res  = await fetch(`${import.meta.env.VITE_API_URL}/api/memories?limit=100`);
      const data = await res.json();
      setExportMemories(data.memories || []);
      setTimeout(() => { window.print(); setIsExporting(false); }, 300);
    } catch {
      addToast('Failed to export report', 'error');
      setIsExporting(false);
    }
  };

  /* ─────────────────────────────────────────────────────────────────────────
     On mount: fetch data, set up keyboard shortcuts
  ───────────────────────────────────────────────────────────────────────── */
  /* ── Initial boot: show loader briefly, then dismiss regardless of API ── */
  useEffect(() => {
    setIsAppLoading(true);
    // Always dismiss loader after 2.5 s maximum (safety net if backend is slow)
    const safetyTimer = setTimeout(() => setIsAppLoading(false), 2500);
    refreshMemories().finally(() => {
      clearTimeout(safetyTimer);
      setIsAppLoading(false);
    });
    fetchStats();
    refreshProjects();
    refreshSessions();
    fetchIdentity();
    const statsInterval = setInterval(fetchStats, 30000);
    return () => {
      clearTimeout(safetyTimer);
      clearInterval(statsInterval);
    };
  }, [refreshMemories, fetchStats, refreshProjects, refreshSessions, fetchIdentity]);

  useEffect(() => {
    refreshMemories();
    refreshSessions();
  }, [activeProject, refreshMemories, refreshSessions]);

  /* Keyboard shortcuts */
  useEffect(() => {
    const onKeyDown = (e) => {
      const meta = e.metaKey || e.ctrlKey;

      /* Cmd+D → Demo */
      if (meta && e.key === 'd') {
        e.preventDefault();
        runDemo();
      }
      /* Cmd+S → Save decision */
      if (meta && e.key === 's') {
        e.preventDefault();
        setIsSaveModalOpen(true);
      }
      /* Cmd+E → Export */
      if (meta && e.key === 'e') {
        e.preventDefault();
        handleExportReport();
      }
      /* Cmd+1–4 → switch persona */
      if (meta && ['1','2','3','4'].includes(e.key)) {
        e.preventDefault();
        const persona = PERSONAS[parseInt(e.key) - 1];
        if (persona) setActivePersonaId(persona.id);
      }
      /* ? → shortcuts modal (no modifier, not in input) */
      if (e.key === '?' && !meta && !e.target.closest('input, textarea')) {
        setShowShortcuts(true);
      }
      /* Esc → close any open modal */
      if (e.key === 'Escape') {
        setShowShortcuts(false);
        setIsSaveModalOpen(false);
        setIsStandupOpen(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [runDemo]);

  /* ─────────────────────────────────────────────────────────────────────────
     Derived
  ───────────────────────────────────────────────────────────────────────── */
  const activePersona = PERSONAS.find(p => p.id === activePersonaId) || PERSONAS[0];
  const panelBase = {
    background: 'var(--white)',
    border: '1px solid var(--border)',
    boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
    display: 'flex', flexDirection: 'column',
    overflow: 'hidden',
  };

  /* ═══════════════════════════════════════════════════════════════════════════
     Render
  ══════════════════════════════════════════════════════════════════════════ */
  return (
    <div className="app-grid" style={{
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif",
    }}>
      {/* ── Full-page app boot loader ─────────────────────────────────────── */}
      {isAppLoading && <AppLoader message="Loading your memories…" />}

      {/* ── Toasts ───────────────────────────────────────────────────────── */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />

      {/* ── Keyboard Shortcuts Modal ──────────────────────────────────────── */}
      {showShortcuts && <ShortcutsModal onClose={() => setShowShortcuts(false)} />}

      {/* ── Onboarding Modal ─────────────────────────────────────────────── */}
      {showOnboarding && (
        <OnboardingModal
          onComplete={() => {
            localStorage.setItem('onboarded', 'true');
            setShowOnboarding(false);
            addToast('Welcome aboard! Try the Demo button to see it in action.', 'success', 5000);
          }}
        />
      )}

      {/* ── Navbar (ZONE 1) ──────────────────────────────────────────── */}
      <div className="zone-navbar">
        <Navbar
          activeProject={activeProject}
          totalMemories={stats.totalMemories ?? memories.length}
          activePersona={activePersona}
          theme={theme}
          onToggleTheme={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
          onOpenShortcuts={() => setShowShortcuts(true)}
          onOpenStandup={() => setIsStandupOpen(true)}
          onDemoClick={runDemo}
          isDemoRunning={isDemoRunning}
          demoStep={demoStep}
          onToggleSidebar={() => setSidebarOpen(o => !o)}
          identity={identity}
        />
      </div>


      {/* ── Standup Modal ─────────────────────────────────────────────────── */}
      <StandupPanel
        open={isStandupOpen}
        onClose={() => setIsStandupOpen(false)}
        messages={messages}
      />

      {/* ── Mobile sidebar overlay ───────────────────────────────────────── */}
      <div
        className="sidebar-overlay"
        onClick={() => setSidebarOpen(false)}
        style={{
          display: 'none',
          position: 'fixed', inset: 0, top: 56,
          background: 'rgba(0,0,0,0.35)',
          zIndex: 199,
          opacity: sidebarOpen ? 1 : 0,
          pointerEvents: sidebarOpen ? 'auto' : 'none',
          transition: 'opacity 0.25s ease',
        }}
      />

      {/* ── Save Decision Modal ───────────────────────────────────────────── */}
      <Modal
        open={isSaveModalOpen}
        onClose={() => setIsSaveModalOpen(false)}
        title="Save Decision"
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsSaveModalOpen(false)}>Cancel</Button>
            <Button
              variant="primary"
              onClick={async () => { await handleSaveDecision(); setIsSaveModalOpen(false); }}
              disabled={isSavingDecision || !saveTitle.trim() || !saveContent.trim()}
              loading={isSavingDecision}
            >
              Save to Memory
            </Button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Input
            label="Decision Title"
            placeholder="e.g., Use Postgres instead of Mongo"
            value={saveTitle}
            onChange={e => setSaveTitle(e.target.value)}
            disabled={isSavingDecision}
          />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--gray-mid)', fontFamily: 'var(--font)' }}>
              Decision Content
            </label>
            <textarea
              placeholder="Explain the reasoning..."
              value={saveContent}
              onChange={e => setSaveContent(e.target.value)}
              disabled={isSavingDecision}
              rows={4}
              style={{
                width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)',
                border: '1.5px solid var(--border)', fontSize: 15, outline: 'none',
                background: 'var(--white)', boxSizing: 'border-box', resize: 'vertical',
                fontFamily: 'inherit', transition: 'border-color 0.15s ease', color: 'var(--black)',
              }}
              onFocus={e  => e.target.style.borderColor = 'var(--blue)'}
              onBlur={e   => e.target.style.borderColor = 'var(--border)'}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--gray-mid)', fontFamily: 'var(--font)' }}>
              Tags (press Enter to add)
            </label>
            <div style={{
              display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center',
              background: 'var(--white)', border: '1.5px solid var(--border)',
              borderRadius: 'var(--radius-md)', padding: '6px 10px',
              minHeight: 42, boxSizing: 'border-box',
            }}>
              {saveTags.map(tag => (
                <div key={tag} style={{
                  background: 'var(--blue-light)', color: 'var(--blue)',
                  padding: '4px 10px', borderRadius: 'var(--radius-pill)',
                  fontSize: 13, display: 'flex', alignItems: 'center', gap: 6, fontWeight: 500,
                }}>
                  {tag}
                  <button onClick={() => removeTag(tag)} disabled={isSavingDecision} style={{
                    background: 'none', border: 'none', color: 'var(--blue)',
                    padding: 0, cursor: 'pointer', display: 'flex', alignItems: 'center',
                  }}>
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                      <path d="M2.5 2.5L7.5 7.5M7.5 2.5L2.5 7.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                    </svg>
                  </button>
                </div>
              ))}
              <input
                type="text"
                placeholder={saveTags.length === 0 ? 'Add tags…' : ''}
                value={currentTagInput}
                onChange={e => setCurrentTagInput(e.target.value)}
                onKeyDown={handleTagKeyDown}
                disabled={isSavingDecision}
                style={{
                  border: 'none', outline: 'none', background: 'transparent',
                  fontSize: 14, flex: 1, minWidth: 80, fontFamily: 'var(--font)', color: 'var(--black)',
                }}
              />
            </div>
          </div>
        </div>
      </Modal>

      {/* ── ZONE 3A — Memory Sidebar ───────────────────────────────────── */}
      <div className="zone-sidebar">
        <Sidebar
          open={sidebarOpen}
          memories={memories}
          sessions={sessions}
          projects={projects}
          activeProject={activeProject}
          stats={stats}
          isLoading={memoriesLoading || isSearching}
          onRefresh={refreshMemories}
          onSaveDecisionClick={() => setIsSaveModalOpen(true)}
          onSearch={handleSearch}
          onMemorySaved={refreshMemories}
          onSessionSelect={handleSessionSelect}
          onProjectSwitch={handleProjectSwitch}
          onSettingsChange={handleSettingsChange}
          className={sidebarGlow ? 'sidebar-glow' : ''}
        />
      </div>

      <Outlet context={{
        messages,
        isLoading,
        streamSteps,
        activePersonaId,
        PERSONAS,
        setActivePersonaId,
        handleSuggestion,
        handleSubmit,
        activeProject,
        refreshMemories,
        panelBase,
        memories,
        memoriesLoading,
        stats,
        sessions,
        projects,
        onRefresh: refreshMemories,
        onSessionSelect: handleSessionSelect,
        onProjectSwitch: handleProjectSwitch,
        onSettingsChange: handleSettingsChange,
        theme,
        setTheme,
        identity,
        autoSave,
        toggleAutoSave,
        extractMemory,
        chatTag,
        setChatTag,
      }} />

      {/* ── Memory Preview Modal (auto-save OFF path) ────────────────────── */}
      {memoryPreview && (
        <MemoryPreviewModal
          extraction={memoryPreview.extraction}
          isSaving={isSavingPreview}
          onSkip={() => setMemoryPreview(null)}
          onSave={async (edited) => {
            setIsSavingPreview(true);
            try {
              const res = await fetch(`${import.meta.env.VITE_API_URL}/api/memory/save-confirmed`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  title:     edited.title,
                  content:   edited.content,
                  category:  edited.category,
                  projectId: 'default-project',
                  source:    'agent',
                }),
              });
              const data = await res.json();
              if (data.success) {
                const catMeta = {
                  'Architecture Decision': { icon: '🏗️' }, 'Bug Fix': { icon: '🐛' },
                  'Coding Standard': { icon: '📐' }, 'Deployment History': { icon: '🚀' },
                  'Feature Request': { icon: '✨' }, 'Team Discussion': { icon: '💬' },
                  'Documentation Update': { icon: '📄' },
                };
                const icon = catMeta[edited.category]?.icon || '🧠';
                const ts   = new Date(data.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
                addToast(`${icon} Memory Saved! · ${edited.category} · ${ts}`, 'success', 5000);
                refreshMemories();
              } else {
                addToast('Failed to save memory', 'error');
              }
            } catch (e) {
              addToast('Failed to save memory', 'error');
            } finally {
              setIsSavingPreview(false);
              setMemoryPreview(null);
            }
          }}
        />
      )}

      {/* ── CSS: animations, sidebar drawer, demo glow, print ───────────── */}
      <style>{`
        @keyframes demoPulse {
          0%, 100% { box-shadow: 0 4px 16px rgba(0,113,227,0.40); }
          50%       { box-shadow: 0 4px 28px rgba(0,113,227,0.75), 0 0 0 4px rgba(0,113,227,0.18); }
        }
        @keyframes sidebarGlowPulse {
          0%, 100% { box-shadow: 0 0 0 2px var(--blue), 0 0 24px 6px rgba(0,113,227,0.30); }
          50%       { box-shadow: 0 0 0 4px var(--blue), 0 0 48px 14px rgba(0,113,227,0.55); }
        }
        .sidebar-glow {
          border: 2px solid var(--blue) !important;
          animation: sidebarGlowPulse 1.2s ease-in-out infinite !important;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        @media (max-width: 768px) {
          .mobile-menu-btn { display: flex !important; }
          .sidebar-panel {
            position: fixed !important;
            top: 56px !important; left: 0 !important; bottom: 0 !important;
            width: 85vw !important; max-width: 340px !important;
            border-radius: 0 18px 18px 0 !important;
            z-index: 200;
            transform: translateX(-100%);
            transition: transform 0.28s cubic-bezier(0.4,0,0.2,1);
            box-shadow: 4px 0 24px rgba(0,0,0,0.14) !important;
          }
          .sidebar-panel.open { transform: translateX(0) !important; }
          .sidebar-overlay    { display: block !important; }
          .layout-panels      { padding: 10px !important; gap: 0 !important; }
          .chat-panel         { border-radius: 14px !important; }
        }

        /* ── Print report ── */
        @media print {
          body, html { margin: 0; padding: 0; }
          body > *   { visibility: hidden; }
          #print-report {
            display: block !important; visibility: visible !important;
            position: fixed; inset: 0; z-index: 99999;
            background: var(--white); overflow: auto;
            font-family: 'Inter', -apple-system, sans-serif;
            color: var(--black); padding: 36px 48px;
          }
          #print-report * { visibility: visible !important; }
          .print-header { border-bottom: 2px solid var(--blue); padding-bottom: 18px; margin-bottom: 28px; }
          .print-header h1 { margin: 0 0 6px; font-size: 26px; font-weight: 800; color: var(--blue); }
          .print-header p  { margin: 0; font-size: 13px; color: var(--gray-mid); }
          .print-memory    { break-inside: avoid; border: 1px solid var(--border); border-radius: 10px; padding: 18px 22px; margin-bottom: 18px; }
          .print-memory h2 { margin: 0 0 4px; font-size: 15px; font-weight: 700; color: var(--black); }
          .print-memory .print-date    { font-size: 11px; color: var(--gray-mid); margin-bottom: 10px; }
          .print-memory .print-content { font-size: 13px; line-height: 1.7; color: #3A3A3C; white-space: pre-wrap; }
          .print-memory .print-tags    { display: flex; flex-wrap: wrap; gap: 5px; margin-top: 10px; }
          .print-memory .print-tag     { font-size: 10px; font-weight: 600; padding: 2px 8px; border-radius: 99px; background: var(--blue-light); color: var(--blue); }
          .print-footer { position: fixed; bottom: 24px; left: 48px; right: 48px; display: flex; justify-content: space-between; font-size: 10px; color: var(--gray-mid); border-top: 1px solid var(--border); padding-top: 8px; }
          @page { margin: 0; size: A4; }
        }
      `}</style>

      {/* ── Hidden print report ───────────────────────────────────────────── */}
      <div id="print-report" style={{ display: 'none' }}>
        <div className="print-header">
          <h1>SentientOS — Decision Log</h1>
          <p>
            {activeProject}&nbsp;·&nbsp;
            Exported on {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        {exportMemories.length === 0 ? (
          <p style={{ color: 'var(--gray-mid)', fontStyle: 'italic' }}>No memories found.</p>
        ) : (
          exportMemories.map((m, i) => {
            const title   = extractTitle(m);
            const date    = extractDate(m);
            const content = m.content || (m.messages?.[0]?.content) || extractContent(m);
            const tags    = Array.isArray(m.tag?.tags) ? m.tag.tags
              : typeof m.tag === 'object' && m.tag
                ? Object.entries(m.tag)
                    .filter(([k]) => !['timestamp','project'].includes(k))
                    .map(([k, v]) => `${k}: ${v}`)
                : [];
            return (
              <div key={m.id || i} className="print-memory">
                <h2>{title}</h2>
                {date && <div className="print-date">{date}</div>}
                <div className="print-content">{content}</div>
                {tags.length > 0 && (
                  <div className="print-tags">
                    {tags.map((t, j) => <span key={j} className="print-tag">{t}</span>)}
                  </div>
                )}
              </div>
            );
          })
        )}
        <div className="print-footer">
          <span>SR Enterprises · Rayyan Shaikh</span>
          <span>SentientOS Decision Log</span>
          <span>{new Date().toLocaleDateString()}</span>
        </div>
      </div>

    </div>
  );
}
