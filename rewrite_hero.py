with open('client/src/pages/Landing.jsx', 'r') as f:
    content = f.read()

# Update Buttons CSS
content = content.replace("""        .hero-btn {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 16px 32px;
          border-radius: 980px;
          font-family: 'Inter', -apple-system, sans-serif;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .hero-btn-primary {
          background: #0071E3;
          color: #FFFFFF;
          font-size: 17px;
          font-weight: 500;
          border: none;
        }
        .hero-btn-primary:hover {
          background: #0077ED;
          transform: scale(1.02);
        }
        .hero-btn-primary:active {
          transform: scale(0.98);
        }

        .hero-btn-secondary {
          background: rgba(0,0,0,0.05);
          border: none;
          color: #1D1D1F;
          font-size: 17px;
          font-weight: 500;
        }
        .hero-btn-secondary:hover {
          background: rgba(0,0,0,0.08);
          transform: scale(1.02);
        }
        .hero-btn-secondary:active {
          transform: scale(0.98);
        }""", """        .hero-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          padding: 16px 32px;
          border-radius: 12px;
          font-family: 'Inter', -apple-system, sans-serif;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
          font-size: 16px;
          font-weight: 600;
          min-width: 160px;
        }
        .hero-btn-primary {
          background: #A855F7;
          color: #FFFFFF;
          border: none;
          box-shadow: 0 4px 14px rgba(168, 85, 247, 0.4);
        }
        .hero-btn-primary:hover {
          background: #9333EA;
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(168, 85, 247, 0.5);
        }
        .hero-btn-primary:active {
          transform: translateY(0);
          box-shadow: 0 2px 8px rgba(168, 85, 247, 0.4);
        }

        .hero-btn-secondary {
          background: #FFFFFF;
          border: 1px solid #1D1D1F;
          color: #1D1D1F;
        }
        .hero-btn-secondary:hover {
          background: #FAFAFA;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.05);
        }
        .hero-btn-secondary:active {
          transform: translateY(0);
          box-shadow: none;
        }""")

# Update Ambient Glows
content = content.replace("""        background: 'radial-gradient(circle, rgba(0,113,227,0.15), transparent 70%)',""", """        background: 'radial-gradient(circle, rgba(168,85,247,0.12), transparent 70%)',""")
content = content.replace("""        background: 'radial-gradient(circle, rgba(124,58,237,0.12), transparent 70%)',""", """        background: 'radial-gradient(circle, rgba(168,85,247,0.08), transparent 70%)',""")
content = content.replace("""        background: 'radial-gradient(ellipse, rgba(6,182,212,0.08), transparent 70%)',""", """        background: 'radial-gradient(ellipse, rgba(168,85,247,0.05), transparent 70%)',""")

# Update Badge JSX
content = content.replace("""            {/* Animated badge */}
            <div 
              style={{
                background: 'rgba(0,113,227,0.1)',
                color: '#0071E3',
                border: '1px solid rgba(0,113,227,0.2)',
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
            </div>""", """            {/* Animated badge */}
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
            </div>""")

# Update Headline JSX
content = content.replace("""            {/* Main headline */}
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
            </h1>""", """            {/* Main headline */}
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
            </h1>""")

# Remove the primary-btn-wrapper ring pulse (it clashes with the new clean button style)
content = content.replace("""              <div className="primary-btn-wrapper">
                <button
                  onClick={() => navigate('/app')}
                  className="hero-btn hero-btn-primary"
                >
                  Launch App <span style={{ transition: 'transform 0.2s', display: 'inline-block' }}>→</span>
                </button>
              </div>""", """              <div>
                <button
                  onClick={() => navigate('/app')}
                  className="hero-btn hero-btn-primary"
                >
                  Launch App <span style={{ transition: 'transform 0.2s', display: 'inline-block' }}>→</span>
                </button>
              </div>""")

with open('client/src/pages/Landing.jsx', 'w') as f:
    f.write(content)
