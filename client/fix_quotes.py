import os

replacements = [
    ("''#A855F7''", "'#A855F7'"),
    ("''#A3E635''", "'#A3E635'")
]

def process_file(filepath):
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
    except Exception as e:
        return False
        
    original_content = content
    for old, new in replacements:
        content = content.replace(old, new)
        
    if content != original_content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        return True
    return False

for root, dirs, files in os.walk('client/src'):
    for file in files:
        if file.endswith(('.jsx', '.js', '.css')):
            filepath = os.path.join(root, file)
            process_file(filepath)

print("Fixed quotes.")
