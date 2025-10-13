import { ethers } from 'ethers'

/**
 * Simple RPC helper with retry logic and caching
 */

// Simple in-memory cache
const cache = new Map()
const CACHE_DURATION = 3600000 // 1 hour

/**
 * Get cached value
 */
function getCached(key) {
  const cached = cache.get(key)
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    console.log('📦 Cache hit:', key)
    return cached.value
  }
  return null
}

/**
 * Set cached value
 */
function setCached(key, value) {
  cache.set(key, {
    value,
    timestamp: Date.now()
  })
  // Limit cache size
  if (cache.size > 500) {
    const firstKey = cache.keys().next().value
    cache.delete(firstKey)
  }
}

/**
 * Create provider with timeout
 */
export function createProvider(rpcUrl) {
  return new ethers.JsonRpcProvider(rpcUrl, undefined, {
    timeout: 10000 // 10 second timeout
  })
}

/**
 * Get tokenURI with retry and caching
 */
export async function getTokenURIWithRetry(networkConfig, tokenId, contractAddress, abi) {
  const cacheKey = `tokenURI-${networkConfig.chainId}-${tokenId}`
  
  // Check cache first
  const cached = getCached(cacheKey)
  if (cached) {
    return cached
  }
  
  let lastError = null
  
  // Try up to 3 times with increasing timeout
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      console.log(`🔄 RPC attempt ${attempt}/3 for token ${tokenId}`)
      
      const provider = createProvider(networkConfig.rpcUrl)
      const contract = new ethers.Contract(contractAddress, abi, provider)
      
      // Set a timeout for the contract call
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('RPC timeout')), 10000 * attempt)
      )
      
      const tokenURIPromise = contract.tokenURI(tokenId)
      
      const tokenURI = await Promise.race([tokenURIPromise, timeoutPromise])
      
      console.log(`✅ RPC call succeeded on attempt ${attempt}`)
      
      // Cache successful result
      setCached(cacheKey, tokenURI)
      
      return tokenURI
      
    } catch (error) {
      console.warn(`❌ RPC attempt ${attempt} failed:`, error.message)
      lastError = error
      
      // Wait before retry
      if (attempt < 3) {
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt))
      }
    }
  }
  
  throw lastError || new Error('Failed to fetch tokenURI after 3 attempts')
}

/**
 * Fetch metadata with caching
 */
export function getCachedMetadata(uri) {
  return getCached(`metadata-${uri}`)
}

export function setCachedMetadata(uri, metadata) {
  setCached(`metadata-${uri}`, metadata)
}