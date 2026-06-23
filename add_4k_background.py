import re

with open('client/src/pages/Landing.jsx', 'r') as f:
    content = f.read()

# 1. Replace the old ambient glows with the 4K dynamic background
new_background = """      {/* 4K DYNAMIC THEME BACKGROUND */}
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
          backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.85\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")',
          pointerEvents: 'none'
        }} />
      </div>"""

# Find the start of the ambient background glows up to the CONTENT WRAPPER
old_background_pattern = r'\{\/\*\s*AMBIENT BACKGROUND GLOWS\s*\*\/\}.*?(?=\{\/\*\s*CONTENT WRAPPER\s*\*\/)'
content = re.sub(old_background_pattern, new_background + "\n\n      ", content, flags=re.DOTALL)

# 2. Remove the white background from the Hero Wrapper
content = content.replace("""      {/* HERO SECTION WRAPPER */}
      <div style={{
        background: '#FFFFFF',
        width: '100%',
        position: 'relative'
      }}>""", """      {/* HERO SECTION WRAPPER */}
      <div style={{
        background: 'transparent',
        width: '100%',
        position: 'relative'
      }}>""")

with open('client/src/pages/Landing.jsx', 'w') as f:
    f.write(content)

