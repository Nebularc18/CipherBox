export function stripSpaces(input: string) {
  return input.replace(/\s+/g, '')
}

export function reverseText(input: string) {
  return input.split('').reverse().join('')
}

export function countLettersOnly(input: string) {
  const matches = input.match(/[a-z]/gi)
  return matches ? matches.length : 0
}
