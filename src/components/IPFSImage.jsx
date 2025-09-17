import React, { useState, useEffect, useRef } from 'react'

// IPFS Gateways for fallback (ordered by reliability)
const IPFS_GATEWAYS = [
  'https://ipfs.io/ipfs/',
  'https://gateway.pinata.cloud/ipfs/',
  'https://nftstorage.link/ipfs/',
  'https://w3s.link/ipfs/'
]

// Extract IPFS hash from various URL formats
const extractIPFSHash = (url) => {
  const patterns = [
    /ipfs:\/\/(.+)/,
    /\/ipfs\/(.+)/,
    /ipfs\.io\/ipfs\/(.+)/,
    /gateway\.pinata\.cloud\/ipfs\/(.+)/,
    /nftstorage\.link\/ipfs\/(.+)/,
    /w3s\.link\/ipfs\/(.+)/
  ]
  
  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) {
      return match[1]
    }
  }
  
  return url
}

// Promise-based image loader with timeout
const loadImageWithTimeout = (src, timeout = 8000) => {
  console.log(`⏱️ Starting image load with ${timeout}ms timeout: ${src}`)
  
  return new Promise((resolve, reject) => {
    const img = new Image()
    let timeoutId = null
    let loaded = false
    
    // Set timeout
    timeoutId = setTimeout(() => {
      if (!loaded) {
        console.log(`⏰ Image timeout after ${timeout}ms: ${src}`)
        img.src = '' // Cancel loading
        reject(new Error(`Timeout after ${timeout}ms`))
      }
    }, timeout)
    
    // Handle successful load
    img.onload = () => {
      loaded = true
      if (timeoutId) clearTimeout(timeoutId)
      console.log(`✅ Image loaded successfully: ${src}`)
      resolve(src)
    }
    
    // Handle error
    img.onerror = () => {
      loaded = true
      if (timeoutId) clearTimeout(timeoutId)
      console.log(`❌ Image failed to load: ${src}`)
      reject(new Error('Failed to load'))
    }
    
    // Start loading
    img.src = src
  })
}

