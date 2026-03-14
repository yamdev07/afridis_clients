
import os
import re

def remove_dark_mode(directory):
    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.endswith(('.jsx', '.css', '.js')):
                filepath = os.path.join(root, file)
                with open(filepath, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                # Regex to match 'dark:' preceded by a space or quote
                # and followed by some tailwind class characters
                # Example: ' dark:bg-slate-900', '"dark:text-white"'
                new_content = re.sub(r'\s?dark:[^\s"\'`\}]+', '', content)
                
                if new_content != content:
                    with open(filepath, 'w', encoding='utf-8') as f:
                        f.write(new_content)
                    print(f"Updated {filepath}")

# Path to src directory
src_path = os.path.join(os.getcwd(), 'my-react-app', 'src')
remove_dark_mode(src_path)
