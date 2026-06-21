import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import Button from '../ui/Button';
import 'highlight.js/styles/github-dark.css';

// Small helper to handle copy-to-clipboard for code blocks
function CodeBlock({ node, inline, className, children, ...props }) {
  const [copied, setCopied] = useState(false);
  const match = /language-(\w+)/.exec(className || '');
  const language = match ? match[1] : 'text';

  if (inline || !match) {
    return (
      <code
        style={{
          background: 'rgba(0,0,0,0.06)',
          padding: '2px 6px',
          borderRadius: 4,
          fontFamily: 'monospace',
          fontSize: '0.9em',
          color: 'inherit'
        }}
        {...props}
      >
        {children}
      </code>
    );
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(String(children).replace(/\n$/, ''));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{
      background: '#1E1E1E',
      borderRadius: 'var(--radius-card)',
      overflow: 'hidden',
      margin: '12px 0'
    }}>
      {/* Top Bar */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '6px 12px', background: '#2D2D2D', color: '#A0A0A0',
        fontSize: 12, fontFamily: 'sans-serif'
      }}>
        <span style={{ textTransform: 'uppercase', fontWeight: 600 }}>{language}</span>
        <button
          onClick={handleCopy}
          style={{
            background: 'none', border: 'none', color: copied ? '#34C759' : '#A0A0A0',
            cursor: 'pointer', fontSize: 12, fontWeight: 500, padding: 0,
            display: 'flex', alignItems: 'center', gap: 4
          }}
        >
          {copied ? 'Copied ✓' : 'Copy'}
        </button>
      </div>
      {/* Code Area */}
      <div style={{ padding: '12px', overflowX: 'auto' }}>
        <code className={className} style={{ fontFamily: 'monospace', fontSize: 13, color: 'var(--white)' }} {...props}>
          {children}
        </code>
      </div>
    </div>
  );
}

// Markdown Custom Components mapping
const MarkdownComponents = {
  code: CodeBlock,
  p: ({ children }) => <p style={{ fontSize: 15, lineHeight: 1.6, marginBottom: 12, marginTop: 0 }}>{children}</p>,
  h1: ({ children }) => <h3 style={{ fontSize: 19, fontWeight: 700, margin: '16px 0 8px' }}>{children}</h3>,
  h2: ({ children }) => <h4 style={{ fontSize: 17, fontWeight: 700, margin: '14px 0 8px' }}>{children}</h4>,
  h3: ({ children }) => <h5 style={{ fontSize: 15, fontWeight: 600, margin: '12px 0 8px' }}>{children}</h5>,
  strong: ({ children }) => <strong style={{ fontWeight: 600 }}>{children}</strong>,
  ul: ({ children }) => (
    <ul style={{ paddingLeft: 20, marginBottom: 12, listStyle: 'none', margin: '0 0 12px 0' }}>
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol style={{ paddingLeft: 20, marginBottom: 12, margin: '0 0 12px 0' }}>
      {children}
    </ol>
  ),
  li: ({ children, node }) => {
    const isOrdered = node.parent && node.parent.tagName === 'ol';
    if (isOrdered) {
      return <li style={{ marginBottom: 4, lineHeight: 1.6 }}>{children}</li>;
    }
    return (
      <li style={{ position: 'relative', marginBottom: 4, lineHeight: 1.6 }}>
        <span style={{
          position: 'absolute', left: -14, top: 9,
          width: 5, height: 5, borderRadius: '50%', background: 'var(--blue)'
        }} />
        {children}
      </li>
    );
  }
};

