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
          :src="metadata.image"
          alt="Certificate of Authenticity"
          class="coa-image"
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
    </div>

    <!-- Loading State -->
    <div v-else class="loading-container">
      <div class="loading-spinner"></div>
      <p class="loading-text">Loading certificate...</p>
    </div>
  </CoAAccessGate>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import CoAAccessGate from '../components/CoAAccessGate.vue';

const route = useRoute();
const tokenId = route.params.id;
const userEmail = ''; // Placeholder for Privy logic

const metadata = ref(null);

// Blockchain configuration
const RPC_URL = 'https://testnet-btest-ub57a.avax-test.network/ext/bc/2GMLdy7Fmb2FqA1EyHsUVre5rj1W5upmsDwqyKT1FEvJgWg79z/rpc?token=f3d07db83ce3d2ed8cd5e844136e7f5fbf66e7e7e83b11a984dfb6fdf5f99eba';
const CONTRACT_ADDRESS = '0x600D115075768548527BCcd156ccC921D7861f87';

// IPFS Gateways for fallback
const IPFS_GATEWAYS = [
  'https://ipfs.io/ipfs/',
  'https://gateway.pinata.cloud/ipfs/',
  'https://nftstorage.link/ipfs/',
  'https://w3s.link/ipfs/'
];

// Helper functions
async function rpcCall(method, params) {
  const response = await fetch(RPC_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      method: method,
      params: params,
      id: 1
    })
  });
  const data = await response.json();
  if (data.error) throw new Error(data.error.message);
  return data.result;
}

function encodeTokenURI(tokenId) {
  const paddedTokenId = parseInt(tokenId).toString(16).padStart(64, '0');
  return '0xc87b56dd' + paddedTokenId;
}

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
    return '';
  }
}

function extractIPFSHash(url) {
  const match = url.match(/ipfs:\/\/(.+)|\/ipfs\/(.+)/);
  return match ? (match[1] || match[2]) : url;
}

async function fetchWithFallback(ipfsUrl) {
  const hash = extractIPFSHash(ipfsUrl);
  
  for (const gateway of IPFS_GATEWAYS) {
    try {
      const url = gateway + hash;
      const response = await fetch(url, { signal: AbortSignal.timeout(10000) });
      if (response.ok) {
        return await response.json();
      }
    } catch (err) {
      console.log(`Gateway ${gateway} failed, trying next...`);
    }
  }
  throw new Error('Failed to fetch from all gateways');
}

onMounted(async () => {
  try {
    // Get tokenURI from blockchain
    const callData = encodeTokenURI(tokenId);
    const result = await rpcCall('eth_call', [{
      to: CONTRACT_ADDRESS,
      data: callData
    }, 'latest']);
    
    const tokenURI = decodeString(result);
    if (!tokenURI) throw new Error('No tokenURI found');
    
    // Fetch metadata with gateway fallback
    metadata.value = await fetchWithFallback(tokenURI);
  } catch (err) {
    console.error('Failed to fetch metadata:', err);
  }
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
