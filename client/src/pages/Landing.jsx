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
    { text: "✓ Found 3 relevant decisions", color: "#A3E635" },
    { text: "> Building context-aware prompt...", color: "#6E6E73" },
    { text: "✓ Architecture: FastAPI + MongoDB", color: "#A3E635" },
    { text: "✓ Style: Apple design system", color: "#A3E635" },
    { text: "> Generating response...", color: "#6E6E73" },
    { text: "✓ Done. Memory saved to Parcle.", color: "#A855F7" }
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
      <div style={{ height: '280px', opacity: fading ? 0 : 1, transition: 'opacity 1s ease' }}>
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
      fontFamily: "'Space Grotesk', -apple-system, sans-serif",
      display: 'flex',
      flexDirection: 'column',
      overflowX: 'hidden',
      position: 'relative'
    }}>
      <style>{`
        /* Global Reset for this view */
        body { 
          background-color: #FFFFFF; 
          margin: 0; 
        }
        
        @keyframes fadeUp {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
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
          background: #F5F5F7;
          border: 1px solid rgba(0,0,0,0.05);
          border-radius: 24px;
          padding: 32px 28px;
          position: relative;
          overflow: hidden;
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
          text-align: left;
          display: flex;
          flex-direction: column;
          height: 100%;
          box-sizing: border-box;
        }
        .feat-card:hover {
          transform: translateY(-4px) scale(1.01);
          box-shadow: 0 16px 40px rgba(0,0,0,0.06);
          border-color: rgba(0,0,0,0.08);
        }

                .feat-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 24px;
        }

        .neo-card {
          border: 2px solid #1D1D1F;
          border-radius: 32px;
          padding: 48px 40px;
          box-shadow: 0 8px 0 #1D1D1F;
          min-height: 280px;
          display: flex;
          position: relative;
          overflow: hidden;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .neo-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 0 #1D1D1F;
        }
        
        .neo-card-content {
          display: flex;
          flex-direction: column;
          z-index: 2;
          width: 60%;
        }

        .neo-card-graphic {
          position: absolute;
          right: 40px;
          top: 50%;
          transform: translateY(-50%);
          z-index: 1;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .neo-pill {
          display: inline-block;
          padding: 2px 12px;
          border-radius: 8px;
          font-weight: 600;
          font-size: 26px;
          letter-spacing: -0.5px;
          margin-bottom: 4px;
          width: fit-content;
        }

        .neo-subtitle {
          font-size: 26px;
          font-weight: 500;
          letter-spacing: -0.5px;
          margin-top: 0;
          margin-bottom: 24px;
        }

        .neo-learn-more {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-top: auto;
          cursor: pointer;
        }

        .neo-lm-circle {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          font-weight: bold;
        }

        .neo-lm-text {
          font-size: 15px;
          font-weight: 500;
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
          width: 680px;
          min-width: 680px;
          height: 380px;
          flex-shrink: 0;
          box-sizing: border-box;
          margin: 0;
          background: #111111;
          border-radius: 16px;
          border: 3px solid #1D1D1F;
          padding: 32px 36px;
          box-shadow: 16px 16px 0 #A855F7;
          text-align: left;
          font-family: 'JetBrains Mono', 'Courier New', monospace;
          font-size: 16px;
          line-height: 2;
          opacity: 0;
          animation: fadeUp 1s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          animation-delay: 0.5s;
        }

        .primary-btn-wrapper {
          position: relative;
          display: inline-block;
          opacity: 0;
          animation: fadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          animation-delay: 0.7s;
        }
        .hero-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          padding: 16px 32px;
          border-radius: 12px;
          font-family: 'Space Grotesk', -apple-system, sans-serif;
          cursor: pointer;
          transition: all 0.15s ease;
          font-size: 16px;
          font-weight: 600;
          min-width: 160px;
        }
        .hero-btn-primary {
          background: #A855F7;
          color: #FFFFFF;
          border: 2px solid #1D1D1F;
          box-shadow: 0 4px 0 #1D1D1F;
        }
        .hero-btn-primary:hover {
          background: #9333EA;
          transform: translateY(-2px);
          box-shadow: 0 6px 0 #1D1D1F;
        }
        .hero-btn-primary:active {
          transform: translateY(2px);
          box-shadow: 0 2px 0 #1D1D1F;
        }

        .hero-btn-secondary {
          background: #FFFFFF;
          color: #1D1D1F;
          border: 2px solid #1D1D1F;
          box-shadow: 0 4px 0 #1D1D1F;
        }
        .hero-btn-secondary:hover {
          background: #FAFAFA;
          transform: translateY(-2px);
          box-shadow: 0 6px 0 #1D1D1F;
        }
        .hero-btn-secondary:active {
          transform: translateY(2px);
          box-shadow: 0 2px 0 #1D1D1F;
        }

        .nav-btn {
          background: #A855F7;
          color: #FFFFFF;
          border: 2px solid #1D1D1F;
          box-shadow: 0 2px 0 #1D1D1F;
          border-radius: 12px;
          padding: 8px 16px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          font-family: 'Space Grotesk', -apple-system, sans-serif;
          transition: all 0.15s ease;
        }
        .nav-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 0 #1D1D1F;
        }
        .nav-btn:active {
          transform: translateY(1px);
          box-shadow: 0 1px 0 #1D1D1F;
        }

        .nav-glass {
          background: rgba(255, 255, 255, 0.7);
          backdrop-filter: saturate(180%) blur(20px);
          -webkit-backdrop-filter: saturate(180%) blur(20px);
          border-bottom: 1px solid rgba(0,0,0,0.05);
        }

        @media (max-width: 900px) {
          .feat-grid {
            grid-template-columns: 1fr;
          }
          .neo-card {
            padding: 32px;
            min-height: 240px;
          }
          .neo-card-graphic {
            right: -20px;
            opacity: 0.5;
          }
          .footer-content {
            grid-template-columns: 1fr;
            text-align: center;
            gap: 16px;
          }
          .footer-left, .footer-center, .footer-right {
            justify-self: center;
            text-align: center;
          }
        }
`}</style>

            {/* 4K DYNAMIC THEME BACKGROUND */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, overflow: 'hidden', background: '#FAFAFA' }}>
        {/* Animated CSS Grid */}
        <div style={{
          position: 'absolute', inset: '-100%',
          backgroundImage: 'linear-gradient(rgba(29, 29, 31, 0.04) 2px, transparent 2px), linear-gradient(90deg, rgba(29, 29, 31, 0.04) 2px, transparent 2px)',
          backgroundSize: '60px 60px',
          animation: 'panGrid 40s linear infinite',
        }} />
        
        <style>{`
          @keyframes panGrid {
            0% { transform: translate(0, 0); }
            100% { transform: translate(60px, 60px); }
          }
          @keyframes orb-float-1 {
            0% { transform: translate(0, 0) scale(1); }
            33% { transform: translate(15vw, 15vh) scale(1.2); }
            66% { transform: translate(-10vw, 20vh) scale(0.9); }
            100% { transform: translate(0, 0) scale(1); }
          }
          @keyframes orb-float-2 {
            0% { transform: translate(0, 0) scale(1); }
            33% { transform: translate(-20vw, -10vh) scale(1.1); }
            66% { transform: translate(10vw, -15vh) scale(1.3); }
            100% { transform: translate(0, 0) scale(1); }
          }
          @keyframes orb-float-3 {
            0% { transform: translate(0, 0) scale(1.2); }
            50% { transform: translate(15vw, -10vh) scale(0.8); }
            100% { transform: translate(0, 0) scale(1.2); }
          }
        `}</style>

        {/* Purple Orb */}
        <div style={{
          position: 'absolute', top: '-10vh', left: '-10vw', width: '60vw', height: '60vw',
          background: 'radial-gradient(circle, rgba(168,85,247,0.25) 0%, transparent 60%)',
          animation: 'orb-float-1 20s ease-in-out infinite',
          filter: 'blur(60px)',
          pointerEvents: 'none'
        }} />

        {/* Lime Orb */}
        <div style={{
          position: 'absolute', bottom: '-10vh', right: '-10vw', width: '70vw', height: '70vw',
          background: 'radial-gradient(circle, rgba(163,230,53,0.25) 0%, transparent 60%)',
          animation: 'orb-float-2 25s ease-in-out infinite reverse',
          filter: 'blur(80px)',
          pointerEvents: 'none'
        }} />

        {/* Secondary Purple/Pink Orb for mixing */}
        <div style={{
          position: 'absolute', top: '40vh', left: '40vw', width: '40vw', height: '40vw',
          background: 'radial-gradient(circle, rgba(168,85,247,0.15) 0%, transparent 70%)',
          animation: 'orb-float-3 18s ease-in-out infinite',
          filter: 'blur(50px)',
          pointerEvents: 'none'
        }} />

        {/* Noise overlay to bind it all together with premium texture */}
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.04, mixBlendMode: 'overlay',
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          pointerEvents: 'none'
        }} />
      </div>

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
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
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
            <span style={{ fontSize: '16px', fontWeight: 600, color: '#1D1D1F', letterSpacing: '-0.3px', fontFamily: "'Space Grotesk', -apple-system, sans-serif" }}>
              SentientOS
            </span>
          </div>
          <button 
            onClick={() => navigate('/app')}
            className="nav-btn"
          >
            Launch App <span>→</span>
          </button>
        </nav>

        {/* HERO SECTION WRAPPER */}
      <div style={{
        background: 'transparent',
        width: '100%',
        position: 'relative'
      }}>
        <main 
          className="hero-layout"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '180px 80px 120px',
            width: '100%',
            position: 'relative',
            zIndex: 10,
            gap: '80px',
            boxSizing: 'border-box',
            minHeight: '100vh'
          }}
        >
          {/* LEFT SIDE: TEXT CONTENT */}
          <div className="hero-layout-left" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', textAlign: 'left' }}>
            {/* Animated badge */}
            <div 
              style={{
                background: 'rgba(255,255,255,0.8)',
                color: '#6E6E73',
                border: '1px solid rgba(168,85,247,0.4)',
                borderRadius: '980px',
                padding: '6px 16px',
                fontSize: '11px',
                letterSpacing: '1px',
                fontWeight: 600,
                marginBottom: '24px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                opacity: 0,
                animation: 'fadeUp 0.6s ease-out forwards',
                animationDelay: '0.1s',
                boxShadow: '0 2px 10px rgba(0,0,0,0.02)'
              }}
            >
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#A855F7' }} />
              <span>POWERED BY PARCLE · ENTER PRO</span>
            </div>

            {/* Main headline */}
            <h1 
              className="hero-title"
              style={{
                fontSize: '76px',
                fontWeight: 600,
                lineHeight: 1.15,
                letterSpacing: '-2.5px',
                margin: '0 0 24px 0',
                opacity: 0,
                animation: 'fadeUp 0.8s ease-out forwards',
                animationDelay: '0.3s',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                gap: '8px'
              }}
            >
              <span style={{ color: '#1D1D1F' }}>The AI Engineer,</span>
              <span style={{ 
                background: '#A855F7', 
                color: '#FFFFFF', 
                padding: '2px 24px 8px 24px', 
                borderRadius: '20px',
                display: 'inline-block',
                boxShadow: '0 10px 30px rgba(168, 85, 247, 0.3)'
              }}>
                That Never Forgets.
              </span>
            </h1>

            {/* Subtitle */}
            <p 
              style={{
                fontSize: '20px',
                fontWeight: 400,
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
              <div>
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

      {/* FEATURE CARDS SECTION */}
      <div 
        style={{
          padding: '120px 80px',
          width: '100%',
          boxSizing: 'border-box'
        }}
      >
        <div style={{
          color: '#A855F7',
          fontFamily: "'Space Grotesk', sans-serif",
          fontWeight: 600,
          fontSize: '11px',
          letterSpacing: '2px',
          textAlign: 'center',
          marginBottom: '16px'
        }}>
          WHAT MAKES IT DIFFERENT
        </div>
        
        <h2 style={{
          fontFamily: "'Space Grotesk', sans-serif",
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
            <div className="neo-card" style={{ background: '#F4F4F5' }}>
              <div className="neo-card-content">
                <div className="neo-pill" style={{ background: '#A3E635', color: '#1D1D1F' }}>Persistent</div>
                <h3 className="neo-subtitle" style={{ color: '#1D1D1F' }}>knowledge</h3>
                <div className="neo-learn-more">
                  <div className="neo-lm-circle" style={{ background: '#1D1D1F', color: '#FFF' }}>→</div>
                  <span className="neo-lm-text" style={{ color: '#1D1D1F' }}>Learn more</span>
                </div>
              </div>
              <div className="neo-card-graphic">
                <div style={{ position: 'relative', width: '90px', height: '90px', display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ width: '80px', height: '24px', background: '#A855F7', border: '2px solid #1D1D1F', borderRadius: '6px', boxShadow: '4px 4px 0 #1D1D1F' }}></div>
                  <div style={{ width: '80px', height: '24px', background: '#A3E635', border: '2px solid #1D1D1F', borderRadius: '6px', boxShadow: '4px 4px 0 #1D1D1F' }}></div>
                  <div style={{ width: '80px', height: '24px', background: '#FFFFFF', border: '2px solid #1D1D1F', borderRadius: '6px', boxShadow: '4px 4px 0 #1D1D1F' }}></div>
                </div>
              </div>
            </div>
          </ScrollFadeIn>

          {/* Card 2 */}
          <ScrollFadeIn delay={100}>
            <div className="neo-card" style={{ background: '#A3E635' }}>
              <div className="neo-card-content">
                <div className="neo-pill" style={{ background: '#FFFFFF', color: '#1D1D1F' }}>Context-aware</div>
                <h3 className="neo-subtitle" style={{ color: '#1D1D1F' }}>reasoning</h3>
                <div className="neo-learn-more">
                  <div className="neo-lm-circle" style={{ background: '#1D1D1F', color: '#FFF' }}>→</div>
                  <span className="neo-lm-text" style={{ color: '#1D1D1F' }}>Learn more</span>
                </div>
              </div>
              <div className="neo-card-graphic">
                <div style={{ width: '110px', height: '80px', background: '#1A1B1E', borderRadius: '8px', border: '2px solid #1D1D1F', padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px', boxShadow: '6px 6px 0 #1D1D1F' }}>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#FF5F56', border: '1px solid #1D1D1F' }}></div>
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#FFBD2E', border: '1px solid #1D1D1F' }}></div>
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#27C93F', border: '1px solid #1D1D1F' }}></div>
                  </div>
                  <div style={{ color: '#A3E635', fontFamily: 'monospace', fontSize: '16px', fontWeight: 'bold' }}>&gt; _</div>
                </div>
              </div>
            </div>
          </ScrollFadeIn>

          {/* Card 3 */}
          <ScrollFadeIn delay={200}>
            <div className="neo-card" style={{ background: '#1A1B1E' }}>
              <div className="neo-card-content">
                <div className="neo-pill" style={{ background: '#A3E635', color: '#1D1D1F' }}>Autonomous</div>
                <h3 className="neo-subtitle" style={{ color: '#FFFFFF' }}>execution</h3>
                <div className="neo-learn-more">
                  <div className="neo-lm-circle" style={{ background: '#FFFFFF', color: '#1D1D1F' }}>→</div>
                  <span className="neo-lm-text" style={{ color: '#FFFFFF' }}>Learn more</span>
                </div>
              </div>
              <div className="neo-card-graphic">
                <div style={{ width: '80px', height: '80px', background: '#A855F7', borderRadius: '16px', border: '2px solid #A3E635', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 20px rgba(163, 230, 53, 0.4)' }}>
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="5 3 19 12 5 21 5 3"></polygon>
                  </svg>
                </div>
              </div>
            </div>
          </ScrollFadeIn>

          {/* Card 4 */}
          <ScrollFadeIn delay={300}>
            <div className="neo-card" style={{ background: '#F4F4F5' }}>
              <div className="neo-card-content">
                <div className="neo-pill" style={{ background: '#A855F7', color: '#FFFFFF' }}>Seamless</div>
                <h3 className="neo-subtitle" style={{ color: '#1D1D1F' }}>integrations</h3>
                <div className="neo-learn-more">
                  <div className="neo-lm-circle" style={{ background: '#1D1D1F', color: '#FFF' }}>→</div>
                  <span className="neo-lm-text" style={{ color: '#1D1D1F' }}>Learn more</span>
                </div>
              </div>
              <div className="neo-card-graphic">
                <div style={{ position: 'relative', width: '100px', height: '100px' }}>
                  <div style={{ position: 'absolute', top: '48%', left: '15px', right: '15px', height: '4px', background: '#1D1D1F', zIndex: 1 }}></div>
                  <div style={{ position: 'absolute', top: '25px', left: '48%', bottom: '25px', width: '4px', background: '#1D1D1F', zIndex: 1 }}></div>
                  <div style={{ position: 'absolute', left: 0, top: '35px', width: '30px', height: '30px', borderRadius: '50%', background: '#A3E635', border: '2px solid #1D1D1F', zIndex: 2 }}></div>
                  <div style={{ position: 'absolute', right: 0, top: '35px', width: '30px', height: '30px', borderRadius: '50%', background: '#A855F7', border: '2px solid #1D1D1F', zIndex: 2 }}></div>
                  <div style={{ position: 'absolute', top: 0, left: '35px', width: '30px', height: '30px', borderRadius: '50%', background: '#FFFFFF', border: '2px solid #1D1D1F', zIndex: 2 }}></div>
                  <div style={{ position: 'absolute', bottom: 0, left: '35px', width: '30px', height: '30px', borderRadius: '50%', background: '#1A1B1E', border: '2px solid #1D1D1F', zIndex: 2 }}></div>
                </div>
              </div>
            </div>
          </ScrollFadeIn>
        </div>

      </div>

      {/* FOOTER */}
      <footer style={{
        padding: '40px 24px',
        background: '#F5F5F7',
        borderTop: '1px solid rgba(0,0,0,0.05)',
        position: 'relative',
        zIndex: 10,
        marginTop: 'auto',
        fontFamily: "'Space Grotesk', sans-serif"
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
