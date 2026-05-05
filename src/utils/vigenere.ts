function sanitizeKey(key: string) {
  return key.replace(/[^a-z]/gi, '').toUpperCase()
}

function shiftLetter(character: string, offset: number) {
  const isUppercase = character >= 'A' && character <= 'Z'
  const isLowercase = character >= 'a' && character <= 'z'

  if (!isUppercase && !isLowercase) {
    return character
  }

  const base = isUppercase ? 65 : 97
  const code = character.charCodeAt(0) - base
  const normalized = (code + offset + 26) % 26
  return String.fromCharCode(normalized + base)
}

export function vigenereCipher(input: string, key: string, mode: 'encode' | 'decode') {
  const normalizedKey = sanitizeKey(key)

  if (!normalizedKey) {
    return ''
  }

  let keyIndex = 0

  return input
    .split('')
    .map((character) => {
      if (!/[a-z]/i.test(character)) {
        return character
      }

      const offset = normalizedKey.charCodeAt(keyIndex % normalizedKey.length) - 65
      keyIndex += 1
      return shiftLetter(character, mode === 'encode' ? offset : -offset)
    })
    .join('')
}
