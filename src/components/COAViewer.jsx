import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { getNetworkConfig, detectNetworkFromUrl } from '../config/networks'
import { getTokenURI, fetchMetadataFromURI, searchTokensByOrderId, searchEarlCampbellCOA } from '../utils/blockchain'
import EnhancedMobileInput from './EnhancedMobileInput'
import SimpleIPFSImage from './SimpleIPFSImage'
import blocktivityLogo from '../assets/blockticity-logo.png'

const LockIcon = () => (
  <svg className="lock-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M19 11H5C3.89543 11 3 11.8954 3 13V20C3 21.1046 3.89543 22 5 22H19C20.1046 22 21 21.1046 21 20V13C21 11.8954 20.1046 11 19 11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M7 11V7C7 5.67392 7.52678 4.40215 8.46447 3.46447C9.40215 2.52678 10.6739 2 12 2C13.3261 2 14.5979 2.52678 15.5355 3.46447C16.4732 4.40215 17 5.67392 17 7V11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="12" cy="16" r="1" fill="currentColor"/>
  </svg>
)

const LegalDisclaimer = () => (
  <div 
    className="legal-disclaimer"
    style={{
      marginTop: '40px',
      padding: '20px',
      borderTop: '1px solid rgba(91, 209, 215, 0.2)',
      background: 'rgba(0, 0, 0, 0.2)',
      borderRadius: '8px',
      fontSize: '0.875rem',
      lineHeight: '1.5',
      color: 'var(--text-secondary)',
      textAlign: 'center'
    }}
  >
    <strong style={{ color: 'var(--primary-teal)', display: 'block', marginBottom: '8px' }}>
      Important Notice
    </strong>
    <p style={{ margin: 0 }}>
      This viewer is for public access to published certificates only. Blockticity does not manage 
      redemption, customer support, or any commercial aspects of the real-world asset depicted. 
      For questions about the product, claim process, or related services, please contact the issuer directly.
    </p>
  </div>
)

