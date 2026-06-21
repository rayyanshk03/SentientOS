import { useState, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import { MemoryGridSkeleton } from '../components/ui/Skeleton';

const CATEGORIES = [
  { id: 'all',           label: 'All',                   icon: '🧠', color: '#6E6E73' },
  { id: 'architecture',  label: 'Architecture Decision',  icon: '🏗️', color: '#0071E3' },
  { id: 'bug_fix',       label: 'Bug Fix',                icon: '🐛', color: '#FF3B30' },
  { id: 'coding',        label: 'Coding Standard',        icon: '📐', color: '#AF52DE' },
  { id: 'deployment',    label: 'Deployment History',     icon: '🚀', color: '#FF9500' },
  { id: 'feature',       label: 'Feature Request',        icon: '✨', color: '#34C759' },
  { id: 'team',          label: 'Team Discussion',        icon: '💬', color: '#5AC8FA' },
  { id: 'documentation', label: 'Documentation Update',   icon: '📄', color: '#8E8E93' },
];

/* ─── Helpers ─────────────────────────────────────────────────────────────── */
function formatRelativeTime(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return '';
  const diffMs = Date.now() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHr / 24);

  if (diffSec < 60) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr} hours ago`;
  if (diffDays === 1) return 'Yesterday';
  return `${diffDays} days ago`;
}

function getGroupTags(m) {
  const tags = Array.isArray(m.tag?.tags) ? m.tag.tags : 
               (typeof m.tag === 'object' && m.tag ? 
                Object.keys(m.tag).filter(k => !['timestamp', 'project', 'title', 'type'].includes(k)) 
                : []);
  return tags;
}

export default function MemoriesPage() {
  const { memories = [], onRefresh, refreshMemories, activeProject, memoriesLoading = false } = useOutletContext();
  const triggerRefresh = onRefresh || refreshMemories;

  const [searchQuery, setSearchQuery] = useState('');
  const [activeSort, setActiveSort] = useState('Recent');
  const [activeCategory, setActiveCategory] = useState('all');
  
  // Edit state
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');

  // Delete confirm state
  const [deletingId, setDeletingId] = useState(null);
  const [exitingId, setExitingId]   = useState(null);

  // New Memory Modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newCategory, setNewCategory] = useState('Architecture Decision');
  const [newSource, setNewSource] = useState('manual');
  const [newTagsStr, setNewTagsStr] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Sort & Filter memories
  const processedMemories = useMemo(() => {
    let list = [...memories];
    
    // Category filter
    if (activeCategory !== 'all') {
      const catEntry = CATEGORIES.find(c => c.id === activeCategory);
      const catLabel = catEntry?.label || '';
      list = list.filter(m => {
        const mCat = m.category || m.tag?.category || '';
        return mCat.toLowerCase().includes(catLabel.toLowerCase().split(' ')[0].toLowerCase());
      });
    }

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(m => 
        (m.title || m.tag?.title || '').toLowerCase().includes(q) ||
        (m.content || '').toLowerCase().includes(q) ||
        (m.category || '').toLowerCase().includes(q)
      );
    }

    // Sorting
    if (activeSort === 'Recent') {
      list.sort((a, b) => new Date(b.updated_at || b.created_at || 0) - new Date(a.updated_at || a.created_at || 0));
    } else if (activeSort === 'Pinned') {
      list.sort((a, b) => (b.pinned || 0) - (a.pinned || 0));
    } else {
      list.sort((a, b) => (b.hitCount || b.hit_count || 0) - (a.hitCount || a.hit_count || 0));
    }

    return list;
  }, [memories, searchQuery, activeSort, activeCategory]);

  // Grouped stats
  const totalCount = memories.length;
  const pinnedCount = memories.filter(m => m.pinned).length;
  const hotCount = memories.filter(m => (m.hitCount || m.hit_count || 0) >= 5).length;

  const handleCopy = (m) => {
    const titleText = m.title || m.tag?.title || 'Decision';
    navigator.clipboard.writeText(`${titleText}\n\n${m.content || ''}`);
  };

  const handlePin = async (m) => {
    try {
      const isPinned = m.pinned || false;
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/memory/pin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: m.id, pinned: !isPinned })
      });
      if (res.ok && triggerRefresh) triggerRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    // Trigger exit animation first
    setExitingId(id);
    await new Promise(r => setTimeout(r, 210));
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/memories/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setDeletingId(null);
        setExitingId(null);
        if (triggerRefresh) triggerRefresh();
      }
    } catch (err) {
      setExitingId(null);
      console.error(err);
    }
  };

  const startEdit = (m) => {
    setEditingId(m.id);
    setEditTitle(m.title || m.tag?.title || 'Decision');
    setEditContent(m.content || '');
  };

  const saveEdit = async (id) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/memories/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: editTitle, content: editContent })
      });
      if (res.ok) {
        setEditingId(null);
        if (triggerRefresh) triggerRefresh();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddMemory = async () => {
    if (!newTitle.trim() || !newContent.trim()) return;
    setIsSaving(true);
    try {
      const tags = newTagsStr.split(',').map(s => s.trim()).filter(Boolean);
      // Map UI category label to enum key
      const categoryMap = {
        'Architecture Decision': 'architecture',
        'Bug Fix': 'bug_fix',
        'Coding Standard': 'coding_standard',
        'Deployment History': 'deployment',
        'Feature Request': 'feature',
        'Team Discussion': 'team',
        'Documentation Update': 'documentation',
      };
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/memory/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTitle.trim(),
          content: newContent.trim(),
          description: newDescription.trim() || undefined,
          category: categoryMap[newCategory] || 'general',
          source: newSource,
          projectId: 'default-project',
          tags,
        })
      });
      if (res.ok) {
        setNewTitle(''); setNewContent(''); setNewDescription('');
        setNewTagsStr(''); setShowAddModal(false);
        if (triggerRefresh) triggerRefresh();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div 
      className="main-content-page page-enter"
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
          <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--black)', margin: '0 0 4px 0' }}>Memory Directory</h1>
          <p style={{ fontSize: 13, color: 'var(--gray-mid)', margin: 0 }}>Review, search, and edit architectural rules indexed in the permanent store</p>
        </div>
        <Button variant="primary" size="sm" onClick={() => setShowAddModal(true)}>
          ➕ Add Manual Decision
        </Button>
      </div>

      {/* Overview Stat Widgets */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
        <div style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 12, padding: 18 }}>
          <span style={{ fontSize: 11, color: 'var(--gray-mid)', fontWeight: 600, textTransform: 'uppercase' }}>Total Memories</span>
          <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--black)', marginTop: 4 }}>{totalCount}</div>
        </div>
        <div style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 12, padding: 18 }}>
          <span style={{ fontSize: 11, color: 'var(--gray-mid)', fontWeight: 600, textTransform: 'uppercase' }}>Pinned</span>
          <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--blue)', marginTop: 4 }}>{pinnedCount}</div>
        </div>
        <div style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 12, padding: 18 }}>
          <span style={{ fontSize: 11, color: 'var(--gray-mid)', fontWeight: 600, textTransform: 'uppercase' }}>Categories</span>
          <div style={{ fontSize: 28, fontWeight: 700, color: '#AF52DE', marginTop: 4 }}>{CATEGORIES.length - 1}</div>
        </div>
      </div>

      {/* Category Filter Chips */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {CATEGORIES.map(cat => {
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 5,
                padding: '6px 14px', borderRadius: 'var(--radius-pill)',
                border: `1.5px solid ${isActive ? cat.color : 'var(--border)'}`,
                background: isActive ? `${cat.color}18` : 'var(--white)',
                color: isActive ? cat.color : 'var(--gray-mid)',
                fontSize: 12.5, fontWeight: isActive ? 700 : 500,
                cursor: 'pointer', transition: 'all 0.15s ease',
              }}
            >
              <span>{cat.icon}</span>{cat.label}
            </button>
          );
        })}
      </div>

      {/* Control bar (Search + Sort) */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--white)', padding: 12, borderRadius: 10, border: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, maxSelf: 'stretch', maxWidth: 400, position: 'relative' }}>
          <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#AEAEB2' }}>🔍</span>
          <input
            type="text"
            placeholder="Search decisions or keywords..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{
              width: '100%', height: 36, border: '1px solid var(--border)', borderRadius: 8,
              padding: '0 12px 0 32px', fontSize: 13.5, outline: 'none', background: 'var(--gray-light)', color: 'var(--black)'
            }}
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', border: 'none', background: 'transparent', cursor: 'pointer', color: '#AEAEB2' }}>✕</button>
          )}
        </div>

        <div style={{ display: 'flex', gap: 6 }}>
          {['Recent', 'Most Used', 'Pinned'].map(sortOpt => (
            <button
              key={sortOpt}
              onClick={() => setActiveSort(sortOpt)}
              style={{
                padding: '6px 12px', borderRadius: 8, fontSize: 12.5, fontWeight: 600, cursor: 'pointer',
                border: activeSort === sortOpt ? '1px solid var(--blue)' : '1px solid var(--border)',
                background: activeSort === sortOpt ? 'var(--blue-light)' : 'var(--white)',
                color: activeSort === sortOpt ? 'var(--blue)' : 'var(--gray-mid)',
                transition: 'all 0.15s ease'
              }}
            >
              {sortOpt}
            </button>
          ))}
        </div>
      </div>

      {/* Memory items Grid — skeleton / empty / real data */}
      {memoriesLoading ? (
        <MemoryGridSkeleton count={6} />
      ) : memories.length === 0 ? (
        /* ── True empty state: no memories at all ── */
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          padding: '72px 20px', textAlign: 'center',
          background: 'var(--white)', borderRadius: 12, border: '1px solid var(--border)',
          gap: 12,
        }}>
          <div style={{
            width: 64, height: 64, borderRadius: '50%',
            background: 'linear-gradient(135deg, #E8F1FB, #F5F5F7)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 32, marginBottom: 4,
          }}>🧠</div>
          <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--black)', margin: 0 }}>
            No memories yet
          </h3>
          <p style={{ fontSize: 13, color: 'var(--gray-mid)', margin: 0, maxWidth: 280, lineHeight: 1.5 }}>
            Start a conversation and I'll remember every decision permanently.
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            style={{
              marginTop: 4, padding: '8px 18px', borderRadius: 'var(--radius-pill)',
              border: '1px solid var(--border)', background: 'var(--white)',
              fontSize: 13, fontWeight: 600, color: 'var(--gray-mid)',
              cursor: 'pointer', transition: 'all 0.15s ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--gray-light)'; e.currentTarget.style.color = 'var(--black)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'var(--white)'; e.currentTarget.style.color = 'var(--gray-mid)'; }}
          >
            Seed starter memories
          </button>
        </div>
      ) : processedMemories.length === 0 ? (
        /* ── Search returned no results ── */
        <div style={{
          padding: '60px 0', textAlign: 'center', color: 'var(--gray-mid)',
          background: 'var(--white)', borderRadius: 12, border: '1px solid var(--border)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
        }}>
          <span style={{ fontSize: 32 }}>🔍</span>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: 'var(--black)' }}>No matching decisions</h3>
          <p style={{ fontSize: 13, margin: 0 }}>Try a different search term or clear the filter.</p>
          <button
            onClick={() => setSearchQuery('')}
            style={{
              marginTop: 8, padding: '7px 16px', borderRadius: 'var(--radius-pill)',
              border: '1px solid var(--border)', background: 'transparent',
              fontSize: 12.5, fontWeight: 600, color: 'var(--blue)', cursor: 'pointer',
            }}
          >
            Clear search
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
          {processedMemories.map((m, cardIdx) => {
            const isEditing = editingId === m.id;
            const hitCount = m.hitCount || m.hit_count || 0;
            const tags = getGroupTags(m);

            let badgeColor = 'gray';
            let badgeLabel = '🆕 New';
            if (hitCount >= 5) {
              badgeColor = 'red';
              badgeLabel = '🔥 Hot';
            } else if (hitCount >= 2) {
              badgeColor = 'yellow';
              badgeLabel = '⚡ Active';
            }

            return (
              <div
                key={m.id}
                className={`memory-card-enter${exitingId === m.id ? ' memory-card-exit' : ''}`}
                style={{
                  '--card-delay': `${Math.min(cardIdx, 12) * 50}ms`,
                  background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 12, padding: 18,
                  display: 'flex', flexDirection: 'column', gap: 10, position: 'relative',
                  boxShadow: 'var(--shadow-sm)',
                  transition: 'transform 0.15s ease, box-shadow 0.2s ease',
                  cursor: 'default',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.10)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                }}
              >
                {isEditing ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <input
                      type="text"
                      value={editTitle}
                      onChange={e => setEditTitle(e.target.value)}
                      style={{ fontSize: 13.5, fontWeight: 600, padding: '6px 10px', border: '1px solid var(--border)', borderRadius: 6, width: '100%' }}
                    />
                    <textarea
                      value={editContent}
                      onChange={e => setEditContent(e.target.value)}
                      rows={4}
                      style={{ fontSize: 13, padding: '6px 10px', border: '1px solid var(--border)', borderRadius: 6, width: '100%', resize: 'vertical' }}
                    />
                    <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                      <Button variant="ghost" size="xs" onClick={() => setEditingId(null)}>Cancel</Button>
                      <Button variant="primary" size="xs" onClick={() => saveEdit(m.id)}>Save</Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        {/* Category badge */}
                        {(() => {
                          const cat = m.category || m.tag?.category || 'General';
                          const catEntry = CATEGORIES.find(c => cat.toLowerCase().includes(c.label.split(' ')[0].toLowerCase()));
                          return (
                            <span style={{
                              display: 'inline-flex', alignItems: 'center', gap: 4,
                              fontSize: 10, fontWeight: 700, padding: '2px 8px',
                              borderRadius: 'var(--radius-pill)',
                              background: catEntry ? `${catEntry.color}18` : '#F5F5F7',
                              color: catEntry?.color || '#6E6E73',
                              border: `1px solid ${catEntry ? catEntry.color + '40' : '#E5E5EA'}`,
                            }}>
                              {catEntry?.icon || '🧠'} {cat}
                            </span>
                          );
                        })()}
                        <Badge color={badgeColor} size="sm">{badgeLabel}</Badge>
                      </div>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button onClick={() => handlePin(m)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, opacity: m.pinned ? 1 : 0.4 }} title="Pin">📌</button>
                        <button onClick={() => handleCopy(m)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, opacity: 0.6 }} title="Copy">📋</button>
                        <button onClick={() => startEdit(m)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, opacity: 0.6 }} title="Edit">✏️</button>
                        <button onClick={() => setDeletingId(m.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, color: '#ff3b30', opacity: 0.7 }} title="Delete">🗑️</button>
                      </div>
                    </div>

                    <h3 style={{ fontSize: 14.5, fontWeight: 700, color: 'var(--black)', margin: 0 }}>
                      {m.title || m.tag?.title || 'Decision'}
                    </h3>

                    <p style={{ fontSize: 13, color: 'var(--gray-mid)', lineHeight: 1.5, flex: 1, margin: 0, whiteSpace: 'pre-wrap' }}>
                      {m.content || 'No details specified.'}
                    </p>

                    {tags.length > 0 && (
                      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                        {tags.map(t => <Badge key={t} color="gray" size="sm">{t}</Badge>)}
                      </div>
                    )}

                    <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '4px 0 0 0' }} />
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--gray-mid)' }}>
                      <span>📡 {m.tag?.source || m.source || 'agent'} · {formatRelativeTime(m.updated_at || m.created_at || m.tag?.timestamp)}</span>
                      <span>Recalled {hitCount}×</span>
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Delete confirmation modal */}
      {deletingId && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: 'var(--white)', borderRadius: 16, padding: 24, width: 340, display: 'flex', flexDirection: 'column', gap: 16, boxShadow: 'var(--shadow-lg)' }}>
            <span style={{ fontWeight: 700, fontSize: 15, color: '#FF3B30' }}>Delete Decision Rule?</span>
            <div style={{ fontSize: 13, color: 'var(--gray-mid)', lineHeight: 1.5 }}>
              This will remove this rule completely from the memory vault. The AI agent might contradict this rule in future.
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <Button variant="ghost" onClick={() => setDeletingId(null)}>Cancel</Button>
              <Button variant="danger" onClick={() => handleDelete(deletingId)}>Yes, delete</Button>
            </div>
          </div>
        </div>
      )}

      {showAddModal && (
        <Modal
          open
          onClose={() => setShowAddModal(false)}
          title="Add Memory Entry"
          footer={
            <>
              <Button variant="ghost" onClick={() => setShowAddModal(false)}>Cancel</Button>
              <Button variant="primary" onClick={handleAddMemory} disabled={isSaving || !newTitle.trim() || !newContent.trim()} loading={isSaving}>Save Memory</Button>
            </>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Input label="Title *" placeholder="e.g. Use Vite instead of CRA" value={newTitle} onChange={e => setNewTitle(e.target.value)} />

            {/* Category selector */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--gray-mid)' }}>Category *</label>
              <select
                value={newCategory}
                onChange={e => setNewCategory(e.target.value)}
                style={{ height: 38, border: '1px solid var(--border)', borderRadius: 8, fontSize: 13.5, padding: '0 10px', background: 'var(--white)', color: 'var(--black)', outline: 'none' }}
              >
                {CATEGORIES.filter(c => c.id !== 'all').map(c => (
                  <option key={c.id} value={c.label}>{c.icon} {c.label}</option>
                ))}
              </select>
            </div>

            {/* Description */}
            <Input label="Description (optional)" placeholder="Short summary for quick scanning" value={newDescription} onChange={e => setNewDescription(e.target.value)} />

            {/* Content */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--gray-mid)' }}>Full Details *</label>
              <textarea
                placeholder="Full explanation, reasoning, or code snippet..."
                value={newContent}
                onChange={e => setNewContent(e.target.value)}
                rows={4}
                style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1.5px solid var(--border)', fontSize: 14.5, outline: 'none', background: 'var(--white)', color: 'var(--black)', resize: 'vertical', fontFamily: 'inherit' }}
              />
            </div>

            {/* Source */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--gray-mid)' }}>Source</label>
              <select
                value={newSource}
                onChange={e => setNewSource(e.target.value)}
                style={{ height: 38, border: '1px solid var(--border)', borderRadius: 8, fontSize: 13.5, padding: '0 10px', background: 'var(--white)', color: 'var(--black)', outline: 'none' }}
              >
                <option value="manual">Manual Entry</option>
                <option value="upload">Document Upload</option>
                <option value="standup">Standup Meeting</option>
                <option value="agent">AI Agent</option>
              </select>
            </div>

            <Input label="Tags (comma separated)" placeholder="e.g. react, vite, port" value={newTagsStr} onChange={e => setNewTagsStr(e.target.value)} />
          </div>
        </Modal>
      )}
    </div>
  );
}
