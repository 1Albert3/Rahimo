import re, glob, os

HOOK_PATTERNS = [
    r'^\s+const \[.*?\] = useState',
    r'^\s+const \{.*?\} = useForm',
    r'^\s+const \{.*?\} = useApi',
    r'^\s+const \w+ = useCallback',
    r'^\s+const \w+ = useMemo',
    r'^\s+const \w+ = useRef',
    r'^\s+useEffect\(',
]

def is_hook_line(line):
    return any(re.match(p, line) for p in HOOK_PATTERNS)

def is_early_return(line):
    return re.match(r'\s+if \([^)]+\) return ', line) or re.match(r'\s+if \([^)]+\)\s*\{?\s*$', line)

def fix_file(path):
    content = open(path).read()
    lines = content.split('\n')
    changed = False

    # Find function body start (export default function)
    func_start = None
    for i, l in enumerate(lines):
        if re.match(r'export default function ', l):
            func_start = i
            break
    if func_start is None:
        return

    # Collect all hook declarations and their line ranges (handling multiline)
    # Simple approach: collect single-line hooks that appear AFTER an early return
    
    i = 0
    result = list(lines)
    
    # Find the first early return inside the function
    first_early_return = None
    for i in range(func_start, len(lines)):
        l = lines[i]
        if re.match(r'\s+if \(loading\) return |if \(error\) return ', l):
            first_early_return = i
            break
    
    if first_early_return is None:
        return

    # Collect hook lines that appear AFTER the early return and BEFORE main return (
    hooks_to_move = []
    hooks_indices = []
    
    i = first_early_return + 1
    while i < len(lines):
        l = lines[i]
        # Stop at the main JSX return
        if re.match(r'\s+return \(', l) or re.match(r'\s+return <', l):
            break
        if is_hook_line(l):
            # Collect multiline hook (until semicolon at end of logical line)
            hook_block = [l]
            j = i + 1
            # Check if it's multiline (opening paren not closed)
            open_parens = l.count('(') - l.count(')')
            while open_parens > 0 and j < len(lines):
                hook_block.append(lines[j])
                open_parens += lines[j].count('(') - lines[j].count(')')
                j += 1
            hooks_to_move.append(hook_block)
            hooks_indices.extend(range(i, i + len(hook_block)))
            i = j
        else:
            i += 1
    
    if not hooks_to_move:
        return

    # Build new lines: remove hooks from their positions, insert before early return
    new_lines = []
    skip = set(hooks_indices)
    
    for i, l in enumerate(lines):
        if i == first_early_return:
            # Insert all hooks before the early return
            for block in hooks_to_move:
                new_lines.extend(block)
            new_lines.append(l)
        elif i in skip:
            pass  # skip (already moved)
        else:
            new_lines.append(l)
    
    result_content = '\n'.join(new_lines)
    if result_content != content:
        open(path, 'w').write(result_content)
        print(f'Fixed: {os.path.basename(path)}')

files = glob.glob('/home/albert/Bureau/App/Rahimo/frontend/src/**/*.tsx', recursive=True)
for f in files:
    try:
        fix_file(f)
    except Exception as e:
        print(f'Error {f}: {e}')

print('Done')
