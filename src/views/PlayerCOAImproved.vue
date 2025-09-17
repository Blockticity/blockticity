<template>
  <CoAAccessGate :tokenId="tokenId" :userEmail="userEmail">
    <div v-if="metadata" class="coa-container">
      <!-- Header Section -->
      <div class="coa-header">
        <h1 class="coa-title">{{ metadata.name }}</h1>
        <p class="coa-subtitle">Certificate of Authenticity</p>
      </div>

      <!-- Image Section -->
      <div class="coa-image-container">
        <img
          :src="certificateImage"
          alt="Certificate of Authenticity"
          class="coa-image"
          @error="handleImageError"
        />
      </div>

      <!-- Description Section -->
      <div class="coa-description">
        <p>{{ metadata.description }}</p>
      </div>

      <!-- Attributes Section -->
      <div v-if="metadata.attributes && metadata.attributes.length" class="coa-attributes">
        <h2 class="attributes-title">Certificate Details</h2>
        <div class="attributes-grid">
          <div v-for="(attr, index) in metadata.attributes" :key="index" class="attribute-item">
            <span class="attribute-label">{{ attr.trait_type }}</span>
            <span class="attribute-value">{{ attr.value }}</span>
          </div>
        </div>
      </div>

      <!-- Blockchain Info -->
      <div class="blockchain-info">
        <div class="blockchain-badge">
          <svg class="blockchain-icon" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
          </svg>
          <span>Verified on Blockticity L1</span>
        </div>
      </div>

      <!-- Debug Info (only in development) -->
      <div v-if="showDebugInfo" class="debug-info">
        <h3>Debug Information</h3>
        <p>Token ID: {{ tokenId }}</p>
        <p>Gateway Used: {{ successfulGateway || 'None' }}</p>
        <p>Fallback Attempts: {{ fallbackAttempts }}</p>
      </div>
    </div>

    <!-- Loading State -->
    <div v-else-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <p class="loading-text">{{ loadingMessage }}</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-container">
      <div class="error-icon">⚠️</div>
      <h2 class="error-title">Unable to Load Certificate</h2>
      <p class="error-message">{{ errorMessage }}</p>
      <button @click="retryFetch" class="retry-button">Retry</button>
      <details v-if="errorDetails" class="error-details">
        <summary>Technical Details</summary>
        <pre>{{ errorDetails }}</pre>
      </details>
    </div>
  </CoAAccessGate>
</template>

<script setup>
import { onMounted, ref, computed } from 'vue';
import { useRoute } from 'vue-router';
import CoAAccessGate from '../components/CoAAccessGate.vue';

const route = useRoute();
const tokenId = route.params.id;
const userEmail = ''; // Placeholder for Privy logic

// State management
const metadata = ref(null);
const loading = ref(true);
const error = ref(false);
const loadingMessage = ref('Loading certificate...');
const errorMessage = ref('');
const errorDetails = ref('');
const successfulGateway = ref('');
const fallbackAttempts = ref(0);
const certificateImage = ref('');

// Debug mode
const showDebugInfo = computed(() => {
  return process.env.NODE_ENV === 'development' || 
         new URLSearchParams(window.location.search).has('debug');
});

// Blockchain configuration
const RPC_URL = 'https://testnet-btest-ub57a.avax-test.network/ext/bc/2GMLdy7Fmb2FqA1EyHsUVre5rj1W5upmsDwqyKT1FEvJgWg79z/rpc?token=f3d07db83ce3d2ed8cd5e844136e7f5fbf66e7e7e83b11a984dfb6fdf5f99eba';
const CONTRACT_ADDRESS = '0x600D115075768548527BCcd156ccC921D7861f87';

// IPFS Gateway configurations with priorities
const IPFS_GATEWAYS = [
  { 
    name: 'IPFS.io', 
    url: 'https://ipfs.io/ipfs/',
    priority: 1
  },
  { 
    name: 'Pinata', 
    url: 'https://gateway.pinata.cloud/ipfs/',
    priority: 2
  },
  { 
    name: 'DWeb', 
    url: 'https://nftstorage.link/ipfs/',
    priority: 3
  },
  {
    name: 'W3S',
    url: 'https://w3s.link/ipfs/',
    priority: 4
  }
];

// Function to make RPC calls
async function rpcCall(method, params) {
  const response = await fetch(RPC_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      jsonrpc: '2.0',
      method: method,
      params: params,
      id: 1
    })
  });

  const data = await response.json();
  
  if (data.error) {
    throw new Error(data.error.message);
  }
  
  return data.result;
}

// Encode function call for tokenURI(uint256)
function encodeTokenURI(tokenId) {
  const paddedTokenId = parseInt(tokenId).toString(16).padStart(64, '0');
  return '0xc87b56dd' + paddedTokenId;
}

