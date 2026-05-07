import re

with open('src/App.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

# 1. Imports
if 'ArrowLeft' not in code:
    code = code.replace("import {\n  Binary,", "import {\n  ArrowLeft,\n  Binary,")

# 2. State
if 'currentView' not in code:
    # We will insert it at the start of the App function
    code = code.replace(
        "function App() {\n  const [caesarInput, setCaesarInput] = useState('')",
        "function App() {\n  const [currentView, setCurrentView] = useState('dashboard')\n  const [activeCategory, setActiveCategory] = useState('All')\n  const [caesarInput, setCaesarInput] = useState('')"
    )

# 3. ToolCard Props
code = re.sub(
    r'<ToolCard\n?\s*key=\{tool\.id\}\n?\s*href=\{`#\$\{tool\.id\}`\}',
    r'<ToolCard\n              key={tool.id}\n              onClick={() => { setCurrentView(tool.id); window.scrollTo({top: 0, behavior: "smooth"}); }}',
    code
)

# 4. Wrap Hero & Dashboard
if '{currentView === \'dashboard\' &&' not in code:
    code = code.replace(
        '<header className="hero-panel">',
        '{currentView === \'dashboard\' && (\n          <div className="dashboard-view">\n            <header className="hero-panel">'
    )
    
    code = code.replace(
        '</section>\n\n        <div className="tool-stack">',
        '</section>\n          </div>\n        )}\n\n        <div className="tool-stack">\n          {currentView !== \'dashboard\' && (\n            <div className="view-header">\n              <button type="button" className="back-button" onClick={() => setCurrentView(\'dashboard\')}>\n                <ArrowLeft size={16} /> Back to Dashboard\n              </button>\n            </div>\n          )}'
    )

# 5. Section visibility
code = re.sub(
    r'<section id="([^"]+)" className="tool-section">',
    r'<section id="\1" className={`tool-section ${currentView === "\1" ? "active" : "hidden"}`}>',
    code
)

# 6. Sidebar navigation overriding
code = re.sub(
    r'<a key=\{`\$\{href\}-\$\{label\}`\} href=\{href\}>',
    r'<button key={`${href}-${label}`} type="button" className="side-nav-button" onClick={(e) => { e.preventDefault(); setCurrentView(\'dashboard\'); window.scrollTo(0,0); }}>',
    code
)
code = code.replace('</a>\n          ))}', '</button>\n          ))}')

with open('src/App.tsx', 'w', encoding='utf-8') as f:
    f.write(code)
