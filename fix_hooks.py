import re, sys, os, glob

def fix_file(path):
    content = open(path).read()
    
    # Pattern: useApi line, then immediately "if (loading) return ..." before other hooks
    # Find functions with the problematic pattern
    pattern = re.compile(
        r'(const \{[^}]+\} = use(?:Api|Api)[^;]+;\n)'  # useApi call
        r'(\s*if \(loading\) return [^\n]+;\n)'          # early return
        r'((?:.*\n)*?)'                                   # code between
        r'(\s*const \[)',                                 # first useState after
        re.MULTILINE
    )
    
    # Simpler approach: move "if (loading) return" line to just before the return (JSX)
    # Find the pattern: line with "if (loading) return" that appears before useState/useForm/useCallback lines
    lines = content.split('\n')
    new_lines = []
    i = 0
    changed = False
    
    while i < len(lines):
        line = lines[i]
        # Detect early return after useApi
        if re.match(r'\s+if \(loading\) return ', line):
            # Check if there are hook calls after this line
            remaining = lines[i+1:]
            has_hooks_after = any(
                re.match(r'\s+const \[|\s+const \{.*\} = use(?:Form|Callback|State|Memo|Ref)\b', l)
                for l in remaining[:30]
            )
            if has_hooks_after:
                # Skip this line now, insert it later before the JSX return
                loading_return_line = line
                new_lines.append('')  # placeholder removed
                i += 1
                # Collect all remaining lines until we hit the JSX return
                while i < len(lines):
                    l = lines[i]
                    # Insert before the main return statement (JSX)
                    if re.match(r'\s+return \(', l) or re.match(r'\s+return <', l):
                        new_lines.append(loading_return_line)
                        new_lines.append(l)
                        changed = True
                        i += 1
                        break
                    else:
                        new_lines.append(l)
                        i += 1
                continue
        new_lines.append(line)
        i += 1
    
    if changed:
        # Remove the empty placeholder lines we added
        result = '\n'.join(new_lines)
        # Clean up double empty lines created by removal
        result = re.sub(r'\n\n\n+', '\n\n', result)
        open(path, 'w').write(result)
        print(f'Fixed: {path}')
    
files = glob.glob('/home/albert/Bureau/App/Rahimo/frontend/src/**/*.tsx', recursive=True)
for f in files:
    fix_file(f)
print('Done')
