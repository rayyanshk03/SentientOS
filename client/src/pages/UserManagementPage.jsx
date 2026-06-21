import { useState, useEffect } from 'react';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';

export default function UserManagementPage() {
  const [identity, setIdentity] = useState({
    name: 'Rayyan',
    role: 'Builder · IIIT Dharwad',
    techStack: ['React', 'Node.js', 'Vite', 'MongoDB', 'Parcle AI'],
    codingStyle: 'Modular, clean OOP/functional patterns, verbose comments, strict semantic typing',
    projectDescription: 'SentientOS — an AI orchestrator that index architectural choices forever'
  });

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState(identity);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/identity`)
      .then(res => res.json())
      .then(data => {
        if (data && data.name) {
          setIdentity(data);
          setForm(data);
        }
      })
      .catch(console.error);
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/identity/setup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      if (res.ok) {
        setIdentity(form);
        setIsEditing(false);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  const inputStyle = {
    width: '100%', padding: '8px 12px', borderRadius: 8,
    border: '1px solid var(--border)', fontSize: 14,
    fontFamily: 'inherit', color: 'var(--black)', background: 'var(--white)',
    outline: 'none', transition: 'border-color 0.2s', marginTop: 4
  };

  const [teammates] = useState([
    { name: 'Aditya', role: 'DevOps Architect', status: 'Online', avatar: 'A' },
    { name: 'Neha', role: 'UI/UX Designer', status: 'Offline', avatar: 'N' }
  ]);

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
      {/* Header */}
      <div>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--black)', margin: '0 0 4px 0' }}>User Management</h1>
        <p style={{ fontSize: 13, color: 'var(--gray-mid)', margin: 0 }}>Configure workspace member identity context and team permissions</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.2fr', gap: 24, alignItems: 'start' }}>
        
        {/* Left Card: Builder Identity Profile */}
        <div style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 12, padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{
                width: 56, height: 56, borderRadius: '50%',
                background: 'linear-gradient(135deg, #0071E3 0%, #00A3FF 100%)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#FFFFFF', fontWeight: 700, fontSize: 18
              }}>
                {identity.name ? identity.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'U'}
              </div>
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--black)', margin: 0 }}>{identity.name || 'Unnamed Builder'}</h2>
                <p style={{ fontSize: 13, color: 'var(--gray-mid)', margin: 0 }}>{identity.role || 'No role set'}</p>
              </div>
            </div>
            {!isEditing ? (
              <Button size="sm" variant="secondary" onClick={() => { setForm(identity); setIsEditing(true); }}>Edit Profile</Button>
            ) : (
              <div style={{ display: 'flex', gap: 8 }}>
                <Button size="sm" variant="ghost" onClick={() => setIsEditing(false)}>Cancel</Button>
                <Button size="sm" variant="primary" onClick={handleSave} loading={isSaving}>Save</Button>
              </div>
            )}
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: 0 }} />

          {isEditing ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--gray-mid)' }}>Name</label>
                <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} style={inputStyle} />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--gray-mid)' }}>Role</label>
                <input value={form.role} onChange={e => setForm({...form, role: e.target.value})} style={inputStyle} />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--gray-mid)' }}>Tech Stack (comma separated)</label>
                <input value={form.techStack?.join(', ') || ''} onChange={e => setForm({...form, techStack: e.target.value.split(',').map(s => s.trim()).filter(Boolean)})} style={inputStyle} />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--gray-mid)' }}>Coding Style</label>
                <textarea value={form.codingStyle} onChange={e => setForm({...form, codingStyle: e.target.value})} style={{...inputStyle, minHeight: 80, resize: 'vertical'}} />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--gray-mid)' }}>Project Description</label>
                <textarea value={form.projectDescription} onChange={e => setForm({...form, projectDescription: e.target.value})} style={{...inputStyle, minHeight: 80, resize: 'vertical'}} />
              </div>
            </div>
          ) : (
            <>
              <div>
                <h3 style={{ fontSize: 12, fontWeight: 600, color: 'var(--gray-mid)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6 }}>Technology Stack</h3>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {identity.techStack && identity.techStack.length > 0 ? identity.techStack.map(t => (
                    <Badge key={t} color="blue">{t}</Badge>
                  )) : <span style={{ fontSize: 13, color: 'var(--gray-mid)' }}>None specified</span>}
                </div>
              </div>

              <div>
                <h3 style={{ fontSize: 12, fontWeight: 600, color: 'var(--gray-mid)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6 }}>Coding Style Directives</h3>
                <p style={{ fontSize: 13, color: 'var(--black)', lineHeight: 1.5, background: 'var(--gray-light)', padding: 12, borderRadius: 8, margin: 0 }}>
                  {identity.codingStyle || 'None specified'}
                </p>
              </div>

              <div>
                <h3 style={{ fontSize: 12, fontWeight: 600, color: 'var(--gray-mid)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6 }}>Active Project context</h3>
                <p style={{ fontSize: 13, color: 'var(--gray-mid)', lineHeight: 1.5, margin: 0 }}>
                  {identity.projectDescription || 'None specified'}
                </p>
              </div>
            </>
          )}
        </div>

        {/* Right Card: Teammates */}
        <div style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 12, padding: 20 }}>
          <h2 style={{ fontSize: 15, fontWeight: 600, color: 'var(--black)', marginBottom: 16 }}>Workspace Team</h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {teammates.map(t => (
              <div key={t.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: '50%', background: '#F5F5F7', border: '1px solid var(--border)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 600, color: 'var(--black)'
                  }}>
                    {t.avatar}
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--black)' }}>{t.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--gray-mid)' }}>{t.role}</div>
                  </div>
                </div>
                <Badge color={t.status === 'Online' ? 'green' : 'gray'}>{t.status}</Badge>
              </div>
            ))}

            <button style={{
              marginTop: 8, padding: '8px 12px', border: '1px dashed var(--border)', background: 'transparent',
              color: 'var(--blue)', fontSize: 12.5, fontWeight: 500, borderRadius: 8, cursor: 'pointer'
            }}>
              + Invite Teammate
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
