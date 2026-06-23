with open('client/src/pages/AdrsPage.jsx', 'r') as f:
    content = f.read()

content = content.replace("<div style={{ maxWidth: 840, margin: '0 auto' }}>", "<div style={{ maxWidth: 1000, margin: '0 auto' }}>")

content = content.replace("""            {/* Vertical timeline line */}
            <div style={{ position: 'absolute', left: 19, top: 20, bottom: 20, width: 2, background: '#E5E5EA', zIndex: 1 }} />
            
            {adrs.map(adr => {""", """            {/* Vertical timeline line */}
            <div style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', top: 20, bottom: 20, width: 2, background: '#E5E5EA', zIndex: 1 }} />
            
            {adrs.map((adr, index) => {
              const isLeft = index % 2 === 0;""")

content = content.replace("""              return (
                <div key={adr.id} style={{ display: 'flex', gap: 24, position: 'relative' }}>
                  {/* Timeline Dot */}
                  <div style={{
                    width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg, #007aff 0%, #0051a8 100%)', color: 'white',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0,
                    boxShadow: '0 4px 12px rgba(0, 122, 255, 0.3), 0 0 0 6px #F5F5F7', zIndex: 2
                  }}>
                    🏗️
                  </div>

                  {/* ADR Card */}
                  <div style={{
                    background: 'var(--white)', border: 'none', borderRadius: 20,
                    padding: 32, flex: 1, boxShadow: '0 8px 30px rgba(0,0,0,0.04)',
                    transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
                    position: 'relative', zIndex: 2
                  }}>""", """              return (
                <div key={adr.id} style={{ display: 'flex', width: '100%', justifyContent: isLeft ? 'flex-start' : 'flex-end', position: 'relative' }}>
                  {/* Timeline Dot */}
                  <div style={{
                    position: 'absolute', left: '50%', transform: 'translateX(-50%)', top: 0,
                    width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg, #007aff 0%, #0051a8 100%)', color: 'white',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0,
                    boxShadow: '0 4px 12px rgba(0, 122, 255, 0.3), 0 0 0 6px #F5F5F7', zIndex: 2
                  }}>
                    🏗️
                  </div>

                  {/* ADR Card */}
                  <div style={{
                    width: 'calc(50% - 48px)',
                    background: 'var(--white)', border: 'none', borderRadius: 20,
                    padding: 32, boxShadow: '0 8px 30px rgba(0,0,0,0.04)',
                    transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
                    position: 'relative', zIndex: 2
                  }}>""")

with open('client/src/pages/AdrsPage.jsx', 'w') as f:
    f.write(content)
