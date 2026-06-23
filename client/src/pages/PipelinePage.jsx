import { useState } from 'react';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';

export default function PipelinePage() {
  const [activeStep, setActiveStep] = useState(0);
  const [isPipelineRunning, setIsPipelineRunning] = useState(true);
  const [webhookStatus, setWebhookStatus] = useState('');

  const testGitHubWebhook = async () => {
    setWebhookStatus('Testing GitHub PR Webhook (Code Style Enforcer)...');
    try {
      const res = await fetch('http://localhost:3002/api/webhooks/github/pr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: "Update index styling",
          diff: "+ body { margin: 0px; }\n- body { margin: 10px; }"
        })
      });
      const data = await res.json();
      setWebhookStatus(data.message || 'Success! Code Style Enforced.');
    } catch (err) {
      setWebhookStatus('Error: ' + err.message);
    }
  };

  const testProduckWebhook = async () => {
    setWebhookStatus('Testing Produck Webhook (Zero-Sync Debugger)...');
    try {
      const res = await fetch('http://localhost:3002/api/webhooks/produck/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: "Crash on mobile layout",
          description: "When I open the menu on mobile, it overlaps the header."
        })
      });
      const data = await res.json();
      setWebhookStatus(data.message || 'Success! Patch generated.');
    } catch (err) {
      setWebhookStatus('Error: ' + err.message);
    }
  };

  const testStandupWebhook = async () => {
    setWebhookStatus('Generating Daily Standup (Standup Summarizer)...');
    try {
      const res = await fetch('http://localhost:3002/api/standup/today', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });
      const data = await res.json();
      setWebhookStatus(data.summary || data.error || 'Success! Standup recorded.');
    } catch (err) {
      setWebhookStatus('Error: ' + err.message);
    }
  };

  const testOnboardingWebhook = async () => {
    setWebhookStatus('Generating Developer Onboarding (Onboarding Bot)...');
    try {
      const res = await fetch('http://localhost:3002/api/webhooks/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ developer: "Alice" })
      });
      const data = await res.json();
      setWebhookStatus(data.message || 'Success! Onboarding generated.');
    } catch (err) {
      setWebhookStatus('Error: ' + err.message);
    }
  };

  const testErrorLogWebhook = async () => {
    setWebhookStatus('Archiving Server Crash Log (Error Log Archivist)...');
    try {
      const res = await fetch('http://localhost:3002/api/webhooks/server/error', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trace: "TypeError: undefined is not an object (evaluating 'user.profile.id')" })
      });
      const data = await res.json();
      setWebhookStatus(data.message || 'Success! Error archived.');
    } catch (err) {
      setWebhookStatus('Error: ' + err.message);
    }
  };

  const testAutoDocsWebhook = async () => {
    setWebhookStatus('Updating Documentation (Documentation Helper)...');
    try {
      const res = await fetch('http://localhost:3002/api/webhooks/github/push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ diff: "+ function addAuth() { ... }" })
      });
      const data = await res.json();
      setWebhookStatus(data.message || 'Success! Documentation updated.');
    } catch (err) {
      setWebhookStatus('Error: ' + err.message);
    }
  };

  const testCleanupWebhook = async () => {
    setWebhookStatus('Scanning for Dead Code (Repo Cleanup Bot)...');
    try {
      const res = await fetch('http://localhost:3002/api/webhooks/github/cleanup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ file: "import { unusedVariable } from 'test';\nconst x = 5;" })
      });
      const data = await res.json();
      setWebhookStatus(data.message || 'Success! Cleanup patch suggested.');
    } catch (err) {
      setWebhookStatus('Error: ' + err.message);
    }
  };

  const steps = [
    { name: 'User Request Reception', status: 'completed', duration: '10ms', desc: 'Capture user task or architectural question from the interface.', logs: ['[Info] Received incoming prompt via websocket', '[Info] Parsing attached files/context', '[Success] User intent identified'] },
    { name: 'Memory Retrieval', status: 'completed', duration: '150ms', desc: 'Query Parcle system for past architectural decisions, bugs, and context.', logs: ['[Info] Extracting semantic keywords', '[Info] Querying Parcle vector index', '[Success] Retrieved 3 relevant memory clusters'] },
    { name: 'Context Injection', status: 'completed', duration: '25ms', desc: 'Format the prompt, injecting the retrieved memories into the system instructions.', logs: ['[Info] Formatting memory blocks', '[Info] Applying persona constraints', '[Success] Context injection complete'] },
    { name: 'Agent Reasoning', status: 'active', duration: 'Running', desc: 'Gemini AI evaluates the context and user request to generate a structured response.', logs: ['[Info] Sending payload to Gemini API', '[Info] Receiving text stream...', '[Info] Validating code outputs against previous decisions'] },
    { name: 'Decision Extraction', status: 'pending', duration: 'Waiting', desc: 'Identify key architectural or technical decisions from the generated response.', logs: ['[Info] Queueing post-processing analyzer...'] },
    { name: 'Permanent Storage', status: 'pending', duration: 'Waiting', desc: 'Write the newly extracted decisions back into Parcle memory for future use.', logs: ['[Info] Waiting for finalized decision tags...'] }
  ];

  return (
    <div 
      className="main-content-page"
      style={{
        gridColumn: 2,
        gridRow: '2 / 4',
        padding: '32px 40px',
        overflowY: 'auto',
        background: 'linear-gradient(135deg, #fdfdfd 0%, #f4f5f7 100%)',
        display: 'flex',
        flexDirection: 'column',
        gap: 24,
      }}
    >
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--black)', margin: '0 0 4px 0' }}>Orchestration Pipeline</h1>
          <p style={{ fontSize: 13, color: 'var(--gray-mid)', margin: 0 }}>Monitor real-time agent reasoning and memory orchestration</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Button 
            variant={isPipelineRunning ? 'danger' : 'primary'} 
            size="sm" 
            onClick={() => setIsPipelineRunning(!isPipelineRunning)}
          >
            {isPipelineRunning ? '🛑 Stop Pipeline' : '▶ Start Pipeline'}
          </Button>
          <Button variant="secondary" size="sm" onClick={() => window.location.reload()}>
            🔄 Refresh Status
          </Button>
        </div>
      </div>

      {!isPipelineRunning ? (
        /* Idle Pipeline Empty State */
        <div style={{
          background: 'var(--white)',
          border: '1px solid var(--border)',
          borderRadius: 12,
          padding: '60px 20px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          gap: 16
        }}>
          {/* Top: SVG Check Circle */}
          <div style={{ color: '#34C759', width: 56, height: 56, background: '#E8F8EF', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--black)', margin: '0 0 6px 0' }}>Idle Pipeline</h2>
            <p style={{ fontSize: 13, color: 'var(--gray-mid)', margin: 0, maxWidth: 320, lineHeight: 1.4 }}>
              Waiting for new code commits or documentation logs...
            </p>
          </div>
          <Button variant="primary" size="md" onClick={() => setIsPipelineRunning(true)}>
            Start Ingestion
          </Button>
        </div>
      ) : (
        /* Grid Content */
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 24 }}>
        
        {/* Left Side: Pipeline Steps visual */}
        <div style={{ background: 'var(--white)', border: '2px solid var(--border)', borderRadius: 'var(--radius-card)', padding: 24, boxShadow: 'var(--shadow-md)' }}>
          <h2 style={{ fontSize: 15, fontWeight: 600, color: 'var(--black)', marginBottom: 16 }}>Agent Workflow Status</h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20, position: 'relative' }}>
            {/* Visual connector line */}
            <div style={{ position: 'absolute', left: 28, top: 12, bottom: 12, width: 2, background: 'var(--border)', zIndex: 0 }} />

            {steps.map((step, idx) => {
              const isActive = activeStep === idx;
              const isCompleted = step.status === 'completed';
              const isStepActive = step.status === 'active';
              
              let dotBg = 'var(--border)';
              let dotBorder = 'none';
              if (isCompleted) dotBg = 'var(--blue)';
              else if (isStepActive) {
                dotBg = 'var(--white)';
                dotBorder = '3px solid var(--blue)';
              }

              return (
                <div 
                  key={step.name} 
                  onClick={() => setActiveStep(idx)}
                  style={{
                    display: 'flex', gap: 16, cursor: 'pointer', zIndex: 1, position: 'relative',
                    padding: '8px 12px', borderRadius: 8,
                    background: isActive ? 'var(--gray-light)' : 'transparent',
                    border: isActive ? '1px solid var(--border)' : '1px solid transparent',
                    transition: 'all 0.2s'
                  }}
                >
                  {/* Step Dot */}
                  <div style={{
                    width: 32, height: 32, borderRadius: '50%', background: dotBg, border: dotBorder,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', color: isCompleted ? 'var(--white)' : 'var(--gray-mid)',
                    fontWeight: 600, fontSize: 13, flexShrink: 0
                  }}>
                    {isCompleted ? '✓' : idx + 1}
                  </div>

                  {/* Text */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--black)' }}>{step.name}</span>
                      {isStepActive && <Badge color="yellow">Active</Badge>}
                      {isCompleted && <Badge color="green">Done</Badge>}
                    </div>
                    <span style={{ fontSize: 11, color: 'var(--gray-mid)' }}>Duration: {step.duration}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Side: Step logs and description details */}
        <div style={{ flex: 1, background: '#111214', display: 'flex', flexDirection: 'column', borderRadius: 'var(--radius-card)', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)', boxShadow: 'var(--shadow-lg)' }}>
          <div style={{ padding: '14px 20px', borderBottom: '1px solid rgba(255,255,255,0.08)', background: '#1A1C20', color: '#8b949e', fontSize: 12, fontFamily: 'monospace', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#FF5F56' }} />
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#FFBD2E' }} />
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#27C93F' }} />
              <span style={{ marginLeft: 12, color: '#e6edf3', fontWeight: 500 }}>SentientOS ~ Memory Core Live Logs</span>
            </div>
            <span style={{ color: '#888', fontSize: 11, background: 'rgba(255,255,255,0.1)', padding: '2px 8px', borderRadius: 12 }}>[{steps[activeStep].name}]</span>
          </div>
          
          <div style={{ flex: 1, padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12, minHeight: 400 }}>
            <div style={{ color: '#888', fontFamily: 'monospace', fontSize: 13, marginBottom: 8, paddingBottom: 16, borderBottom: '1px dashed #444', lineHeight: 1.5 }}>
              // Task: {steps[activeStep].desc}
            </div>
            
            {steps[activeStep].logs.length === 0 ? (
              <div style={{ color: '#666', fontFamily: 'monospace', fontSize: 14 }}>Waiting for actions...</div>
            ) : (
              steps[activeStep].logs.map((log, i) => (
                <div key={i} style={{ color: '#34c759', fontFamily: 'monospace', fontSize: 13, lineHeight: 1.6 }}>{log}</div>
              ))
            )}
          </div>
        </div>

        </div>
      )}

      {/* WEBHOOKS DEMO SUITE */}
      <div style={{ 
        marginTop: 32, 
        background: 'rgba(255,255,255,0.7)', 
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: '1px solid rgba(255,255,255,0.5)', 
        borderRadius: 'var(--radius-card)', 
        padding: 32,
        boxShadow: '0 8px 32px rgba(31, 38, 135, 0.07)'
      }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--black)', marginBottom: 8 }}>Automated Webhook Integrations</h2>
        <p style={{ fontSize: 14, color: 'var(--gray-mid)', marginBottom: 24, lineHeight: 1.5 }}>
          Simulate incoming webhooks from external platforms to instantly trigger SentientOS's autonomous resolution capabilities.
        </p>
        
        <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
          {[
            { label: '🐙 GitHub PR (Style Enforcer)', action: testGitHubWebhook, color: 'linear-gradient(135deg, #24292e 0%, #1b1f23 100%)' },
            { label: '🦆 Produck (Zero-Sync Debugger)', action: testProduckWebhook, color: 'linear-gradient(135deg, #0052CC 0%, #0045A8 100%)' },
            { label: '☀️ Daily Standup', action: testStandupWebhook, color: 'linear-gradient(135deg, #FFB020 0%, #F59A00 100%)' },
            { label: '👶 New Dev Onboarding', action: testOnboardingWebhook, color: 'linear-gradient(135deg, #10B981 0%, #059669 100%)' },
            { label: '💥 Server Error Log', action: testErrorLogWebhook, color: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)' },
            { label: '📄 Auto-Docs (Push)', action: testAutoDocsWebhook, color: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)' },
            { label: '🧹 Repo Cleanup', action: testCleanupWebhook, color: 'linear-gradient(135deg, #F43F5E 0%, #E11D48 100%)' },
          ].map((btn, i) => (
            <button 
              key={i}
              onClick={btn.action}
              style={{
                background: btn.color,
                color: 'white',
                border: '2px solid var(--border)',
                padding: '10px 18px',
                borderRadius: '50px',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(0,0,0,0.15)',
                transition: 'transform 0.2s, boxShadow 0.2s',
              }}
              onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.2)'; }}
              onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(0,0,0,0.15)'; }}
            >
              {btn.label}
            </button>
          ))}
        </div>

        {webhookStatus && (
          <div style={{ 
            padding: 16, 
            borderRadius: 12, 
            background: 'rgba(0,0,0,0.85)', 
            border: '1px solid rgba(255,255,255,0.1)', 
            fontSize: 13, 
            color: '#4ADE80', 
            fontFamily: 'monospace',
            boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.5)',
            lineHeight: 1.6
          }}>
            &gt; {webhookStatus}
          </div>
        )}
      </div>
    </div>
  );
}
