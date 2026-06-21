import { useState, useRef, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import Button from '../components/ui/Button';

export default function DemoPage() {
  const { panelBase } = useOutletContext();
  const [logs, setLogs] = useState([]);
  const [sessionId, setSessionId] = useState(`demo-sess-${Date.now()}`);
  const [loadingStep, setLoadingStep] = useState(null);
  const [latestMemories, setLatestMemories] = useState([]);
  const [latestResponse, setLatestResponse] = useState("");
  
  const scrollRef = useRef(null);

  // Auto-scroll logs
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  const addLog = (title, content, type = 'info') => {
    setLogs(prev => [...prev, { id: Date.now(), title, content, type, time: new Date().toLocaleTimeString() }]);
  };

  // --- Actions ---

  // 1. Save Architecture Decision
  const handleSaveAdr = async () => {
    setLoadingStep(1);
    addLog('System', 'Initiating POST /api/adr...', 'system');
    
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/adr`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: "Database and Backend Framework Choice",
          problem: "Need a fast backend and robust relational database for the MVP.",
          solution: "Use FastAPI and PostgreSQL.",
          reasoning: "FastAPI provides async support and auto-docs. PostgreSQL offers ACID compliance.",
          alternatives: "Node.js / MongoDB",
          author: "Lead Architect"
        }),
      });
      const data = await res.json();
      if (data.success) {
        addLog('Memory Core', `Successfully saved ADR to Parcle Vector Store. Memory ID: ${data.memory_id}`, 'success');
      }
    } catch (e) {
      addLog('Error', String(e), 'error');
    }
    setLoadingStep(null);
  };

  // 2. Start New Session
  const handleNewSession = () => {
    const newId = `demo-sess-${Date.now()}`;
    setSessionId(newId);
    setLatestMemories([]);
    setLatestResponse("");
    addLog('Session Manager', `Cleared local chat context. Generated new Session ID: ${newId}. The AI now has ZERO local context.`, 'system');
  };

  // 3. Ask New Question
  const handleAskQuestion = async () => {
    setLoadingStep(3);
    const question = "What backend and database are we using?";
    addLog('User', question, 'user');
    addLog('System', `Sending POST /api/agent with Session ID: ${sessionId}...`, 'system');
    
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/agent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          task: question,
          persona: "architect",
          projectId: "default-project",
          sessionId: sessionId
        }),
      });

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let done = false;
      let finalAgentResponse = "";
      let mems = [];

      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        if (value) {
          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');
          for (let i = 0; i < lines.length; i++) {
            if (lines[i].startsWith('data: ')) {
              try {
                const data = JSON.parse(lines[i].substring(6));
                if (data.response) {
                  finalAgentResponse = data.response;
                  if (data.retrievedMemories) mems = data.retrievedMemories;
                }
              } catch (e) {}
            }
          }
        }
      }
      
      setLatestResponse(finalAgentResponse);
      setLatestMemories(mems);
      addLog('Agent', finalAgentResponse, 'agent');

    } catch (e) {
      addLog('Error', String(e), 'error');
    }
    setLoadingStep(null);
  };

  // 4. Show Retrieved Memory
  const handleShowMemory = () => {
    if (latestMemories.length === 0) {
      addLog('Memory Core', 'No memories were retrieved in the last request.', 'warning');
      return;
    }
    
    const memStr = latestMemories.map(m => `• ${m.title} (Confidence: ${m.confidence}%)`).join('\n');
    addLog('Parcle Retrieval', `The following memories were injected into the LLM context before generation:\n\n${memStr}`, 'info');
  };

  // 5. Generate Code
  const handleGenerateCode = async () => {
    setLoadingStep(5);
    const question = "Generate the connection setup code for our database based on our architecture decisions.";
    addLog('User', question, 'user');
    addLog('System', `Sending POST /api/agent...`, 'system');
    
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/agent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          task: question,
          persona: "architect",
          projectId: "default-project",
          sessionId: sessionId
        }),
      });

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let done = false;
      let finalAgentResponse = "";

      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        if (value) {
          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');
          for (let i = 0; i < lines.length; i++) {
            if (lines[i].startsWith('data: ')) {
              try {
                const data = JSON.parse(lines[i].substring(6));
                if (data.response) finalAgentResponse = data.response;
              } catch (e) {}
            }
          }
        }
      }
      
      setLatestResponse(finalAgentResponse);
      addLog('Agent', finalAgentResponse, 'agent');

    } catch (e) {
      addLog('Error', String(e), 'error');
    }
    setLoadingStep(null);
  };

  // 6. Show Reasoning Trace
  const handleShowTrace = () => {
    if (!latestResponse) {
      addLog('System', 'No agent response to analyze.', 'warning');
      return;
    }
    
    // Extract everything after ### Reasoning Trace
    const traceMatch = latestResponse.split('### Reasoning Trace');
    if (traceMatch.length < 2) {
      addLog('Analysis', 'The LLM did not append a structured Reasoning Trace.', 'warning');
    } else {
      addLog('Reasoning Trace Highlight', '### Reasoning Trace\n' + traceMatch[1].trim(), 'highlight');
    }
  };


  return (
    <div style={{ ...panelBase, display: 'flex', height: '100%' }}>
      
      {/* LEFT PANEL: Controls */}
      <div style={{ 
        width: 380, borderRight: '1px solid var(--border)', background: 'var(--sidebar-bg)', 
        padding: '32px 24px', display: 'flex', flexDirection: 'column', gap: 24, overflowY: 'auto'
      }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, margin: '0 0 8px 0', color: 'var(--black)' }}>
            🏆 Judge Demo
          </h1>
          <p style={{ margin: 0, color: 'var(--gray-dark)', fontSize: 14, lineHeight: 1.5 }}>
            Execute these steps in order to demonstrate global memory persistence, retrieval, and reasoning capabilities.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <DemoButton 
            num={1} title="Save Architecture Decision" desc="Saves a mock decision (FastAPI & Postgres) to Parcle."
            onClick={handleSaveAdr} loading={loadingStep === 1} 
          />
          <DemoButton 
            num={2} title="Start New Session" desc="Clears local context. Proves the AI relies on global memory."
            onClick={handleNewSession} 
          />
          <DemoButton 
            num={3} title="Ask New Question" desc="Asks 'What backend and database are we using?' with 0 local context."
            onClick={handleAskQuestion} loading={loadingStep === 3}
          />
          <DemoButton 
            num={4} title="Show Retrieved Memory" desc="Displays the exact vectors Parcle injected into the LLM prompt."
            onClick={handleShowMemory} 
          />
          <DemoButton 
            num={5} title="Generate Code" desc="Asks the AI to write connection code based on the architecture."
            onClick={handleGenerateCode} loading={loadingStep === 5}
          />
          <DemoButton 
            num={6} title="Show Reasoning Trace" desc="Extracts the LLM's justification for its generated solution."
            onClick={handleShowTrace} 
          />
        </div>
      </div>

      {/* RIGHT PANEL: Output Logs */}
      <div style={{ flex: 1, background: '#1E1E1E', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '16px 24px', borderBottom: '1px solid #333', background: '#252526', color: '#ccc', fontSize: 13, fontFamily: 'monospace' }}>
          SentientOS ~ Memory Core Live Logs
        </div>
        
        <div ref={scrollRef} style={{ flex: 1, padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {logs.length === 0 ? (
            <div style={{ color: '#666', fontFamily: 'monospace', fontSize: 14 }}>Waiting for actions...</div>
          ) : (
            logs.map(log => (
              <LogBlock key={log.id} log={log} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function DemoButton({ num, title, desc, onClick, loading }) {
  return (
    <div 
      onClick={!loading ? onClick : undefined}
      style={{ 
        background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: 12, 
        padding: 16, cursor: loading ? 'wait' : 'pointer', transition: 'all 0.2s',
        boxShadow: 'var(--shadow-sm)', opacity: loading ? 0.7 : 1
      }}
      onMouseOver={e => !loading && (e.currentTarget.style.borderColor = 'var(--blue)')}
      onMouseOut={e => !loading && (e.currentTarget.style.borderColor = 'var(--border)')}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
        <div style={{ 
          width: 24, height: 24, borderRadius: '50%', background: 'var(--blue)', color: 'white', 
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700 
        }}>
          {num}
        </div>
        <div style={{ fontWeight: 600, fontSize: 15, color: 'var(--black)' }}>
          {title} {loading && <span style={{ fontSize: 12, fontWeight: 400, color: 'var(--gray-dark)' }}>(running...)</span>}
        </div>
      </div>
      <div style={{ fontSize: 13, color: 'var(--gray-dark)', paddingLeft: 36, lineHeight: 1.4 }}>
        {desc}
      </div>
    </div>
  );
}

function LogBlock({ log }) {
  let color = '#ccc';
  let bg = '#252526';
  let border = '#333';
  let icon = 'ℹ️';

  if (log.type === 'user') { color = '#4AF626'; icon = '🧑‍💻'; }
  else if (log.type === 'agent') { color = '#58A6FF'; icon = '🤖'; }
  else if (log.type === 'success') { color = '#3FB950'; icon = '✅'; }
  else if (log.type === 'error') { color = '#F85149'; icon = '❌'; bg = '#3d1c1c'; border = '#F85149'; }
  else if (log.type === 'system') { color = '#8B949E'; icon = '⚙️'; }
  else if (log.type === 'highlight') { color = '#D2A8FF'; icon = '✨'; bg = 'rgba(210,168,255,0.1)'; border = '#D2A8FF'; }

  return (
    <div style={{ 
      background: bg, border: `1px solid ${border}`, borderRadius: 8, padding: 16,
      fontFamily: 'SFMono-Regular, Consolas, monospace', fontSize: 13, color
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, opacity: 0.8, fontSize: 12 }}>
        <span style={{ fontWeight: 600 }}>{icon} {log.title}</span>
        <span>{log.time}</span>
      </div>
      <div style={{ lineHeight: 1.5, whiteSpace: 'pre-wrap', color: log.type === 'highlight' ? '#E6EDF3' : color }}>
        {log.type === 'agent' || log.type === 'highlight' ? (
          <div className="markdown-body" style={{ background: 'transparent', color: 'inherit', fontSize: 'inherit' }}>
            <ReactMarkdown>{log.content}</ReactMarkdown>
          </div>
        ) : (
          log.content
        )}
      </div>
    </div>
  );
}
