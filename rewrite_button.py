import re

with open('client/src/components/ui/Button.jsx', 'r') as f:
    content = f.read()

# Replace VARIANTS
variants_replacement = """const VARIANTS = {
  primary: {
    background: '#A855F7',
    color: '#FFFFFF',
    border: '2px solid #1D1D1F',
    '--hover-bg': '#9333EA',
  },
  secondary: {
    background: '#FFFFFF',
    color: '#1D1D1F',
    border: '2px solid #1D1D1F',
    '--hover-bg': '#F4F4F5',
  },
  ghost: {
    background: '#A3E635',
    color: '#1D1D1F',
    border: '2px solid #1D1D1F',
    '--hover-bg': '#84CC16',
  },
  danger: {
    background: '#FF3B30',
    color: '#FFFFFF',
    border: '2px solid #1D1D1F',
    '--hover-bg': '#E0342A',
  },
};"""
content = re.sub(r'const VARIANTS = \{.*?\n\};\n', variants_replacement + "\n", content, flags=re.DOTALL)

# Replace baseStyle interaction/transform/shadow logic
style_pattern = r'    /\* interaction \*/.*?    \.\.\.style,\n  \};'
new_style = """    /* interaction */
    cursor:     isDisabled ? 'not-allowed' : 'pointer',
    opacity:    isDisabled ? 0.5 : 1,
    transform:  isDisabled ? 'none'
      : pressed ? 'translateY(2px)'
      : hovered ? 'translateY(-2px)'
      : 'translateY(0px)',
    outline:    'none',

    /* transition */
    transition: 'all 0.15s ease',

    /* shadow */
    boxShadow: isDisabled ? 'none'
      : pressed ? '0 2px 0 #1D1D1F'
      : hovered ? '0 6px 0 #1D1D1F'
      : '0 4px 0 #1D1D1F',

    ...style,
  };"""
content = re.sub(style_pattern, new_style, content, flags=re.DOTALL)

# Also fix the border radius on baseStyle to make it matching pills or thick rectangles
# We want it to be 12px or 9999px.
content = content.replace("borderRadius:   'var(--radius-button)',", "borderRadius:   '12px',")

with open('client/src/components/ui/Button.jsx', 'w') as f:
    f.write(content)

