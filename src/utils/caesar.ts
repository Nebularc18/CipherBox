const ALPHABET_SIZE = 26

function shiftCharacter(character: string, shift: number) {
  const codePoint = character.charCodeAt(0)

  if (codePoint >= 65 && codePoint <= 90) {
    return String.fromCharCode(((codePoint - 65 + shift + ALPHABET_SIZE) % ALPHABET_SIZE) + 65)
  }

  if (codePoint >= 97 && codePoint <= 122) {
    return String.fromCharCode(((codePoint - 97 + shift + ALPHABET_SIZE) % ALPHABET_SIZE) + 97)
  }

  return character
}

export function caesarCipher(input: string, shift: number, mode: 'encode' | 'decode') {
  const normalizedShift = ((shift % ALPHABET_SIZE) + ALPHABET_SIZE) % ALPHABET_SIZE
  const direction = mode === 'encode' ? normalizedShift : -normalizedShift

  return input
    .split('')
    .map((character) => shiftCharacter(character, direction))
    .join('')
}

export function rot13(input: string) {
  return caesarCipher(input, 13, 'encode')
}
