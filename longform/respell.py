"""Respell Tunisian and other names in a film's English narration so Kokoro says them right: python3 respell.py <slug> ...

Changes only what the voice reads: a line's `say`, or a new `say` made from its `text` without the * and ~ marks.
The French lines (FR) are left alone. Spellings checked with Kokoro's phonemizer (misaki with the espeak fallback)."""
import re, sys
RULES = [
    (r'\bKsar [GR]hilane\b', 'Kuh-sar Ghee-lahn'), (r'\bKsar\b', 'Kuh-sar'),
    (r'\bHammamet\b', 'Hamma-met'), (r'\bTakrouna\b', 'Takroona'), (r'\bGab[eè]s\b', 'Gahbess'),
    (r'\bAlamein\b', 'Allamain'), (r'\bN(?:ou|oo|uu)r\b', 'Nuhr'), (r'\bKhaled\b', 'Khalid'),
    (r'\bLeclerc\b', 'Luh-clair'), (r'\bHaane\b', 'Hahneh'), (r'\bEnfidha\b', 'Enfeeda'),
    (r'\bZigzaou\b', 'Zigzow'), (r'\bThala\b', 'Tahla'), (r'\bThapa\b', 'Tahpa'), (r'\bMesse\b', 'Messeh'),
    (r'\bLamine\b', 'Lameen'), (r'\bBoukris\b', 'Bookrees'), (r'\bZaghouan\b', 'Zagwan'),
]
def fix(s):
    for a, b in RULES: s = re.sub(a, b, s)
    return s
for slug in sys.argv[1:]:
    p = f'/tmp/claude-0/-home-user/597d1c62-e00b-59e9-a6a1-fbf35da32d35/scratchpad/studio/{slug}/script.mjs'
    out, n = [], 0
    for line in open(p, encoding='utf-8'):
        if "{ key: '" in line and "text: '" in line:
            m = re.search(r"say: '([^']*)'", line)
            if m:
                new = fix(m.group(1))
                if new != m.group(1): line = line[:m.start(1)] + new + line[m.end(1):]; n += 1
            else:
                t = re.search(r"text: '([^']*)'", line)
                spoken = t.group(1).replace('*', '').replace('~', '')
                new = fix(spoken)
                if new != spoken:
                    i = line.rindex('}'); line = line[:i].rstrip() + f", say: '{new}' " + line[i:]; n += 1
        out.append(line)
    open(p, 'w', encoding='utf-8').write(''.join(out))
    print(f'{slug}: {n} lines respelled')
