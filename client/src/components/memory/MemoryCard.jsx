import { useState } from 'react';
import Badge from '../ui/Badge';
import Modal from '../ui/Modal';
import Button from '../ui/Button';

// Helper for relative time
function getRelativeTime(dateInput) {
  if (!dateInput) return '';
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return '';
  
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);
  
  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 172800) return 'Yesterday';
  
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function MemoryCard({
  title = 'Decision',
  content = '',
  tags = [],
  date = '',
  hitCount = 0,
  isPinned = false,
  memoryId,
  onUpdate, // Optional: callback to refresh list if pinned/deleted
}) {
  const [expanded, setExpanded] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [localPinned, setLocalPinned] = useState(isPinned);

  const togglePin = async (e) => {
    e.stopPropagation();
    try {
      setLocalPinned(!localPinned);
      if (memoryId) {
        await fetch(`${import.meta.env.VITE_API_URL}/api/memory/pin`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: memoryId, pinned: !localPinned })
        });
        if (onUpdate) onUpdate();
      }
    } catch (err) {
      console.error('Failed to toggle pin', err);
      setLocalPinned(localPinned); // revert on failure
    }
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    try {
      if (memoryId) {
        await fetch(`${import.meta.env.VITE_API_URL}/api/memories/${memoryId}`, { method: 'DELETE' });
        if (onUpdate) onUpdate();
      }
    } catch (err) {
      console.error('Failed to delete memory', err);
    }
  };

  const handleCopy = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(`${title}\n\n${content}`);
    setMenuOpen(false);
  };

  const handleCardClick = (e) => {
    // Ignore clicks if they originate from an interactive element
    if (e.target.closest('button') || e.target.closest('.no-modal-click')) {
      return;
    }
    setShowModal(true);
  };

  // Importance Badge logic
  let badgeColor = 'gray';
  let badgeLabel = '🆕 New';
  if (hitCount >= 5) {
    badgeColor = 'red';
    badgeLabel = '🔥 Hot';
  } else if (hitCount >= 2) {
    badgeColor = 'yellow';
    badgeLabel = '⚡ Active';
  }

  // Content Truncation
  const isContentLong = content.length > 90;
  const displayContent = expanded ? content : (isContentLong ? content.slice(0, 90) : content);

  return (
    <>
      <div
        onClick={handleCardClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => { setIsHovered(false); setMenuOpen(false); setShowDeleteConfirm(false); }}
        style={{
          background: 'white',
          border: `1px solid ${showModal ? '#A855F7' : (isHovered ? '#C7C7CC' : '#E5E5EA')}`,
          borderRadius: '10px',
          padding: '10px 12px',
          marginBottom: '6px',
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          cursor: 'pointer',
          transition: 'all 0.15s ease',
          boxShadow: showModal ? '0 0 0 3px rgba(0,113,227,0.1)' : (isHovered ? '0 2px 8px rgba(0,0,0,0.06)' : 'none'),
          transform: isHovered && !showModal ? 'translateY(-1px)' : 'none',
          position: 'relative',
        }}
      >
        {/* TOP ROW */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Badge color={badgeColor} size="sm">{badgeLabel}</Badge>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {/* Pinned icon */}
            <button
              onClick={togglePin}
              style={{
                background: 'none', border: '2px solid var(--border)', padding: 2, cursor: 'pointer',
                color: localPinned ? 'var(--blue)' : 'var(--gray-mid)',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}
            >
              {localPinned ? (
                <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
                  <path d="M9.5 2h-5A1.5 1.5 0 003 3.5v2L2 8v1h4v4h2V9h4V8l-1-2.5v-2A1.5 1.5 0 009.5 2z" />
                </svg>
              ) : (
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M9.5 2h-5A1.5 1.5 0 003 3.5v2L2 8v1h4v4h2V9h4V8l-1-2.5v-2A1.5 1.5 0 009.5 2z" strokeLinejoin="round" />
                </svg>
              )}
            </button>
            
            {/* Hover Menu */}
            <div style={{ position: 'relative', opacity: isHovered ? 1 : 0, transition: 'opacity 0.2s', width: 24, height: 24 }}>
              <button
                onClick={(e) => { e.stopPropagation(); setMenuOpen(!menuOpen); setShowDeleteConfirm(false); }}
                style={{
                  background: 'transparent', border: 'none', width: '100%', height: '100%',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--gray-dark)', borderRadius: 'var(--radius-sm)'
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--gray-light)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
                  <circle cx="7" cy="3" r="1.2" />
                  <circle cx="7" cy="7" r="1.2" />
                  <circle cx="7" cy="11" r="1.2" />
                </svg>
              </button>
              
              {menuOpen && (
                <div style={{
                  position: 'absolute', top: '100%', right: 0, marginTop: 4,
                  background: 'var(--white)', border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-sm)', boxShadow: 'var(--shadow-md)',
                  padding: 4, zIndex: 10, minWidth: 120
                }}>
                  {showDeleteConfirm ? (
                    <div style={{ padding: '6px 8px', display: 'flex', flexDirection: 'column', gap: 6 }} className="no-modal-click">
                      <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--black)', textAlign: 'center' }}>Delete memory?</span>
                      <div style={{ display: 'flex', gap: 4 }}>
                        <Button variant="danger" size="sm" fullWidth onClick={handleDelete}>Yes</Button>
                        <Button variant="ghost" size="sm" fullWidth onClick={(e) => { e.stopPropagation(); setShowDeleteConfirm(false); setMenuOpen(false); }}>Cancel</Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <button
                        onClick={handleCopy}
                        style={{ display: 'block', width: '100%', textAlign: 'left', padding: '6px 8px', border: 'none', background: 'transparent', fontSize: 12, cursor: 'pointer', borderRadius: 4, color: 'var(--black)' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'var(--gray-light)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        Copy content
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); alert('Edit not implemented yet'); }}
                        style={{ display: 'block', width: '100%', textAlign: 'left', padding: '6px 8px', border: 'none', background: 'transparent', fontSize: 12, cursor: 'pointer', borderRadius: 4, color: 'var(--black)' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'var(--gray-light)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        Edit
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); setShowDeleteConfirm(true); }}
                        style={{ display: 'block', width: '100%', textAlign: 'left', padding: '6px 8px', border: 'none', background: 'transparent', fontSize: 12, cursor: 'pointer', borderRadius: 4, color: 'var(--black)' }}
                        onMouseEnter={e => e.currentTarget.style.background = '#FEE2E2'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <span style={{ color: '#DC2626' }}>Delete</span>
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* TITLE ROW */}
        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--black)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {title}
        </div>

        {/* CONTENT PREVIEW */}
        <div style={{ fontSize: 13, color: 'var(--gray-mid)', lineHeight: 1.5, wordBreak: 'break-word' }}>
          {displayContent}
          {isContentLong && !expanded && (
            <button
              onClick={(e) => { e.stopPropagation(); setExpanded(true); }}
              className="no-modal-click"
              style={{
                background: 'none', border: '2px solid var(--border)', padding: 0,
                color: 'var(--blue)', fontSize: 13, cursor: 'pointer',
                marginLeft: 4,
              }}
            >
              ...more
            </button>
          )}
        </div>

        {/* TAG ROW */}
        {tags && tags.length > 0 && (
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {tags.slice(0, 3).map((tag, i) => (
              <Badge key={i} color="gray" size="sm">{tag}</Badge>
            ))}
            {tags.length > 3 && (
              <Badge color="gray" size="sm">+{tags.length - 3} more</Badge>
            )}
          </div>
        )}

        {/* BOTTOM ROW */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--gray-mid)' }}>
          <span>{getRelativeTime(date) || 'Unknown date'}</span>
          <span>•</span>
          <span>Used {hitCount} time{hitCount !== 1 ? 's' : ''}</span>
        </div>
      </div>

      {/* FULL MEMORY MODAL */}
      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title={title}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Metadata */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Badge color={badgeColor} size="sm">{badgeLabel}</Badge>
            <span style={{ fontSize: 13, color: 'var(--gray-mid)' }}>
              {getRelativeTime(date) || 'Unknown date'} • Used {hitCount} time{hitCount !== 1 ? 's' : ''}
            </span>
            {localPinned && (
              <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, color: 'var(--blue)', fontWeight: 500 }}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
                  <path d="M9.5 2h-5A1.5 1.5 0 003 3.5v2L2 8v1h4v4h2V9h4V8l-1-2.5v-2A1.5 1.5 0 009.5 2z" />
                </svg>
                Pinned
              </span>
            )}
          </div>

          {/* Full content */}
          <div style={{
            background: 'var(--gray-light)', padding: 16, borderRadius: 'var(--radius-md)',
            fontSize: 14, color: 'var(--black)', lineHeight: 1.6, whiteSpace: 'pre-wrap'
          }}>
            {content}
          </div>

          {/* All tags */}
          {tags && tags.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {tags.map((tag, i) => (
                <Badge key={i} color="gray" size="sm">{tag}</Badge>
              ))}
            </div>
          )}
        </div>
      </Modal>
    </>
  );
}
