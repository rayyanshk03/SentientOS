import os
import re

TARGET_DIRS = ['client/src/pages', 'client/src']

def process_file(filepath):
    if not filepath.endswith('.jsx'): return
    with open(filepath, 'r') as f:
        content = f.read()

    original = content
    
    # 1. Update Box Shadows
    # Soft card shadows
    content = re.sub(r"boxShadow:\s*['\"]0 [48]px \d+px rgba\(0,0,0,0\.0[3456]\)['\"]", "boxShadow: 'var(--shadow-md)'", content)
    # Larger card shadows
    content = re.sub(r"boxShadow:\s*['\"]0 16px 40px rgba\(0,0,0,0\.2\)['\"]", "boxShadow: 'var(--shadow-lg)'", content)
    content = re.sub(r"boxShadow:\s*['\"]0 20px 40px rgba\(0,0,0,0\.15\)['\"]", "boxShadow: 'var(--shadow-lg)'", content)
    content = re.sub(r"boxShadow:\s*['\"]0 8px 40px rgba\(0,0,0,0\.12\)['\"]", "boxShadow: 'var(--shadow-lg)'", content)
    
    # 2. Update Borders
    # border: 'none' -> border: '2px solid var(--border)' 
    # ONLY if it's near a background or padding to avoid messing up structural divs
    content = re.sub(r"border:\s*['\"]none['\"](,\s*(?:borderRadius|padding|boxShadow))", r"border: '2px solid var(--border)'\1", content)
    content = re.sub(r"border:\s*['\"]1px solid rgba\(0,0,0,0\.0[456]\)['\"]", "border: '2px solid var(--border)'", content)

    # 3. Update Border Radii
    # We want to replace 20 with var(--radius-card) but only in borderRadius
    content = re.sub(r"borderRadius:\s*(?:20|16|24)\b", "borderRadius: 'var(--radius-card)'", content)

    # 4. Navbar & Sidebar specifically in App.jsx / index.css
    # Handled separately

    if original != content:
        with open(filepath, 'w') as f:
            f.write(content)
        print(f"Updated {filepath}")

for d in TARGET_DIRS:
    for root, _, files in os.walk(d):
        for file in files:
            process_file(os.path.join(root, file))
