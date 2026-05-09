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
} from '../geocaching'
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

describe('geocaching ciphers', () => {
  it('applies Atbash while preserving numbers and punctuation', () => {
    expect(atbashCipher('Clue: N59 E018')).toBe('Xofv: M59 V018')
    expect(atbashCipher(atbashCipher('Clue: N59 E018'))).toBe('Clue: N59 E018')
  })

  it('encodes and decodes A1Z26 with slash word separators', () => {
    const encoded = '3 1 3 8 5 / 14 15 18 20 8'

    expect(a1z26Cipher('CACHE NORTH', 'encode')).toBe(encoded)
    expect(a1z26Cipher(encoded, 'decode')).toBe('CACHE NORTH')
  })

  it('keeps A1Z26 punctuation decodable as standalone tokens', () => {
    const encoded = '3 1 3 8 5 .'

    expect(a1z26Cipher('CACHE.', 'encode')).toBe(encoded)
    expect(a1z26Cipher(encoded, 'decode')).toBe('CACHE.')
  })

  it('encodes and decodes Morse code with digits used in coordinates', () => {
    const encoded = '-. ..... ----. / . .---- ---..'

    expect(morseCipher('N59 E18', 'encode')).toBe(encoded)
    expect(morseCipher(encoded, 'decode')).toBe('N59 E18')
  })

  it('passes unknown Morse decode tokens through unchanged', () => {
    expect(morseCipher('... | ---', 'decode')).toBe('S|O')
  })

  it('encodes and decodes Bacon A/B groups', () => {
    const encoded = 'AAAAB AAABA AAABB / BBAAB'

    expect(baconCipher('BCD Z', 'encode')).toBe(encoded)
    expect(baconCipher(encoded, 'decode')).toBe('BCD Z')
  })

  it('marks Bacon non-letter literals so they are not mistaken for groups', () => {
    const encoded = 'AAAAB [5] [.]'

    expect(baconCipher('B5.', 'encode')).toBe(encoded)
    expect(baconCipher(encoded, 'decode')).toBe('B5.')
  })

  it('encodes and decodes Polybius square values with I/J sharing a cell', () => {
    const encoded = '13 11 13 23 15 / 24 42'

    expect(polybiusCipher('CACHE JR', 'encode')).toBe(encoded)
    expect(polybiusCipher(encoded, 'decode')).toBe('CACHE IR')
  })

  it('encodes and decodes Gronsfeld with a numeric key', () => {
    const encoded = 'Fbgij Qpvum'

    expect(gronsfeldCipher('Cache North', '31415', 'encode')).toBe(encoded)
    expect(gronsfeldCipher(encoded, '31415', 'decode')).toBe('Cache North')
  })

  it('returns empty Gronsfeld output when the key has no digits', () => {
    expect(gronsfeldCipher('Cache North', 'north', 'encode')).toBe('')
  })

  it('encodes and decodes NATO phonetic words', () => {
    const encoded = 'Charlie Alfa Charlie Hotel Echo / November Oscar Romeo Tango Hotel'

    expect(natoCipher('CACHE NORTH', 'encode')).toBe(encoded)
    expect(natoCipher(encoded, 'decode')).toBe('CACHE NORTH')
  })

  it('encodes and decodes NATO digit words used in coordinates', () => {
    const encoded = 'November Pantafive Niner'

    expect(natoCipher('N59', 'encode')).toBe(encoded)
    expect(natoCipher(encoded, 'decode')).toBe('N59')
  })

  it('calculates letter values for coordinate formulas', () => {
    expect(letterValue('GEOCACHING')).toBe('7 + 5 + 15 + 3 + 1 + 3 + 8 + 9 + 14 + 7 = 72')
  })

  it('keeps letter value output format consistent when there are no letters', () => {
    expect(letterValue('123 !?')).toBe('0 = 0')
  })

  it('converts decimal coordinates to DDM coordinate format', () => {
    expect(decimalCoordinatesToDdm('56.17240822, 15.58957037')).toBe(
      'N 56° 10.344 E 015° 35.374',
    )
  })

  it('uses S and W hemispheres for negative decimal coordinates', () => {
    expect(decimalCoordinatesToDdm('-56.17240822 -15.58957037')).toBe(
      'S 56° 10.344 W 015° 35.374',
    )
  })

  it('carries rounded DDM minutes into degrees', () => {
    expect(decimalCoordinatesToDdm('12.999999, 179.999999')).toBe(
      'N 13° 00.000 E 180° 00.000',
    )
    expect(decimalCoordinatesToDdm('89.999999, 0')).toBe(
      'N 90° 00.000 E 000° 00.000',
    )
    expect(decimalCoordinatesToDdm('90, 180')).toBe(
      'N 90° 00.000 E 180° 00.000',
    )
  })

  it('rejects invalid decimal coordinate input', () => {
    expect(() => decimalCoordinatesToDdm('95, 15')).toThrow('Latitude must be between -90 and 90.')
    expect(() => decimalCoordinatesToDdm('56, 181')).toThrow('Longitude must be between -180 and 180.')
    expect(() => decimalCoordinatesToDdm('56 only')).toThrow('Coordinates must be valid decimal numbers.')
    expect(() => decimalCoordinatesToDdm('56north, 15')).toThrow(
      'Coordinates must be valid decimal numbers.',
    )
  })

  it('encodes and decodes ASCII decimal values', () => {
    const encoded = '67 65 67 72 69'

    expect(asciiDecimalCipher('CACHE', 'encode')).toBe(encoded)
    expect(asciiDecimalCipher(encoded, 'decode')).toBe('CACHE')
  })

  it('encodes and decodes extended ASCII byte values up to 255', () => {
    const extendedCharacter = String.fromCharCode(255)

    expect(asciiDecimalCipher(extendedCharacter, 'encode')).toBe('255')
    expect(asciiDecimalCipher('255', 'decode')).toBe(extendedCharacter)
  })

  it('encodes ASCII decimal input as reversible modulo pairs', () => {
    expect(numberModuloCipher('67 65 67 72 69', 7, 'encode')).toBe('9:4 9:2 9:4 10:2 9:6')
    expect(numberModuloCipher('9:4 9:2 9:4 10:2 9:6', 7, 'decode')).toBe('67 65 67 72 69')
  })

  it('encodes and decodes modulo values without an ASCII byte limit', () => {
    const encoded = '28:7 50:1 0:1 61:13'

    expect(numberModuloCipher('511 901 1 1111', 18, 'encode')).toBe(encoded)
    expect(numberModuloCipher(encoded, 18, 'decode')).toBe('511 901 1 1111')
  })

  it('round-trips negative modulo numbers', () => {
    expect(numberModuloCipher('-5', 18, 'encode')).toBe('-1:13')
    expect(numberModuloCipher('-1:13', 18, 'decode')).toBe('-5')
  })

  it('rejects non-reversible modulo decode input', () => {
    expect(() => numberModuloCipher('2 0 2', 5, 'decode')).toThrow(
      'Decode input must use quotient:remainder groups.',
    )
  })

  it('replaces characters above byte range during ASCII decimal encode', () => {
    const encoded = '67 233 63'

    expect(asciiDecimalCipher('Cé€', 'encode')).toBe(encoded)
    expect(asciiDecimalCipher(encoded, 'decode')).toBe('Cé?')
  })

  it('encodes and decodes ternary letter codes', () => {
    const encoded = '010 001 010 022 012 / 112 120 200 202 022'

    expect(ternaryCipher('CACHE NORTH', 'encode')).toBe(encoded)
    expect(ternaryCipher(encoded, 'decode')).toBe('CACHE NORTH')
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
