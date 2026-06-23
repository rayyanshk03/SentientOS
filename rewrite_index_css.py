with open('client/src/index.css', 'r') as f:
    content = f.read()

# Core palette
content = content.replace("""  /* Core palette (Premium Apple Light Theme) */
  --blue:        #0071E3;
  --blue-hover:  #0077ED;
  --blue-light:  rgba(0,113,227,0.12);
  --black:       #1D1D1F;
  --gray-dark:   #3D3D3F;
  --gray-mid:    #86868B;
  --gray-light:  #F5F5F7;
  --white:       #FFFFFF;
  --border:      rgba(0,0,0,0.06);""", """  /* Core palette (RealChain Neubrutalism Theme) */
  --blue:        #A855F7;
  --blue-hover:  #9333EA;
  --blue-light:  rgba(168,85,247,0.12);
  --lime:        #A3E635;
  --black:       #1D1D1F;
  --gray-dark:   #3D3D3F;
  --gray-mid:    #6E6E73;
  --gray-light:  #F8FAFC;
  --white:       #FFFFFF;
  --border:      #1D1D1F;""")

# Shadows
content = content.replace("""  /* Shadows */
  --shadow-sm:   0 2px 8px rgba(0,0,0,0.04);
  --shadow-md:   0 8px 24px rgba(0,0,0,0.06);
  --shadow-lg:   0 16px 40px rgba(0,0,0,0.08);""", """  /* Shadows */
  --shadow-sm:   0 2px 0 #1D1D1F;
  --shadow-md:   0 4px 0 #1D1D1F;
  --shadow-lg:   0 8px 0 #1D1D1F;""")

# Radii
content = content.replace("""  /* Border radii (New System) */
  --radius-button: 980px;
  --radius-card:   20px;
  --radius-input:  24px;
  --radius-bubble: 20px;
  --radius-chip:   980px;
  --radius-modal:  24px;""", """  /* Border radii (New System) */
  --radius-button: 16px;
  --radius-card:   24px;
  --radius-input:  16px;
  --radius-bubble: 16px;
  --radius-chip:   16px;
  --radius-modal:  24px;""")

# Light Theme Semantic
content = content.replace("""[data-theme="light"] {
  /* Semantic surface tokens (light - Premium Apple Starlight Theme) */
  --navbar-bg:        rgba(251, 251, 249, 0.75);
  --sidebar-bg:       #F4F3EF;
  --chat-bg:          #FBFBF9;
  --card-bg:          #FFFFFF;
  --input-bg:         #FFFFFF;
  --bubble-user-bg:   #0071E3;
  --bubble-agent-bg:  #FFFFFF;
  --code-bg:          #1E1E1E;
  --code-border:      transparent;
  --dropdown-bg:      rgba(255,255,255,0.92);
  --modal-bg:         #FFFFFF;
  --modal-backdrop:   rgba(0,0,0,0.30);
}""", """[data-theme="light"] {
  /* Semantic surface tokens (light - RealChain Theme) */
  --navbar-bg:        #FFFFFF;
  --sidebar-bg:       #FAFAFA;
  --chat-bg:          #F8FAFC;
  --card-bg:          #FFFFFF;
  --input-bg:         #FFFFFF;
  --bubble-user-bg:   #A3E635; /* Lime green for user bubbles */
  --bubble-agent-bg:  #FFFFFF;
  --code-bg:          #1A1B1E;
  --code-border:      transparent;
  --dropdown-bg:      #FFFFFF;
  --modal-bg:         #FFFFFF;
  --modal-backdrop:   rgba(0,0,0,0.60);
}""")

with open('client/src/index.css', 'w') as f:
    f.write(content)
