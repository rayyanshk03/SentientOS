import re

with open('client/src/pages/Landing.jsx', 'r') as f:
    content = f.read()

# 1. Backgrounds
content = content.replace("backgroundColor: '#0A0A0F'", "backgroundColor: '#FFF0F5'")
content = content.replace("body { background-color: #0A0A0F", "body { background-color: #FFF0F5")
content = content.replace("background: 'linear-gradient(180deg, #FFF0F5 0%, #FFF0F5 70%, #0A0A0F 100%)'", "background: '#FFF0F5'")
content = content.replace("background: 'rgba(0,0,0,0.2)'", "background: 'rgba(0,0,0,0.03)'")

# 2. Text colors
content = content.replace("color: '#F5F5F7'", "color: '#2B2538'")
content = content.replace("stroke=\"#F5F5F7\"", "stroke=\"#2B2538\"")
content = content.replace("#F5F5F7", "#2B2538")

# 3. Transparent white backgrounds & borders to transparent black
content = content.replace("rgba(255,255,255,0.02)", "rgba(0,0,0,0.02)")
content = content.replace("rgba(255,255,255,0.03)", "rgba(0,0,0,0.02)")
content = content.replace("rgba(255,255,255,0.04)", "rgba(0,0,0,0.03)")
content = content.replace("rgba(255,255,255,0.05)", "rgba(0,0,0,0.04)")
content = content.replace("rgba(255,255,255,0.06)", "rgba(0,0,0,0.06)")
content = content.replace("rgba(255,255,255,0.07)", "rgba(0,0,0,0.08)")
content = content.replace("rgba(255,255,255,0.1)", "rgba(0,0,0,0.1)")
content = content.replace("rgba(255,255,255,0.12)", "rgba(0,0,0,0.12)")
content = content.replace("rgba(255,255,255,0.2)", "rgba(0,0,0,0.2)")

# 4. Navbar specific (was dark glass)
content = content.replace("background: 'rgba(10,10,15,0.7)'", "background: 'rgba(255,240,245,0.7)'")

with open('client/src/pages/Landing.jsx', 'w') as f:
    f.write(content)