function MemoriesUsed({ memories }) {
  const [open, setOpen] = useState(false);
  const [hovered, setHovered] = useState(false);

  if (!memories || memories.length === 0) return null;

  return (
    <div style={{ marginTop: 4 }}>
      <button
        onClick={() => setOpen(o => !o)}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: 0,
          color: hovered ? '#0071E3' : '#6E6E73',
          fontSize: '12px',
          fontFamily: 'inherit',
          fontWeight: 400,
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          transition: 'color 0.15s ease',
          outline: 'none',
        }}
      >
        <span>📎</span>
        {memories.length} memories used
        <svg
          width="10" height="10" viewBox="0 0 10 10" fill="none"
          style={{ transform: open ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s', color: 'currentColor' }}
        >
          <path d="M2 3.5l3 3 3-3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
          {memories.map((m, i) => {
            const title = m.title || m.tag?.title || m.tag?.type || 'Decision';
            const truncated = title.length > 30 ? title.substring(0, 30) + '...' : title;
            return (
              <div key={i} style={{
                background: '#E8F1FB',
                color: '#0071E3',
                borderRadius: '980px',
                padding: '2px 8px',
                fontSize: '11px',
                fontWeight: 500,
                fontFamily: 'inherit',
              }}>
                {truncated}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function RatingBar({ onRate, messageId, onSave }) {
  const [activeRating, setActiveRating] = useState(null); // 'up' | 'down'
  const [pinned, setPinned] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [isHoveredUp, setIsHoveredUp] = useState(false);
  const [isHoveredDown, setIsHoveredDown] = useState(false);
  const [isHoveredPin, setIsHoveredPin] = useState(false);
  const [isHoveredSave, setIsHoveredSave] = useState(false);

  const handleRate = (type) => {
    setActiveRating(type);
    if (onRate) onRate(messageId, type);
  };

  const togglePin = () => {
    setPinned(!pinned);
  };

  const btnStyle = {
    width: 26,
    height: 26,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: 'none',
    cursor: 'pointer',
    fontFamily: 'inherit',
    fontSize: '12px',
    transition: 'all 0.15s ease',
    outline: 'none',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 4 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        {/* Thumb Up */}
        <button
          onClick={() => handleRate('up')}
          onMouseEnter={() => setIsHoveredUp(true)}
          onMouseLeave={() => setIsHoveredUp(false)}
          style={{
            ...btnStyle,
            background: activeRating === 'up' ? '#E8F5E9' : (isHoveredUp ? '#F5F5F7' : 'transparent'),
            color: activeRating === 'up' ? '#34C759' : '#6E6E73',
          }}
        >
          👍
        </button>

        {/* Thumb Down */}
        <button
          onClick={() => handleRate('down')}
          onMouseEnter={() => setIsHoveredDown(true)}
          onMouseLeave={() => setIsHoveredDown(false)}
          style={{
            ...btnStyle,
            background: activeRating === 'down' ? '#FFE5E5' : (isHoveredDown ? '#F5F5F7' : 'transparent'),
            color: activeRating === 'down' ? '#FF3B30' : '#6E6E73',
          }}
        >
          👎
        </button>

        {/* Pin */}
        <button
          onClick={togglePin}
          onMouseEnter={() => setIsHoveredPin(true)}
          onMouseLeave={() => setIsHoveredPin(false)}
          style={{
            ...btnStyle,
            background: pinned ? '#E8F1FB' : (isHoveredPin ? '#F5F5F7' : 'transparent'),
            color: pinned ? '#0071E3' : '#6E6E73',
          }}
        >
          📌
        </button>

        {/* Save Memory */}
        {onSave && (
          <button
            onClick={onSave}
            onMouseEnter={() => setIsHoveredSave(true)}
            onMouseLeave={() => setIsHoveredSave(false)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: isHoveredSave ? '#F5F5F7' : 'transparent', 
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-pill)', padding: '4px 10px',
              fontSize: 11.5, fontWeight: 600, color: 'var(--gray-mid)',
              cursor: 'pointer', transition: 'all 0.15s', marginLeft: 6,
            }}
          >
            <span>💾</span> Save Memory
          </button>
        )}
      </div>

      {activeRating === 'down' && (
        <div style={{ display: 'flex', gap: 6, width: '100%', maxWidth: 300, marginTop: 4 }}>
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="What could be better?"
            style={{
              flex: 1,
              padding: '6px 10px',
              borderRadius: 'var(--radius-input)',
              border: '1px solid var(--border)',
              fontSize: 12,
              resize: 'none',
              minHeight: 40,
              fontFamily: 'inherit',
              outline: 'none',
            }}
          />
          <button
            onClick={() => { alert('Feedback submitted!'); setFeedback(''); }}
            style={{
              background: 'var(--gray-dark)',
              color: 'var(--white)',
              border: 'none',
              borderRadius: 'var(--radius-button)',
              padding: '6px 12px',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
              height: 28,
            }}
          >
            Send
          </button>
        </div>
      )}
    </div>
  );
}

function formatRelativeTime(dateInput) {
  if (!dateInput) return '';
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return '';
  const hours = d.getHours().toString().padStart(2, '0');
  const minutes = d.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}

export default function MessageBubble({ msg, onRate, onSave }) {
  // Check if system message
  if (msg.role === 'system') {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          width: '100%',
          padding: '8px 0',
        }}
      >
        <span
          style={{
            fontFamily: 'var(--font)',
            fontSize: '12px',
            fontWeight: 400,
            color: '#AEAEB2',
            textAlign: 'center',
          }}
        >
          {msg.content}
        </span>
      </div>
    );
  }

  // Check if typing indicator message
  if (msg.isTyping) {
    return (
      <div
        style={{
          padding: '6px 20px',
          display: 'flex',
          gap: '8px',
          width: '100%',
          flexDirection: 'row',
          alignItems: 'flex-start',
        }}
      >
        {/* Avatar */}
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #1D1D1F, #3D3D3F)',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'var(--font)',
            fontSize: '11px',
            fontWeight: 700,
            flexShrink: 0,
            marginTop: '4px',
          }}
        >
          EA
        </div>

        {/* Content column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', width: '100%' }}>
          <span style={{ fontFamily: 'var(--font)', fontWeight: 600, fontSize: '12px', color: '#6E6E73', marginBottom: '2px' }}>
            Eternal Architect
          </span>
          <div
            style={{
              background: '#F5F5F7',
              borderRadius: '18px 18px 18px 4px',
              padding: '12px 16px',
              maxWidth: '80%',
              border: '1px solid #E5E5EA',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              height: '42px',
              width: 'fit-content',
            }}
          >
            <div className="typing-dot typing-dot-1" />
            <div className="typing-dot typing-dot-2" />
            <div className="typing-dot typing-dot-3" />
          </div>
        </div>
      </div>
    );
  }

  const isUser = msg.role === 'user';

  // USER BUBBLE
  if (isUser) {
    return (
      <div
        className="msg-user"
        style={{
          padding: '6px 20px',
          display: 'flex',
          gap: '8px',
          width: '100%',
          flexDirection: 'row-reverse',
        }}
      >
        <div
          style={{
            background: '#0071E3',
            color: 'white',
            borderRadius: '18px 18px 4px 18px',
            padding: '10px 14px',
            maxWidth: '72%',
            fontFamily: 'var(--font)',
            fontSize: '15px',
            lineHeight: 1.5,
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            boxShadow: '0 1px 2px rgba(0,113,227,0.3)',
          }}
        >
          <div>{msg.content}</div>
          <div
            style={{
              fontFamily: 'var(--font)',
              fontSize: '11px',
              color: 'rgba(255, 255, 255, 0.7)',
              marginTop: '4px',
              textAlign: 'right',
            }}
          >
            {formatRelativeTime(msg.timestamp || Date.now())}
          </div>
        </div>
      </div>
    );
  }

  // AGENT BUBBLE
  return (
    <div
      className="msg-agent"
      style={{
        padding: '6px 20px',
        display: 'flex',
        gap: '8px',
        width: '100%',
        flexDirection: 'row',
        alignItems: 'flex-start',
      }}
    >
      {/* Avatar */}
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #1D1D1F, #3D3D3F)',
          color: '#FFFFFF',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'var(--font)',
          fontSize: '11px',
          fontWeight: 700,
          flexShrink: 0,
          marginTop: '4px',
        }}
      >
        EA
      </div>

      {/* Content column */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', width: '100%' }}>
        <span style={{ fontFamily: 'var(--font)', fontWeight: 600, fontSize: '12px', color: '#6E6E73', marginBottom: '2px' }}>
          Eternal Architect
        </span>
        
        {/* Bubble */}
        <div
          style={{
            background: '#F5F5F7',
            color: '#1D1D1F',
            borderRadius: '18px 18px 18px 4px',
            padding: '12px 16px',
            maxWidth: '80%',
            fontFamily: 'var(--font)',
            fontSize: '15px',
            lineHeight: 1.6,
            border: '1px solid #E5E5EA',
            wordBreak: 'break-word',
          }}
        >
          <ReactMarkdown
            components={MarkdownComponents}
            rehypePlugins={[rehypeHighlight]}
          >
            {msg.content}
          </ReactMarkdown>
        </div>
        
        {msg.retrievedMemories && msg.retrievedMemories.length > 0 && (
          <MemoriesUsed memories={msg.retrievedMemories} />
        )}
        
        <RatingBar onRate={onRate} messageId={msg.id} onSave={onSave} />
      </div>
    </div>
  );
}