const COAViewer = () => {
  const { orderId, networkOrderId } = useParams()
  const [metadata, setMetadata] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [password, setPassword] = useState('')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [authError, setAuthError] = useState(null)
  const [orderIdSearch, setOrderIdSearch] = useState('')
  const [searchMode, setSearchMode] = useState(false)
  
  // Parse network and order ID from URL parameters
  let currentNetwork, actualOrderId;
  
  if (networkOrderId) {
    // Handle /coa/mainnet-b0229059 or /coa/testnet-b0229059 format
    if (networkOrderId.startsWith('mainnet-')) {
      currentNetwork = 'mainnet';
      actualOrderId = networkOrderId.replace('mainnet-', '');
    } else if (networkOrderId.startsWith('testnet-')) {
      currentNetwork = 'testnet';
      actualOrderId = networkOrderId.replace('testnet-', '');
    } else {
      // Fallback: treat the whole thing as order ID and detect network normally
      currentNetwork = detectNetworkFromUrl();
      actualOrderId = networkOrderId;
    }
  } else {
    // Use standard network detection and order ID
    currentNetwork = detectNetworkFromUrl();
    actualOrderId = orderId;
  }
  
  const networkConfig = getNetworkConfig(currentNetwork)
  
  // Enhanced debug logging
  console.log('🔍 COAViewer Network Debug:', {
    urlOrderId: orderId,
    networkOrderId: networkOrderId,
    actualOrderId: actualOrderId,
    detectedNetwork: currentNetwork,
    pathname: window.location.pathname,
    searchParams: window.location.search,
    config: {
      name: networkConfig.name,
      chainId: networkConfig.chainId,
      contractAddress: networkConfig.contractAddress,
      orderIdMappingKeys: Object.keys(networkConfig.orderIdMapping)
    }
  })

  // Use network-specific metadata endpoint
  const METADATA_BASE_URL = networkConfig.metadataBaseUrl
  
  useEffect(() => {
    // Check if we have a Certificate ID from URL path
    if (actualOrderId) {
      console.log('🌐 URL parameter detected, starting blockchain search:', actualOrderId)
      
      // Check if it looks like a token ID (numeric) or Certificate ID (alphanumeric)
      if (/^\d+$/.test(actualOrderId)) {
        // Direct token ID
        console.log('🔢 Treating URL parameter as direct Token ID:', actualOrderId)
        fetchMetadata(actualOrderId)
      } else {
        // Certificate ID - search blockchain
        console.log('🏷️ Treating URL parameter as Certificate ID:', actualOrderId)
        handleOrderIdSearch(actualOrderId)
      }
    } else {
      // Show search mode
      setSearchMode(true)
      setLoading(false)
    }
  }, [actualOrderId, currentNetwork])

  // Mobile keyboard fix is now handled by MobileOrderInput component

  const handleOrderIdSearch = async (orderId) => {
    console.log('🔍 BLOCKCHAIN Certificate ID Search:', {
      searchedOrderId: orderId,
      lowercaseOrderId: orderId.toLowerCase(),
      currentNetwork,
      networkConfig: networkConfig.name,
      searchMethod: 'BLOCKCHAIN_SCAN'
    })
    
    setLoading(true)
    setError(null)
    
    try {
      // First, try local mapping for known certificates (backward compatibility)
      const mappings = networkConfig.orderIdMapping || {}
      const mappedTokenId = mappings[orderId.toLowerCase()]
      
      if (mappedTokenId) {
        console.log('📋 Found in local mapping, fetching blockchain data for token:', mappedTokenId)
        await fetchMetadata(mappedTokenId)
        return
      }
      
      // Try Earl Campbell direct lookup first (much faster)
      console.log('🏈 Checking Earl Campbell COA mapping for:', orderId)
      let foundTokens = await searchEarlCampbellCOA(networkConfig, orderId)
      
      // If not Earl Campbell, fall back to general blockchain search
      if (foundTokens.length === 0) {
        console.log('🔍 Not Earl Campbell, searching blockchain for Order ID:', orderId)
        foundTokens = await searchTokensByOrderId(networkConfig, orderId)
      }
      
      if (foundTokens.length > 0) {
        const token = foundTokens[0] // Use the first match
        console.log('✅ Found Order ID on blockchain:', {
          orderId,
          tokenId: token.tokenId,
          name: token.metadata.name
        })
        
        // Set the metadata directly since we already fetched it
        token.metadata._debugInfo = {
          source: 'BLOCKCHAIN_SEARCH',
          tokenURI: token.tokenURI,
          searchedOrderId: orderId,
          foundTokenId: token.tokenId,
          network: networkConfig.name
        }
        
        setMetadata(token.metadata)
        
        if (!token.metadata.requiresPassword) {
          setIsAuthenticated(true)
        }
        
      } else {
        console.log('❌ Order ID not found on blockchain')
        setError(`Certificate ID "${orderId}" not found on blockchain. Please verify the ID and try again.`)
      }
      
    } catch (error) {
      console.error('❌ Blockchain search failed:', error)
      setError(`Failed to search blockchain for Certificate ID "${orderId}": ${error.message}`)
    } finally {
      setLoading(false)
    }
  }
  
  const handleSearchSubmit = (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    
    // Navigate to the Certificate ID with proper network parameter
    const networkParam = currentNetwork === 'mainnet' ? '' : '?network=testnet'
    window.location.href = `/${orderIdSearch}${networkParam}`
  }
  
  
  const fetchMetadata = async (tokenId) => {
    setLoading(true)
    setError(null)
    
    try {
      console.log('🚀 Fetching REAL blockchain data for token:', tokenId)
      
      // Step 1: Get the actual tokenURI from the blockchain smart contract
      const tokenURI = await getTokenURI(networkConfig, tokenId)
      
      // Step 2: Fetch the metadata from IPFS/Pinata using the blockchain tokenURI
      const data = await fetchMetadataFromURI(tokenURI)
      
      // Add debug info about data source
      data._debugInfo = {
        source: 'BLOCKCHAIN',
        tokenURI: tokenURI,
        network: networkConfig.name,
        contract: networkConfig.contractAddress,
        fetchedAt: new Date().toISOString()
      }
      
      console.log('✅ REAL blockchain metadata loaded:', {
        tokenId,
        name: data.name,
        description: data.description?.substring(0, 100) + '...',
        source: 'BLOCKCHAIN + IPFS',
        tokenURI
      })
      
      setMetadata(data)
      
      // If no password required, authenticate immediately
      if (!data.requiresPassword) {
        setIsAuthenticated(true)
      }
      
    } catch (err) {
      console.error('❌ Blockchain metadata fetch failed:', err)
      
      // Fallback to local metadata for development/testing
      console.warn('🔄 Falling back to local metadata for development')
      try {
        const fallbackUrl = `${METADATA_BASE_URL}/${tokenId}.json`
        console.log('Trying fallback URL:', fallbackUrl)
        
        const response = await fetch(fallbackUrl)
        if (!response.ok) {
          throw new Error('Certificate not found on blockchain or locally')
        }
        
        const data = await response.json()
        data._debugInfo = {
          source: 'LOCAL_FALLBACK',
          fallbackUrl: fallbackUrl,
          originalError: err.message,
          fetchedAt: new Date().toISOString()
        }
        
        console.log('⚠️ Using fallback metadata:', data.name)
        setMetadata(data)
        
        if (!data.requiresPassword) {
          setIsAuthenticated(true)
        }
        
      } catch (fallbackErr) {
        console.error('❌ Both blockchain and fallback failed:', fallbackErr)
        setError(`Certificate not found. Blockchain error: ${err.message}`)
      }
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordSubmit = (e) => {
    e.preventDefault()
    setAuthError(null)
    
    // Simple client-side password check
    // In production, this should validate against a secure backend
    if (metadata.password && password === metadata.password) {
      setIsAuthenticated(true)
    } else {
      setAuthError('Invalid password. Please try again.')
    }
  }

  // Show search interface if in search mode
  if (searchMode && !loading) {
    return (
      <div className="container">
          <div className="card">
          <div className="header">
            <img 
              src={blocktivityLogo} 
              alt="Blockticity" 
              className="logo-image"
              style={{
                height: '60px',
                width: 'auto',
                maxWidth: '280px',
                objectFit: 'contain'
              }}
            />
            <p className="subtitle">Certificate of Authenticity</p>
          </div>
          
          <h2 style={{ textAlign: 'center', marginBottom: '20px', color: 'var(--text-primary)' }}>
            Search by Certificate ID (Order Identifier)
          </h2>
          <p style={{ textAlign: 'center', marginBottom: '30px', color: 'var(--text-secondary)' }}>
            Enter your Certificate ID (Order Identifier) to view the certificate
          </p>
          
          <form onSubmit={handleSearchSubmit} className="access-form">
            <div className="input-group">
              <EnhancedMobileInput
                value={orderIdSearch}
                onChange={(e) => setOrderIdSearch(e.target.value)}
                placeholder="Enter Certificate ID (e.g., b0229206)"
                className="input-field"
                required
              />
            </div>
            
            {error && (
              <div className="error-message">
                {error}
              </div>
            )}
            
            <button type="submit" className="button">
              Search Certificate
            </button>
          </form>
          
          <LegalDisclaimer />
        </div>
      </div>
    )
  }
  
  if (loading) {
    return (
      <div className="container">
          <div className="card">
          <div className="loading">
            <div className="spinner"></div>
            <span>Loading certificate...</span>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container">
          <div className="card">
          <div className="header">
            <img 
              src={blocktivityLogo} 
              alt="Blockticity" 
              className="logo-image"
              style={{
                height: '60px',
                width: 'auto',
                maxWidth: '280px',
                objectFit: 'contain'
              }}
            />
            <p className="subtitle">Certificate of Authenticity</p>
          </div>
          <div className="error-message">
            {error}
          </div>
        </div>
      </div>
    )
  }

  // Password gate
  if (metadata?.requiresPassword && !isAuthenticated) {
    return (
      <div className="container">
          <div className="card">
          <div className="header">
            <img 
              src={blocktivityLogo} 
              alt="Blockticity" 
              className="logo-image"
              style={{
                height: '60px',
                width: 'auto',
                maxWidth: '280px',
                objectFit: 'contain'
              }}
            />
            <p className="subtitle">Certificate of Authenticity</p>
          </div>
          
          <LockIcon />
          
          <h2 style={{ textAlign: 'center', marginBottom: '20px', color: 'var(--text-primary)' }}>
            Access Restricted
          </h2>
          <p style={{ textAlign: 'center', marginBottom: '30px', color: 'var(--text-secondary)' }}>
            This certificate requires authentication to view
          </p>
          
          <form onSubmit={handlePasswordSubmit} className="access-form">
            <div className="input-group">
              <label htmlFor="password" className="input-label">
                Enter Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field"
                placeholder="Enter your password"
                required
              />
            </div>
            
            {authError && (
              <div className="error-message">
                {authError}
              </div>
            )}
            
            <button type="submit" className="button">
              Unlock Certificate
            </button>
          </form>
        </div>
      </div>
    )
  }

  // Display COA
  return (
    <div className="container">
        <div className="card coa-content">
        <div className="header">
          <img 
            src={blocktivityLogo} 
            alt="Blockticity" 
            className="logo-image"
            style={{
              height: '60px',
              width: 'auto',
              maxWidth: '280px',
              objectFit: 'contain'
            }}
          />
          <p className="subtitle">Certificate of Authenticity</p>
        </div>
        
        <div className="coa-image-container">
          {metadata.image ? (
            <SimpleIPFSImage
              src={metadata.image}
              alt={metadata.name || 'Certificate of Authenticity'}
              className="coa-image"
            />
          ) : (
            <div className="coa-image-placeholder">
              <svg width="100" height="100" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="3" y="6" width="18" height="15" rx="2" stroke="#5BD1D7" strokeWidth="2"/>
                <path d="M3 6L12 13L21 6" stroke="#5BD1D7" strokeWidth="2" strokeLinecap="round"/>
                <circle cx="8" cy="11" r="1.5" fill="#5BD1D7"/>
              </svg>
              <p>Certificate of Authenticity</p>
            </div>
          )}
        </div>
        
        <h2 className="coa-title">{metadata.name || `COA #${orderId}`}</h2>
        
        {/* Debug Info Panel - Shows data source */}
        {metadata._debugInfo && (
          <div style={{
            background: 'rgba(91, 209, 215, 0.1)',
            border: '1px solid rgba(91, 209, 215, 0.3)',
            borderRadius: '8px',
            padding: '12px',
            marginBottom: '20px',
            fontSize: '12px',
            fontFamily: 'monospace'
          }}>
            <div style={{ color: '#5BD1D7', fontWeight: 'bold', marginBottom: '8px' }}>
              🔍 Data Source: {metadata._debugInfo.source}
            </div>
            {metadata._debugInfo.tokenURI && (
              <div style={{ color: '#a8b2c7', marginBottom: '4px' }}>
                📡 Token URI: {metadata._debugInfo.tokenURI}
              </div>
            )}
            <div style={{ color: '#a8b2c7', marginBottom: '4px' }}>
              🌐 Network: {metadata._debugInfo.network}
            </div>
            <div style={{ color: '#a8b2c7', fontSize: '10px' }}>
              ⏰ Fetched: {new Date(metadata._debugInfo.fetchedAt).toLocaleString()}
            </div>
          </div>
        )}
        
        {metadata.description && (
          <p style={{ marginBottom: '20px', color: 'var(--text-secondary)' }}>
            {metadata.description}
          </p>
        )}
        
        <div className="metadata-section">
          <h3 className="metadata-title">Certificate Details</h3>
          <div className="metadata-grid">
            {metadata.attributes
              ?.filter(attr => attr.trait_type !== 'Certificate Quality') // Remove Certificate Quality field
              ?.map((attr, index) => {
                // Fix blockchain name to show "Testnet"
                const value = attr.trait_type === 'Blockchain' && attr.value === 'Blockticity L1' 
                  ? 'Blockticity L1 Testnet' 
                  : attr.value;
                  
                return (
                  <div key={index} className="metadata-item">
                    <div className="metadata-key">{attr.trait_type}</div>
                    <div className="metadata-value">{value}</div>
                  </div>
                );
              })}
            
            {metadata.tokenId && (
              <div className="metadata-item">
                <div className="metadata-key">Token ID</div>
                <div className="metadata-value">{metadata.tokenId}</div>
              </div>
            )}
            
            {metadata.mintDate && (
              <div className="metadata-item">
                <div className="metadata-key">Mint Date</div>
                <div className="metadata-value">
                  {new Date(metadata.mintDate).toLocaleDateString()}
                </div>
              </div>
            )}
            
            {metadata.contractAddress && (
              <div className="metadata-item">
                <div className="metadata-key">Contract</div>
                <div className="metadata-value" style={{ fontSize: '0.875rem' }}>
                  {metadata.contractAddress.slice(0, 6)}...{metadata.contractAddress.slice(-4)}
                </div>
              </div>
            )}
          </div>
        </div>
        
        {metadata.verificationUrl && (
          <div style={{ marginTop: '30px', textAlign: 'center' }}>
            <a 
              href={metadata.verificationUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="button"
              style={{ textDecoration: 'none', display: 'inline-block' }}
            >
              Verify Certificate
            </a>
          </div>
        )}
        
        <LegalDisclaimer />
      </div>
    </div>
  )
}

export default COAViewer