const IPFSImage = ({ src, alt, className, onLoad, onError, ...props }) => {
  const [currentSrc, setCurrentSrc] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [gatewayIndex, setGatewayIndex] = useState(0)
  const [attemptLog, setAttemptLog] = useState([])
  const mountedRef = useRef(true)

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false
    }
  }, [])

  // Load image through gateways
  const loadImageThroughGateways = async (ipfsHash) => {
    console.log(`🔍 Starting gateway fallback for IPFS hash: ${ipfsHash}`)
    const attempts = []
    
    for (let i = 0; i < IPFS_GATEWAYS.length; i++) {
      if (!mountedRef.current) return // Component unmounted
      
      const gateway = IPFS_GATEWAYS[i]
      const imageUrl = gateway + ipfsHash
      const attemptNumber = i + 1
      
      console.log(`🌐 Attempting Gateway ${attemptNumber}/${IPFS_GATEWAYS.length}: ${gateway}`)
      setGatewayIndex(i)
      setCurrentSrc(imageUrl)
      
      // Update attempt log
      const attempt = {
        gateway: gateway.split('//')[1].split('/')[0],
        status: 'trying',
        number: attemptNumber
      }
      attempts.push(attempt)
      setAttemptLog([...attempts])
      
      try {
        // Try loading with timeout
        await loadImageWithTimeout(imageUrl, 8000)
        
        // Success!
        console.log(`🎉 Successfully loaded from Gateway ${attemptNumber}: ${gateway}`)
        attempt.status = 'success'
        setAttemptLog([...attempts])
        
        if (mountedRef.current) {
          setLoading(false)
          setError(false)
          if (onLoad) onLoad({ target: { src: imageUrl } })
        }
        return // Exit on success
        
      } catch (err) {
        // Failed, log and try next
        console.log(`⚠️ Gateway ${attemptNumber} failed: ${err.message}`)
        attempt.status = 'failed'
        attempt.error = err.message
        setAttemptLog([...attempts])
        
        // Continue to next gateway
        if (i === IPFS_GATEWAYS.length - 1) {
          // All gateways failed
          console.log('❌ All IPFS gateways failed')
          if (mountedRef.current) {
            setLoading(false)
            setError(true)
            if (onError) onError(new Error('All gateways failed'))
          }
        }
      }
    }
  }

  // Initialize loading when src changes
  useEffect(() => {
    if (!src) return

    // Reset state
    setLoading(true)
    setError(false)
    setGatewayIndex(0)
    setAttemptLog([])

    // If not IPFS, use directly
    if (!src.includes('ipfs')) {
      setCurrentSrc(src)
      setLoading(false)
      return
    }

    // Extract hash and start loading
    const ipfsHash = extractIPFSHash(src)
    loadImageThroughGateways(ipfsHash)
  }, [src])

  // Manual retry
  const handleManualRetry = () => {
    console.log('🔄 Manual retry triggered')
    if (src && src.includes('ipfs')) {
      setLoading(true)
      setError(false)
      setGatewayIndex(0)
      setAttemptLog([])
      const ipfsHash = extractIPFSHash(src)
      loadImageThroughGateways(ipfsHash)
    }
  }

  // Manual next gateway
  const handleNextGateway = () => {
    if (gatewayIndex < IPFS_GATEWAYS.length - 1) {
      const nextIndex = gatewayIndex + 1
      const ipfsHash = extractIPFSHash(src)
      const nextUrl = IPFS_GATEWAYS[nextIndex] + ipfsHash
      
      console.log(`⏭️ Manually skipping to Gateway ${nextIndex + 1}`)
      setGatewayIndex(nextIndex)
      setCurrentSrc(nextUrl)
      
      // Continue from next gateway
      const continueFromGateway = async () => {
        for (let i = nextIndex; i < IPFS_GATEWAYS.length; i++) {
          if (!mountedRef.current) return
          
          const gateway = IPFS_GATEWAYS[i]
          const imageUrl = gateway + ipfsHash
          
          console.log(`🌐 Trying Gateway ${i + 1}/${IPFS_GATEWAYS.length}: ${gateway}`)
          setGatewayIndex(i)
          setCurrentSrc(imageUrl)
          
          try {
            await loadImageWithTimeout(imageUrl, 8000)
            setLoading(false)
            setError(false)
            return
          } catch (err) {
            console.log(`Gateway ${i + 1} failed: ${err.message}`)
            if (i === IPFS_GATEWAYS.length - 1) {
              setLoading(false)
              setError(true)
            }
          }
        }
      }
      
      continueFromGateway()
    }
  }

  // Error state
  if (error) {
    return (
      <div className={`ipfs-image-error ${className || ''}`} {...props}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
          background: 'rgba(239, 68, 68, 0.1)',
          border: '2px dashed rgba(239, 68, 68, 0.3)',
          borderRadius: '0.5rem',
          color: '#ef4444'
        }}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
            <path d="m15 9-6 6" stroke="currentColor" strokeWidth="2"/>
            <path d="m9 9 6 6" stroke="currentColor" strokeWidth="2"/>
          </svg>
          <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.875rem' }}>
            Image failed to load
          </p>
          <p style={{ margin: '0.25rem 0 0.5rem 0', fontSize: '0.75rem', opacity: 0.7 }}>
            All {IPFS_GATEWAYS.length} gateways attempted
          </p>
          
          {/* Show attempt log */}
          <div style={{
            fontSize: '0.7rem',
            opacity: 0.6,
            marginBottom: '0.5rem',
            textAlign: 'center'
          }}>
            {attemptLog.map((attempt, i) => (
              <div key={i}>
                Gateway {attempt.number}: {attempt.gateway} - {attempt.status}
              </div>
            ))}
          </div>
          
          <button
            onClick={handleManualRetry}
            style={{
              padding: '0.5rem 1rem',
              background: '#5BD1D7',
              color: '#0a0f1b',
              border: 'none',
              borderRadius: '0.25rem',
              fontSize: '0.875rem',
              fontWeight: '500',
              cursor: 'pointer'
            }}
            onMouseOver={(e) => e.target.style.background = '#089Ca2'}
            onMouseOut={(e) => e.target.style.background = '#5BD1D7'}
          >
            Retry All Gateways
          </button>
        </div>
      </div>
    )
  }

  // Loading state
  if (loading) {
    return (
      <div className={`ipfs-image-loading ${className || ''}`} {...props}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
          background: 'rgba(91, 209, 215, 0.1)',
          border: '2px dashed rgba(91, 209, 215, 0.3)',
          borderRadius: '0.5rem',
          color: '#5BD1D7'
        }}>
          <div style={{
            width: '32px',
            height: '32px',
            border: '3px solid rgba(91, 209, 215, 0.3)',
            borderTop: '3px solid #5BD1D7',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}></div>
          <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.875rem' }}>
            Loading certificate image...
          </p>
          <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.75rem', opacity: 0.7 }}>
            Gateway {gatewayIndex + 1}/{IPFS_GATEWAYS.length}
          </p>
          
          {/* Show current gateway */}
          <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.7rem', opacity: 0.5 }}>
            {IPFS_GATEWAYS[gatewayIndex].split('//')[1].split('/')[0]}
          </p>
          
          {/* Manual skip button */}
          {gatewayIndex < IPFS_GATEWAYS.length - 1 && (
            <button
              onClick={handleNextGateway}
              style={{
                marginTop: '0.5rem',
                padding: '0.25rem 0.75rem',
                background: 'transparent',
                color: '#5BD1D7',
                border: '1px solid #5BD1D7',
                borderRadius: '0.25rem',
                fontSize: '0.75rem',
                cursor: 'pointer'
              }}
              onMouseOver={(e) => {
                e.target.style.background = '#5BD1D7'
                e.target.style.color = '#0a0f1b'
              }}
              onMouseOut={(e) => {
                e.target.style.background = 'transparent'
                e.target.style.color = '#5BD1D7'
              }}
            >
              Try Next Gateway
            </button>
          )}
        </div>
      </div>
    )
  }

  // Success - show image
  return (
    <img
      src={currentSrc}
      alt={alt}
      className={className}
      {...props}
      style={{
        ...props.style,
        maxWidth: '100%',
        height: 'auto'
      }}
    />
  )
}

export default IPFSImage