// Decode hex string response to URL
function decodeString(hex) {
  if (!hex || hex === '0x') return '';
  
  try {
    const cleanHex = hex.slice(2);
    const lengthHex = cleanHex.slice(64, 128);
    const length = parseInt(lengthHex, 16);
    const stringHex = cleanHex.slice(128, 128 + (length * 2));
    
    let result = '';
    for (let i = 0; i < stringHex.length; i += 2) {
      result += String.fromCharCode(parseInt(stringHex.substr(i, 2), 16));
    }
    
    return result;
  } catch (e) {
    console.error('Error decoding string:', e);
    return '';
  }
}

// Extract IPFS hash from various URL formats
function extractIPFSHash(url) {
  const patterns = [
    /ipfs:\/\/(.+)/,
    /\/ipfs\/(.+)/,
    /ipfs\.io\/ipfs\/(.+)/,
    /gateway\.pinata\.cloud\/ipfs\/(.+)/,
    /nftstorage\.link\/ipfs\/(.+)/,
    /w3s\.link\/ipfs\/(.+)/
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      return match[1];
    }
  }
  
  return url;
}

// Fetch metadata with gateway fallback
async function fetchMetadataWithFallback(ipfsUrl) {
  const ipfsHash = extractIPFSHash(ipfsUrl);
  console.log('Extracted IPFS hash:', ipfsHash);
  
  const errors = [];
  
  for (const gateway of IPFS_GATEWAYS) {
    try {
      fallbackAttempts.value++;
      loadingMessage.value = `Trying ${gateway.name}...`;
      
      const url = gateway.url + ipfsHash;
      console.log(`Attempting to fetch from ${gateway.name}:`, url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json, text/plain, */*'
        },
        signal: AbortSignal.timeout(10000) // 10 second timeout
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      successfulGateway.value = gateway.name;
      console.log(`Successfully fetched from ${gateway.name}`);
      
      // Update image URL with successful gateway if needed
      if (data.image) {
        certificateImage.value = updateImageGateway(data.image, gateway);
      }
      
      return data;
      
    } catch (err) {
      console.error(`Failed to fetch from ${gateway.name}:`, err.message);
      errors.push(`${gateway.name}: ${err.message}`);
    }
  }
  
  // All gateways failed
  throw new Error('Failed to fetch from all gateways:\n' + errors.join('\n'));
}

// Update image URL to use successful gateway
function updateImageGateway(imageUrl, gateway) {
  const hash = extractIPFSHash(imageUrl);
  return gateway.url + hash;
}

// Handle image loading errors with fallback
async function handleImageError() {
  console.log('Image failed to load, trying fallback gateways...');
  
  if (metadata.value && metadata.value.image) {
    const hash = extractIPFSHash(metadata.value.image);
    
    for (const gateway of IPFS_GATEWAYS) {
      if (gateway.name !== successfulGateway.value) {
        const testUrl = gateway.url + hash;
        
        try {
          // Test if image loads from this gateway
          await new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = resolve;
            img.onerror = reject;
            img.src = testUrl;
          });
          
          certificateImage.value = testUrl;
          console.log(`Image loaded successfully from ${gateway.name}`);
          break;
        } catch (err) {
          console.log(`Image failed from ${gateway.name}`);
        }
      }
    }
  }
}

// Fetch certificate metadata
async function fetchCertificate() {
  loading.value = true;
  error.value = false;
  errorMessage.value = '';
  errorDetails.value = '';
  fallbackAttempts.value = 0;
  
  try {
    // Step 1: Fetch tokenURI from blockchain
    loadingMessage.value = 'Fetching certificate from blockchain...';
    const callData = encodeTokenURI(tokenId);
    
    const result = await rpcCall('eth_call', [{
      to: CONTRACT_ADDRESS,
      data: callData
    }, 'latest']);
    
    const tokenURI = decodeString(result);
    
    if (!tokenURI) {
      throw new Error(`No tokenURI found for token ${tokenId}`);
    }
    
    console.log('TokenURI:', tokenURI);
    
    // Step 2: Fetch metadata with gateway fallback
    loadingMessage.value = 'Loading certificate metadata...';
    const fetchedMetadata = await fetchMetadataWithFallback(tokenURI);
    
    metadata.value = fetchedMetadata;
    
    // Set initial image URL
    if (!certificateImage.value && fetchedMetadata.image) {
      certificateImage.value = fetchedMetadata.image;
    }
    
    loading.value = false;
    
  } catch (err) {
    console.error('Error fetching certificate:', err);
    error.value = true;
    loading.value = false;
    errorMessage.value = err.message || 'An unexpected error occurred';
    
    // Provide detailed error info in debug mode
    if (showDebugInfo.value) {
      errorDetails.value = JSON.stringify({
        tokenId: tokenId,
        error: err.toString(),
        stack: err.stack,
        fallbackAttempts: fallbackAttempts.value,
        timestamp: new Date().toISOString()
      }, null, 2);
    }
  }
}

// Retry fetching
function retryFetch() {
  fetchCertificate();
}

// On component mount
onMounted(() => {
  fetchCertificate();
});
</script>

<style scoped>
/* Container */
.coa-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
  animation: fadeIn 0.6s ease-out;
}

/* Header Section */
.coa-header {
  text-align: center;
  margin-bottom: 3rem;
  padding-bottom: 2rem;
  border-bottom: 2px solid var(--primary-teal);
}

.coa-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--deep-teal);
  margin-bottom: 0.5rem;
  letter-spacing: -0.5px;
}

.coa-subtitle {
  font-size: 1.125rem;
  color: var(--dark-gray);
  font-weight: 300;
}

/* Image Section */
.coa-image-container {
  background: var(--gray-50);
  border-radius: 1rem;
  padding: 2rem;
  margin-bottom: 3rem;
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
}

.coa-image {
  width: 100%;
  max-width: 600px;
  height: auto;
  border-radius: 0.75rem;
  display: block;
  margin: 0 auto;
}

/* Description Section */
.coa-description {
  background: linear-gradient(135deg, rgba(91, 209, 215, 0.05) 0%, rgba(8, 156, 162, 0.05) 100%);
  border-radius: 1rem;
  padding: 2rem;
  margin-bottom: 3rem;
}

.coa-description p {
  font-size: 1.125rem;
  line-height: 1.75;
  color: var(--dark-gray);
  margin: 0;
}

/* Attributes Section */
.coa-attributes {
  margin-bottom: 3rem;
}

.attributes-title {
  font-size: 1.875rem;
  font-weight: 600;
  color: var(--deep-teal);
  margin-bottom: 2rem;
  text-align: center;
}

.attributes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.attribute-item {
  background: var(--white);
  border: 1px solid var(--gray-200);
  border-radius: 0.75rem;
  padding: 1.5rem;
  transition: all 0.3s ease;
}

.attribute-item:hover {
  border-color: var(--primary-teal);
  box-shadow: 0 4px 12px rgba(91, 209, 215, 0.15);
  transform: translateY(-2px);
}

.attribute-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--deep-teal);
  margin-bottom: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.attribute-value {
  display: block;
  font-size: 1.125rem;
  color: var(--dark-gray);
  font-weight: 400;
  word-break: break-word;
}

