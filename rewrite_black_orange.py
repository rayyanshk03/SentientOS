import re

with open('client/src/pages/Landing.jsx', 'r') as f:
    content = f.read()

# 1. Backgrounds
content = content.replace("backgroundColor: '#FFF0F5'", "backgroundColor: '#0A0A0F'")
content = content.replace("body { background-color: #FFF0F5; margin: 0; }", """body { 
          background-color: #0A0A0F; 
          background-image: 
            linear-gradient(to right, rgba(249, 115, 22, 0.07) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(249, 115, 22, 0.07) 1px, transparent 1px);
          background-size: 40px 40px;
          margin: 0; 
        }""")
content = content.replace("background: 'linear-gradient(180deg, #FFF0F5 0%, #FFF0F5 70%, #0A0A0F 100%)'", "background: 'transparent'")
content = content.replace("background: '#FFF0F5'", "background: '#0A0A0F'")
content = content.replace("background: 'rgba(0,0,0,0.03)'", "background: 'rgba(0,0,0,0.2)'")

# 2. Text colors
content = content.replace("color: '#2B2538'", "color: '#F5F5F7'")
content = content.replace("stroke=\"#2B2538\"", "stroke=\"#F5F5F7\"")
content = content.replace("#2B2538", "#F5F5F7")
content = content.replace("#4A4A5A", "#A1A1AA")

# 3. Accents (Pink -> Orange)
content = content.replace("#E879B5", "#F97316") # Pink to Orange
content = content.replace("#F5E1EC", "rgba(249,115,22,0.1)") # Light pink background for badge -> Orange translucent
content = content.replace("rgba(232,121,181,0.3)", "rgba(249,115,22,0.3)") # Badge border
content = content.replace("rgba(232,121,181,0.15)", "rgba(249,115,22,0.15)") # Glow

# 4. Transparent black to transparent white
content = content.replace("rgba(0,0,0,0.02)", "rgba(255,255,255,0.03)")
content = content.replace("rgba(0,0,0,0.03)", "rgba(255,255,255,0.04)")
content = content.replace("rgba(0,0,0,0.04)", "rgba(255,255,255,0.05)")
content = content.replace("rgba(0,0,0,0.06)", "rgba(255,255,255,0.06)")
content = content.replace("rgba(0,0,0,0.08)", "rgba(255,255,255,0.07)")
content = content.replace("rgba(0,0,0,0.1)", "rgba(255,255,255,0.1)")
content = content.replace("rgba(0,0,0,0.12)", "rgba(255,255,255,0.12)")
content = content.replace("rgba(0,0,0,0.2)", "rgba(255,255,255,0.2)")

# 5. Navbar specific (was pink glass)
content = content.replace("background: 'rgba(255,240,245,0.7)'", "background: 'rgba(10,10,15,0.7)'")

with open('client/src/pages/Landing.jsx', 'w') as f:
    f.write(content)
