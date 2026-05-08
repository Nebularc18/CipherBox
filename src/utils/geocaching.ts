type CipherMode = 'encode' | 'decode'

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
const POLYBIUS_ALPHABET = 'ABCDEFGHIKLMNOPQRSTUVWXYZ'

const NATO_BY_CHARACTER: Record<string, string> = {
  A: 'Alfa',
  B: 'Bravo',
  C: 'Charlie',
  D: 'Delta',
  E: 'Echo',
  F: 'Foxtrot',
  G: 'Golf',
  H: 'Hotel',
  I: 'India',
  J: 'Juliett',
  K: 'Kilo',
  L: 'Lima',
  M: 'Mike',
  N: 'November',
  O: 'Oscar',
  P: 'Papa',
  Q: 'Quebec',
  R: 'Romeo',
  S: 'Sierra',
  T: 'Tango',
  U: 'Uniform',
  V: 'Victor',
  W: 'Whiskey',
  X: 'X-ray',
  Y: 'Yankee',
  Z: 'Zulu',
  0: 'Nadazero',
  1: 'Unaone',
  2: 'Bissotwo',
  3: 'Terrathree',
  4: 'Kartefour',
  5: 'Pantafive',
  6: 'Soxisix',
  7: 'Setteseven',
  8: 'Oktoeight',
  9: 'Niner',
}

const MORSE_BY_CHARACTER: Record<string, string> = {
  A: '.-',
  B: '-...',
  C: '-.-.',
  D: '-..',
  E: '.',
  F: '..-.',
  G: '--.',
  H: '....',
  I: '..',
  J: '.---',
  K: '-.-',
  L: '.-..',
  M: '--',
  N: '-.',
  O: '---',
  P: '.--.',
  Q: '--.-',
  R: '.-.',
  S: '...',
  T: '-',
  U: '..-',
  V: '...-',
  W: '.--',
  X: '-..-',
  Y: '-.--',
  Z: '--..',
  0: '-----',
  1: '.----',
  2: '..---',
  3: '...--',
  4: '....-',
  5: '.....',
  6: '-....',
  7: '--...',
  8: '---..',
  9: '----.',
  '.': '.-.-.-',
  ',': '--..--',
  '?': '..--..',
  "'": '.----.',
  '!': '-.-.--',
  '/': '-..-.',
  '(': '-.--.',
  ')': '-.--.-',
  '&': '.-...',
  ':': '---...',
  ';': '-.-.-.',
  '=': '-...-',
  '+': '.-.-.',
  '-': '-....-',
  '_': '..--.-',
  '"': '.-..-.',
  '$': '...-..-',
  '@': '.--.-.',
}

const CHARACTER_BY_MORSE = Object.fromEntries(
  Object.entries(MORSE_BY_CHARACTER).map(([character, morse]) => [morse, character]),
)

const CHARACTER_BY_NATO = Object.fromEntries(
  Object.entries(NATO_BY_CHARACTER).map(([character, word]) => [word.toUpperCase(), character]),
)

function shiftAtbashCharacter(character: string) {
  const codePoint = character.charCodeAt(0)

  if (codePoint >= 65 && codePoint <= 90) {
    return String.fromCharCode(90 - (codePoint - 65))
  }

  if (codePoint >= 97 && codePoint <= 122) {
    return String.fromCharCode(122 - (codePoint - 97))
  }

  return character
}

export function atbashCipher(input: string) {
  return input
    .split('')
    .map((character) => shiftAtbashCharacter(character))
    .join('')
}

export function a1z26Cipher(input: string, mode: CipherMode) {
  if (mode === 'encode') {
    return input
      .toUpperCase()
      .split('')
      .map((character) => {
        if (character === ' ') {
          return '/'
        }

        const index = ALPHABET.indexOf(character)
        return index === -1 ? character : String(index + 1)
      })
      .join(' ')
  }

  return input
    .trim()
    .split(/\s+/)
    .map((token) => {
      if (token === '/') {
        return ' '
      }

      const number = Number.parseInt(token, 10)
      if (/^\d+$/.test(token) && number >= 1 && number <= 26) {
        return ALPHABET[number - 1]
      }

      return token
    })
    .join('')
}

export function morseCipher(input: string, mode: CipherMode) {
  if (mode === 'encode') {
    return input
      .toUpperCase()
      .split('')
      .map((character) => {
        if (character === ' ') {
          return '/'
        }

        return MORSE_BY_CHARACTER[character] ?? character
      })
      .join(' ')
  }

  return input
    .trim()
    .split(/\s+/)
    .map((token) => {
      if (token === '/') {
        return ' '
      }

      return CHARACTER_BY_MORSE[token] ?? token
    })
    .join('')
}

export function baconCipher(input: string, mode: CipherMode) {
  if (mode === 'encode') {
    return input
      .toUpperCase()
      .split('')
      .map((character) => {
        if (character === ' ') {
          return '/'
        }

        const index = ALPHABET.indexOf(character)
        if (index === -1) {
          return `[${character}]`
        }

        return index
          .toString(2)
          .padStart(5, '0')
          .replace(/0/g, 'A')
          .replace(/1/g, 'B')
      })
      .join(' ')
  }

  return input
    .trim()
    .split(/\s+/)
    .map((token) => {
      if (token === '/') {
        return ' '
      }

      if (!/^[ABab]{5}$/.test(token)) {
        const literal = token.match(/^\[(.)\]$/)
        if (literal) {
          return literal[1]
        }

        return token
      }

      const index = Number.parseInt(token.toUpperCase().replace(/A/g, '0').replace(/B/g, '1'), 2)
      return ALPHABET[index] ?? '?'
    })
    .join('')
}

