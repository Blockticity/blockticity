/**
 * Browser-compatible decryption utilities for encrypted COA metadata
 * Matches the encryption format from scripts/utils/encryption.js
 */

const ALGORITHM = 'aes-256-gcm'
const IV_LENGTH = 16
const TAG_LENGTH = 16
const KEY_LENGTH = 32
const ITERATIONS = 100000

/**
 * Derive encryption key from password using PBKDF2
 */
async function deriveKey(password, salt) {
  const encoder = new TextEncoder()
  const passwordKey = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveBits']
  )

  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: ITERATIONS,
      hash: 'SHA-512'
    },
    passwordKey,
    KEY_LENGTH * 8
  )

  return new Uint8Array(derivedBits)
}

/**
 * Check if data appears to be encrypted binary
 */
export function isEncryptedData(arrayBuffer) {
  // Encrypted data starts with length prefixes (4 bytes each)
  // Check if first 4 bytes look like a reasonable salt length (64 bytes)
  if (arrayBuffer.byteLength < 100) return false

  const view = new DataView(arrayBuffer)
  const saltLen = view.getUint32(0, false) // big-endian

  // Salt should be 64 bytes
  return saltLen === 64
}

/**
 * Unpack encrypted buffer into components
 */
function unpackEncryptedBuffer(encryptedBuffer) {
  const view = new DataView(encryptedBuffer)
  let offset = 0

  // Read salt
  const saltLen = view.getUint32(offset, false)
  offset += 4
  const salt = new Uint8Array(encryptedBuffer.slice(offset, offset + saltLen))
  offset += saltLen

  // Read IV
  const ivLen = view.getUint32(offset, false)
  offset += 4
  const iv = new Uint8Array(encryptedBuffer.slice(offset, offset + ivLen))
  offset += ivLen

  // Read auth tag
  const tagLen = view.getUint32(offset, false)
  offset += 4
  const tag = new Uint8Array(encryptedBuffer.slice(offset, offset + tagLen))
  offset += tagLen

  // Read encrypted data
  const encrypted = new Uint8Array(encryptedBuffer.slice(offset))

  return { salt, iv, tag, encrypted }
}

/**
 * Decrypt an encrypted file buffer
 */
export async function decryptFile(encryptedBuffer, password) {
  try {
    console.log('🔓 Starting decryption:', {
      bufferSize: encryptedBuffer.byteLength,
      password: password.substring(0, 4) + '***'
    })

    // Unpack the encrypted buffer
    const { salt, iv, tag, encrypted } = unpackEncryptedBuffer(encryptedBuffer)

    console.log('📦 Unpacked encrypted data:', {
      saltLength: salt.length,
      ivLength: iv.length,
      tagLength: tag.length,
      encryptedLength: encrypted.length
    })

    // Derive the key from password
    const key = await deriveKey(password, salt)

    // Import the key for AES-GCM
    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      key,
      { name: 'AES-GCM' },
      false,
      ['decrypt']
    )

    // Combine encrypted data with auth tag for GCM
    const ciphertext = new Uint8Array(encrypted.length + tag.length)
    ciphertext.set(encrypted)
    ciphertext.set(tag, encrypted.length)

    // Decrypt
    const decrypted = await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: iv,
        tagLength: 128
      },
      cryptoKey,
      ciphertext
    )

    console.log('✅ Decryption successful:', {
      decryptedSize: decrypted.byteLength
    })

    return new Uint8Array(decrypted)

  } catch (error) {
    console.error('❌ Decryption failed:', error)

    if (error.name === 'OperationError') {
      throw new Error('Invalid password or corrupted encrypted data')
    }

    throw new Error(`Decryption error: ${error.message}`)
  }
}

/**
 * Decrypt and parse JSON metadata
 */
export async function decryptMetadata(encryptedBuffer, password) {
  const decryptedBytes = await decryptFile(encryptedBuffer, password)
  const decoder = new TextDecoder()
  const jsonString = decoder.decode(decryptedBytes)
  return JSON.parse(jsonString)
}

/**
 * Decrypt image and return blob URL
 */
export async function decryptImage(encryptedBuffer, password) {
  const decryptedBytes = await decryptFile(encryptedBuffer, password)
  const blob = new Blob([decryptedBytes], { type: 'image/jpeg' })
  return URL.createObjectURL(blob)
}
