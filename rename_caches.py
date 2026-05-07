import re

with open('src/App.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

# 1. Update ToolCards
replacements = [
    (
        r"description: 'Mirror A-Z letters for quick geocache substitution clues.',\s*badge: 'Geocaching',",
        "description: 'Mirror A-Z letters for quick substitution.',\n    badge: 'Substitution',"
    ),
    (
        r"description: 'Convert letters to 1-26 numbers and decode numbered cache hints.',\s*badge: 'Geocaching',",
        "description: 'Convert letters to 1-26 numbers and decode numbered sequences.',\n    badge: 'Substitution',"
    ),
    (
        r"description: 'Translate dot-dash clue text, including coordinate digits.',\s*badge: 'Geocaching',",
        "description: 'Translate dot-dash text, including digits.',\n    badge: 'Signal',"
    ),
    (
        r"description: 'Encode and decode five-symbol A/B groups used in puzzle caches.',\s*badge: 'Geocaching',",
        "description: 'Encode and decode five-symbol A/B substitution groups.',\n    badge: 'Substitution',"
    ),
    (
        r"description: 'Convert letters through a 5x5 I/J square into row-column pairs.',\s*badge: 'Geocaching',",
        "description: 'Convert letters through a 5x5 I/J square into row-column pairs.',\n    badge: 'Fractionation',"
    ),
    (
        r"description: 'Use a numeric key as repeating Caesar shifts for cache text.',\s*badge: 'Geocaching',",
        "description: 'Use a numeric key as repeating Caesar shifts for cipher text.',\n    badge: 'Keyed',"
    )
]

for old, new in replacements:
    code = re.sub(old, new, code)

# 2. Update category filter logic
code = code.replace(
    "['Classical', 'Keyed', 'XOR', 'Geocaching', 'Signal']",
    "['Classical', 'Keyed', 'XOR', 'Substitution', 'Fractionation', 'Signal']"
)

# 3. Update section tags
code = code.replace('<p className="section-tag">Geocaching Clue</p>', '<p className="section-tag">Substitution Cipher</p>')
code = code.replace('<p className="section-tag">Geocaching</p>', '<p className="section-tag">Substitution</p>') # just in case

# Make Polybius 'Fractionation' instead of 'Substitution Cipher'
code = re.sub(
    r'(<section id="polybius"[\s\S]*?)<p className="section-tag">Substitution Cipher</p>',
    r'\1<p className="section-tag">Fractionation Cipher</p>',
    code
)

# Make Morse 'Signal Code'
code = re.sub(
    r'(<section id="morse"[\s\S]*?)<p className="section-tag">Substitution Cipher</p>',
    r'\1<p className="section-tag">Signal Code</p>',
    code
)

# 4. Update placeholder texts that use CACHE or GEOCACHING
code = code.replace("Type CACHE NORTH.", "Type CIPHER TEXT.")
code = code.replace("Type CACHE.", "Type CIPHER.")
code = code.replace("Type GEOCACHING", "Type CRYPTOGRAPHY")

with open('src/App.tsx', 'w', encoding='utf-8') as f:
    f.write(code)
