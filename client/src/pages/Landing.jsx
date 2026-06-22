import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const StatNumber = ({ targetText, targetNumber, prefix = "", suffix = "" }) => {
  const [value, setValue] = useState(0);
  const ref = useRef(null);
  
  useEffect(() => {
    if (targetText) return; // If static text provided, skip animation
    
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        if (targetNumber === 0) {
          setValue(0);
          observer.disconnect();
          return;
        }

        let start = 0;
        const duration = 1500;
        const increment = targetNumber / (duration / 16);
        
        const timer = setInterval(() => {
          start += increment;
          if (start >= targetNumber) {
            setValue(targetNumber);
            clearInterval(timer);
          } else {
            setValue(Math.floor(start));
          }
        }, 16);
        
        observer.disconnect();
      }
    }, { threshold: 0.5 });
    
    if (ref.current) {
      observer.observe(ref.current);
    }
    
    return () => observer.disconnect();
  }, [targetNumber, targetText]);

  return (
    <div ref={ref} style={{
      fontSize: '36px',
      fontWeight: 700,
      background: 'linear-gradient(135deg, #60A5FA 0%, #A78BFA 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
      lineHeight: 1.2
    }}>
      {targetText ? targetText : `${prefix}${value}${suffix}`}
    </div>
  );
};

const StatsStrip = () => {
  return (
    <div style={{
      width: '100%',
      padding: '40px 24px',
      borderTop: '1px solid rgba(0,0,0,0.06)',
      borderBottom: '1px solid rgba(0,0,0,0.06)',
      background: 'rgba(0,0,0,0.03)',
      display: 'flex',
      justifyContent: 'center',
      position: 'relative',
      zIndex: 10,
      boxSizing: 'border-box'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '60px',
        maxWidth: '900px',
        width: '100%',
        flexWrap: 'wrap'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <StatNumber targetText="∞ Permanent" />
          <div style={{ color: '#6E6E73', fontSize: '13px', fontWeight: 400, marginTop: '6px' }}>
            Memory retention
          </div>
        </div>

        <div className="stat-divider" style={{ width: '1px', height: '48px', background: 'rgba(0,0,0,0.06)' }} />

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <StatNumber targetNumber={1} prefix="< " suffix="s" />
          <div style={{ color: '#6E6E73', fontSize: '13px', fontWeight: 400, marginTop: '6px' }}>
            Context retrieval
          </div>
        </div>

        <div className="stat-divider" style={{ width: '1px', height: '48px', background: 'rgba(0,0,0,0.06)' }} />

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <StatNumber targetNumber={0} />
          <div style={{ color: '#6E6E73', fontSize: '13px', fontWeight: 400, marginTop: '6px' }}>
            Repeated mistakes
          </div>
        </div>
      </div>
    </div>
  );
};

const ScrollFadeIn = ({ children, delay = 0 }) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        setIsVisible(true);
        observer.disconnect();
      }
    }, { threshold: 0.2 });

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(40px)',
        transition: `opacity 0.6s ease-out ${delay}ms, transform 0.6s ease-out ${delay}ms`,
        height: '100%',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {children}
    </div>
  );
};

