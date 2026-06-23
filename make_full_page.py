import os
import re

directory = 'client/src/pages'

for filename in os.listdir(directory):
    if filename.endswith('.jsx'):
        filepath = os.path.join(directory, filename)
        with open(filepath, 'r') as f:
            content = f.read()

        # Remove maxWidth and margin: 0 auto from page containers
        # Match something like `maxWidth: 840, margin: '0 auto'`
        
        # 1. Matches: `maxWidth: 840, margin: '0 auto', `
        content = re.sub(r'maxWidth:\s*(840|1000|1040|1200),\s*margin:\s*\'0 auto\',?\s*', '', content)
        
        # 2. Matches: `maxWidth: 840, margin: '0 auto'`
        content = re.sub(r'maxWidth:\s*(840|1000|1040|1200),\s*margin:\s*\'0 auto\'', '', content)
        
        # 3. Matches: `maxWidth: 1200` (for LLMSettingsPage)
        content = re.sub(r'maxWidth:\s*1200\s*', 'width: \'100%\'', content)

        # Cleanup trailing commas if we left `{ display: 'flex', }`
        content = content.replace(", }", " }").replace(",}", "}")

        with open(filepath, 'w') as f:
            f.write(content)

print("Removed max-width constraints.")
