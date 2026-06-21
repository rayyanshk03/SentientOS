import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Landing() {
  const navigate = useNavigate();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div style={{
      width: '100vw',
      minHeight: '100vh',
      backgroundColor: '#FFFFFF',
      fontFamily: "'Inter', -apple-system, sans-serif",
      display: 'flex',
      flexDirection: 'column',
      overflowX: 'hidden'
    }}>
      <style>{`
        @keyframes fadeUp {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes subtlePulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(0, 113, 227, 0.4); }
          50% { box-shadow: 0 0 0 8px rgba(0, 113, 227, 0); }
        }
        .animate-fade-up {
          opacity: 0;
          animation: fadeUp 0.6s ease forwards;
        }
        .delay-100 { animation-delay: 100ms; }
        .delay-200 { animation-delay: 200ms; }
        .delay-300 { animation-delay: 300ms; }
        .pulse-btn {
          animation: subtlePulse 3s infinite;
        }

        @media (max-width: 768px) {
          .hero-title { font-size: 40px !important; }
          .cards-container { flexDirection: column !important; }
        }
      `}</style>

      {/* TOP NAVBAR */}
      <nav style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '20px 40px',
        backgroundColor: 'transparent',
        borderBottom: 'none'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#0071E3" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9.5 2h5M12 2v4M12 22v-4" />
            <path d="M12 6a4.5 4.5 0 0 0-4.5 4.5c0 1.5.8 2.7 2 3.5v2M12 6a4.5 4.5 0 0 1 4.5 4.5c0 1.5-.8 2.7-2 3.5v2" />
            <path d="M9.5 16h5" />
            <path d="M6 9.5H2" />
            <path d="M22 9.5h-4" />
            <path d="M4 14.5h2" />
            <path d="M18 14.5h2" />
            <path d="M6.5 19.5 4 22" />
            <path d="M17.5 19.5 20 22" />
          </svg>
          <span style={{ fontSize: '20px', fontWeight: 700, color: '#1D1D1F', letterSpacing: '-0.5px' }}>
            Eternal Architect
          </span>
        </div>
        <button 
          onClick={() => navigate('/app')}
          style={{
            background: '#0071E3',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: '999px',
            padding: '10px 24px',
            fontSize: '14px',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          Launch App <span style={{ fontSize: '16px' }}>→</span>
        </button>
      </nav>

      {/* HERO SECTION */}
      <main style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '80px 24px 60px',
        textAlign: 'center'
      }}>
        {/* Animated tag line */}
        <div 
          className={mounted ? 'animate-fade-up' : ''}
          style={{
            background: '#E8F1FB',
            color: '#0071E3',
            border: '1px solid rgba(0, 113, 227, 0.2)',
            borderRadius: '999px',
            padding: '6px 16px',
            fontSize: '13px',
            fontWeight: 600,
            marginBottom: '32px',
            display: 'inline-block'
          }}
        >
          ⚡ Powered by Parcle + Enter Pro
        </div>

        {/* Main headline */}
        <h1 
          className={`hero-title ${mounted ? 'animate-fade-up' : ''}`}
          style={{
            fontSize: '72px',
            fontWeight: 700,
            color: '#1D1D1F',
            lineHeight: 1.1,
            letterSpacing: '-2px',
            margin: '0 0 24px 0'
          }}
        >
          The AI Engineer<br/>That Never Forgets.
        </h1>

        {/* Subtitle */}
        <p 
          className={mounted ? 'animate-fade-up' : ''}
          style={{
            fontSize: '20px',
            fontWeight: 400,
            color: '#6E6E73',
            maxWidth: '560px',
            lineHeight: 1.5,
            margin: '0 auto 48px auto'
          }}
        >
          Most AI assistants forget everything after the session ends.<br/>
          Eternal Architect remembers every decision, every bug fix, forever.
        </p>

        {/* CTA buttons row */}
        <div 
          className={mounted ? 'animate-fade-up' : ''}
          style={{
            display: 'flex',
            gap: '16px',
            marginBottom: '48px',
            justifyContent: 'center',
            flexWrap: 'wrap'
          }}
        >
          <button
            onClick={() => navigate('/app')}
            className="pulse-btn"
            style={{
              background: '#0071E3',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '999px',
              padding: '16px 36px',
              fontSize: '16px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'transform 0.2s ease, background 0.2s ease'
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.02)'; e.currentTarget.style.background = '#0077ED'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.background = '#0071E3'; }}
          >
            Start Building <span>→</span>
          </button>
          <button
            style={{
              background: 'transparent',
              color: '#1D1D1F',
              border: '1px solid #D2D2D7',
              borderRadius: '999px',
              padding: '16px 36px',
              fontSize: '16px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'background 0.2s ease'
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#F5F5F7'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <span style={{ color: '#6E6E73' }}>▶</span> Watch Demo
          </button>
        </div>

        {/* Social proof */}
        <div 
          className={mounted ? 'animate-fade-up' : ''}
          style={{
            fontSize: '13px',
            color: '#6E6E73',
            fontWeight: 500,
            display: 'flex',
            gap: '12px',
            flexWrap: 'wrap',
            justifyContent: 'center'
          }}
        >
          <span>🔒 Memory persists forever</span>
          <span style={{ color: '#D2D2D7' }}>•</span>
          <span>⚡ Powered by Parcle</span>
          <span style={{ color: '#D2D2D7' }}>•</span>
          <span>🏗️ Built on Enter Pro</span>
        </div>

        {/* FEATURE CARDS SECTION */}
        <div 
          className="cards-container"
          style={{
            display: 'flex',
            gap: '24px',
            marginTop: '80px',
            maxWidth: '1000px',
            width: '100%',
            justifyContent: 'center',
            padding: '0 20px'
          }}
        >
          {[
            {
              emoji: '🧠',
              title: 'Permanent Memory',
              desc: 'Every architectural decision, bug fix, and team discussion stored forever in Parcle.'
            },
            {
              emoji: '⚡',
              title: 'Context-Aware Reasoning',
              desc: 'Before every response, the agent reads your entire project history.'
            },
            {
              emoji: '🚫',
              title: 'Zero Conflicts',
              desc: 'New features never break old decisions. The agent remembers what you agreed on.'
            }
          ].map((card, idx) => (
            <div 
              key={idx}
              className={mounted ? `animate-fade-up delay-${(idx + 1) * 100}` : ''}
              style={{
                flex: 1,
                background: '#FFFFFF',
                border: '1px solid #D2D2D7',
                borderRadius: '16px',
                padding: '32px',
                textAlign: 'left',
                boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,0.08)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.03)';
              }}
            >
              <div style={{
                width: '56px',
                height: '56px',
                background: '#E8F1FB',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '28px',
                marginBottom: '24px'
              }}>
                {card.emoji}
              </div>
              <h3 style={{
                fontSize: '18px',
                fontWeight: 600,
                color: '#1D1D1F',
                margin: '0 0 12px 0'
              }}>
                {card.title}
              </h3>
              <p style={{
                fontSize: '15px',
                color: '#6E6E73',
                margin: 0,
                lineHeight: 1.5
              }}>
                {card.desc}
              </p>
            </div>
          ))}
        </div>
      </main>

      {/* FOOTER */}
      <footer style={{
        padding: '40px 20px',
        textAlign: 'center',
        fontSize: '13px',
        color: '#86868B',
        fontWeight: 500
      }}>
        Built for HackWithMumbai — Track 01: The Sentient Workspace
      </footer>
    </div>
  );
}
