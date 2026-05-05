import { useEffect, useMemo, useState, type Dispatch, type SetStateAction } from 'react'
import './App.css'
import { CopyButton } from './components/CopyButton'
import { TextAreaPanel } from './components/TextAreaPanel'
import { ToolCard } from './components/ToolCard'
import { caesarCipher, rot13 } from './utils/caesar'
import { hashSha256 } from './utils/hash'
import {
  decodeBase64,
  decodeBinary,
  decodeHex,
  encodeBase64,
  encodeBinary,
  encodeHex,
} from './utils/encodings'
import { countLettersOnly, reverseText, stripSpaces } from './utils/text'
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
  },
  {
    id: 'vigenere',
    title: 'Vigenere Cipher',
    description: 'Work with keyed substitution while preserving punctuation and spacing.',
    badge: 'Keyed',
  },
  {
    id: 'hash',
    title: 'SHA-256 Hash',
    description: 'Generate a browser-side digest with the Web Crypto API.',
    badge: 'Integrity',
  },
  {
    id: 'base',
    title: 'Base Tools',
    description: 'Convert between Base64, hex, and binary without leaving the page.',
    badge: 'Encoding',
  },
  {
    id: 'cleanup',
    title: 'Text Cleanup',
    description: 'Normalize clues, reverse strings, and inspect character counts fast.',
    badge: 'Prep',
  },
] as const

const createBaseToolState = (): BaseToolState => ({
  input: '',
  output: '',
  error: '',
})

function App() {
  const [caesarInput, setCaesarInput] = useState('')
  const [caesarShift, setCaesarShift] = useState(13)
  const [caesarMode, setCaesarMode] = useState<Mode>('encode')

  const [vigenereInput, setVigenereInput] = useState('')
  const [vigenereKey, setVigenereKey] = useState('')
  const [vigenereMode, setVigenereMode] = useState<Mode>('encode')

  const [hashInput, setHashInput] = useState('')
  const [hashOutput, setHashOutput] = useState('')
  const [hashError, setHashError] = useState('')

  const [base64State, setBase64State] = useState<BaseToolState>(createBaseToolState)
  const [hexState, setHexState] = useState<BaseToolState>(createBaseToolState)
  const [binaryState, setBinaryState] = useState<BaseToolState>(createBaseToolState)

  const [cleanupInput, setCleanupInput] = useState('')

  const caesarOutput = useMemo(
    () => caesarCipher(caesarInput, caesarShift, caesarMode),
    [caesarInput, caesarMode, caesarShift],
  )

  const caesarDisplayOutput = useMemo(() => {
    if (!caesarInput) {
      return ''
    }

    return caesarMode === 'encode' && caesarShift === 13 ? rot13(caesarInput) : caesarOutput
  }, [caesarInput, caesarMode, caesarOutput, caesarShift])

  const vigenereOutput = useMemo(
    () => vigenereCipher(vigenereInput, vigenereKey, vigenereMode),
    [vigenereInput, vigenereKey, vigenereMode],
  )

  const cleanupResults = useMemo(
    () => ({
      noSpaces: stripSpaces(cleanupInput),
      uppercase: cleanupInput.toUpperCase(),
      lowercase: cleanupInput.toLowerCase(),
      reversed: reverseText(cleanupInput),
      charCount: cleanupInput.length,
      letterCount: countLettersOnly(cleanupInput),
    }),
    [cleanupInput],
  )

  useEffect(() => {
    setHashOutput('')
    setHashError('')
  }, [hashInput])

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

  return (
    <div className="app-shell">
      <header className="hero-panel">
        <div className="hero-copy">
          <p className="eyebrow">Puzzle Crypto Workbench</p>
          <h1>CipherForge</h1>
          <p className="hero-subtitle">
            A browser toolbox for ciphers, hashes, and puzzle solving.
          </p>
        </div>
        <div className="hero-chip-grid">
          <span>Local-first</span>
          <span>No backend</span>
          <span>GitHub Pages ready</span>
        </div>
      </header>

      <section className="dashboard" aria-label="Tool dashboard">
        {toolCards.map((tool) => (
          <ToolCard
            key={tool.id}
            href={`#${tool.id}`}
            title={tool.title}
            description={tool.description}
            badge={tool.badge}
          />
        ))}
      </section>

      <main className="tool-stack">
        <section id="caesar" className="tool-section">
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
              <button
                type="button"
                className="mode-button"
                onClick={() => {
                  setCaesarShift(13)
                  setCaesarMode('encode')
                }}
              >
                ROT13
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
              value={caesarDisplayOutput}
              readOnly
              placeholder="Shifted text appears here."
              helperText="ROT13 is Caesar with a shift of 13."
              actions={<CopyButton value={caesarDisplayOutput} disabled={!caesarInput} />}
            />
          </div>

          <label className="field-group inline-field" htmlFor="caesar-shift">
            <span>Shift</span>
            <input
              id="caesar-shift"
              className="number-input"
              type="number"
              min={0}
              max={25}
              value={caesarShift}
              onChange={(event) =>
                setCaesarShift(
                  Math.min(25, Math.max(0, Number.parseInt(event.target.value || '0', 10))),
                )
              }
            />
          </label>
        </section>

        <section id="vigenere" className="tool-section">
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
        </section>

        <section id="hash" className="tool-section">
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
        </section>

        <section id="base" className="tool-section">
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
        </section>

        <section id="cleanup" className="tool-section">
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
              label="Uppercase"
              value={cleanupResults.uppercase}
              emptyLabel="Uppercase output appears here."
            />
            <ResultCard
              label="Lowercase"
              value={cleanupResults.lowercase}
              emptyLabel="Lowercase output appears here."
            />
            <ResultCard
              label="Reverse Text"
              value={cleanupResults.reversed}
              emptyLabel="Reversed text appears here."
            />
            <MetricCard
              label="Character Count"
              value={cleanupResults.charCount.toString()}
            />
            <MetricCard
              label="Letters Only"
              value={cleanupResults.letterCount.toString()}
            />
          </div>
        </section>
      </main>
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