export function polybiusCipher(input: string, mode: CipherMode) {
  if (mode === 'encode') {
    return input
      .toUpperCase()
      .replace(/J/g, 'I')
      .split('')
      .map((character) => {
        if (character === ' ') {
          return '/'
        }

        const index = POLYBIUS_ALPHABET.indexOf(character)
        if (index === -1) {
          return character
        }

        const row = Math.floor(index / 5) + 1
        const column = (index % 5) + 1
        return `${row}${column}`
      })
      .join(' ')
  }

  return input
    .trim()
    .split(/\s+/)
    .map((token) => {
      if (token === '/') {
        return ' '
      }

      if (!/^[1-5]{2}$/.test(token)) {
        return token
      }

      const row = Number.parseInt(token[0], 10) - 1
      const column = Number.parseInt(token[1], 10) - 1
      return POLYBIUS_ALPHABET[row * 5 + column]
    })
    .join('')
}

export function gronsfeldCipher(input: string, key: string, mode: CipherMode) {
  const shifts = key
    .replace(/\D/g, '')
    .split('')
    .map((digit) => Number.parseInt(digit, 10))

  if (shifts.length === 0) {
    return ''
  }

  let keyIndex = 0

  return input
    .split('')
    .map((character) => {
      const codePoint = character.charCodeAt(0)
      const isUppercase = codePoint >= 65 && codePoint <= 90
      const isLowercase = codePoint >= 97 && codePoint <= 122

      if (!isUppercase && !isLowercase) {
        return character
      }

      const base = isUppercase ? 65 : 97
      const shift = shifts[keyIndex % shifts.length] * (mode === 'encode' ? 1 : -1)
      keyIndex += 1

      return String.fromCharCode(((codePoint - base + shift + 26) % 26) + base)
    })
    .join('')
}

export function natoCipher(input: string, mode: CipherMode) {
  if (mode === 'encode') {
    return input
      .toUpperCase()
      .split('')
      .map((character) => {
        if (character === ' ') {
          return '/'
        }

        return NATO_BY_CHARACTER[character] ?? character
      })
      .join(' ')
  }

  return input
    .trim()
    .split(/\s+/)
    .map((token) => {
      if (token === '/') {
        return ' '
      }

      return CHARACTER_BY_NATO[token.toUpperCase()] ?? token
    })
    .join('')
}

export function letterValue(input: string) {
  const values = input
    .toUpperCase()
    .split('')
    .map((character) => ALPHABET.indexOf(character) + 1)
    .filter((value) => value > 0)

  const total = values.reduce((sum, value) => sum + value, 0)

  if (values.length === 0) {
    return '0 = 0'
  }

  return `${values.join(' + ')} = ${total}`
}

export function asciiDecimalCipher(input: string, mode: CipherMode) {
  if (mode === 'encode') {
    return input
      .split('')
      .map((character) => {
        const codePoint = character.charCodeAt(0)
        return (codePoint <= 255 ? codePoint : 63).toString()
      })
      .join(' ')
  }

  return input
    .trim()
    .split(/\s+/)
    .map((token) => {
      const codePoint = Number.parseInt(token, 10)

      if (!/^\d+$/.test(token) || codePoint > 255) {
        return token
      }

      return String.fromCharCode(codePoint)
    })
    .join('')
}

function parseModuloValues(input: string) {
  const trimmed = input.trim()

  if (!trimmed) {
    return []
  }

  if (!/^[\d\s,;/|-]+$/.test(trimmed)) {
    throw new Error('Input must contain whole decimal numbers.')
  }

  return trimmed.split(/[\s,;/|]+/).flatMap((token) => {
    if (!token) {
      return []
    }

    if (!/^-?\d+$/.test(token)) {
      throw new Error('Number input must contain whole decimal values.')
    }

    return [Number.parseInt(token, 10)]
  })
}

export function numberModuloCipher(input: string, modulus: number, mode: CipherMode) {
  if (!Number.isInteger(modulus) || modulus < 2) {
    throw new Error('Modulo must be a whole number of 2 or higher.')
  }

  if (mode === 'encode') {
    return parseModuloValues(input)
      .map((value) => {
        const remainder = ((value % modulus) + modulus) % modulus
        const quotient = (value - remainder) / modulus

        return `${quotient}:${remainder}`
      })
      .join(' ')
  }

  return input
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((token) => {
      const match = token.match(/^(-?\d+):(\d+)$/)

      if (!match) {
        throw new Error('Decode input must use quotient:remainder groups.')
      }

      const quotient = Number.parseInt(match[1], 10)
      const remainder = Number.parseInt(match[2], 10)

      if (remainder >= modulus) {
        throw new Error('Remainders must be lower than the modulo value.')
      }

      const value = quotient * modulus + remainder

      return value.toString()
    })
    .join(' ')
}

export function ternaryCipher(input: string, mode: CipherMode) {
  if (mode === 'encode') {
    return input
      .toUpperCase()
      .split('')
      .map((character) => {
        if (character === ' ') {
          return '/'
        }

        const index = ALPHABET.indexOf(character)
        return index === -1 ? character : (index + 1).toString(3).padStart(3, '0')
      })
      .join(' ')
  }

  return input
    .trim()
    .split(/\s+/)
    .map((token) => {
      if (token === '/') {
        return ' '
      }

      const value = Number.parseInt(token, 3)

      if (!/^[0-2]{3}$/.test(token) || value < 1 || value > 26) {
        return token
      }

      return ALPHABET[value - 1]
    })
    .join('')
}
