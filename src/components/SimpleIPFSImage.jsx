import React, { useState, useEffect } from 'react'
import { isEncryptedData, decryptImage } from '../utils/decryption'

const WACKER_PASSWORD = '***REMOVED***'; // Default password for Wacker COAs

const SimpleIPFSImage = ({ src, alt, className, ...props }) => {
  const [finalSrc, setFinalSrc] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (!src) {
      setLoading(false)
      setError(true)
      return
    }

    console.log('🖼️ SimpleIPFSImage received src:', src)

    // Extract IPFS hash and convert to HTTP URL
    let httpUrl = src

    if (src.includes('ipfs')) {
      // Extract hash from various IPFS formats
      const ipfsMatch = src.match(/(?:ipfs:\/\/|\/ipfs\/)([^/?]+)/)
      if (ipfsMatch) {
        const hash = ipfsMatch[1]
        httpUrl = `https://ipfs.io/ipfs/${hash}`
        console.log('🔗 Converted IPFS URL:', httpUrl)
      }
    }

    // Try to fetch and check if encrypted
    fetchAndDecryptIfNeeded(httpUrl)
  }, [src])

  const fetchAndDecryptIfNeeded = async (url) => {
    setLoading(true)
    setError(false)

    try {
      console.log('📥 Fetching image data from:', url)
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const arrayBuffer = await response.arrayBuffer()
      console.log('📦 Received image data:', arrayBuffer.byteLength, 'bytes')

      // Check if data is encrypted
      if (isEncryptedData(arrayBuffer)) {
        console.log('🔐 Image is encrypted, decrypting...')
        try {
          const decryptedBlobUrl = await decryptImage(arrayBuffer, WACKER_PASSWORD)
          console.log('✅ Image decrypted successfully')
          setFinalSrc(decryptedBlobUrl)
          setLoading(false)
        } catch (decryptErr) {
          console.error('❌ Image decryption failed:', decryptErr)
          setError(true)
          setLoading(false)
        }
      } else {
        // Not encrypted, use original URL
        console.log('📄 Image is not encrypted, using original URL')
        setFinalSrc(url)
        setLoading(true) // Let the img onLoad handler manage loading state
      }
    } catch (fetchErr) {
      console.error('❌ Failed to fetch image:', fetchErr)
      // Fallback to trying to load the image directly
      setFinalSrc(url)
      setLoading(true)
    }
  }

  const handleLoad = () => {
    console.log('✅ Image loaded successfully:', finalSrc)
    setLoading(false)
    setError(false)
  }

  const handleError = () => {
    console.log('❌ Image failed to load:', finalSrc)
    setLoading(false)
    setError(true)
  }

  if (!finalSrc) {
    return (
      <div style={{
        padding: '2rem',
        textAlign: 'center',
        color: '#ef4444'
      }}>
        No image source provided
      </div>
    )
  }

  return (
    <div style={{ position: 'relative' }}>
      {/* Always render the actual image element */}
      <img
        src={finalSrc}
        alt={alt}
        className={className}
        {...props}
        style={{
          ...props.style,
          maxWidth: '100%',
          height: 'auto',
          display: error ? 'none' : 'block'
        }}
        onLoad={handleLoad}
        onError={handleError}
      />
      
      {/* Loading overlay */}
      {loading && !error && (
        <div style={{
          position: error ? 'static' : 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(91, 209, 215, 0.1)',
          border: '2px dashed rgba(91, 209, 215, 0.3)',
          borderRadius: '0.5rem',
          color: '#5BD1D7',
          minHeight: '200px'
        }}>
          <div style={{
            width: '32px',
            height: '32px',
            border: '3px solid rgba(91, 209, 215, 0.3)',
            borderTop: '3px solid #5BD1D7',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}></div>
          <p style={{ margin: '1rem 0 0 0', fontSize: '0.875rem' }}>
            Loading certificate image...
          </p>
          <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.7rem', opacity: 0.7 }}>
            {finalSrc}
          </p>
        </div>
      )}
      
      {/* Error state */}
      {error && (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
          background: 'rgba(239, 68, 68, 0.1)',
          border: '2px dashed rgba(239, 68, 68, 0.3)',
          borderRadius: '0.5rem',
          color: '#ef4444',
          minHeight: '200px'
        }}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
            <path d="m15 9-6 6" stroke="currentColor" strokeWidth="2"/>
            <path d="m9 9 6 6" stroke="currentColor" strokeWidth="2"/>
          </svg>
          <p style={{ margin: '1rem 0 0 0', fontSize: '0.875rem' }}>
            Certificate image unavailable
          </p>
          <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.7rem', opacity: 0.7 }}>
            {finalSrc}
          </p>
          <button
            onClick={() => {
              setLoading(true)
              setError(false)
              // Force reload by updating src
              const img = document.querySelector(`img[src="${finalSrc}"]`)
              if (img) {
                img.src = finalSrc + '?retry=' + Date.now()
              }
            }}
            style={{
              marginTop: '1rem',
              padding: '0.5rem 1rem',
              background: '#5BD1D7',
              color: '#0a0f1b',
              border: 'none',
              borderRadius: '0.25rem',
              cursor: 'pointer'
            }}
          >
            Retry
          </button>
        </div>
      )}
    </div>
  )
}

export default SimpleIPFSImage