const encoder = new TextEncoder()
const decoder = new TextDecoder()

function bytesToBase64(bytes: Uint8Array) {
  let binary = ''
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte)
  })
  return btoa(binary)
}

function base64ToBytes(input: string) {
  const normalized = input.replace(/\s+/g, '')
  const binary = atob(normalized)
  return Uint8Array.from(binary, (character) => character.charCodeAt(0))
}

export function encodeBase64(input: string) {
  return bytesToBase64(encoder.encode(input))
}

export function decodeBase64(input: string) {
  try {
    return decoder.decode(base64ToBytes(input))
  } catch {
    throw new Error('Invalid Base64 input.')
  }
}

export function encodeHex(input: string) {
  return Array.from(encoder.encode(input), (byte) => byte.toString(16).padStart(2, '0')).join('')
}

export function decodeHex(input: string) {
  const normalized = input.replace(/\s+/g, '')

  if (normalized.length % 2 !== 0 || /[^0-9a-f]/i.test(normalized)) {
    throw new Error('Hex input must use pairs of 0-9 or a-f characters.')
  }

  const bytes = new Uint8Array(
    normalized.match(/.{1,2}/g)?.map((chunk) => Number.parseInt(chunk, 16)) ?? [],
  )

  return decoder.decode(bytes)
}

export function encodeBinary(input: string) {
  return Array.from(encoder.encode(input), (byte) => byte.toString(2).padStart(8, '0')).join(' ')
}

export function decodeBinary(input: string) {
  const normalized = input.replace(/\s+/g, '')

  if (normalized.length % 8 !== 0 || /[^01]/.test(normalized)) {
    throw new Error('Binary input must be made of 8-bit groups using only 0 and 1.')
  }

  const bytes = new Uint8Array(
    normalized.match(/.{1,8}/g)?.map((chunk) => Number.parseInt(chunk, 2)) ?? [],
  )

  return decoder.decode(bytes)
}
