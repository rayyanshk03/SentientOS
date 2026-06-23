import re

with open('client/src/components/layout/Sidebar.jsx', 'r') as f:
    content = f.read()

# 1. Update Logo gradient to Neubrutalism style
# background: 'linear-gradient(135deg, #0071E3, #00A3FF)',
# borderRadius: '6px',

new_logo_style = """              background: '#A3E635',
              border: '2px solid #1D1D1F',
              boxShadow: '2px 2px 0 #1D1D1F',
              borderRadius: '8px',"""
content = re.sub(r"background:\s*'linear-gradient\(135deg, #0071E3, #00A3FF\)',\s*borderRadius:\s*'6px',", new_logo_style, content)

# 2. Update User Profile gradient
new_user_style = """              background: '#A855F7',
              border: '2px solid #1D1D1F',
              boxShadow: '2px 2px 0 #1D1D1F',
              borderRadius: '8px',"""
content = re.sub(r"borderRadius:\s*'50%',\s*background:\s*'linear-gradient\(135deg, #0071E3 0%, #00A3FF 100%\)',", new_user_style, content)

# 3. Update NavLink styles
old_navlink = """                      <NavLink
                        to={item.path}
                        end={item.end}
                        style={({ isActive }) => ({
                          display: 'flex',
                          alignItems: 'center',
                          gap: isCollapsed ? 0 : 10,
                          justifyContent: isCollapsed ? 'center' : 'flex-start',
                          padding: '8px 12px',
                          height: 38,
                          borderRadius: '8px',
                          color: isActive ? 'var(--blue)' : 'var(--gray-mid)',
                          background: isActive ? 'var(--blue-light)' : 'transparent',
                          textDecoration: 'none',
                          fontSize: '13.5px',
                          fontWeight: isActive ? 600 : 500,
                          transition: 'all 0.15s ease',
                          cursor: 'pointer'
                        })}
                        className={({ isActive }) => (isActive ? 'active-nav-link' : '')}
                        onMouseEnter={e => {
                          if (!e.currentTarget.classList.contains('active-nav-link')) {
                            e.currentTarget.style.background = 'var(--gray-light)';
                            e.currentTarget.style.color = 'var(--black)';
                          }
                        }}
                        onMouseLeave={e => {
                          if (!e.currentTarget.classList.contains('active-nav-link')) {
                            e.currentTarget.style.background = 'transparent';
                            e.currentTarget.style.color = 'var(--gray-mid)';
                          }
                        }}
                      >"""

new_navlink = """                      <NavLink
                        to={item.path}
                        end={item.end}
                        style={({ isActive }) => ({
                          display: 'flex',
                          alignItems: 'center',
                          gap: isCollapsed ? 0 : 10,
                          justifyContent: isCollapsed ? 'center' : 'flex-start',
                          padding: '8px 12px',
                          height: 38,
                          borderRadius: '8px',
                          color: isActive ? 'var(--black)' : 'var(--gray-mid)',
                          background: isActive ? 'var(--lime)' : 'transparent',
                          border: isActive ? '2px solid var(--border)' : '2px solid transparent',
                          boxShadow: isActive ? '2px 2px 0 var(--border)' : 'none',
                          transform: isActive ? 'translateY(-2px)' : 'translateY(0)',
                          textDecoration: 'none',
                          fontSize: '13.5px',
                          fontWeight: isActive ? 700 : 600,
                          transition: 'all 0.15s ease',
                          cursor: 'pointer'
                        })}
                        className={({ isActive }) => (isActive ? 'active-nav-link' : '')}
                        onMouseEnter={e => {
                          if (!e.currentTarget.classList.contains('active-nav-link')) {
                            e.currentTarget.style.background = 'var(--white)';
                            e.currentTarget.style.color = 'var(--black)';
                            e.currentTarget.style.border = '2px solid var(--border)';
                            e.currentTarget.style.boxShadow = '2px 2px 0 var(--border)';
                            e.currentTarget.style.transform = 'translateY(-2px)';
                          }
                        }}
                        onMouseLeave={e => {
                          if (!e.currentTarget.classList.contains('active-nav-link')) {
                            e.currentTarget.style.background = 'transparent';
                            e.currentTarget.style.color = 'var(--gray-mid)';
                            e.currentTarget.style.border = '2px solid transparent';
                            e.currentTarget.style.boxShadow = 'none';
                            e.currentTarget.style.transform = 'translateY(0)';
                          }
                        }}
                      >"""

content = content.replace(old_navlink, new_navlink)

with open('client/src/components/layout/Sidebar.jsx', 'w') as f:
    f.write(content)

print("Sidebar updated.")
