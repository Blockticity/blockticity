import { ethers } from 'ethers'
import { getTokenURIWithRetry, getCachedMetadata, setCachedMetadata, createProvider } from './rpc-helper'
import { isEncryptedData, decryptMetadata } from './decryption'

// ERC-721 ABI for tokenURI function
const ERC721_ABI = [
  {
    "inputs": [{"internalType": "uint256", "name": "tokenId", "type": "uint256"}],
    "name": "tokenURI",
    "outputs": [{"internalType": "string", "name": "", "type": "string"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "tokenId", "type": "uint256"}],
    "name": "ownerOf",
    "outputs": [{"internalType": "address", "name": "", "type": "address"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "totalSupply",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  }
]

/**
 * Get the actual tokenURI from the blockchain smart contract
 */
export const getTokenURI = async (networkConfig, tokenId) => {
  try {
    console.log('🔗 Querying blockchain for tokenURI:', {
      network: networkConfig.name,
      contract: networkConfig.contractAddress,
      tokenId: tokenId
    })

    // Use retry helper with caching
    const tokenURI = await getTokenURIWithRetry(
      networkConfig, 
      tokenId,
      networkConfig.contractAddress,
      ERC721_ABI
    )
    
    console.log('✅ Blockchain tokenURI result:', {
      tokenId,
      tokenURI,
      isIPFS: tokenURI.startsWith('ipfs://'),
      isPinata: tokenURI.includes('pinata.cloud')
    })
    
    return tokenURI
    
  } catch (error) {
    console.error('❌ Blockchain query failed:', {
      tokenId,
      error: error.message,
      code: error.code
    })
    throw new Error(`Failed to query tokenURI for token ${tokenId}: ${error.message}`)
  }
}

// IPFS Gateways for fallback
const IPFS_GATEWAYS = [
  'https://ipfs.io/ipfs/',
  'https://gateway.pinata.cloud/ipfs/',
  'https://nftstorage.link/ipfs/',
  'https://w3s.link/ipfs/'
]

/**
 * Extract IPFS hash from various URL formats
 */
const extractIPFSHash = (uri) => {
  const patterns = [
    /ipfs:\/\/(.+)/,
    /\/ipfs\/(.+)/,
    /ipfs\.io\/ipfs\/(.+)/,
    /gateway\.pinata\.cloud\/ipfs\/(.+)/,
    /nftstorage\.link\/ipfs\/(.+)/,
    /w3s\.link\/ipfs\/(.+)/
  ]
  
  for (const pattern of patterns) {
    const match = uri.match(pattern)
    if (match) {
      return match[1]
    }
  }
  
  return uri
}

/**
 * Convert IPFS URI to HTTP gateway URL
 */
export const resolveIPFSUrl = (uri) => {
  if (uri.startsWith('ipfs://')) {
    const hash = uri.replace('ipfs://', '')
    // Use IPFS.io as primary gateway
    return `https://ipfs.io/ipfs/${hash}`
  }
  return uri
}

/**
 * Fetch metadata with automatic IPFS gateway fallback
 * Supports both plain JSON and encrypted metadata
 */
export const fetchMetadataFromURI = async (uri, password = null) => {
  // Auto-decrypt for Wacker tokens using environment variable
  if (!password) {
    password = import.meta.env.VITE_WACKER_PASSWORD || null;
  }
  // Check cache first (only for non-encrypted or already decrypted)
  const cached = getCachedMetadata(uri)
  if (cached && !cached._encrypted) {
    return cached
  }

  console.log('📡 Starting metadata fetch:', {
    originalUri: uri,
    isIPFS: uri.startsWith('ipfs://'),
    source: uri.startsWith('ipfs://') ? 'IPFS' : 'HTTP',
    hasPassword: !!password
  })

  let metadata

  // If it's not IPFS, use direct fetch
  if (!uri.startsWith('ipfs://')) {
    const response = await fetch(uri)
    if (!response.ok) {
      throw new Error(`Failed to fetch metadata: ${response.status} ${response.statusText}`)
    }

    // Try to detect if it's encrypted binary data
    const arrayBuffer = await response.arrayBuffer()
    if (isEncryptedData(arrayBuffer)) {
      console.log('🔐 Detected encrypted metadata')
      // Return a special marker indicating encryption
      return {
        _encrypted: true,
        _uri: uri,
        _data: arrayBuffer
      }
    }

    // Parse as JSON
    const text = new TextDecoder().decode(arrayBuffer)
    metadata = JSON.parse(text)
    setCachedMetadata(uri, metadata)
    return metadata
  }

  // IPFS URI - use gateway fallback
  const hash = extractIPFSHash(uri)
  console.log('🔗 IPFS hash extracted:', hash)

  const errors = []

  for (const gateway of IPFS_GATEWAYS) {
    try {
      const url = gateway + hash
      console.log(`🌐 Trying gateway: ${gateway}`)

      const response = await fetch(url, {
        signal: AbortSignal.timeout(10000) // 10 second timeout per gateway
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      // Get as array buffer to check if encrypted
      const arrayBuffer = await response.arrayBuffer()

      // Check if this is encrypted data
      if (isEncryptedData(arrayBuffer)) {
        console.log('🔐 Detected encrypted metadata from:', gateway)

        // If no password provided, return marker
        if (!password) {
          return {
            _encrypted: true,
            _uri: uri,
            _data: arrayBuffer
          }
        }

        // Decrypt the metadata
        try {
          console.log('🔓 Attempting to decrypt metadata...')
          metadata = await decryptMetadata(arrayBuffer, password)

          console.log('✅ Metadata decrypted successfully:', {
            name: metadata.name,
            description: metadata.description?.substring(0, 100) + '...',
            image: metadata.image,
            attributes: metadata.attributes?.length || 0
          })

          setCachedMetadata(uri, metadata)
          return metadata

        } catch (decryptError) {
          console.error('❌ Decryption failed:', decryptError.message)
          throw new Error(`Failed to decrypt metadata: ${decryptError.message}`)
        }
      }

      // Try to parse as JSON
      try {
        const text = new TextDecoder().decode(arrayBuffer)
        metadata = JSON.parse(text)

        console.log('✅ Metadata fetched successfully via:', gateway, {
          name: metadata.name,
          description: metadata.description?.substring(0, 100) + '...',
          image: metadata.image,
          attributes: metadata.attributes?.length || 0
        })

        // Cache the successful result
        setCachedMetadata(uri, metadata)

        return metadata
      } catch (jsonError) {
        throw new Error(`Failed to parse as JSON: ${jsonError.message}`)
      }

    } catch (err) {
      console.log(`❌ Gateway ${gateway} failed:`, err.message)
      errors.push(`${gateway}: ${err.message}`)
    }
  }

  // All gateways failed
  throw new Error('Failed to fetch from all IPFS gateways:\n' + errors.join('\n'))
}

/**
 * Search for tokens by iterating through minted tokens
 * This is a fallback method to find token IDs associated with Order IDs
 */
export const searchTokensByOrderId = async (networkConfig, orderIdToFind) => {
  try {
    console.log('🔍 Searching blockchain for Order ID:', orderIdToFind)
    
    // Create provider with timeout
    const provider = createProvider(networkConfig.rpcUrl)
    const contract = new ethers.Contract(
      networkConfig.contractAddress,
      ERC721_ABI,
      provider
    )
    
    // Define search ranges based on known token ranges
    const searchRanges = [
      // Earl Campbell mainnet COAs
      { start: 687723, end: 688019, description: 'Earl Campbell mainnet COAs' },
      // Other known ranges can be added here
      { start: 1, end: 100, description: 'Early tokens' },
      { start: 1400, end: 1500, description: 'Testnet range' }
    ]
    
    const foundTokens = []
    
    // Search through each range
    for (const range of searchRanges) {
      console.log(`🔍 Searching ${range.description}: ${range.start} to ${range.end}`)
      
      for (let tokenId = range.start; tokenId <= range.end; tokenId++) {
        try {
          const tokenURI = await contract.tokenURI(tokenId)
          const metadata = await fetchMetadataFromURI(tokenURI)
          
          // Check if this metadata contains the Order ID we're looking for
          const hasOrderId = metadata.attributes?.some(attr => 
            attr.trait_type?.toLowerCase().includes('order') && 
            attr.value?.toLowerCase() === orderIdToFind.toLowerCase()
          ) || metadata.name?.toLowerCase().includes(orderIdToFind.toLowerCase())
          
          if (hasOrderId) {
            foundTokens.push({
              tokenId,
              tokenURI,
              metadata
            })
            console.log('🎯 Found matching token:', {
              tokenId,
              orderId: orderIdToFind,
              name: metadata.name
            })
            // Return immediately when found for faster response
            return foundTokens
          }
          
        } catch (error) {
          // Token might not exist or have invalid metadata, skip it
          console.debug(`Skipping token ${tokenId}:`, error.message)
        }
      }
      
      // If found in this range, no need to search others
      if (foundTokens.length > 0) {
        break
      }
    }
    
    return foundTokens
    
  } catch (error) {
    console.error('❌ Order ID search failed:', error)
    throw error
  }
}

/**
 * Direct lookup for Earl Campbell COAs using known mappings
 * This is much faster than blockchain search
 */
export const searchEarlCampbellCOA = async (networkConfig, orderIdToFind) => {
  // Earl Campbell Order ID to Token ID mapping
  const earlCampbellMappings = {}
  
  // Generate the mappings (b0229059 to b0229355 → 687723 to 688019)
  const startOrderNum = 229059
  const endOrderNum = 229355
  const startTokenId = 687723
  
  for (let i = 0; i <= (endOrderNum - startOrderNum); i++) {
    const orderNum = startOrderNum + i
    const orderId = `b0${orderNum}`
    const tokenId = startTokenId + i
    earlCampbellMappings[orderId] = tokenId
  }
  
  // Check if this is an Earl Campbell COA
  const tokenId = earlCampbellMappings[orderIdToFind.toLowerCase()]
  
  if (tokenId) {
    console.log('🎯 Found Earl Campbell COA mapping:', {
      orderId: orderIdToFind,
      tokenId: tokenId,
      source: 'DIRECT_MAPPING'
    })
    
    try {
      // Get the actual metadata from blockchain
      const tokenURI = await getTokenURI(networkConfig, tokenId)
      const metadata = await fetchMetadataFromURI(tokenURI)
      
      return [{
        tokenId,
        tokenURI,
        metadata
      }]
    } catch (error) {
      console.error('❌ Failed to fetch Earl Campbell COA metadata:', error)
      throw error
    }
  }
  
  return [] // Not an Earl Campbell COA
}