/* Blockchain Info */
.blockchain-info {
  text-align: center;
  padding: 2rem;
  background: linear-gradient(135deg, var(--deep-teal) 0%, var(--primary-teal) 100%);
  border-radius: 1rem;
  color: var(--white);
}

.blockchain-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1rem;
  font-weight: 500;
  padding: 0.75rem 1.5rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2rem;
  backdrop-filter: blur(10px);
}

.blockchain-icon {
  width: 1.5rem;
  height: 1.5rem;
}

/* Loading State */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  gap: 1.5rem;
}

.loading-spinner {
  width: 3rem;
  height: 3rem;
  border: 3px solid var(--gray-200);
  border-top-color: var(--primary-teal);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.loading-text {
  font-size: 1.125rem;
  color: var(--dark-gray);
  font-weight: 300;
}

/* Error State */
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  gap: 1rem;
  padding: 2rem;
  text-align: center;
}

.error-icon {
  font-size: 3rem;
}

.error-title {
  font-size: 1.5rem;
  color: var(--deep-teal);
  margin: 0;
}

.error-message {
  font-size: 1rem;
  color: var(--dark-gray);
  max-width: 500px;
  margin: 0.5rem 0 1.5rem;
}

.retry-button {
  background: var(--primary-teal);
  color: white;
  border: none;
  padding: 0.75rem 2rem;
  border-radius: 0.5rem;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.3s ease;
}

.retry-button:hover {
  background: var(--deep-teal);
}

.error-details {
  margin-top: 2rem;
  width: 100%;
  max-width: 600px;
}

.error-details summary {
  cursor: pointer;
  color: var(--deep-teal);
  font-weight: 500;
  margin-bottom: 1rem;
}

.error-details pre {
  background: var(--gray-50);
  padding: 1rem;
  border-radius: 0.5rem;
  overflow-x: auto;
  text-align: left;
  font-size: 0.875rem;
}

/* Debug Info */
.debug-info {
  margin-top: 2rem;
  padding: 1rem;
  background: #f0f0f0;
  border-radius: 0.5rem;
  font-family: monospace;
  font-size: 0.875rem;
}

.debug-info h3 {
  margin-top: 0;
  color: var(--deep-teal);
}

.debug-info p {
  margin: 0.25rem 0;
}

/* Animations */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Responsive Design */
@media (max-width: 768px) {
  .coa-container {
    padding: 1rem;
  }
  
  .coa-title {
    font-size: 2rem;
  }
  
  .attributes-grid {
    grid-template-columns: 1fr;
  }
  
  .coa-image-container {
    padding: 1rem;
  }
}</style>