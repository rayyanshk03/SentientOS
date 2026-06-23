import re

with open('client/src/pages/Landing.jsx', 'r') as f:
    content = f.read()

# 1. Update the CSS grid
css_replacement = """        .feat-grid {
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
        }"""

content = re.sub(r"\.feat-grid\s*\{\s*display:\s*grid;\s*grid-template-columns:\s*repeat\(3,\s*1fr\);\s*gap:\s*24px;\s*\}", css_replacement, content)

# Update media query for feat grid
content = re.sub(r"\.feat-grid\s*\{\s*grid-template-columns:\s*1fr;\s*\}", ".feat-grid {\n            grid-template-columns: 1fr;\n          }\n          .neo-card {\n            padding: 32px;\n            min-height: 240px;\n          }\n          .neo-card-graphic {\n            right: -20px;\n            opacity: 0.5;\n          }", content)

# 2. Replace the JSX block
jsx_replacement = """        <div className="feat-grid">
          {/* Card 1 */}
          <ScrollFadeIn delay={0}>
            <div className="neo-card" style={{ background: '#F4F4F5' }}>
              <div className="neo-card-content">
                <div className="neo-pill" style={{ background: '#A3E635', color: '#1D1D1F' }}>Permanent</div>
                <h3 className="neo-subtitle" style={{ color: '#1D1D1F' }}>memory</h3>
                <div className="neo-learn-more">
                  <div className="neo-lm-circle" style={{ background: '#1D1D1F', color: '#FFF' }}>→</div>
                  <span className="neo-lm-text" style={{ color: '#1D1D1F' }}>Learn more</span>
                </div>
              </div>
              <div className="neo-card-graphic">
                <div style={{ position: 'relative', width: '120px', height: '80px' }}>
                  <div style={{ position: 'absolute', left: 0, top: 0, width: '80px', height: '80px', borderRadius: '50%', background: '#A3E635', border: '2px solid #1D1D1F', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: 'bold', color: '#1D1D1F', zIndex: 1 }}>P</div>
                  <div style={{ position: 'absolute', right: 0, top: 0, width: '80px', height: '80px', borderRadius: '50%', background: '#1A1B1E', border: '2px solid #1D1D1F', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: 'bold', color: '#A3E635', zIndex: 2 }}>$</div>
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
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div style={{ width: '100px', height: '70px', background: '#1A1B1E', borderRadius: '8px', border: '2px solid #1D1D1F', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', color: '#A3E635', fontWeight: 'bold' }}>$</div>
                  <div style={{ width: '4px', height: '20px', background: '#1D1D1F' }}></div>
                  <div style={{ width: '12px', height: '4px', background: '#1D1D1F', borderRadius: '2px' }}></div>
                </div>
              </div>
            </div>
          </ScrollFadeIn>

          {/* Card 3 */}
          <ScrollFadeIn delay={200}>
            <div className="neo-card" style={{ background: '#1A1B1E' }}>
              <div className="neo-card-content">
                <div className="neo-pill" style={{ background: '#A3E635', color: '#1D1D1F' }}>Zero-friction</div>
                <h3 className="neo-subtitle" style={{ color: '#FFFFFF' }}>conflicts</h3>
                <div className="neo-learn-more">
                  <div className="neo-lm-circle" style={{ background: '#FFFFFF', color: '#1D1D1F' }}>→</div>
                  <span className="neo-lm-text" style={{ color: '#FFFFFF' }}>Learn more</span>
                </div>
              </div>
              <div className="neo-card-graphic">
                <svg width="80" height="100" viewBox="0 0 24 24" fill="#A3E635" stroke="#A3E635" strokeWidth="1">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
                </svg>
              </div>
            </div>
          </ScrollFadeIn>

          {/* Card 4 */}
          <ScrollFadeIn delay={300}>
            <div className="neo-card" style={{ background: '#F4F4F5' }}>
              <div className="neo-card-content">
                <div className="neo-pill" style={{ background: '#A3E635', color: '#1D1D1F' }}>Universal</div>
                <h3 className="neo-subtitle" style={{ color: '#1D1D1F' }}>integrations</h3>
                <div className="neo-learn-more">
                  <div className="neo-lm-circle" style={{ background: '#1D1D1F', color: '#FFF' }}>→</div>
                  <span className="neo-lm-text" style={{ color: '#1D1D1F' }}>Learn more</span>
                </div>
              </div>
              <div className="neo-card-graphic">
                <div style={{ position: 'relative', width: '100px', height: '80px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
                  <div style={{ position: 'absolute', top: '10px', left: '10px', right: '10px', height: '30px', borderTop: '2px solid #1D1D1F', borderLeft: '2px solid #1D1D1F', borderRight: '2px solid #1D1D1F' }}></div>
                  <div style={{ width: '28px', height: '40px', background: '#1A1B1E', border: '2px solid #1D1D1F', borderRadius: '4px', zIndex: 2 }}></div>
                  <div style={{ width: '28px', height: '60px', background: '#A3E635', border: '2px solid #1D1D1F', borderRadius: '4px', zIndex: 2 }}></div>
                  <div style={{ width: '28px', height: '30px', background: '#1A1B1E', border: '2px solid #1D1D1F', borderRadius: '4px', zIndex: 2 }}></div>
                </div>
              </div>
            </div>
          </ScrollFadeIn>
        </div>"""

# Replace the JSX. The old JSX starts at <div className="feat-grid"> and ends at the closing div before {/* FOOTER */}
old_jsx_pattern = r'<div className="feat-grid">[\s\S]*?(?=</style>\s*\{/\*\s*AMBIENT BACKGROUND GLOWS\s*\*/\})'
# Wait, feat-grid is NOT near the style tag. The feat-grid is rendered in the return statement.
# Let's find exactly the replacement zone.
# It starts at <div className="feat-grid"> and ends right before {/* FOOTER */}
content = re.sub(r'<div className="feat-grid">[\s\S]*?(?=\{\/\*\s*FOOTER\s*\*\/\})', jsx_replacement + "\n\n      ", content)

with open('client/src/pages/Landing.jsx', 'w') as f:
    f.write(content)

