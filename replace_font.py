import re

with open('client/src/index.css', 'r') as f:
    content = f.read()

# Replace Inter with Space Grotesk in --font
content = re.sub(r"--font:\s*'Inter',\s*-apple-system,\s*BlinkMacSystemFont,\s*sans-serif;", "--font: 'Space Grotesk', -apple-system, BlinkMacSystemFont, sans-serif;", content)

with open('client/src/index.css', 'w') as f:
    f.write(content)

# We should also replace 'Inter' in Landing.jsx and other places if it is hardcoded
import os
for root, dirs, files in os.walk('client/src'):
    for file in files:
        if file.endswith('.jsx') or file.endswith('.css'):
            filepath = os.path.join(root, file)
            with open(filepath, 'r') as f:
                c = f.read()
            if "'Inter'" in c or '"Inter"' in c:
                c = c.replace("'Inter'", "'Space Grotesk'")
                c = c.replace('"Inter"', '"Space Grotesk"')
                with open(filepath, 'w') as f:
                    f.write(c)

print("Font replaced globally.")
