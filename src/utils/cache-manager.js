/**
 * Cache Manager for COA data
 * Reduces RPC calls by caching tokenURI and metadata
 */

class CacheManager {
  constructor() {
    this.tokenURICache = new Map();
    this.metadataCache = new Map();
    this.cacheExpiry = 3600000; // 1 hour
    this.maxCacheSize = 500; // Maximum items to cache
  }
  
  /**
   * Generate cache key
   */
  getCacheKey(networkId, tokenId) {
    return `${networkId}-${tokenId}`;
  }
  
  /**
   * Get cached tokenURI
   */
  getTokenURI(networkId, tokenId) {
    const key = this.getCacheKey(networkId, tokenId);
    const cached = this.tokenURICache.get(key);
    
    if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
      console.log('📦 Cache hit for tokenURI:', key);
      return cached.value;
    }
    
    return null;
  }
  
  /**
   * Set cached tokenURI
   */
  setTokenURI(networkId, tokenId, tokenURI) {
    const key = this.getCacheKey(networkId, tokenId);
    
    // Implement LRU eviction if cache is too large
    if (this.tokenURICache.size >= this.maxCacheSize) {
      const firstKey = this.tokenURICache.keys().next().value;
      this.tokenURICache.delete(firstKey);
    }
    
    this.tokenURICache.set(key, {
      value: tokenURI,
      timestamp: Date.now()
    });
    
    console.log('💾 Cached tokenURI:', key);
  }
  
  /**
   * Get cached metadata
   */
  getMetadata(uri) {
    const cached = this.metadataCache.get(uri);
    
    if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
      console.log('📦 Cache hit for metadata:', uri.substring(0, 50) + '...');
      return cached.value;
    }
    
    return null;
  }
  
  /**
   * Set cached metadata
   */
  setMetadata(uri, metadata) {
    // Implement LRU eviction if cache is too large
    if (this.metadataCache.size >= this.maxCacheSize) {
      const firstKey = this.metadataCache.keys().next().value;
      this.metadataCache.delete(firstKey);
    }
    
    this.metadataCache.set(uri, {
      value: metadata,
      timestamp: Date.now()
    });
    
    console.log('💾 Cached metadata for:', uri.substring(0, 50) + '...');
  }
  
  /**
   * Clear all caches
   */
  clearAll() {
    this.tokenURICache.clear();
    this.metadataCache.clear();
    console.log('🧹 Cache cleared');
  }
  
  /**
   * Get cache stats
   */
  getStats() {
    return {
      tokenURICount: this.tokenURICache.size,
      metadataCount: this.metadataCache.size,
      totalSize: this.tokenURICache.size + this.metadataCache.size,
      maxSize: this.maxCacheSize * 2
    };
  }
}

// Singleton instance
const cacheManager = new CacheManager();

export default cacheManager;