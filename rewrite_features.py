with open('client/src/pages/Landing.jsx', 'r') as f:
    content = f.read()

# Replace Card 1
content = content.replace("""              <div style={{
                width: '56px', height: '56px',
                borderRadius: '14px',
                background: 'rgba(0,113,227,0.12)',
                border: '1px solid rgba(0,113,227,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '28px'
              }}>""", """              <div style={{
                width: '56px', height: '56px',
                borderRadius: '14px',
                background: '#FFFFFF',
                border: '1px solid rgba(0,0,0,0.08)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '28px'
              }}>""")

content = content.replace("""              <div style={{
                width: '32px', height: '2px', background: '#0071E3',
                borderRadius: '1px', margin: '20px 0 16px 0'
              }} />
              <h3 style={{ margin: '0 0 12px 0', fontSize: '20px', fontWeight: 600, color: '#1D1D1F', fontFamily: "'Inter', sans-serif" }}>""", """              <h3 style={{ margin: '24px 0 12px 0', fontSize: '20px', fontWeight: 600, color: '#1D1D1F', fontFamily: "'Inter', sans-serif" }}>""")

content = content.replace("""              <div style={{ color: '#60A5FA', fontSize: '13px', fontWeight: 500, fontFamily: "'Inter', sans-serif", marginTop: '20px' }}>""", """              <div style={{ color: '#0071E3', fontSize: '13px', fontWeight: 500, fontFamily: "'Inter', sans-serif", marginTop: '20px' }}>""")

# Replace Card 2
content = content.replace("""              <div style={{
                width: '56px', height: '56px',
                borderRadius: '14px',
                background: 'rgba(124,58,237,0.12)',
                border: '1px solid rgba(124,58,237,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '28px'
              }}>""", """              <div style={{
                width: '56px', height: '56px',
                borderRadius: '14px',
                background: '#FFFFFF',
                border: '1px solid rgba(0,0,0,0.08)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '28px'
              }}>""")

content = content.replace("""              <div style={{
                width: '32px', height: '2px', background: '#7C3AED',
                borderRadius: '1px', margin: '20px 0 16px 0'
              }} />
              <h3 style={{ margin: '0 0 12px 0', fontSize: '20px', fontWeight: 600, color: '#1D1D1F', fontFamily: "'Inter', sans-serif" }}>""", """              <h3 style={{ margin: '24px 0 12px 0', fontSize: '20px', fontWeight: 600, color: '#1D1D1F', fontFamily: "'Inter', sans-serif" }}>""")

content = content.replace("""              <div style={{ color: '#A78BFA', fontSize: '13px', fontWeight: 500, fontFamily: "'Inter', sans-serif", marginTop: '20px' }}>""", """              <div style={{ color: '#0071E3', fontSize: '13px', fontWeight: 500, fontFamily: "'Inter', sans-serif", marginTop: '20px' }}>""")

# Replace Card 3
content = content.replace("""              <div style={{
                width: '56px', height: '56px',
                borderRadius: '14px',
                background: 'rgba(6,182,212,0.12)',
                border: '1px solid rgba(6,182,212,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '28px'
              }}>""", """              <div style={{
                width: '56px', height: '56px',
                borderRadius: '14px',
                background: '#FFFFFF',
                border: '1px solid rgba(0,0,0,0.08)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '28px'
              }}>""")

content = content.replace("""              <div style={{
                width: '32px', height: '2px', background: '#06B6D4',
                borderRadius: '1px', margin: '20px 0 16px 0'
              }} />
              <h3 style={{ margin: '0 0 12px 0', fontSize: '20px', fontWeight: 600, color: '#1D1D1F', fontFamily: "'Inter', sans-serif" }}>""", """              <h3 style={{ margin: '24px 0 12px 0', fontSize: '20px', fontWeight: 600, color: '#1D1D1F', fontFamily: "'Inter', sans-serif" }}>""")

content = content.replace("""              <div style={{ color: '#22D3EE', fontSize: '13px', fontWeight: 500, fontFamily: "'Inter', sans-serif", marginTop: '20px' }}>""", """              <div style={{ color: '#0071E3', fontSize: '13px', fontWeight: 500, fontFamily: "'Inter', sans-serif", marginTop: '20px' }}>""")


with open('client/src/pages/Landing.jsx', 'w') as f:
    f.write(content)
