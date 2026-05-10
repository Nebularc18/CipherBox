import { useCallback, useEffect, useMemo, useState, useRef, type Dispatch, type SetStateAction } from 'react'
import {
  ArrowUp,
  Binary,
  Braces,
  Compass,
  GitBranch,
  Hash,
  Home,
  KeyRound,
  LockKeyhole,
  ShieldCheck,
  Shuffle,
  Sparkles,
  TextCursorInput,
  X,
} from 'lucide-react'
import './App.css'
import { CopyButton } from './components/CopyButton'
import { TextAreaPanel } from './components/TextAreaPanel'
import { ToolCard } from './components/ToolCard'
import { caesarCipher } from './utils/caesar'
import { hashSha256 } from './utils/hash'
import {
  a1z26Cipher,
  asciiDecimalCipher,
  atbashCipher,
  baconCipher,
  decimalCoordinatesToDdm,
  gronsfeldCipher,
  letterValue,
  morseCipher,
  natoCipher,
  numberModuloCipher,
  polybiusCipher,
  ternaryCipher,
} from './utils/geocaching'
import {
  decodeBase64,
  decodeBinary,
  decodeHex,
  encodeBase64,
  encodeBinary,
  encodeHex,
} from './utils/encodings'
import {
  countAlphanumericOnly,
  countLettersOnly,
  reverseText,
  stripNonAlphanumeric,
  stripSpaces,
} from './utils/text'
import { decryptKeyStream, encryptKeyStream } from './utils/keyStream'
import { vigenereCipher } from './utils/vigenere'

type Mode = 'encode' | 'decode'

type BaseToolState = {
  input: string
  output: string
  error: string
}

const toolCards = [
  {
    id: 'caesar',
    title: 'Caesar Cipher',
    description: 'Shift letters forward or backward and test quick ROT13 transforms.',
    badge: 'Classical',
    Icon: Binary,
  },
  {
    id: 'vigenere',
    title: 'Vigenere Cipher',
    description: 'Work with keyed substitution while preserving punctuation and spacing.',
    badge: 'Keyed',
    Icon: KeyRound,
  },
  {
    id: 'keystream',
    title: 'Hex Key Stream',
    description: 'Encrypt coordinates and other mixed text with a repeating hex byte key.',
    badge: 'XOR',
    Icon: LockKeyhole,
  },
  {
    id: 'atbash',
    title: 'Atbash Cipher',
    description: 'Mirror A-Z letters for quick substitution.',
    badge: 'Substitution',
    Icon: Compass,
  },
  {
    id: 'a1z26',
    title: 'A1Z26 Cipher',
    description: 'Convert letters to 1-26 numbers and decode numbered sequences.',
    badge: 'Substitution',
    Icon: Compass,
  },
  {
    id: 'morse',
    title: 'Morse Code',
    description: 'Translate dot-dash text, including digits.',
    badge: 'Signal',
    Icon: Compass,
  },
  {
    id: 'bacon',
    title: 'Bacon A/B Cipher',
    description: 'Encode and decode five-symbol A/B substitution groups.',
    badge: 'Substitution',
    Icon: Compass,
  },
  {
    id: 'polybius',
    title: 'Polybius Square',
    description: 'Convert letters through a 5x5 I/J square into row-column pairs.',
    badge: 'Fractionation',
    Icon: Compass,
  },
  {
    id: 'gronsfeld',
    title: 'Gronsfeld Cipher',
    description: 'Use a numeric key as repeating Caesar shifts for cipher text.',
    badge: 'Keyed',
    Icon: KeyRound,
  },
  {
    id: 'nato',
    title: 'NATO Alphabet',
    description: 'Translate Alfa, Bravo, Charlie-style phonetic clues.',
    badge: 'Signal',
    Icon: Compass,
  },
  {
    id: 'letter-value',
    title: 'Letter Value',
    description: 'Calculate A1Z26 letter sums for final coordinate formulas.',
    badge: 'Formula',
    Icon: Binary,
  },
  {
    id: 'coordinates',
    title: 'Coordinates',
    description: 'Convert decimal latitude and longitude into geocaching DDM format.',
    badge: 'Formula',
    Icon: Compass,
  },
  {
    id: 'ascii-decimal',
    title: 'ASCII Decimal',
    description: 'Convert between text and decimal character codes.',
    badge: 'Encoding',
    Icon: Braces,
  },
  {
    id: 'ascii-modulo',
    title: 'Number Modulo',
    description: 'Turn decimal numbers into reversible quotient and remainder pairs.',
    badge: 'Formula',
    Icon: Binary,
  },
  {
    id: 'ternary',
    title: 'Ternary Code',
    description: 'Convert letters to three-digit base-3 values used in puzzle sheets.',
    badge: 'Encoding',
    Icon: Braces,
  },
  {
    id: 'hash',
    title: 'SHA-256 Hash',
    description: 'Generate a browser-side digest with the Web Crypto API.',
    badge: 'Integrity',
    Icon: ShieldCheck,
  },
  {
    id: 'base',
    title: 'Base Tools',
    description: 'Convert between Base64, hex, and binary without leaving the page.',
    badge: 'Encoding',
    Icon: Braces,
  },
  {
    id: 'cleanup',
    title: 'Text Cleanup',
    description: 'Normalize clues, reverse strings, and inspect character counts fast.',
    badge: 'Prep',
    Icon: Sparkles,
  },
] as const

const navigationItems = [
  { href: '#top', label: 'Home', Icon: Home },
  { href: '#caesar', label: 'Ciphers', Icon: Binary },
  { href: '#hash', label: 'Hashing', Icon: Hash },
  { href: '#base', label: 'Encoding', Icon: Shuffle },
  { href: '#cleanup', label: 'Text Utils', Icon: TextCursorInput },
]

const createBaseToolState = (): BaseToolState => ({
  input: '',
  output: '',
  error: '',
})

