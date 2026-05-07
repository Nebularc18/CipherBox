import { describe, expect, it } from 'vitest'
import { caesarCipher, rot13 } from '../caesar'
import {
  decodeBase64,
  decodeBinary,
  decodeHex,
  encodeBase64,
  encodeBinary,
  encodeHex,
} from '../encodings'
import { hashSha256 } from '../hash'
import { decryptKeyStream, encryptKeyStream } from '../keyStream'
import {
  countAlphanumericOnly,
  countLettersOnly,
  reverseText,
  stripNonAlphanumeric,
  stripSpaces,
} from '../text'
import { vigenereCipher } from '../vigenere'

describe('caesarCipher', () => {
  it('encodes while preserving punctuation', () => {
    expect(caesarCipher('Hello, World!', 3, 'encode')).toBe('Khoor, Zruog!')
  })

  it('decodes back to the original message', () => {
    expect(caesarCipher('Uifsf jt b dmvf.', 1, 'decode')).toBe('There is a clue.')
  })

  it('wraps large and negative shifts', () => {
    expect(caesarCipher('Az za', 27, 'encode')).toBe('Ba ab')
    expect(caesarCipher('Ba ab', -1, 'encode')).toBe('Az za')
  })

  it('performs ROT13 as a reversible Caesar transform', () => {
    expect(rot13('Clue: N59 E018')).toBe('Pyhr: A59 R018')
    expect(rot13(rot13('Clue: N59 E018'))).toBe('Clue: N59 E018')
  })
})

describe('vigenereCipher', () => {
  it('encodes using only letter characters from the key', () => {
    expect(vigenereCipher('Attack at dawn!', 'L3m-on', 'encode')).toBe(
      vigenereCipher('Attack at dawn!', 'LMON', 'encode'),
    )
  })

  it('decodes back to plaintext', () => {
    expect(vigenereCipher('Lxfopv ef rnhr!', 'lemon', 'decode')).toBe('Attack at dawn!')
  })

  it('preserves spaces and punctuation without advancing the key', () => {
    expect(vigenereCipher('A A-A', 'BC', 'encode')).toBe('B C-B')
  })

  it('returns empty output when the key has no letters', () => {
    expect(vigenereCipher('Attack at dawn!', '123-!?', 'encode')).toBe('')
  })
})

describe('key stream cipher', () => {
  const coordinate = 'N5611248E01535589'
  const key = '8dc5d661a303b6eaddcd08718814e3e9eb6be786'
  const encrypted = 'c3f0e050923182d298fd3944bb21d6d1d2'

  it('encrypts the requested coordinate with the requested key', () => {
    expect(encryptKeyStream(coordinate, key)).toBe(encrypted)
  })

  it('decrypts back to the requested coordinate', () => {
    expect(decryptKeyStream(encrypted, key)).toBe(coordinate)
  })

  it('allows whitespace in hex keys and ciphertext', () => {
    expect(encryptKeyStream('A', '0f ff')).toBe('4e')
    expect(decryptKeyStream('4e', '0f ff')).toBe('A')
    expect(decryptKeyStream('c3 f0 e0 50 92 31 82 d2 98 fd 39 44 bb 21 d6 d1 d2', key)).toBe(
      coordinate,
    )
  })

  it('rejects malformed hex keys on encrypt', () => {
    expect(() => encryptKeyStream(coordinate, 'abc')).toThrow('Key must use hex byte pairs.')
  })

  it('rejects malformed hex keys on decrypt', () => {
    expect(() => decryptKeyStream(encrypted, 'abc')).toThrow('Key must use hex byte pairs.')
  })

  it('rejects malformed ciphertext hex on decrypt', () => {
    expect(() => decryptKeyStream('abc', key)).toThrow('Ciphertext must use hex byte pairs.')
  })

  it('validates the key before returning empty encrypt output', () => {
    expect(() => encryptKeyStream('', 'notHex!')).toThrow('Key must use hex byte pairs.')
  })

  it('validates the key before returning empty decrypt output', () => {
    expect(() => decryptKeyStream('', 'notHex!')).toThrow('Key must use hex byte pairs.')
  })
})

describe('encoding helpers', () => {
  it('round-trips Base64 text', () => {
    expect(decodeBase64(encodeBase64('CipherForge'))).toBe('CipherForge')
  })

  it('round-trips Unicode text through Base64', () => {
    expect(decodeBase64(encodeBase64('Ångström ✓'))).toBe('Ångström ✓')
  })

  it('round-trips hex text', () => {
    expect(decodeHex(encodeHex('geocache'))).toBe('geocache')
  })

  it('decodes hex with whitespace and uppercase characters', () => {
    expect(decodeHex('43 69 50 48 45 52')).toBe('CiPHER')
  })

  it('round-trips binary text', () => {
    expect(decodeBinary(encodeBinary('PUZZLE'))).toBe('PUZZLE')
  })

  it('decodes binary with whitespace between byte groups', () => {
    expect(decodeBinary('01000011 01101100 01110101 01100101')).toBe('Clue')
  })

  it('throws for malformed Base64', () => {
    expect(() => decodeBase64('not base64!')).toThrow('Invalid Base64 input.')
  })

  it('throws for malformed hex', () => {
    expect(() => decodeHex('abc')).toThrow('Hex input must use pairs of 0-9 or a-f characters.')
  })

  it('throws for malformed binary', () => {
    expect(() => decodeBinary('1010102')).toThrow(
      'Binary input must be made of 8-bit groups using only 0 and 1.',
    )
  })
})

describe('text helpers', () => {
  it('removes whitespace and reverses text', () => {
    expect(stripSpaces('N 59 21.123 E 018 04.567')).toBe('N5921.123E01804.567')
    expect(reverseText('stressed')).toBe('desserts')
  })

  it('removes non-alphanumeric characters', () => {
    expect(stripNonAlphanumeric('N 59-21.123 / E 018,04.567!')).toBe('N5921123E01804567')
  })

  it('counts letters only', () => {
    expect(countLettersOnly('A1 B2 C3!')).toBe(3)
  })

  it('counts letters and numbers only', () => {
    expect(countAlphanumericOnly('A1 B2 C3!')).toBe(6)
  })
})

describe('hashSha256', () => {
  it('hashes text with the standard SHA-256 digest', async () => {
    await expect(hashSha256('CipherForge')).resolves.toBe(
      '2fb0d045d5acf48f8a952d6d7eb128fd43a372cd7f3fee9a4b623100bd794a36',
    )
  })

  it('hashes empty input', async () => {
    await expect(hashSha256('')).resolves.toBe(
      'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    )
  })
})
