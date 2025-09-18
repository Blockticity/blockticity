import { ethers } from 'ethers';

/**
 * RPC Manager with automatic failover and performance monitoring
 * Handles multiple RPC endpoints and switches to fastest available
 */

class RPCManager {
  constructor(chainId) {
    this.chainId = chainId;
    this.providers = [];
    this.currentProviderIndex = 0;
    this.rpcStats = new Map();
    this.healthCheckInterval = null;
    this.lastHealthCheck = null;
    
    // Define RPC endpoints with priority
    this.rpcEndpoints = this.getRPCEndpoints(chainId);
    
    // Initialize providers
    this.initializeProviders();
    
    // Start health monitoring
    this.startHealthMonitoring();
  }
  
  /**
   * Get RPC endpoints based on chain ID
   */
  getRPCEndpoints(chainId) {
    // Blockticity L1 Mainnet
    if (chainId === 28530) {
      return [
        {
          url: 'https://subnets.avax.network/btic/mainnet/rpc',
          priority: 1,
          name: 'Subnets Public (Primary)',
          timeout: 8000
        },
        // Add additional endpoints here as they become available
        // For now, we'll use just the known working endpoint
        // but the architecture supports adding more later
      ];
    }
    
    // Blockticity L1 Testnet
    if (chainId === 75234) {
      return [
        {
          url: 'https://testnet-btest-ub57a.avax-test.network/ext/bc/2GMLdy7Fmb2FqA1EyHsUVre5rj1W5upmsDwqyKT1FEvJgWg79z/rpc?token=f3d07db83ce3d2ed8cd5e844136e7f5fbf66e7e7e83b11a984dfb6fdf5f99eba',
          priority: 1,
          name: 'Testnet Primary',
          timeout: 8000
        },
        {
          url: 'https://subnets.avax.network/btest/testnet/rpc',
          priority: 2,
          name: 'Testnet Public',
          timeout: 10000
        }
      ];
    }
    
    // Fallback to original single endpoint
    return [
      {
        url: 'https://subnets.avax.network/btic/mainnet/rpc',
        priority: 1,
        name: 'Default',
        timeout: 10000
      }
    ];
  }
  
  /**
   * Initialize providers for all endpoints
   */
  initializeProviders() {
    this.providers = this.rpcEndpoints.map(endpoint => ({
      provider: new ethers.JsonRpcProvider(endpoint.url),
      endpoint: endpoint,
      isHealthy: true,
      avgResponseTime: null,
      lastCheck: null
    }));
    
    // Sort by priority
    this.providers.sort((a, b) => a.endpoint.priority - b.endpoint.priority);
  }
  
