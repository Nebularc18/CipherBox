import { describe, expect, it } from 'vitest'
import { caesarCipher } from '../caesar'
import {
  decodeBase64,
  decodeBinary,
  decodeHex,
  encodeBase64,
  encodeBinary,
  encodeHex,
} from '../encodings'
import { decryptKeyStream, encryptKeyStream } from '../keyStream'
import { countLettersOnly, reverseText, stripSpaces } from '../text'
import { vigenereCipher } from '../vigenere'

describe('caesarCipher', () => {
  it('encodes while preserving punctuation', () => {
    expect(caesarCipher('Hello, World!', 3, 'encode')).toBe('Khoor, Zruog!')
  })

  it('decodes back to the original message', () => {
    expect(caesarCipher('Uifsf jt b dmvf.', 1, 'decode')).toBe('There is a clue.')
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

  it('rejects malformed hex keys on encrypt', () => {
    expect(() => encryptKeyStream(coordinate, 'abc')).toThrow('Key must use hex byte pairs.')
  })

  it('rejects malformed hex keys on decrypt', () => {
    expect(() => decryptKeyStream(encrypted, 'abc')).toThrow('Key must use hex byte pairs.')
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

  it('round-trips hex text', () => {
    expect(decodeHex(encodeHex('geocache'))).toBe('geocache')
  })

  it('round-trips binary text', () => {
    expect(decodeBinary(encodeBinary('PUZZLE'))).toBe('PUZZLE')
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

  it('counts letters only', () => {
    expect(countLettersOnly('A1 B2 C3!')).toBe(3)
  })
})
