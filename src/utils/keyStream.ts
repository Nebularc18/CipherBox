const encoder = new TextEncoder()
const decoder = new TextDecoder()

function normalizeHex(input: string) {
  return input.replace(/\s+/g, '').toLowerCase()
}

function hexToBytes(input: string, label: string) {
  const normalized = normalizeHex(input)

  if (!normalized) {
    throw new Error(`${label} must not be empty.`)
  }

  if (normalized.length % 2 !== 0 || /[^0-9a-f]/.test(normalized)) {
    throw new Error(`${label} must use hex byte pairs.`)
  }

  return new Uint8Array(
    normalized.match(/.{1,2}/g)?.map((chunk) => Number.parseInt(chunk, 16)) ?? [],
  )
}

function bytesToHex(bytes: Uint8Array) {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('')
}

function xorWithRepeatingKey(bytes: Uint8Array, key: Uint8Array) {
  return bytes.map((byte, index) => byte ^ key[index % key.length])
}

export function encryptKeyStream(input: string, key: string) {
  const keyBytes = hexToBytes(key, 'Key')

  if (!input) {
    return ''
  }

  return bytesToHex(xorWithRepeatingKey(encoder.encode(input), keyBytes))
}

export function decryptKeyStream(input: string, key: string) {
  const keyBytes = hexToBytes(key, 'Key')

  if (!input) {
    return ''
  }

  const cipherBytes = hexToBytes(input, 'Ciphertext')
  return decoder.decode(xorWithRepeatingKey(cipherBytes, keyBytes))
}
