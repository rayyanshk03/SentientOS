import { useState, useRef, useEffect } from 'react';

const SUGGESTIONS = [
  "🏛️ Review architecture",
  "🐛 Find a bug",
  "📝 Update docs",
  "🎨 Check UI",
  "⚡ Optimize code"
];

const MAX_CHARS = 2000;
const WARN_CHARS = 1800;

export default function InputBar({
  onSubmit,
  disabled,
  placeholder = "Ask your architect anything...",
  activePersonaId,
  onPersonaChange,
  personas = [],
  activeProject,
  onUploadSuccess,
}) {
  const [text, setText] = useState('');
  const [personaMenuOpen, setPersonaMenuOpen] = useState(false);
  const [sendHovered, setSendHovered] = useState(false);
  const [sendPressed, setSendPressed] = useState(false);
  
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);

  // Upload States
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState(null);

  // Auto-grow textarea up to 120px max height
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px';
    }
  }, [text]);

  const handleSubmit = () => {
    const trimmed = text.trim();
    if (!trimmed || disabled || trimmed.length > MAX_CHARS) return;
    onSubmit(trimmed);
    setText('');
    if (textareaRef.current) {
      textareaRef.current.style.height = '24px'; // Reset min height
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setText(suggestion);
    textareaRef.current?.focus();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate
    const validExtensions = ['pdf', 'txt', 'md', 'docx'];
    const ext = file.name.split('.').pop().toLowerCase();
    if (!validExtensions.includes(ext)) {
      setUploadError(`Unsupported file: .${ext}`);
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setUploadError('File exceeds 10MB limit');
      return;
    }

    await uploadFile(file);
    e.target.value = ''; // Reset input
  };

  const uploadFile = async (file) => {
    setIsUploading(true);
    setUploadError(null);
    setUploadProgress(15);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('projectId', activeProject || 'default-project');

    const interval = setInterval(() => {
      setUploadProgress(prev => Math.min(prev + 5, 90));
    }, 450);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/upload`, {
        method: 'POST',
        body: formData,
      });

      clearInterval(interval);
      setUploadProgress(100);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Upload failed');
      }

      const data = await response.json();
      if (onUploadSuccess) onUploadSuccess(data);

      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
      }, 1000);
    } catch (err) {
      clearInterval(interval);
      setUploadError(err.message);
      setIsUploading(false);
    }
  };

  const charCount = text.length;
  const isOverLimit = charCount > MAX_CHARS;
  const isWarning = charCount >= WARN_CHARS && !isOverLimit;
  
  let counterColor = '#AEAEB2';
  if (isOverLimit) counterColor = '#FF3B30';
  else if (isWarning) counterColor = '#FF9500';

  const activePersona = personas.find(p => p.id === activePersonaId) || personas[0] || { emoji: '🏛️', label: 'Eternal Architect' };
  const shortName = activePersona.label.split(' ')[0] || 'Architect';

  const isSendDisabled = disabled || text.trim().length === 0 || isOverLimit;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', position: 'relative' }}>
      
      {/* QUICK SUGGESTIONS ROW */}
      {text.length === 0 && (
        <div className="suggestion-row">
          {SUGGESTIONS.map(s => (
            <button
              key={s}
              onClick={() => handleSuggestionClick(s)}
              className="suggestion-chip"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Persona Switcher Popover (styled above the input bar card) */}
      {personaMenuOpen && (
        <div
          style={{
            position: 'absolute',
            bottom: '100%',
            left: 12,
            marginBottom: 8,
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(0, 0, 0, 0.08)',
            borderRadius: '12px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
            padding: '4px',
            zIndex: 100,
            minWidth: 180,
          }}
        >
          {personas.map(p => (
            <button
              key={p.id}
              onClick={() => {
                onPersonaChange?.(p.id);
                setPersonaMenuOpen(false);
              }}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '8px 10px',
                border: 'none',
                background: p.id === activePersonaId ? 'var(--blue-light)' : 'transparent',
                color: p.id === activePersonaId ? 'var(--blue)' : 'var(--black)',
                borderRadius: '8px',
                cursor: 'pointer',
                textAlign: 'left',
                fontFamily: 'inherit',
                fontSize: '12px',
                fontWeight: 500,
              }}
              onMouseEnter={e => { if (p.id !== activePersonaId) e.currentTarget.style.background = 'var(--gray-light)'; }}
              onMouseLeave={e => { if (p.id !== activePersonaId) e.currentTarget.style.background = 'transparent'; }}
            >
              <span>{p.emoji}</span>
              <span>{p.label}</span>
            </button>
          ))}
        </div>
      )}

      {/* MAIN INPUT CARD */}
      <div className="input-card" style={{ display: 'flex', flexDirection: 'column' }}>
        
        {/* TEXTAREA */}
        <textarea
          ref={textareaRef}
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder={placeholder}
          rows={1}
          style={{
            width: '100%',
            padding: '12px 16px 0 16px',
            border: 'none',
            outline: 'none',
            resize: 'none',
            fontFamily: 'inherit',
            fontSize: '15px',
            color: '#1D1D1F',
            lineHeight: 1.6,
            minHeight: '24px',
            maxHeight: '120px',
            background: 'transparent',
            boxSizing: 'border-box',
          }}
        />

        {/* TOOLBAR */}
        <div style={{ padding: '8px 12px 10px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          
          {/* LEFT TOOLBAR */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              onClick={() => setPersonaMenuOpen(!personaMenuOpen)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                background: '#F5F5F7',
                borderRadius: '980px',
                padding: '4px 10px',
                fontFamily: 'inherit',
                fontWeight: 500,
                fontSize: '12px',
                color: '#6E6E73',
                cursor: 'pointer',
                userSelect: 'none',
              }}
            >
              <span>{activePersona.emoji}</span>
              <span>{shortName}</span>
            </div>

            {/* Paperclip Button */}
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled || isUploading}
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--gray-mid)',
                width: 28,
                height: 28,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'background 0.2s ease, color 0.2s ease',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'var(--gray-light)';
                e.currentTarget.style.color = 'var(--blue)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = 'var(--gray-mid)';
              }}
              title="Upload document memory"
            >
              {isUploading ? (
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" style={{ animation: 'spin 1s linear infinite' }}>
                  <circle cx="8" cy="8" r="6" stroke="var(--blue)" strokeOpacity="0.25" strokeWidth="2" />
                  <path d="M8 2a6 6 0 0 1 6 6" stroke="var(--blue)" strokeWidth="2" strokeLinecap="round" />
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
                </svg>
              )}
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              accept=".pdf,.txt,.md,.docx"
              style={{ display: 'none' }} 
            />

            {/* Inline Upload States */}
            {isUploading && (
              <span style={{ fontSize: '11px', color: 'var(--blue)', fontWeight: 500 }}>
                Uploading ({uploadProgress}%)
              </span>
            )}
            {uploadError && (
              <span style={{ fontSize: '11px', color: '#FF3B30', fontWeight: 500, cursor: 'pointer' }} onClick={() => setUploadError(null)}>
                ⚠ {uploadError}
              </span>
            )}

            {charCount > 100 && (
              <span style={{ fontSize: '12px', fontFamily: 'inherit', color: counterColor, fontWeight: 400 }}>
                {charCount} / 2000
              </span>
            )}
          </div>

          {/* RIGHT TOOLBAR */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: '12px', fontFamily: 'inherit', color: '#AEAEB2', fontWeight: 400 }}>⌘↵</span>
            
            <button
              onMouseEnter={() => setSendHovered(true)}
              onMouseLeave={() => { setSendHovered(false); setSendPressed(false); }}
              onMouseDown={() => setSendPressed(true)}
              onMouseUp={() => setSendPressed(false)}
              onClick={handleSubmit}
              disabled={isSendDisabled}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '10px',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: isSendDisabled ? '#AEAEB2' : (sendHovered ? '#0077ED' : '#0071E3'),
                color: '#FFFFFF',
                cursor: isSendDisabled ? 'not-allowed' : 'pointer',
                transform: sendPressed && !isSendDisabled ? 'scale(0.95)' : (sendHovered && !isSendDisabled ? 'scale(1.05)' : 'scale(1)'),
                transition: 'all 0.15s ease',
                outline: 'none',
              }}
            >
              {disabled ? (
                /* Spinning circle in white */
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ animation: 'spin 1s linear infinite' }}>
                  <circle cx="8" cy="8" r="6" stroke="#FFFFFF" strokeOpacity="0.25" strokeWidth="2" />
                  <path d="M8 2a6 6 0 0 1 6 6" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
                </svg>
              ) : (
                /* Arrow up SVG icon in white */
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="19" x2="12" y2="5" />
                  <polyline points="5 12 12 5 19 12" />
                </svg>
              )}
            </button>
          </div>

        </div>

      </div>

    </div>
  );
}
