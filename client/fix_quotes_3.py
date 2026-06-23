import os

def process_file(filepath):
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
    except Exception as e:
        return False
        
    original_content = content
    content = content.replace("''#A855F7''", "'#A855F7'")
    content = content.replace("''#A3E635''", "'#A3E635'")
        
    if content != original_content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Fixed {filepath}")
        return True
    return False

for root, dirs, files in os.walk('src'):
    for file in files:
        if file.endswith(('.jsx', '.js', '.css')):
            filepath = os.path.join(root, file)
            process_file(filepath)