  /**
   * Test RPC endpoint health and speed
   */
  async testEndpoint(provider, endpoint) {
    const startTime = Date.now();
    
    try {
      // Set timeout for health check
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), endpoint.timeout)
      );
      
      // Test basic RPC call (get block number)
      const blockPromise = provider.provider.getBlockNumber();
      
      await Promise.race([blockPromise, timeoutPromise]);
      
      const responseTime = Date.now() - startTime;
      
      return {
        isHealthy: true,
        responseTime,
        timestamp: Date.now()
      };
      
    } catch (error) {
      console.warn(`RPC endpoint ${endpoint.name} failed health check:`, error.message);
      
      return {
        isHealthy: false,
        responseTime: null,
        error: error.message,
        timestamp: Date.now()
      };
    }
  }
  
  /**
   * Get the best available provider
   */
  async getBestProvider() {
    // First, try to use cached best provider if recent
    if (this.lastHealthCheck && Date.now() - this.lastHealthCheck < 30000) {
      const healthyProviders = this.providers.filter(p => p.isHealthy);
      if (healthyProviders.length > 0) {
        return healthyProviders[0].provider;
      }
    }
    
    // Run health checks in parallel
    const healthChecks = await Promise.all(
      this.providers.map(async (providerInfo) => {
        const health = await this.testEndpoint(providerInfo, providerInfo.endpoint);
        providerInfo.isHealthy = health.isHealthy;
        providerInfo.avgResponseTime = health.responseTime;
        providerInfo.lastCheck = health.timestamp;
        return providerInfo;
      })
    );
    
    // Filter healthy providers and sort by response time
    const healthyProviders = healthChecks
      .filter(p => p.isHealthy)
      .sort((a, b) => {
        // Sort by response time, then by priority
        if (a.avgResponseTime && b.avgResponseTime) {
          return a.avgResponseTime - b.avgResponseTime;
        }
        return a.endpoint.priority - b.endpoint.priority;
      });
    
    this.lastHealthCheck = Date.now();
    
    if (healthyProviders.length === 0) {
      console.error('All RPC endpoints are unhealthy!');
      // Return first provider as last resort
      return this.providers[0].provider;
    }
    
    console.log(`🚀 Using fastest RPC: ${healthyProviders[0].endpoint.name} (${healthyProviders[0].avgResponseTime}ms)`);
    
    return healthyProviders[0].provider;
  }
  
  /**
   * Execute a contract call with automatic failover
   */
  async executeWithFailover(contractCall) {
    let lastError = null;
    
    // Try each healthy provider
    for (const providerInfo of this.providers) {
      if (!providerInfo.isHealthy && providerInfo.lastCheck && 
          Date.now() - providerInfo.lastCheck < 60000) {
        // Skip recently failed providers
        continue;
      }
      
      try {
        console.log(`🔄 Trying RPC: ${providerInfo.endpoint.name}`);
        
        const startTime = Date.now();
        const result = await contractCall(providerInfo.provider);
        const responseTime = Date.now() - startTime;
        
        // Update stats for successful call
        providerInfo.isHealthy = true;
        providerInfo.avgResponseTime = responseTime;
        
        console.log(`✅ RPC call succeeded via ${providerInfo.endpoint.name} (${responseTime}ms)`);
        
        return result;
        
      } catch (error) {
        console.warn(`❌ RPC ${providerInfo.endpoint.name} failed:`, error.message);
        
        providerInfo.isHealthy = false;
        providerInfo.lastCheck = Date.now();
        lastError = error;
        
        // Continue to next provider
      }
    }
    
    // All providers failed
    throw lastError || new Error('All RPC endpoints failed');
  }
  
  /**
   * Start health monitoring
   */
  startHealthMonitoring() {
    // Initial health check
    this.checkAllEndpoints();
    
    // Regular health checks every 30 seconds
    this.healthCheckInterval = setInterval(() => {
      this.checkAllEndpoints();
    }, 30000);
  }
  
  /**
   * Check all endpoints health
   */
  async checkAllEndpoints() {
    console.log('🏥 Running RPC health checks...');
    
    const healthResults = await Promise.all(
      this.providers.map(async (providerInfo) => {
        const health = await this.testEndpoint(providerInfo, providerInfo.endpoint);
        providerInfo.isHealthy = health.isHealthy;
        providerInfo.avgResponseTime = health.responseTime;
        providerInfo.lastCheck = health.timestamp;
        
        return {
          name: providerInfo.endpoint.name,
          healthy: health.isHealthy,
          responseTime: health.responseTime
        };
      })
    );
    
    // Log health status
    const healthyCount = healthResults.filter(r => r.healthy).length;
    console.log(`📊 RPC Health: ${healthyCount}/${healthResults.length} endpoints healthy`);
    
    healthResults.forEach(result => {
      if (result.healthy) {
        console.log(`  ✅ ${result.name}: ${result.responseTime}ms`);
      } else {
        console.log(`  ❌ ${result.name}: Down`);
      }
    });
  }
  
  /**
   * Get current RPC stats
   */
  getStats() {
    return this.providers.map(p => ({
      name: p.endpoint.name,
      url: p.endpoint.url,
      priority: p.endpoint.priority,
      isHealthy: p.isHealthy,
      responseTime: p.avgResponseTime,
      lastCheck: p.lastCheck
    }));
  }
  
  /**
   * Cleanup
   */
  destroy() {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }
  }
}

// Singleton instances
let mainnetManager = null;
let testnetManager = null;

/**
 * Get RPC manager for network
 */
export function getRPCManager(chainId) {
  if (chainId === 28530) {
    if (!mainnetManager) {
      mainnetManager = new RPCManager(chainId);
    }
    return mainnetManager;
  }
  
  if (chainId === 75234) {
    if (!testnetManager) {
      testnetManager = new RPCManager(chainId);
    }
    return testnetManager;
  }
  
  // Create new manager for unknown networks
  return new RPCManager(chainId);
}

/**
 * Get best provider for network
 */
export async function getBestProvider(networkConfig) {
  const manager = getRPCManager(networkConfig.chainId);
  return await manager.getBestProvider();
}

/**
 * Execute with failover
 */
export async function executeWithFailover(networkConfig, contractCall) {
  const manager = getRPCManager(networkConfig.chainId);
  return await manager.executeWithFailover(contractCall);
}

export default RPCManager;