const TerminalAnimation = () => {
  const lines = [
    { text: "> Querying Parcle memory...", color: "#6E6E73" },
    { text: "✓ Found 3 relevant decisions", color: "#28C840" },
    { text: "> Building context-aware prompt...", color: "#6E6E73" },
    { text: "✓ Architecture: FastAPI + MongoDB", color: "#28C840" },
    { text: "✓ Style: Apple design system", color: "#28C840" },
    { text: "> Generating response...", color: "#6E6E73" },
    { text: "✓ Done. Memory saved to Parcle.", color: "#0071E3" }
  ];

  const [currentLine, setCurrentLine] = useState(0);
  const [currentChar, setCurrentChar] = useState(0);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    if (fading) return;

    if (currentLine >= lines.length) {
      const finishTimeout = setTimeout(() => {
        setFading(true);
        setTimeout(() => {
          setCurrentLine(0);
          setCurrentChar(0);
          setFading(false);
        }, 1000);
      }, 2000);
      return () => clearTimeout(finishTimeout);
    }

    const line = lines[currentLine].text;
    if (currentChar < line.length) {
      const typeTimeout = setTimeout(() => {
        setCurrentChar(prev => prev + 1);
      }, 30);
      return () => clearTimeout(typeTimeout);
    } else {
      const lineTimeout = setTimeout(() => {
        setCurrentLine(prev => prev + 1);
        setCurrentChar(0);
      }, 200);
      return () => clearTimeout(lineTimeout);
    }
  }, [currentLine, currentChar, fading]);

  return (
    <div className="terminal-card">
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#FF5F57' }} />
          <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#FEBC2E' }} />
          <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#28C840' }} />
        </div>
        <div style={{ flex: 1, textAlign: 'center', color: '#6E6E73', fontSize: '12px', marginLeft: '-44px' }}>
          eternal-architect
        </div>
      </div>
      <div style={{ minHeight: '160px', opacity: fading ? 0 : 1, transition: 'opacity 1s ease' }}>
        {lines.map((line, idx) => {
          if (idx < currentLine) return <div key={idx} style={{ color: line.color }}>{line.text}</div>;
          if (idx === currentLine) {
            return (
              <div key={idx} style={{ color: line.color }}>
                {line.text.substring(0, currentChar)}
                <span className="cursor-blink">|</span>
              </div>
            );
          }
          return null;
        })}
      </div>
    </div>
  );
};

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
      color: '#1D1D1F',
      fontFamily: "'Inter', -apple-system, sans-serif",
      display: 'flex',
      flexDirection: 'column',
      overflowX: 'hidden',
      position: 'relative'
    }}>
      <style>{`
        /* Global Reset for this view */
        body { 
          background-color: #1D1D1F; 
          background-image: 
            linear-gradient(to right, rgba(249, 115, 22, 0.07) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(249, 115, 22, 0.07) 1px, transparent 1px);
          background-size: 40px 40px;
          margin: 0; 
        }
        
        @keyframes fadeUp {
          0% { opacity: 0; transform: translateY(30px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes float-card {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        @keyframes float-orb-1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33%  { transform: translate(60px, 40px) scale(1.05); }
          66%  { transform: translate(-30px, 60px) scale(0.95); }
        }
        @keyframes float-orb-2 {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(-80px, 80px); }
        }
        @keyframes float-orb-3 {
          0% { transform: translateX(-50%) translateY(0); }
          100% { transform: translateX(-55%) translateY(-60px) scale(1.05); }
        }
        @keyframes logo-pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(0,113,227,0.4); }
          50% { box-shadow: 0 0 0 8px rgba(0,113,227,0); }
        }
        @keyframes pulseGlow {
          0%, 100% { box-shadow: 0 0 20px rgba(0, 113, 227, 0.4), inset 0 0 0 rgba(255,255,255,0); }
          50% { box-shadow: 0 0 35px rgba(0, 113, 227, 0.7), inset 0 0 10px rgba(255,255,255,0.1); }
        }
        @keyframes borderGlow {
          0%, 100% { border-color: rgba(124, 58, 237, 0.2); box-shadow: 0 0 15px rgba(124, 58, 237, 0.1); }
          50% { border-color: rgba(6, 182, 212, 0.5); box-shadow: 0 0 25px rgba(6, 182, 212, 0.2); }
        }

        @keyframes gradient-shift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes ring-pulse {
          0% { transform: scale(1); opacity: 1; }
          100% { transform: scale(1.4); opacity: 0; }
        }
        @keyframes cursor-blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }

        .cursor-blink { animation: cursor-blink 1s step-end infinite; }
        
        .animate-fade-up {
          opacity: 0;
          animation: fadeUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        .feat-card {
          background: rgba(0,0,0,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 20px;
          padding: 32px 28px;
          position: relative;
          overflow: hidden;
          transition: all 0.3s ease;
          text-align: left;
          display: flex;
          flex-direction: column;
          height: 100%;
          box-sizing: border-box;
        }
        .feat-card:hover {
          background: rgba(0,0,0,0.06);
          border-color: rgba(0,0,0,0.1);
          transform: translateY(-6px);
          box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        }
        .feat-card::before {
          content: "";
          position: absolute;
          top: 0; left: 0;
          width: 200px; height: 200px;
          opacity: 0;
          transition: opacity 0.3s ease;
          pointer-events: none;
        }
        .feat-card:hover::before {
          opacity: 0.08;
        }
        .feat-card-1::before { background: radial-gradient(circle at top left, #0071E3, transparent 70%); }
        .feat-card-2::before { background: radial-gradient(circle at top left, #7C3AED, transparent 70%); }
        .feat-card-3::before { background: radial-gradient(circle at top left, #06B6D4, transparent 70%); }

        .feat-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
        }

        .timeline-container {
          display: flex;
          justify-content: space-between;
          position: relative;
          margin-top: 48px;
        }
        .timeline-line {
          position: absolute;
          top: 23px;
          left: 10%;
          right: 10%;
          border-top: 2px dashed rgba(255,255,255,0.1);
          z-index: 0;
        }
        .timeline-step {
          display: flex;
          flex-direction: column;
          align-items: center;
          position: relative;
          z-index: 1;
          flex: 1;
        }

        .footer-content {
          display: grid;
          grid-template-columns: 1fr auto 1fr;
          align-items: center;
          gap: 24px;
          max-width: 1100px;
          margin: 0 auto;
        }
        .footer-left { justify-self: start; }
        .footer-center { justify-self: center; }
        .footer-right { justify-self: end; text-align: right; }

        .terminal-card {
          width: 100%;
          max-width: 560px;
          margin: 40px auto;
          background: rgba(0,0,0,0.03);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 16px;
          padding: 20px 24px;
          box-shadow: 0 0 60px rgba(0,113,227,0.1), 0 32px 64px rgba(0,0,0,0.4);
          text-align: left;
          font-family: 'JetBrains Mono', monospace;
          font-size: 13px;
          line-height: 1.8;
          opacity: 0;
          animation: fadeUp 1s ease-out forwards;
          animation-delay: 0.7s;
        }

        .primary-btn-wrapper {
          position: relative;
          display: inline-block;
          opacity: 0;
          animation: fadeUp 0.6s ease-out forwards;
          animation-delay: 0.9s;
        }
        .primary-btn-wrapper::after {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          border-radius: 980px;
          border: 2px solid rgba(0, 113, 227, 0.4);
          animation: ring-pulse 2s ease-out infinite;
          pointer-events: none;
        }
        .hero-btn {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 16px 32px;
          border-radius: 980px;
          font-family: 'Inter', sans-serif;
          cursor: pointer;
          transition: all 0.2s ease-out;
        }
        .hero-btn-primary {
          background: linear-gradient(135deg, #0071E3, #0051A3);
          color: #FFFFFF;
          font-size: 16px;
          font-weight: 600;
          border: none;
          box-shadow: 0 0 30px rgba(0,113,227,0.35), 0 4px 16px rgba(0,0,0,0.3);
          position: relative;
          z-index: 2;
        }
        .hero-btn-primary:hover {
          transform: translateY(-2px) scale(1.02);
          box-shadow: 0 0 50px rgba(0,113,227,0.5);
        }
        .hero-btn-primary:active {
          transform: scale(0.98);
        }

        .hero-btn-secondary {
          background: rgba(0,0,0,0.06);
          border: 1px solid rgba(0,0,0,0.1);
          color: #1D1D1F;
          font-size: 16px;
          font-weight: 500;
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          opacity: 0;
          animation: fadeUp 0.6s ease-out forwards;
          animation-delay: 0.9s;
        }
        .hero-btn-secondary:hover {
          background: rgba(0,0,0,0.08);
          border-color: rgba(0,0,0,0.15);
          transform: translateY(-1px);
        }

        .nav-btn {
          transition: all 0.2s;
        }
        .nav-btn:hover {
          background: #0077ED !important;
          box-shadow: 0 0 30px rgba(0,113,227,0.6) !important;
          transform: translateY(-1px);
        }

        .text-gradient {
          background: linear-gradient(180deg, #1D1D1F 0%, #6E6E73 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        @media (max-width: 900px) {
          .feat-grid { grid-template-columns: 1fr; }
          .hero-layout {
            flex-direction: column;
            text-align: center;
            padding-top: 100px !important;
          }
          .hero-layout-left {
            align-items: center !important;
            text-align: center !important;
          }
          .hero-buttons {
            justify-content: center !important;
          }
          .hero-layout-right {
            justify-content: center !important;
            margin-top: 40px;
          }
        }
        @media (max-width: 768px) {
          .hero-title { font-size: 44px !important; }
          .cta-title { font-size: 40px !important; }
          .stat-divider { display: none !important; }
          .timeline-container {
            flex-direction: column;
            gap: 40px;
          }
          .timeline-line {
            top: 24px; bottom: 24px;
            left: 50%; right: auto;
            border-top: none;
            border-left: 2px dashed rgba(255,255,255,0.1);
            transform: translateX(-50%);
          }
          .footer-content {
            grid-template-columns: 1fr;
            text-align: center;
          }
          .footer-left, .footer-center, .footer-right {
            justify-self: center;
            text-align: center;
          }
          .footer-left {
            display: flex;
            flex-direction: column;
            align-items: center;
          }
          .footer-center { order: 3; margin-top: 16px; }
        }
      `}</style>

      {/* AMBIENT BACKGROUND GLOWS */}
      <div style={{
        position: 'fixed', top: '-200px', left: '-200px', width: '600px', height: '600px',
        background: 'radial-gradient(circle, rgba(0,113,227,0.15), transparent 70%)',
        pointerEvents: 'none', zIndex: 0,
        animation: 'float-orb-1 12s ease-in-out infinite'
      }} />
      <div style={{
        position: 'fixed', top: '-100px', right: '-200px', width: '500px', height: '500px',
        background: 'radial-gradient(circle, rgba(124,58,237,0.12), transparent 70%)',
        pointerEvents: 'none', zIndex: 0,
        animation: 'float-orb-2 15s ease-in-out infinite'
      }} />
      <div style={{
        position: 'fixed', bottom: '-200px', left: '50%', width: '700px', height: '400px',
        background: 'radial-gradient(ellipse, rgba(6,182,212,0.08), transparent 70%)',
        pointerEvents: 'none', zIndex: 0,
        animation: 'float-orb-3 18s ease-in-out infinite alternate',
        transform: 'translateX(-50%)'
      }} />

      {/* NOISE OVERLAY */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 1, pointerEvents: 'none', opacity: 0.03,
        backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")'
      }} />

      {/* CONTENT WRAPPER */}
      <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        
        {/* TOP NAVBAR */}
        <nav style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          position: 'fixed',
          top: 0, left: 0, right: 0,
          width: '100%',
          height: '60px',
          padding: '0 48px',
          boxSizing: 'border-box',
          background: 'rgba(245,245,247,0.7)',
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
          borderBottom: '1px solid rgba(0,0,0,0.06)',
          zIndex: 100
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              background: 'linear-gradient(135deg, #0071E3, #7C3AED)',
              borderRadius: '8px',
              padding: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              animation: 'logo-pulse 3s infinite'
            }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#1D1D1F" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
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
            </div>
            <span style={{ fontSize: '16px', fontWeight: 600, color: '#1D1D1F', letterSpacing: '-0.3px', fontFamily: "'Inter', -apple-system, sans-serif" }}>
              SentientOS
            </span>
          </div>
          <button 
            onClick={() => navigate('/app')}
            className="nav-btn"
            style={{
              background: '#0071E3',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '980px',
              padding: '10px 20px',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 0 20px rgba(0,113,227,0.4)',
              fontFamily: "'Inter', -apple-system, sans-serif"
            }}
          >
            Launch App <span>→</span>
          </button>
        </nav>

        {/* HERO SECTION WRAPPER */}
      <div style={{
        background: '#FFFFFF',
        width: '100%',
        position: 'relative'
      }}>
        <main 
          className="hero-layout"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '160px 24px 80px',
            maxWidth: '1200px',
            margin: '0 auto',
            width: '100%',
            position: 'relative',
            zIndex: 10,
            gap: '40px'
          }}
        >
          {/* LEFT SIDE: TEXT CONTENT */}
          <div className="hero-layout-left" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', textAlign: 'left' }}>
            {/* Animated badge */}
            <div 
              style={{
                background: 'rgba(0,113,227,0.1)',
                color: '#0071E3',
                border: '1px solid rgba(249,115,22,0.3)',
                borderRadius: '980px',
                padding: '6px 16px',
                fontSize: '13px',
                fontWeight: 600,
                marginBottom: '36px',
                display: 'inline-block',
                opacity: 0,
                animation: 'fadeUp 0.6s ease-out forwards',
                animationDelay: '0.1s'
              }}
            >
              ⚡ Powered by Parcle + Enter Pro
            </div>

            {/* Main headline */}
            <h1 
              className="hero-title"
              style={{
                fontSize: '80px',
                fontWeight: 800,
                lineHeight: 1.05,
                letterSpacing: '-3px',
                margin: '0 0 28px 0',
                opacity: 0,
                animation: 'fadeUp 0.8s ease-out forwards',
                animationDelay: '0.3s'
              }}
            >
              <span style={{ color: '#1D1D1F' }}>The AI Engineer</span><br/>
              <span style={{ color: '#0071E3' }}>That Never Forgets.</span>
            </h1>

            {/* Subtitle */}
            <p 
              style={{
                fontSize: '20px',
                fontWeight: 500,
                color: '#6E6E73',
                maxWidth: '560px',
                lineHeight: 1.7,
                margin: '0 0 40px 0',
                opacity: 0,
                animation: 'fadeUp 0.8s ease-out forwards',
                animationDelay: '0.5s'
              }}
            >
              Most AI assistants forget everything after the session ends.<br/>
              SentientOS remembers every decision, every bug fix, forever.
            </p>

            {/* CTA buttons row */}
            <div 
              className="hero-buttons"
              style={{
                display: 'flex',
                gap: '16px',
                flexWrap: 'wrap'
              }}
            >
              <div className="primary-btn-wrapper">
                <button
                  onClick={() => navigate('/app')}
                  className="hero-btn hero-btn-primary"
                >
                  Launch App <span style={{ transition: 'transform 0.2s', display: 'inline-block' }}>→</span>
                </button>
              </div>
              <button
                onClick={() => navigate('/documents')}
                className="hero-btn hero-btn-secondary"
              >
                View Documentation
              </button>
            </div>
          </div>

          {/* RIGHT SIDE: FLOATING CODE */}
          <div className="hero-layout-right" style={{ flex: 1, display: 'flex', justifyContent: 'flex-end', position: 'relative' }}>
            <div style={{
              animation: 'float-card 6s ease-in-out infinite'
            }}>
              <TerminalAnimation />
            </div>
          </div>
        </main>
      </div>

        {/* Social proof */}
        <div 
          style={{
            fontSize: '13px',
            color: '#6E6E73',
            fontWeight: 400,
            display: 'flex',
            gap: '12px',
            flexWrap: 'wrap',
            justifyContent: 'center',
            alignItems: 'center',
            marginTop: '24px',
            opacity: 0,
            animation: 'fadeUp 0.6s ease-out forwards',
            animationDelay: '1.1s'
          }}
        >
          <span>🔒 Memory persists forever</span>
          <span style={{ color: 'rgba(0,0,0,0.15)' }}>·</span>
          <span>⚡ Powered by Parcle</span>
          <span style={{ color: 'rgba(0,0,0,0.15)' }}>·</span>
          <span>🏗️ Built on Enter Pro</span>
        </div>

      {/* STATS STRIP SECTION */}
      <StatsStrip />

      {/* FEATURE CARDS SECTION */}
      <div 
        style={{
          padding: '80px 24px',
          maxWidth: '1100px',
          margin: '0 auto',
          width: '100%',
          boxSizing: 'border-box'
        }}
      >
        <div style={{
          color: '#0071E3',
          fontFamily: "'Inter', sans-serif",
          fontWeight: 600,
          fontSize: '11px',
          letterSpacing: '2px',
          textAlign: 'center',
          marginBottom: '16px'
        }}>
          WHAT MAKES IT DIFFERENT
        </div>
        
        <h2 style={{
          fontFamily: "'Inter', sans-serif",
          fontWeight: 700,
          fontSize: '40px',
          color: '#1D1D1F',
          textAlign: 'center',
          margin: '0 0 56px 0'
        }}>
          Built different. Built to remember.
        </h2>

        <div className="feat-grid">
          {/* Card 1 */}
          <ScrollFadeIn delay={0}>
            <div className="feat-card feat-card-1">
              <div style={{
                width: '56px', height: '56px',
                borderRadius: '14px',
                background: 'rgba(0,113,227,0.12)',
                border: '1px solid rgba(0,113,227,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '28px'
              }}>
                🧠
              </div>
              <div style={{
                width: '32px', height: '2px', background: '#0071E3',
                borderRadius: '1px', margin: '20px 0 16px 0'
              }} />
              <h3 style={{ margin: '0 0 12px 0', fontSize: '20px', fontWeight: 600, color: '#1D1D1F', fontFamily: "'Inter', sans-serif" }}>
                Permanent Memory
              </h3>
              <p style={{ margin: 0, fontSize: '15px', color: '#6E6E73', lineHeight: 1.7, fontFamily: "'Inter', sans-serif", flex: 1 }}>
                Every architectural decision, bug fix, and team discussion stored forever in Parcle.
              </p>
              <div style={{ color: '#60A5FA', fontSize: '13px', fontWeight: 500, fontFamily: "'Inter', sans-serif", marginTop: '20px' }}>
                Powered by Parcle →
              </div>
            </div>
          </ScrollFadeIn>

          {/* Card 2 */}
          <ScrollFadeIn delay={100}>
            <div className="feat-card feat-card-2">
              <div style={{
                width: '56px', height: '56px',
                borderRadius: '14px',
                background: 'rgba(124,58,237,0.12)',
                border: '1px solid rgba(124,58,237,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '28px'
              }}>
                ⚡
              </div>
              <div style={{
                width: '32px', height: '2px', background: '#7C3AED',
                borderRadius: '1px', margin: '20px 0 16px 0'
              }} />
              <h3 style={{ margin: '0 0 12px 0', fontSize: '20px', fontWeight: 600, color: '#1D1D1F', fontFamily: "'Inter', sans-serif" }}>
                Context-Aware Reasoning
              </h3>
              <p style={{ margin: 0, fontSize: '15px', color: '#6E6E73', lineHeight: 1.7, fontFamily: "'Inter', sans-serif", flex: 1 }}>
                Before every response, the agent reads your entire project history.
              </p>
              <div style={{ color: '#A78BFA', fontSize: '13px', fontWeight: 500, fontFamily: "'Inter', sans-serif", marginTop: '20px' }}>
                Powered by Claude →
              </div>
            </div>
          </ScrollFadeIn>

          {/* Card 3 */}
          <ScrollFadeIn delay={200}>
            <div className="feat-card feat-card-3">
              <div style={{
                width: '56px', height: '56px',
                borderRadius: '14px',
                background: 'rgba(6,182,212,0.12)',
                border: '1px solid rgba(6,182,212,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '28px'
              }}>
                🚫
              </div>
              <div style={{
                width: '32px', height: '2px', background: '#06B6D4',
                borderRadius: '1px', margin: '20px 0 16px 0'
              }} />
              <h3 style={{ margin: '0 0 12px 0', fontSize: '20px', fontWeight: 600, color: '#1D1D1F', fontFamily: "'Inter', sans-serif" }}>
                Zero Conflicts
              </h3>
              <p style={{ margin: 0, fontSize: '15px', color: '#6E6E73', lineHeight: 1.7, fontFamily: "'Inter', sans-serif", flex: 1 }}>
                New features never break old decisions. The agent remembers what you agreed on.
              </p>
              <div style={{ color: '#22D3EE', fontSize: '13px', fontWeight: 500, fontFamily: "'Inter', sans-serif", marginTop: '20px' }}>
                Powered by Enter Pro →
              </div>
            </div>
          </ScrollFadeIn>
        </div>
      </div>

      {/* HOW IT WORKS SECTION */}
      <div 
        className={mounted ? 'animate-fade-up delay-400' : ''}
        style={{
          padding: '80px 24px',
          maxWidth: '800px',
          margin: '0 auto',
          width: '100%',
          boxSizing: 'border-box',
          textAlign: 'center'
        }}
      >
        <div style={{
          color: '#0071E3',
          fontFamily: "'Inter', sans-serif",
          fontWeight: 600,
          fontSize: '11px',
          letterSpacing: '2px',
          marginBottom: '16px'
        }}>
          THE PROCESS
        </div>
        
        <h2 style={{
          fontFamily: "'Inter', sans-serif",
          fontWeight: 700,
          fontSize: '40px',
          color: '#1D1D1F',
          margin: '0 0 56px 0'
        }}>
          From question to memory in seconds.
        </h2>

        <div className="timeline-container">
          <div className="timeline-line" />
          {[
            { num: 1, title: "You ask", desc: "Type any task or question" },
            { num: 2, title: "Memory searched", desc: "Parcle finds relevant past decisions" },
            { num: 3, title: "Agent reasons", desc: "Claude uses context to respond", active: true },
            { num: 4, title: "Saved forever", desc: "Decision stored back in Parcle" }
          ].map((step, i) => (
            <div key={i} className="timeline-step">
              <div style={{
                width: '48px', height: '48px',
                borderRadius: '50%',
                background: step.active ? 'rgba(0,113,227,0.2)' : 'rgba(0,0,0,0.04)',
                border: step.active ? '1px solid #0071E3' : '1px solid rgba(255,255,255,0.1)',
                boxShadow: step.active ? '0 0 20px rgba(0,113,227,0.3)' : 'none',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: '16px',
                zIndex: 2, // Above the dashed line
                position: 'relative'
              }}>
                <span style={step.active ? {
                  color: '#60A5FA',
                  fontWeight: 700, fontSize: '16px', fontFamily: "'Inter', sans-serif"
                } : {
                  background: 'linear-gradient(135deg, #1D1D1F 0%, #6E6E73 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  fontWeight: 700, fontSize: '16px', fontFamily: "'Inter', sans-serif"
                }}>
                  {step.num}
                </span>
              </div>
              <h4 style={{ margin: '0 0 4px 0', fontSize: '15px', fontWeight: 600, color: '#1D1D1F', fontFamily: "'Inter', sans-serif" }}>
                {step.title}
              </h4>
              <p style={{ margin: 0, fontSize: '13px', color: '#6E6E73', fontWeight: 400, fontFamily: "'Inter', sans-serif", maxWidth: '160px' }}>
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* BOTTOM CTA SECTION */}
      <div 
        className={mounted ? 'animate-fade-up delay-500' : ''}
        style={{
          padding: '100px 24px',
          textAlign: 'center',
          position: 'relative',
          width: '100%',
          boxSizing: 'border-box'
        }}
      >
        {/* Ambient Glow */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '600px',
          height: '400px',
          background: 'radial-gradient(circle, rgba(0,113,227,0.08) 0%, transparent 70%)',
          pointerEvents: 'none',
          zIndex: 0
        }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <h2 
            className="cta-title"
            style={{
              fontFamily: "'Inter', sans-serif",
              fontWeight: 800,
              fontSize: '56px',
              lineHeight: 1.1,
              letterSpacing: '-2px',
              margin: '0 0 16px 0',
              background: 'linear-gradient(135deg, #1D1D1F 0%, #60A5FA 50%, #A78BFA 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Your team's memory starts now.
          </h2>

          <p style={{
            fontFamily: "'Inter', sans-serif",
            fontWeight: 400,
            fontSize: '18px',
            color: '#6E6E73',
            margin: '0 0 40px 0'
          }}>
            Every session. Every decision. Remembered forever.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
            <div className="primary-btn-wrapper">
              <button
                onClick={() => navigate('/app')}
                className="hero-btn hero-btn-primary"
                style={{
                  padding: '18px 40px',
                  fontSize: '18px'
                }}
              >
                Start Building for Free <span style={{ transition: 'transform 0.2s', display: 'inline-block' }}>→</span>
              </button>
            </div>
          </div>

          <div style={{
            fontFamily: "'Inter', sans-serif",
            fontWeight: 400,
            fontSize: '13px',
            color: '#6E6E73'
          }}>
            No setup required · Free during hackathon
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <footer style={{
        padding: '40px 24px',
        background: 'rgba(0,0,0,0.15)',
        borderTop: '1px solid rgba(0,0,0,0.06)',
        position: 'relative',
        zIndex: 10,
        marginTop: 'auto',
        fontFamily: "'Inter', sans-serif"
      }}>
        <div className="footer-content">
          {/* LEFT */}
          <div className="footer-left" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1D1D1F" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
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
              <span style={{ fontSize: '14px', fontWeight: 600, color: '#1D1D1F' }}>
                SentientOS
              </span>
            </div>
            <div style={{ fontSize: '12px', fontWeight: 400, color: '#6E6E73' }}>
              Built for HackWithChennai — Track 01
            </div>
          </div>

          {/* CENTER */}
          <div className="footer-center" style={{
            fontSize: '11px',
            fontWeight: 400,
            color: '#3D3D3F'
          }}>
            © 2026 Team Orion · IIIT Dharwad
          </div>

          {/* RIGHT */}
          <div className="footer-right" style={{ 
            fontSize: '12px', 
            fontWeight: 400,
            color: '#6E6E73'
          }}>
            Parcle · Enter Pro API
          </div>
        </div>
      </footer>
      
      </div> {/* End content wrapper */}
    </div>
  );
}
