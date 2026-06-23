with open('client/src/index.css', 'r') as f:
    content = f.read()

content = content.replace("border-bottom: 1px solid var(--border);", "border-bottom: 2px solid var(--border);")
content = content.replace("border-top: 1px solid var(--border);", "border-top: 2px solid var(--border);")
content = content.replace("backdrop-filter: blur(24px) saturate(200%);", "")
content = content.replace("-webkit-backdrop-filter: blur(24px) saturate(200%);", "")
content = content.replace("backdrop-filter: blur(24px);", "")
content = content.replace("-webkit-backdrop-filter: blur(24px);", "")

with open('client/src/index.css', 'w') as f:
    f.write(content)
