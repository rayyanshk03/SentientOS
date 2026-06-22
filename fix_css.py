import re

with open('client/src/index.css', 'r') as f:
    content = f.read()

# Restore :root to default light (but we'll force dark mode anyway)
content = content.replace("--blue:        #E879B5;", "--blue:        #F97316;") # orange
content = content.replace("--blue-hover:  #D4629E;", "--blue-hover:  #EA580C;")
content = content.replace("--blue-light:  #FDEBF4;", "--blue-light:  rgba(249,115,22,0.18);")
content = content.replace("--black:       #2B2538;", "--black:       #1D1D1F;")
content = content.replace("--gray-dark:   #4A4A5A;", "--gray-dark:   #3D3D3F;")
content = content.replace("--gray-light:  #F5E1EC;", "--gray-light:  #F5F5F7;")
content = content.replace("--white:       #FFF0F5;", "--white:       #FFFFFF;")
content = content.replace("--border:      rgba(0,0,0,0.08);", "--border:      #D2D2D7;")

# Revert [data-theme="light"]
content = content.replace("--navbar-bg:        rgba(255,240,245,0.80);", "--navbar-bg:        rgba(255,255,255,0.80);")
content = content.replace("--sidebar-bg:       #FFF0F5;", "--sidebar-bg:       #FFFFFF;")
content = content.replace("--chat-bg:          #FFF0F5;", "--chat-bg:          #FFFFFF;")
content = content.replace("--card-bg:          #FFF0F5;", "--card-bg:          #FFFFFF;")
content = content.replace("--input-bg:         #FFF0F5;", "--input-bg:         #FFFFFF;")
content = content.replace("--bubble-user-bg:   #E879B5;", "--bubble-user-bg:   #F97316;")
content = content.replace("--bubble-agent-bg:  rgba(0,0,0,0.03);", "--bubble-agent-bg:  #F5F5F7;")
content = content.replace("--dropdown-bg:      rgba(255,240,245,0.96);", "--dropdown-bg:      rgba(255,255,255,0.96);")
content = content.replace("--modal-bg:         #FFF0F5;", "--modal-bg:         #FFFFFF;")

# Update [data-theme="dark"] accents to orange
# --blue:        #0A84FF; -> #F97316
content = content.replace("--blue:        #0A84FF;", "--blue:        #F97316;")
content = content.replace("--blue-hover:  #409CFF;", "--blue-hover:  #EA580C;")
content = content.replace("--blue-light:  rgba(10,132,255,0.18);", "--blue-light:  rgba(249,115,22,0.18);")
content = content.replace("--bubble-user-bg:   #0071E3;", "--bubble-user-bg:   #F97316;")

with open('client/src/index.css', 'w') as f:
    f.write(content)
