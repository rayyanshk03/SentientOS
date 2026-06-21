import { useState } from 'react';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';

export default function PipelinePage() {
  const [activeStep, setActiveStep] = useState(0);
  const [isPipelineRunning, setIsPipelineRunning] = useState(true);

  const steps = [
    { name: 'Document Ingestion', status: 'completed', duration: '120ms', desc: 'Accept documents and write raw binaries to backend uploads directory.', logs: ['[Info] Received file: SentientOS_spec.pdf', '[Info] Saved to disk: /uploads/SentientOS_spec.pdf', '[Success] File validation passed (PDF, 2.4MB)'] },
    { name: 'Parsing & Extraction', status: 'completed', duration: '450ms', desc: 'Extract structural text contents, headers, metadata, and pages using pdfminer.', logs: ['[Info] Starting parser worker', '[Info] Extracted 12 structural paragraphs', '[Success] Extracted 4,200 characters from page 1-3'] },
    { name: 'Text Cleaning', status: 'completed', duration: '80ms', desc: 'Normalize whitespace, remove formatting garbage, and standardize capitalization.', logs: ['[Info] Running regex filters', '[Info] Removed 43 non-ASCII glyphs', '[Success] Normalization complete'] },
    { name: 'Dynamic Chunking', status: 'active', duration: 'Running', desc: 'Segment cleaned text into overlapping token windows using markdown headers.', logs: ['[Info] Executing semantic splitting', '[Info] Generated chunk 1 (250 tokens)', '[Info] Generating chunk 2...', '[Warning] Chunk size near upper limit (495 tokens)'] },
    { name: 'Embedding Generation', status: 'pending', duration: 'Waiting', desc: 'Convert textual chunks to 1536-dimensional dense vector embeddings using OpenAI/Gemini.', logs: ['[Info] Queueing embeddings API task...'] },
    { name: 'Vector DB Indexing', status: 'pending', duration: 'Waiting', desc: 'Insert dense vector embeddings into Parcle and local MongoDB vector indexes.', logs: ['[Info] Waiting for embeddings data...'] }
  ];

  return (
    <div 
      className="main-content-page"
      style={{
        gridColumn: 2,
        gridRow: '2 / 4',
        padding: '24px 32px',
        overflowY: 'auto',
        background: 'var(--gray-light)',
        display: 'flex',
        flexDirection: 'column',
        gap: 24,
      }}
    >
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--black)', margin: '0 0 4px 0' }}>Data Pipeline</h1>
          <p style={{ fontSize: 13, color: 'var(--gray-mid)', margin: 0 }}>Monitor and manage real-time document memory indexing</p>
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
        <div style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 12, padding: 20 }}>
          <h2 style={{ fontSize: 15, fontWeight: 600, color: 'var(--black)', marginBottom: 16 }}>Ingestion Pipeline Status</h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20, position: 'relative' }}>
            {/* Visual connector line */}
            <div style={{ position: 'absolute', left: 15, top: 12, bottom: 12, width: 2, background: 'var(--border)', zIndex: 0 }} />

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
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 12, padding: 20, flex: 1 }}>
            <h2 style={{ fontSize: 15, fontWeight: 600, color: 'var(--black)', marginBottom: 8 }}>Step Details: {steps[activeStep].name}</h2>
            <p style={{ fontSize: 13, color: 'var(--gray-mid)', lineHeight: 1.5, marginBottom: 16 }}>{steps[activeStep].desc}</p>
            
            <h3 style={{ fontSize: 12, fontWeight: 600, color: 'var(--black)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>Worker Execution Logs</h3>
            <div style={{
              background: 'var(--black)', color: '#34c759', padding: 12, borderRadius: 8,
              fontFamily: 'monospace', fontSize: 11, minHeight: 120, maxHeight: 220, overflowY: 'auto',
              lineHeight: 1.6, border: '1px solid var(--border)'
            }}>
              {steps[activeStep].logs.map((log, i) => (
                <div key={i}>{log}</div>
              ))}
            </div>
          </div>
        </div>

        </div>
      )}
    </div>
  );
}