function App() {
  const dashboardRef = useRef<HTMLElement>(null)
  const [gridColumns, setGridColumns] = useState(1)
  const [currentView, setCurrentView] = useState('dashboard')
  const [activeCategory, setActiveCategory] = useState('Home')
  const [caesarInput, setCaesarInput] = useState('')
  const [caesarShift, setCaesarShift] = useState(13)
  const [caesarMode, setCaesarMode] = useState<Mode>('encode')

  const [vigenereInput, setVigenereInput] = useState('')
  const [vigenereKey, setVigenereKey] = useState('')
  const [vigenereMode, setVigenereMode] = useState<Mode>('encode')

  const [keyStreamInput, setKeyStreamInput] = useState('')
  const [keyStreamKey, setKeyStreamKey] = useState('')
  const [keyStreamMode, setKeyStreamMode] = useState<Mode>('encode')

  const [atbashInput, setAtbashInput] = useState('')
  const [a1z26Input, setA1z26Input] = useState('')
  const [a1z26Mode, setA1z26Mode] = useState<Mode>('encode')
  const [morseInput, setMorseInput] = useState('')
  const [morseMode, setMorseMode] = useState<Mode>('encode')
  const [baconInput, setBaconInput] = useState('')
  const [baconMode, setBaconMode] = useState<Mode>('encode')
  const [polybiusInput, setPolybiusInput] = useState('')
  const [polybiusMode, setPolybiusMode] = useState<Mode>('encode')
  const [gronsfeldInput, setGronsfeldInput] = useState('')
  const [gronsfeldKey, setGronsfeldKey] = useState('')
  const [gronsfeldMode, setGronsfeldMode] = useState<Mode>('encode')
  const [natoInput, setNatoInput] = useState('')
  const [natoMode, setNatoMode] = useState<Mode>('encode')
  const [letterValueInput, setLetterValueInput] = useState('')
  const [coordinatesInput, setCoordinatesInput] = useState('')
  const [asciiDecimalInput, setAsciiDecimalInput] = useState('')
  const [asciiDecimalMode, setAsciiDecimalMode] = useState<Mode>('encode')
  const [asciiModuloInput, setAsciiModuloInput] = useState('')
  const [asciiModuloMode, setAsciiModuloMode] = useState<Mode>('encode')
  const [asciiModuloValue, setAsciiModuloValue] = useState(5)
  const [ternaryInput, setTernaryInput] = useState('')
  const [ternaryMode, setTernaryMode] = useState<Mode>('encode')

  const [hashInput, setHashInput] = useState('')
  const [hashOutput, setHashOutput] = useState('')
  const [hashError, setHashError] = useState('')

  const [base64State, setBase64State] = useState<BaseToolState>(createBaseToolState)
  const [hexState, setHexState] = useState<BaseToolState>(createBaseToolState)
  const [binaryState, setBinaryState] = useState<BaseToolState>(createBaseToolState)

  const [cleanupInput, setCleanupInput] = useState('')
  const [showScrollTop, setShowScrollTop] = useState(false)

  const filteredTools = useMemo(() => {
    if (activeCategory === 'Home') return toolCards
    return toolCards.filter((tool) => {
      if (activeCategory === 'Ciphers') return ['Classical', 'Keyed', 'XOR', 'Substitution', 'Fractionation', 'Signal'].includes(tool.badge)
      if (activeCategory === 'Hashing') return ['Integrity'].includes(tool.badge)
      if (activeCategory === 'Encoding') return ['Encoding', 'Formula'].includes(tool.badge)
      if (activeCategory === 'Text Utils') return ['Prep'].includes(tool.badge)
      return true
    })
  }, [activeCategory])

  const caesarOutput = useMemo(
    () => caesarCipher(caesarInput, caesarShift, caesarMode),
    [caesarInput, caesarMode, caesarShift],
  )

  const vigenereOutput = useMemo(
    () => vigenereCipher(vigenereInput, vigenereKey, vigenereMode),
    [vigenereInput, vigenereKey, vigenereMode],
  )

  const keyStreamResult = useMemo(() => {
    if (!keyStreamInput || !keyStreamKey) {
      return { output: '', error: '' }
    }

    try {
      return {
        output:
          keyStreamMode === 'encode'
            ? encryptKeyStream(keyStreamInput, keyStreamKey)
            : decryptKeyStream(keyStreamInput, keyStreamKey),
        error: '',
      }
    } catch (error) {
      return {
        output: '',
        error:
          error instanceof Error ? error.message : 'Cipher failed for this input.',
      }
    }
  }, [keyStreamInput, keyStreamKey, keyStreamMode])

  const atbashOutput = useMemo(() => atbashCipher(atbashInput), [atbashInput])

  const a1z26Output = useMemo(
    () => a1z26Cipher(a1z26Input, a1z26Mode),
    [a1z26Input, a1z26Mode],
  )

  const morseOutput = useMemo(
    () => morseCipher(morseInput, morseMode),
    [morseInput, morseMode],
  )

  const baconOutput = useMemo(
    () => baconCipher(baconInput, baconMode),
    [baconInput, baconMode],
  )

  const polybiusOutput = useMemo(
    () => polybiusCipher(polybiusInput, polybiusMode),
    [polybiusInput, polybiusMode],
  )

  const gronsfeldOutput = useMemo(
    () => gronsfeldCipher(gronsfeldInput, gronsfeldKey, gronsfeldMode),
    [gronsfeldInput, gronsfeldKey, gronsfeldMode],
  )

  const natoOutput = useMemo(
    () => natoCipher(natoInput, natoMode),
    [natoInput, natoMode],
  )

  const letterValueOutput = useMemo(
    () => letterValue(letterValueInput),
    [letterValueInput],
  )

  const coordinatesResult = useMemo(() => {
    if (!coordinatesInput) {
      return { output: '', error: '' }
    }

    try {
      return {
        output: decimalCoordinatesToDdm(coordinatesInput),
        error: '',
      }
    } catch (error) {
      return {
        output: '',
        error: error instanceof Error ? error.message : 'Coordinate conversion failed.',
      }
    }
  }, [coordinatesInput])

  const asciiDecimalOutput = useMemo(
    () => asciiDecimalCipher(asciiDecimalInput, asciiDecimalMode),
    [asciiDecimalInput, asciiDecimalMode],
  )

  const asciiModuloResult = useMemo(() => {
    if (!asciiModuloInput) {
      return { output: '', error: '' }
    }

    try {
      return {
        output: numberModuloCipher(asciiModuloInput, asciiModuloValue, asciiModuloMode),
        error: '',
      }
    } catch (error) {
      return {
        output: '',
        error: error instanceof Error ? error.message : 'Modulo conversion failed.',
      }
    }
  }, [asciiModuloInput, asciiModuloMode, asciiModuloValue])

  const ternaryOutput = useMemo(
    () => ternaryCipher(ternaryInput, ternaryMode),
    [ternaryInput, ternaryMode],
  )

  const cleanupResults = useMemo(
    () => {
      const alphanumericOnly = stripNonAlphanumeric(cleanupInput)

      return {
        noSpaces: stripSpaces(cleanupInput),
        uppercase: cleanupInput.toUpperCase(),
        lowercase: cleanupInput.toLowerCase(),
        reversed: reverseText(cleanupInput),
        alphanumericOnly,
        uppercaseAlphanumeric: alphanumericOnly.toUpperCase(),
        lowercaseAlphanumeric: alphanumericOnly.toLowerCase(),
        reversedAlphanumeric: reverseText(alphanumericOnly),
        charCount: cleanupInput.length,
        letterCount: countLettersOnly(cleanupInput),
        alphanumericCount: countAlphanumericOnly(cleanupInput),
      }
    },
    [cleanupInput],
  )

  useEffect(() => {
    setHashOutput('')
    setHashError('')
  }, [hashInput])

  useEffect(() => {
    const updateScrollButton = () => {
      setShowScrollTop(window.scrollY > 360)
    }

    updateScrollButton()
    window.addEventListener('scroll', updateScrollButton, { passive: true })

    return () => {
      window.removeEventListener('scroll', updateScrollButton)
    }
  }, [])

  const getDashboardColumnCount = useCallback(() => {
    if (dashboardRef.current) {
      const style = window.getComputedStyle(dashboardRef.current)
      const cols = style.gridTemplateColumns.split(' ').length
      return cols || 1
    }
    return 1
  }, [])

  const updateGridColumns = useCallback(() => {
    setGridColumns(getDashboardColumnCount())
  }, [getDashboardColumnCount])

  const toggleTool = useCallback((toolId: string) => {
    const nextView = currentView === toolId ? 'dashboard' : toolId

    setGridColumns(getDashboardColumnCount())
    setCurrentView(nextView)

    if (nextView !== 'dashboard') {
      setTimeout(() => {
        document.getElementById('expanded-tool-container')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }, 50)
    }
  }, [currentView, getDashboardColumnCount])

  const closeTool = useCallback(() => {
    setCurrentView('dashboard')
  }, [])

  useEffect(() => {
    updateGridColumns()
    window.addEventListener('resize', updateGridColumns)
    
    let observer: ResizeObserver | null = null
    if (window.ResizeObserver && dashboardRef.current) {
      observer = new ResizeObserver(updateGridColumns)
      observer.observe(dashboardRef.current)
    }

    return () => {
      window.removeEventListener('resize', updateGridColumns)
      if (observer) observer.disconnect()
    }
  }, [updateGridColumns])

  useEffect(() => {
    updateGridColumns()
  }, [activeCategory, updateGridColumns])

  useEffect(() => {
    if (currentView === 'dashboard') return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeTool()
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [closeTool, currentView])

  const runHash = async () => {
    if (!hashInput) {
      setHashOutput('')
      setHashError('Enter text to hash.')
      return
    }

    try {
      const digest = await hashSha256(hashInput)
      setHashOutput(digest)
      setHashError('')
    } catch {
      setHashOutput('')
      setHashError('Hash generation failed in this browser.')
    }
  }

  const updateBaseState = (
    setter: Dispatch<SetStateAction<BaseToolState>>,
    input: string,
  ) => {
    setter((current) => ({
      ...current,
      input,
      error: '',
    }))
  }

  const runBaseAction = (
    kind: 'base64' | 'hex' | 'binary',
    direction: Mode,
  ) => {
    const config = {
      base64: {
        state: base64State,
        setter: setBase64State,
        encode: encodeBase64,
        decode: decodeBase64,
      },
      hex: {
        state: hexState,
        setter: setHexState,
        encode: encodeHex,
        decode: decodeHex,
      },
      binary: {
        state: binaryState,
        setter: setBinaryState,
        encode: encodeBinary,
        decode: decodeBinary,
      },
    }[kind]

    if (!config.state.input) {
      config.setter((current) => ({
        ...current,
        output: '',
        error: 'Enter text before converting.',
      }))
      return
    }

    try {
      const output =
        direction === 'encode'
          ? config.encode(config.state.input)
          : config.decode(config.state.input)

      config.setter((current) => ({
        ...current,
        output,
        error: '',
      }))
    } catch (error) {
      config.setter((current) => ({
        ...current,
        output: '',
        error:
          error instanceof Error ? error.message : 'Conversion failed for this input.',
      }))
    }
  }

  const renderTool = (id: string) => {
    switch (id) {
      case 'caesar':
        return (
          <div className="inline-tool">
            <div className="section-heading">
              <div>
                <p className="section-tag">Classical Cipher</p>
                <h2>Caesar Cipher</h2>
              </div>
              <div className="control-strip">
                <button
                  type="button"
                  className={`mode-button ${caesarMode === 'encode' ? 'active' : ''}`}
                  onClick={() => setCaesarMode('encode')}
                >
                  Encode
                </button>
                <button
                  type="button"
                  className={`mode-button ${caesarMode === 'decode' ? 'active' : ''}`}
                  onClick={() => setCaesarMode('decode')}
                >
                  Decode
                </button>
              </div>
            </div>

            <div className="tool-grid two-column">
              <TextAreaPanel
                id="caesar-input"
                label="Input"
                value={caesarInput}
                onChange={setCaesarInput}
                placeholder="Type ciphertext or plaintext here."
              />
              <TextAreaPanel
                id="caesar-output"
                label="Output"
                value={caesarInput ? caesarOutput : ''}
                readOnly
                placeholder="Shifted text appears here."
                actions={<CopyButton value={caesarOutput} disabled={!caesarInput} />}
              />
            </div>

            <label className="field-group inline-field" htmlFor="caesar-shift">
              <span>Shift</span>
              <div className="stepper">
                <input
                  id="caesar-shift"
                  className="number-input"
                  type="number"
                  value={caesarShift}
                  onChange={(event) =>
                    setCaesarShift(Number.parseInt(event.target.value || '0', 10))
                  }
                />
                <button type="button" onClick={() => setCaesarShift((value) => value - 1)}>
                  -
                </button>
                <button type="button" onClick={() => setCaesarShift((value) => value + 1)}>
                  +
                </button>
              </div>
            </label>
          </div>
        )
      case 'vigenere':
        return (
          <div className="inline-tool">
            <div className="section-heading">
              <div>
                <p className="section-tag">Keyed Cipher</p>
                <h2>Vigenere Cipher</h2>
              </div>
              <div className="control-strip">
                <button
                  type="button"
                  className={`mode-button ${vigenereMode === 'encode' ? 'active' : ''}`}
                  onClick={() => setVigenereMode('encode')}
                >
                  Encode
                </button>
                <button
                  type="button"
                  className={`mode-button ${vigenereMode === 'decode' ? 'active' : ''}`}
                  onClick={() => setVigenereMode('decode')}
                >
                  Decode
                </button>
              </div>
            </div>

            <label className="field-group" htmlFor="vigenere-key">
              <span>Key</span>
              <input
                id="vigenere-key"
                className="text-input"
                type="text"
                value={vigenereKey}
                onChange={(event) => setVigenereKey(event.target.value)}
                placeholder="Example: ORBIT"
              />
            </label>

            <div className="tool-grid two-column">
              <TextAreaPanel
                id="vigenere-input"
                label="Input"
                value={vigenereInput}
                onChange={setVigenereInput}
                placeholder="Type text to transform."
              />
              <TextAreaPanel
                id="vigenere-output"
                label="Output"
                value={vigenereInput && vigenereKey ? vigenereOutput : ''}
                readOnly
                placeholder="Output appears once a key is provided."
                helperText={!vigenereKey ? 'Only letters in the key are used.' : undefined}
                actions={
                  <CopyButton
                    value={vigenereOutput}
                    disabled={!vigenereInput || !vigenereKey}
                  />
                }
              />
            </div>
          </div>
        )
      case 'keystream':
        return (
          <div className="inline-tool">
            <div className="section-heading">
              <div>
                <p className="section-tag">Hex Key Cipher</p>
                <h2>Hex Key Stream</h2>
              </div>
              <div className="control-strip">
                <button
                  type="button"
                  className={`mode-button ${keyStreamMode === 'encode' ? 'active' : ''}`}
                  onClick={() => setKeyStreamMode('encode')}
                >
                  Encrypt
                </button>
                <button
                  type="button"
                  className={`mode-button ${keyStreamMode === 'decode' ? 'active' : ''}`}
                  onClick={() => setKeyStreamMode('decode')}
                >
                  Decrypt
                </button>
              </div>
            </div>

            <label className="field-group" htmlFor="keystream-key">
              <span>Hex Key</span>
              <input
                id="keystream-key"
                className="text-input wide-input"
                type="text"
                value={keyStreamKey}
                onChange={(event) => setKeyStreamKey(event.target.value)}
                placeholder="00112233445566778899aabbccddeeff"
                spellCheck={false}
              />
            </label>

            <div className="tool-grid two-column">
              <TextAreaPanel
                id="keystream-input"
                label={keyStreamMode === 'encode' ? 'Plaintext' : 'Ciphertext Hex'}
                value={keyStreamInput}
                onChange={setKeyStreamInput}
                placeholder={
                  keyStreamMode === 'encode'
                    ? 'Type plaintext to encrypt.'
                    : 'Paste encrypted hex here.'
                }
              />
              <TextAreaPanel
                id="keystream-output"
                label={keyStreamMode === 'encode' ? 'Ciphertext Hex' : 'Plaintext'}
                value={keyStreamResult.output}
                readOnly
                placeholder="Output appears once text and a hex key are provided."
                helperText={
                  keyStreamResult.error ||
                  'Uses repeating-key XOR over UTF-8 bytes; encrypted output is hex.'
                }
                isError={Boolean(keyStreamResult.error)}
                actions={
                  <CopyButton
                    value={keyStreamResult.output}
                    disabled={!keyStreamResult.output}
                  />
                }
              />
            </div>
          </div>
        )
      case 'atbash':
        return (
          <div className="inline-tool">
            <div className="section-heading">
              <div>
                <p className="section-tag">Substitution Cipher</p>
                <h2>Atbash Cipher</h2>
              </div>
            </div>

            <div className="tool-grid two-column">
              <TextAreaPanel
                id="atbash-input"
                label="Input"
                value={atbashInput}
                onChange={setAtbashInput}
                placeholder="Paste Atbash text, such as Xofv: M59 V018."
              />
              <TextAreaPanel
                id="atbash-output"
                label="Output"
                value={atbashInput ? atbashOutput : ''}
                readOnly
                placeholder="Mirrored text appears here."
                helperText="Atbash is reciprocal, so decoding uses the same transform."
                actions={<CopyButton value={atbashOutput} disabled={!atbashInput} />}
              />
            </div>
          </div>
        )
      case 'a1z26':
        return (
          <div className="inline-tool">
            <div className="section-heading">
              <div>
                <p className="section-tag">Substitution Cipher</p>
                <h2>A1Z26 Cipher</h2>
              </div>
              <div className="control-strip">
                <button
                  type="button"
                  className={`mode-button ${a1z26Mode === 'encode' ? 'active' : ''}`}
                  onClick={() => setA1z26Mode('encode')}
                >
                  Encode
                </button>
                <button
                  type="button"
                  className={`mode-button ${a1z26Mode === 'decode' ? 'active' : ''}`}
                  onClick={() => setA1z26Mode('decode')}
                >
                  Decode
                </button>
              </div>
            </div>

            <div className="tool-grid two-column">
              <TextAreaPanel
                id="a1z26-input"
                label="Input"
                value={a1z26Input}
                onChange={setA1z26Input}
                placeholder={a1z26Mode === 'encode' ? 'Type CIPHER TEXT.' : 'Paste 3 1 3 8 5 / 14 15 18 20 8.'}
              />
              <TextAreaPanel
                id="a1z26-output"
                label="Output"
                value={a1z26Input ? a1z26Output : ''}
                readOnly
                placeholder="Converted text appears here."
                helperText="A1Z26 decodes numbers 1-26; use / between words."
                actions={<CopyButton value={a1z26Output} disabled={!a1z26Input} />}
              />
            </div>
          </div>
        )
      case 'morse':
        return (
          <div className="inline-tool">
            <div className="section-heading">
              <div>
                <p className="section-tag">Signal Code</p>
                <h2>Morse Code</h2>
              </div>
              <div className="control-strip">
                <button
                  type="button"
                  className={`mode-button ${morseMode === 'encode' ? 'active' : ''}`}
                  onClick={() => setMorseMode('encode')}
                >
                  Encode
                </button>
                <button
                  type="button"
                  className={`mode-button ${morseMode === 'decode' ? 'active' : ''}`}
                  onClick={() => setMorseMode('decode')}
                >
                  Decode
                </button>
              </div>
            </div>

            <div className="tool-grid two-column">
              <TextAreaPanel
                id="morse-input"
                label="Input"
                value={morseInput}
                onChange={setMorseInput}
                placeholder={morseMode === 'encode' ? 'Type N59 E18.' : 'Paste -. ..... ----. / . .---- ---..'}
              />
              <TextAreaPanel
                id="morse-output"
                label="Output"
                value={morseInput ? morseOutput : ''}
                readOnly
                placeholder="Converted text appears here."
                helperText="Morse decodes space-separated symbols; use / between words."
                actions={<CopyButton value={morseOutput} disabled={!morseInput} />}
              />
            </div>
          </div>
        )
      case 'bacon':
        return (
          <div className="inline-tool">
            <div className="section-heading">
              <div>
                <p className="section-tag">Substitution Cipher</p>
                <h2>Bacon A/B Cipher</h2>
              </div>
              <div className="control-strip">
                <button
                  type="button"
                  className={`mode-button ${baconMode === 'encode' ? 'active' : ''}`}
                  onClick={() => setBaconMode('encode')}
                >
                  Encode
                </button>
                <button
                  type="button"
                  className={`mode-button ${baconMode === 'decode' ? 'active' : ''}`}
                  onClick={() => setBaconMode('decode')}
                >
                  Decode
                </button>
              </div>
            </div>

            <div className="tool-grid two-column">
              <TextAreaPanel
                id="bacon-input"
                label="Input"
                value={baconInput}
                onChange={setBaconInput}
                placeholder={baconMode === 'encode' ? 'Type CIPHER.' : 'Paste AAABA AAAAB AAABB ...'}
              />
              <TextAreaPanel
                id="bacon-output"
                label="Output"
                value={baconInput ? baconOutput : ''}
                readOnly
                placeholder="Converted text appears here."
                helperText="Bacon A/B decodes five-letter A/B groups; use / between words."
                actions={<CopyButton value={baconOutput} disabled={!baconInput} />}
              />
            </div>
          </div>
        )
      case 'polybius':
        return (
          <div className="inline-tool">
            <div className="section-heading">
              <div>
                <p className="section-tag">Fractionation Cipher</p>
                <h2>Polybius Square</h2>
              </div>
              <div className="control-strip">
                <button
                  type="button"
                  className={`mode-button ${polybiusMode === 'encode' ? 'active' : ''}`}
                  onClick={() => setPolybiusMode('encode')}
                >
                  Encode
                </button>
                <button
                  type="button"
                  className={`mode-button ${polybiusMode === 'decode' ? 'active' : ''}`}
                  onClick={() => setPolybiusMode('decode')}
                >
                  Decode
                </button>
              </div>
            </div>

            <div className="tool-grid two-column">
              <TextAreaPanel
                id="polybius-input"
                label="Input"
                value={polybiusInput}
                onChange={setPolybiusInput}
                placeholder={
                  polybiusMode === 'encode' ? 'Type CIPHER TEXT.' : 'Paste 13 11 13 23 15 / 33 34 42 44 23.'
                }
              />
              <TextAreaPanel
                id="polybius-output"
                label="Output"
                value={polybiusInput ? polybiusOutput : ''}
                readOnly
                placeholder="Converted text appears here."
                helperText="Uses a 5x5 Polybius square with I/J sharing one cell."
                actions={<CopyButton value={polybiusOutput} disabled={!polybiusInput} />}
              />
            </div>
          </div>
        )
      case 'gronsfeld':
        return (
          <div className="inline-tool">
            <div className="section-heading">
              <div>
                <p className="section-tag">Numeric Key Cipher</p>
                <h2>Gronsfeld Cipher</h2>
              </div>
              <div className="control-strip">
                <button
                  type="button"
                  className={`mode-button ${gronsfeldMode === 'encode' ? 'active' : ''}`}
                  onClick={() => setGronsfeldMode('encode')}
                >
                  Encode
                </button>
                <button
                  type="button"
                  className={`mode-button ${gronsfeldMode === 'decode' ? 'active' : ''}`}
                  onClick={() => setGronsfeldMode('decode')}
                >
                  Decode
                </button>
              </div>
            </div>

            <label className="field-group" htmlFor="gronsfeld-key">
              <span>Numeric Key</span>
              <input
                id="gronsfeld-key"
                className="text-input"
                type="text"
                value={gronsfeldKey}
                onChange={(event) => setGronsfeldKey(event.target.value)}
                placeholder="Example: 31415"
                inputMode="numeric"
              />
            </label>

            <div className="tool-grid two-column">
              <TextAreaPanel
                id="gronsfeld-input"
                label="Input"
                value={gronsfeldInput}
                onChange={setGronsfeldInput}
                placeholder="Type text to transform with a numeric key."
              />
              <TextAreaPanel
                id="gronsfeld-output"
                label="Output"
                value={gronsfeldInput && gronsfeldKey ? gronsfeldOutput : ''}
                readOnly
                placeholder="Output appears once a key is provided."
                helperText={!gronsfeldKey ? 'Only digits in the key are used.' : undefined}
                actions={
                  <CopyButton
                    value={gronsfeldOutput}
                    disabled={!gronsfeldInput || !gronsfeldKey}
                  />
                }
              />
            </div>
          </div>
        )
      case 'nato':
        return (
          <div className="inline-tool">
            <div className="section-heading">
              <div>
                <p className="section-tag">Signal Code</p>
                <h2>NATO Alphabet</h2>
              </div>
              <div className="control-strip">
                <button
                  type="button"
                  className={`mode-button ${natoMode === 'encode' ? 'active' : ''}`}
                  onClick={() => setNatoMode('encode')}
                >
                  Encode
                </button>
                <button
                  type="button"
                  className={`mode-button ${natoMode === 'decode' ? 'active' : ''}`}
                  onClick={() => setNatoMode('decode')}
                >
                  Decode
                </button>
              </div>
            </div>

            <div className="tool-grid two-column">
              <TextAreaPanel
                id="nato-input"
                label="Input"
                value={natoInput}
                onChange={setNatoInput}
                placeholder={natoMode === 'encode' ? 'Type CIPHER TEXT.' : 'Paste Charlie Alfa Charlie Hotel Echo / November Oscar Romeo Tango Hotel.'}
              />
              <TextAreaPanel
                id="nato-output"
                label="Output"
                value={natoInput ? natoOutput : ''}
                readOnly
                placeholder="Converted text appears here."
                helperText="NATO decoding accepts space-separated phonetic words; use / between words."
                actions={<CopyButton value={natoOutput} disabled={!natoInput} />}
              />
            </div>
          </div>
        )
      case 'letter-value':
        return (
          <div className="inline-tool">
            <div className="section-heading">
              <div>
                <p className="section-tag">Coordinate Formula</p>
                <h2>Letter Value</h2>
              </div>
            </div>

            <div className="tool-grid two-column">
              <TextAreaPanel
                id="letter-value-input"
                label="Input"
                value={letterValueInput}
                onChange={setLetterValueInput}
                placeholder="Type CRYPTOGRAPHY or any formula word."
              />
              <TextAreaPanel
                id="letter-value-output"
                label="Output"
                value={letterValueInput ? letterValueOutput : ''}
                readOnly
                placeholder="Letter values and total appear here."
                helperText="Calculates A=1 through Z=26 and ignores non-letter characters."
                actions={<CopyButton value={letterValueOutput} disabled={!letterValueInput} />}
              />
            </div>
          </div>
        )
      case 'coordinates':
        return (
          <div className="inline-tool">
            <div className="section-heading">
              <div>
                <p className="section-tag">Coordinate Utility</p>
                <h2>Coordinates</h2>
              </div>
            </div>

            <div className="tool-grid two-column">
              <TextAreaPanel
                id="coordinates-input"
                label="Input"
                value={coordinatesInput}
                onChange={setCoordinatesInput}
                placeholder="Paste decimal coordinates like 56.17240822, 15.58957037."
              />
              <TextAreaPanel
                id="coordinates-output"
                label="Output"
                value={coordinatesResult.output}
                readOnly
                placeholder="N 56° 10.344 E 015° 35.374"
                helperText={
                  coordinatesResult.error ||
                  'Formats decimal latitude and longitude as degrees plus decimal minutes.'
                }
                isError={Boolean(coordinatesResult.error)}
                actions={<CopyButton value={coordinatesResult.output} disabled={!coordinatesResult.output} />}
              />
            </div>
          </div>
        )
      case 'ascii-decimal':
        return (
          <div className="inline-tool">
            <div className="section-heading">
              <div>
                <p className="section-tag">Encoding Utility</p>
                <h2>ASCII Decimal</h2>
              </div>
              <div className="control-strip">
                <button
                  type="button"
                  className={`mode-button ${asciiDecimalMode === 'encode' ? 'active' : ''}`}
                  onClick={() => setAsciiDecimalMode('encode')}
                >
                  Encode
                </button>
                <button
                  type="button"
                  className={`mode-button ${asciiDecimalMode === 'decode' ? 'active' : ''}`}
                  onClick={() => setAsciiDecimalMode('decode')}
                >
                  Decode
                </button>
              </div>
            </div>

            <div className="tool-grid two-column">
              <TextAreaPanel
                id="ascii-decimal-input"
                label="Input"
                value={asciiDecimalInput}
                onChange={setAsciiDecimalInput}
                placeholder={asciiDecimalMode === 'encode' ? 'Type CIPHER.' : 'Paste 67 65 67 72 69.'}
              />
              <TextAreaPanel
                id="ascii-decimal-output"
                label="Output"
                value={asciiDecimalInput ? asciiDecimalOutput : ''}
                readOnly
                placeholder="Converted text appears here."
                helperText="Decoding accepts space-separated ASCII values from 0 to 255."
                actions={<CopyButton value={asciiDecimalOutput} disabled={!asciiDecimalInput} />}
              />
            </div>
          </div>
        )
      case 'ascii-modulo':
        return (
          <div className="inline-tool">
            <div className="section-heading">
              <div>
                <p className="section-tag">Number Utility</p>
                <h2>Number Modulo</h2>
              </div>
              <div className="control-strip">
                <button
                  type="button"
                  className={`mode-button ${asciiModuloMode === 'encode' ? 'active' : ''}`}
                  onClick={() => setAsciiModuloMode('encode')}
                >
                  Encode
                </button>
                <button
                  type="button"
                  className={`mode-button ${asciiModuloMode === 'decode' ? 'active' : ''}`}
                  onClick={() => setAsciiModuloMode('decode')}
                >
                  Decode
                </button>
              </div>
            </div>

            <label className="field-group inline-field" htmlFor="ascii-modulo-value">
              <span>Modulo</span>
              <div className="stepper">
                <input
                  id="ascii-modulo-value"
                  className="number-input"
                  type="number"
                  min={2}
                  value={asciiModuloValue}
                  onChange={(event) => {
                    const value = Number.parseInt(event.target.value, 10)
                    setAsciiModuloValue(Number.isFinite(value) ? value : 2)
                  }}
                />
                <button type="button" onClick={() => setAsciiModuloValue((value) => Math.max(2, value - 1))}>
                  -
                </button>
                <button type="button" onClick={() => setAsciiModuloValue((value) => Math.min(10000, value + 1))}>
                  +
                </button>
              </div>
            </label>

            <div className="tool-grid two-column">
              <TextAreaPanel
                id="ascii-modulo-input"
                label="Input"
                value={asciiModuloInput}
                onChange={setAsciiModuloInput}
                placeholder={
                  asciiModuloMode === 'encode'
                    ? 'Paste numbers like 79 15 94 201 511 901 1111.'
                    : 'Paste reversible groups like 4:7 0:15 5:4 11:3.'
                }
              />
              <TextAreaPanel
                id="ascii-modulo-output"
                label="Output"
                value={asciiModuloResult.output}
                readOnly
                placeholder="Modulo output appears here."
                helperText={
                  asciiModuloResult.error ||
                  'Encode stores quotient:remainder pairs; decode returns the original numbers.'
                }
                isError={Boolean(asciiModuloResult.error)}
                actions={<CopyButton value={asciiModuloResult.output} disabled={!asciiModuloResult.output} />}
              />
            </div>
          </div>
        )
      case 'ternary':
        return (
          <div className="inline-tool">
            <div className="section-heading">
              <div>
                <p className="section-tag">Encoding Utility</p>
                <h2>Ternary Code</h2>
              </div>
              <div className="control-strip">
                <button
                  type="button"
                  className={`mode-button ${ternaryMode === 'encode' ? 'active' : ''}`}
                  onClick={() => setTernaryMode('encode')}
                >
                  Encode
                </button>
                <button
                  type="button"
                  className={`mode-button ${ternaryMode === 'decode' ? 'active' : ''}`}
                  onClick={() => setTernaryMode('decode')}
                >
                  Decode
                </button>
              </div>
            </div>

            <div className="tool-grid two-column">
              <TextAreaPanel
                id="ternary-input"
                label="Input"
                value={ternaryInput}
                onChange={setTernaryInput}
                placeholder={ternaryMode === 'encode' ? 'Type CIPHER TEXT.' : 'Paste 010 001 010 022 012 / 112 120 200 202 022.'}
              />
              <TextAreaPanel
                id="ternary-output"
                label="Output"
                value={ternaryInput ? ternaryOutput : ''}
                readOnly
                placeholder="Converted text appears here."
                helperText="Uses A=001 through Z=222 in base 3; use / between words."
                actions={<CopyButton value={ternaryOutput} disabled={!ternaryInput} />}
              />
            </div>
          </div>
        )
      case 'hash':
        return (
          <div className="inline-tool">
            <div className="section-heading">
              <div>
                <p className="section-tag">Digest</p>
                <h2>SHA-256 Hash</h2>
              </div>
              <button type="button" className="action-button" onClick={runHash}>
                Generate Hash
              </button>
            </div>

            <div className="tool-grid two-column">
              <TextAreaPanel
                id="hash-input"
                label="Input"
                value={hashInput}
                onChange={setHashInput}
                placeholder="Enter the text to hash."
              />
              <TextAreaPanel
                id="hash-output"
                label="Output"
                value={hashOutput}
                readOnly
                placeholder="SHA-256 output appears here."
                helperText={hashError || 'Uses the browser Web Crypto API.'}
                isError={Boolean(hashError)}
                actions={<CopyButton value={hashOutput} disabled={!hashOutput} />}
              />
            </div>
          </div>
        )
      case 'base':
        return (
          <div className="inline-tool">
            <div className="section-heading">
              <div>
                <p className="section-tag">Encoding Utilities</p>
                <h2>Base Tools</h2>
              </div>
            </div>

            <div className="tool-grid three-column">
              <EncodingPanel
                title="Base64"
                state={base64State}
                onInputChange={(value) => updateBaseState(setBase64State, value)}
                onEncode={() => runBaseAction('base64', 'encode')}
                onDecode={() => runBaseAction('base64', 'decode')}
              />
              <EncodingPanel
                title="Hex"
                state={hexState}
                onInputChange={(value) => updateBaseState(setHexState, value)}
                onEncode={() => runBaseAction('hex', 'encode')}
                onDecode={() => runBaseAction('hex', 'decode')}
              />
              <EncodingPanel
                title="Binary"
                state={binaryState}
                onInputChange={(value) => updateBaseState(setBinaryState, value)}
                onEncode={() => runBaseAction('binary', 'encode')}
                onDecode={() => runBaseAction('binary', 'decode')}
              />
            </div>
          </div>
        )
      case 'cleanup':
        return (
          <div className="inline-tool">
            <div className="section-heading">
              <div>
                <p className="section-tag">Text Prep</p>
                <h2>Text Cleanup</h2>
              </div>
            </div>

            <TextAreaPanel
              id="cleanup-input"
              label="Input"
              value={cleanupInput}
              onChange={setCleanupInput}
              placeholder="Paste a clue, coordinate string, or suspect ciphertext."
            />

            <div className="cleanup-grid">
              <ResultCard
                label="Remove Spaces"
                value={cleanupResults.noSpaces}
                emptyLabel="No cleaned text yet."
              />
              <ResultCard
                label="Letters + Numbers Only"
                value={cleanupResults.alphanumericOnly}
                emptyLabel="Alphanumeric-only text appears here."
              />
              <ResultCard
                label="Uppercase"
                value={cleanupResults.uppercase}
                emptyLabel="Uppercase output appears here."
              />
              <ResultCard
                label="Uppercase Letters + Numbers"
                value={cleanupResults.uppercaseAlphanumeric}
                emptyLabel="Uppercase alphanumeric output appears here."
              />
              <ResultCard
                label="Lowercase"
                value={cleanupResults.lowercase}
                emptyLabel="Lowercase output appears here."
              />
              <ResultCard
                label="Lowercase Letters + Numbers"
                value={cleanupResults.lowercaseAlphanumeric}
                emptyLabel="Lowercase alphanumeric output appears here."
              />
              <ResultCard
                label="Reverse Text"
                value={cleanupResults.reversed}
                emptyLabel="Reversed text appears here."
              />
              <ResultCard
                label="Reverse Letters + Numbers"
                value={cleanupResults.reversedAlphanumeric}
                emptyLabel="Reversed alphanumeric output appears here."
              />
              <MetricCard
                label="Character Count"
                value={cleanupResults.charCount.toString()}
              />
              <MetricCard
                label="Letters Only"
                value={cleanupResults.letterCount.toString()}
              />
              <MetricCard
                label="Letters + Numbers"
                value={cleanupResults.alphanumericCount.toString()}
              />
            </div>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className="app-frame" id="top">
      <aside className="sidebar" aria-label="Primary navigation">
        <a className="brand" href="#top">
          <span className="brand-mark" aria-hidden="true">
            <LockKeyhole size={23} strokeWidth={2.1} />
          </span>
          <span>
            Cipher<span>Forge</span>
          </span>
        </a>
        <p className="brand-subtitle">Puzzle Crypto Workbench</p>

        <nav className="side-nav">
          {navigationItems.map(({ href, label, Icon }) => (
            <button
              key={`${href}-${label}`}
              type="button"
              className={`side-nav-button ${currentView === 'dashboard' && activeCategory === label ? 'active' : ''}`}
              onClick={(e) => {
                e.preventDefault();
                setCurrentView('dashboard');
                setActiveCategory(label);
                window.scrollTo(0,0);
              }}
            >
              <Icon size={18} strokeWidth={1.9} aria-hidden="true" />
              <span>{label}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-card" id="about">
          <strong>Open Source</strong>
          <p>Built for the puzzle solving community.</p>
          <a href="https://github.com/Nebularc18/CipherBox" target="_blank" rel="noreferrer">
            <GitBranch size={17} strokeWidth={1.9} aria-hidden="true" />
            <span>View on GitHub</span>
          </a>
        </div>

      </aside>

      <main className="app-shell">
          <div className="dashboard-view">
            <header className="hero-panel">
          <div className="hero-copy">
            <p className="eyebrow">Puzzle Crypto Workbench</p>
            <h1>
              Cipher<span>Forge</span>
            </h1>
          <p className="hero-subtitle">
            A browser toolbox for ciphers, hashes, and puzzle solving.
          </p>
        </div>
        </header>

        <div className="dashboard-container">
          <section ref={dashboardRef} className="dashboard" aria-label="Tool dashboard">
            {filteredTools.map((tool, index) => (
              <div 
                key={tool.id} 
                className={`tool-card-wrapper ${currentView === tool.id ? 'active-card' : ''}`}
                style={{ order: index * 10 }}
              >
                <ToolCard
                  onClick={() => toggleTool(tool.id)}
                  title={tool.title}
                  description={tool.description}
                  badge={tool.badge}
                  Icon={tool.Icon}
                />
              </div>
            ))}
            
            {currentView !== 'dashboard' && (
              <div 
                id="expanded-tool-container" 
                className="inline-tool-container active"
                style={{
                  order: Math.floor(filteredTools.findIndex(t => t.id === currentView) / gridColumns) * gridColumns * 10 + (gridColumns * 10) - 5,
                }}
              >
                <div className="inline-tool-actions">
                  <button className="ghost-button inline-tool-close" type="button" onClick={closeTool} aria-label="Close tool panel">
                    <X size={18} strokeWidth={2} aria-hidden="true" />
                  </button>
                </div>
                {renderTool(currentView)}
              </div>
            )}
          </section>
        </div>
        </div>

      </main>
      <button
        type="button"
        className={`scroll-top-button ${showScrollTop ? 'visible' : ''}`}
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        aria-label="Scroll to top"
      >
        <ArrowUp size={30} strokeWidth={2.4} aria-hidden="true" />
      </button>
    </div>
  )
}

type EncodingPanelProps = {
  title: string
  state: BaseToolState
  onInputChange: (value: string) => void
  onEncode: () => void
  onDecode: () => void
}

function EncodingPanel({
  title,
  state,
  onInputChange,
  onEncode,
  onDecode,
}: EncodingPanelProps) {
  return (
    <article className="encoding-panel">
      <div className="section-heading compact">
        <h3>{title}</h3>
        <div className="control-strip">
          <button type="button" className="mode-button" onClick={onEncode}>
            Encode
          </button>
          <button type="button" className="mode-button" onClick={onDecode}>
            Decode
          </button>
        </div>
      </div>

      <TextAreaPanel
        id={`${title.toLowerCase()}-input`}
        label="Input"
        value={state.input}
        onChange={onInputChange}
        placeholder={`Paste ${title} input here.`}
      />

      <TextAreaPanel
        id={`${title.toLowerCase()}-output`}
        label="Output"
        value={state.output}
        readOnly
        placeholder={`${title} output appears here.`}
        helperText={state.error}
        isError={Boolean(state.error)}
        actions={<CopyButton value={state.output} disabled={!state.output} />}
      />
      <p className="encoding-note">Decode accepts whitespace between groups.</p>
    </article>
  )
}

type ResultCardProps = {
  label: string
  value: string
  emptyLabel: string
}

function ResultCard({ label, value, emptyLabel }: ResultCardProps) {
  return (
    <article className="result-card">
      <div className="result-card-header">
        <h3>{label}</h3>
        <CopyButton value={value} disabled={!value} />
      </div>
      <pre>{value || emptyLabel}</pre>
    </article>
  )
}

type MetricCardProps = {
  label: string
  value: string
}

function MetricCard({ label, value }: MetricCardProps) {
  return (
    <article className="metric-card">
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  )
}

export default App
