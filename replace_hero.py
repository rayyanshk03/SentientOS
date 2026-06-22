import re

with open('client/src/pages/Landing.jsx', 'r') as f:
    content = f.read()

# Replace the grid background
content = content.replace("background-image: 'linear-gradient(to right, rgba(249, 115, 22, 0.07) 1px, transparent 1px), linear-gradient(to bottom, rgba(249, 115, 22, 0.07) 1px, transparent 1px)',\n      backgroundSize: '40px 40px',", "backgroundImage: 'radial-gradient(rgba(255,255,255,0.1) 1px, transparent 1px)',\n      backgroundSize: '24px 24px',")
content = content.replace("""        body { 
          background-color: #0A0A0F; 
          background-image: 
            linear-gradient(to right, rgba(249, 115, 22, 0.07) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(249, 115, 22, 0.07) 1px, transparent 1px);
          background-size: 40px 40px;
          margin: 0; 
        }""", """        body { 
          background-color: #050505; 
          background-image: radial-gradient(rgba(255,255,255,0.1) 1px, transparent 1px);
          background-size: 24px 24px;
          margin: 0; 
        }""")

# Find the start of TOP NAVBAR and the end of Social proof
start_idx = content.find("{/* TOP NAVBAR */}")
end_idx = content.find("{/* STATS STRIP SECTION */}")

new_hero = """{/* TOP NAVBAR */}
        <nav style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          position: 'fixed',
          top: 0, left: 0, right: 0,
          width: '100%',
          height: '80px',
          padding: '0 48px',
          boxSizing: 'border-box',
          background: 'rgba(5,5,5,0.85)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(255,255,255,0.04)',
          zIndex: 100,
          fontFamily: "'Inter', sans-serif"
        }}>
          {/* Logo */}
          <div style={{ position: 'absolute', left: '48px', fontSize: '18px', fontWeight: 800, color: '#FFFFFF', letterSpacing: '0.5px' }}>
            ETERNAL ARCHITECT
          </div>
          
          {/* Links */}
          <div style={{ display: 'flex', gap: '32px', fontSize: '14px', fontWeight: 500, color: '#F5F5F7' }}>
            <span style={{ cursor: 'pointer' }}>Home</span>
            <span style={{ cursor: 'pointer' }}>Problem Statement</span>
            <span style={{ cursor: 'pointer' }}>Important Dates</span>
            <span style={{ cursor: 'pointer' }}>Registration</span>
          </div>

          {/* Right side */}
          <div style={{ position: 'absolute', right: '48px', display: 'flex', alignItems: 'center', gap: '20px' }}>
            <button style={{ background: 'transparent', border: 'none', color: '#A1A1AA', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
               <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
            </button>
            <button 
              onClick={() => navigate('/app')}
              style={{
                background: '#FFFFFF',
                color: '#0A0A0F',
                border: 'none',
                borderRadius: '8px',
                padding: '10px 20px',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Launch App
            </button>
          </div>
        </nav>

        {/* HERO SECTION WRAPPER */}
      <div style={{
        background: 'transparent',
        width: '100%',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        paddingTop: '60px'
      }}>
        <main style={{ textAlign: 'center', maxWidth: '800px', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '0 24px' }}>
            {/* Animated badge */}
            <div 
              style={{
                background: 'rgba(255,255,255,0.05)',
                color: '#A1A1AA',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '980px',
                padding: '8px 20px',
                fontSize: '12px',
                fontWeight: 500,
                marginBottom: '40px',
                fontFamily: "'Inter', sans-serif"
              }}
            >
              Powered by Parcle + Enter Pro Collaboration
            </div>

            {/* Main headline */}
            <h1 
              style={{
                fontSize: 'clamp(48px, 8vw, 84px)',
                fontWeight: 800,
                lineHeight: 1.1,
                letterSpacing: '-2px',
                margin: '0 0 24px 0',
                display: 'flex',
                gap: '16px',
                justifyContent: 'center',
                flexWrap: 'wrap',
                fontFamily: "'Inter', sans-serif"
              }}
            >
              <span style={{
                background: 'linear-gradient(to right, #F97316, #E879B5)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>THE AI ENGINEER</span>
              <span style={{ color: '#F97316' }}>THAT NEVER FORGETS.</span>
            </h1>

            {/* Subtitle */}
            <h2 style={{
              fontSize: '24px',
              fontWeight: 400,
              color: '#F5F5F7',
              margin: '0 0 32px 0',
              fontFamily: "'Inter', sans-serif"
            }}>
              Your team's memory starts now
            </h2>

            {/* Paragraph */}
            <p 
              style={{
                fontSize: '16px',
                fontWeight: 400,
                color: '#A1A1AA',
                maxWidth: '680px',
                lineHeight: 1.7,
                margin: '0 0 48px 0',
                fontFamily: "'Inter', sans-serif"
              }}
            >
              A flagship autonomous orchestrator built for the modern engineering team. Join the smartest engineering teams to tackle real-world challenges and shape the future of software development.
            </p>

            {/* Button */}
            <button
              onClick={() => navigate('/app')}
              style={{
                background: '#FFFFFF',
                color: '#0A0A0F',
                border: 'none',
                borderRadius: '6px',
                padding: '14px 28px',
                fontSize: '16px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '64px',
                fontFamily: "'Inter', sans-serif",
                transition: 'transform 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              Launch App <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </button>

            {/* Bottom info row */}
            <div style={{
              display: 'flex',
              gap: '40px',
              color: '#A1A1AA',
              fontSize: '14px',
              fontWeight: 600,
              flexWrap: 'wrap',
              justifyContent: 'center',
              fontFamily: "'Inter', sans-serif"
            }}>
               <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                 <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>
                 100% Open Source
               </div>
               <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                 <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                 June 22-23, 2026
               </div>
               <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                 <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                 SentientOS Cloud
               </div>
            </div>
        </main>
      </div>

      """

if start_idx != -1 and end_idx != -1:
    content = content[:start_idx] + new_hero + content[end_idx:]
    with open('client/src/pages/Landing.jsx', 'w') as f:
        f.write(content)
    print("Replaced successfully!")
else:
    print("Failed to find boundaries!")
