import re

with open('client/src/pages/Landing.jsx', 'r') as f:
    content = f.read()

# 1. Update .hero-btn styles
hero_btn_replacement = """        .hero-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          padding: 16px 32px;
          border-radius: 12px;
          font-family: 'Inter', -apple-system, sans-serif;
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
        }"""
content = re.sub(r'        \.hero-btn \{.*?        \.hero-btn-secondary:active \{\s*transform: translateY\(0\);\s*box-shadow: none;\s*\}', hero_btn_replacement, content, flags=re.DOTALL)

# 2. Update nav-btn inline styles to match .hero-btn-primary exactly, or just assign it the class.
# Let's add .nav-btn to the CSS and remove the inline styles!

nav_btn_css = """
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
          font-family: 'Inter', -apple-system, sans-serif;
          transition: all 0.15s ease;
        }
        .nav-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 0 #1D1D1F;
        }
        .nav-btn:active {
          transform: translateY(1px);
          box-shadow: 0 1px 0 #1D1D1F;
        }"""

# Insert .nav-btn css after .hero-btn-secondary:active { ... }
content = content.replace("        .hero-btn-secondary:active {\n          transform: translateY(2px);\n          box-shadow: 0 2px 0 #1D1D1F;\n        }", "        .hero-btn-secondary:active {\n          transform: translateY(2px);\n          box-shadow: 0 2px 0 #1D1D1F;\n        }\n" + nav_btn_css)

# Remove the inline styles from nav-btn
nav_btn_inline_pattern = r'            className="nav-btn"\s*style=\{\{.*?\}\}'
content = re.sub(nav_btn_inline_pattern, '            className="nav-btn"', content, flags=re.DOTALL)

with open('client/src/pages/Landing.jsx', 'w') as f:
    f.write(content)

