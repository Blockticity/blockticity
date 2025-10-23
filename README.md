<div align="center">

# Blockticity

### Trustless Trade at Scale

**Blockchain Authentication for Real-World Assets**

[![ASTM D8558](https://img.shields.io/badge/ASTM-D8558%20Contributor-blue)](https://www.astm.org/d8558-24.html)
[![NVIDIA Inception](https://img.shields.io/badge/NVIDIA-Inception%20Program-76B900)](https://www.nvidia.com/en-us/startups/)
[![Avalanche](https://img.shields.io/badge/Avalanche-Fintech%20AI%20Grant-E84142)](https://www.avax.network/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

[Website](https://blockticity.io) • [Documentation](https://docs.blockticity.io) • [Explorer](https://subnets-test.avax.network/btest)

</div>

---

## 🎯 Mission

Enable **"Trustless Trade at Scale"** by creating a decentralized infrastructure for AI-native trade authentication. Blockticity serves as the blockchain authentication layer for global trade, making real-world documents verifiable, tamper-evident, and intelligent through our dedicated Layer 1 blockchain.

## 🌟 Overview

Blockticity solves the **$4.5 trillion problem** of fraudulent supply chain documentation by providing a decentralized, standards-based system where:

- ✅ **Certificates of Authenticity (COAs)** are minted as NFTs on Blockticity L1
- 🔗 **Physical products** connect to digital records through secure QR codes
- 🤖 **AI-powered analysis** (CoAi) detects inconsistencies and fraud
- 🔒 **Verifiable metadata** enables regulatory compliance
- 🌐 **Trustless verification** without centralized intermediaries

## 🏆 Key Achievements

- 📜 **ASTM D8558 Contributor** - First blockchain COA standard
- 💰 **$1.2B+ in authenticated RWAs** across multiple sectors
- 🎯 **750K+ COAs** minting target (June 2025)
- 🏅 **Avalanche Fintech AI Innovation Grant** recipient ($150K)
- 🚀 **NVIDIA Inception Program** member
- 🔥 **Plug and Play XDC Enterprise RWA Accelerator** participant

---

## 🏗️ Architecture

```
┌────────────────────────────────────────────────────────────────────────────┐
│                         BLOCKTICITY ECOSYSTEM                              │
├────────────────────────────────────────────────────────────────────────────┤
│                                                                            │
│  ┌─────────────────┐      ┌─────────────────┐      ┌──────────────────┐  │
│  │   QR Generator   │      │  COA Metadata   │      │   CoAi Verifier  │  │
│  │                 │      │   Processor     │      │  (AI Analysis)   │  │
│  │ • Batch QR Gen  │      │ • CSV → JSON    │      │ • Trust Scoring  │  │
│  │ • Logo Branding │      │ • IPFS Upload   │      │ • Fraud Detection│  │
│  │ • ZIP Archives  │      │ • Encryption    │      │ • Gradio UI      │  │
│  └────────┬────────┘      └────────┬────────┘      └────────┬────────┘  │
│           │                         │                         │            │
│           └─────────────────────────┴─────────────────────────┘            │
│                                     │                                      │
│                          ┌──────────▼──────────┐                          │
│                          │   MINTING LAYER     │                          │
│                          │                     │                          │
│                          │ • L1 Minting        │                          │
│                          │ • Gasless XDC       │                          │
│                          │ • Cross-chain       │                          │
│                          └──────────┬──────────┘                          │
│                                     │                                      │
│           ┌─────────────────────────┴─────────────────────────┐           │
│           │                                                   │           │
│  ┌────────▼────────┐      ┌────────▼────────┐      ┌────────▼────────┐  │
│  │  Backend API    │      │  QR Redirect    │      │  COA Viewer     │  │
│  │                 │      │    Server       │      │   Frontend      │  │
│  │ • NFT Claims    │      │ • Dynamic URLs  │      │ • Vue.js SPA    │  │
│  │ • Express.js    │      │ • Redis Cache   │      │ • COA Display   │  │
│  │ • Port 3002     │      │ • Port 3000     │      │ • Port 3001     │  │
│  └────────┬────────┘      └────────┬────────┘      └────────┬────────┘  │
│           │                         │                         │            │
│           └─────────────────────────┴─────────────────────────┘            │
│                                     │                                      │
│                          ┌──────────▼──────────┐                          │
│                          │  INFRASTRUCTURE    │                          │
│                          │                     │                          │
│                          │ • Blockticity L1    │                          │
│                          │ • IPFS (Pinata)     │                          │
│                          │ • PostgreSQL DB     │                          │
│                          │ • Redis Cache       │                          │
│                          └─────────────────────┘                          │
│                                                                            │
└────────────────────────────────────────────────────────────────────────────┘
```

---

## 🔗 Blockticity L1 Network

### Testnet Details
| Parameter | Value |
|-----------|-------|
| **Network Name** | Blockticity Testnet (BTEST) |
| **Chain ID** | 75234 |
| **Token Symbol** | BTEST |
| **Public RPC** | `https://subnets.avax.network/btest/testnet/rpc` |
| **Explorer** | [subnets-test.avax.network/btest](https://subnets-test.avax.network/btest) |
| **Contract Address** | `0x600D115075768548527BCcd156ccC921D7861f87` |
| **Contract Type** | BlockticityLayerZero (ERC-721) |

### Smart Contract Functions
```solidity
// Single NFT minting
function mintURI(address to, string uri) external;

// Safe mint without URI
function safeMint(address to) external;

// Batch minting to multiple recipients
function batchMintURI(address[] recipients, string[] uris) external;
```

---

## 🛠️ Technology Stack

### Frontend
- **Framework**: Vue 3 + Vite
- **UI**: Responsive design with Blockticity branding
- **State Management**: Pinia
- **Routing**: Vue Router

### Backend
- **Runtime**: Node.js + Express.js
- **Database**: PostgreSQL (RDS Multi-AZ)
- **Cache**: Redis (ElastiCache)
- **Storage**: IPFS via Pinata

### Blockchain
- **L1**: Blockticity (Avalanche Subnet)
- **Smart Contracts**: Solidity 0.8.20
- **Framework**: Hardhat
- **Cross-chain**: LayerZero Protocol

### AI/ML
- **Model**: CoAi - Certificate of Authenticity Intelligence
- **Framework**: Python + Gradio
- **Capabilities**: Trust scoring, fraud detection, anomaly detection

---

## 📦 System Modules

### Core Repositories

| Module | Description | Tech Stack |
|--------|-------------|-----------|
| **blockticity-backend** | Express.js API server for NFT claims | Node.js, Express |
| **blockticity-minting** | Smart contract development & deployment | Hardhat, Solidity |
| **blockticity-l1-minting** | L1 blockchain minting functionality | ethers.js, IPFS |
| **blockticity-coa-viewer** | COA display frontend (this repo) | Vue 3, Vite |
| **blockticity-qr-generator** | Batch QR code generation | Node.js, QR libraries |
| **blockticity-qr-redirect** | Dynamic QR routing server | Express, Redis |
| **blockticity-coai-verifier** | AI-powered COA verification | Python, Gradio |
| **blockticity-gasless-xdc** | Gasless transactions on XDC | Solidity, Relayer |
| **blockticity-metadata-privacy-demo** | Encrypted metadata access control | Vue 3, Crypto |

---

## 🚀 Quick Start

### Prerequisites
```bash
node >= 18.x
npm >= 9.x
git
```

### Installation
```bash
# Clone the repository
git clone https://github.com/blockticity/blockticity.git
cd blockticity

# Install dependencies
npm install

# Configure environment
cp .env.template .env
# Edit .env with your configuration

# Start development server
npm run dev
```

### Environment Variables
```bash
# Blockchain Configuration
PRIVATE_KEY=your_wallet_private_key
RPC_URL=https://subnets.avax.network/btest/testnet/rpc
CONTRACT_ADDRESS=0x600D115075768548527BCcd156ccC921D7861f87

# IPFS Storage (Pinata)
PINATA_API_KEY=your_api_key
PINATA_SECRET_API_KEY=your_secret_key
```

### Build for Production
```bash
npm run build
```

---

## 📖 Documentation

### Integration Flow
```
1. CSV Data Input
   └─► QR Generator creates branded QR codes

2. Metadata Processing
   └─► JSON generation → IPFS upload → Returns hash

3. NFT Minting
   └─► L1 script calls mintURI() → Links IPFS to token

4. QR Code Activation
   └─► User scans → Redirect server → COA Viewer

5. AI Verification
   └─► CoAi analyzes metadata → Trust score → Flag issues
```

### Standards Compliance

#### ASTM D8558 Implementation
Blockticity is a contributor to **ASTM D8558**, the first blockchain COA standard, ensuring:
- ✅ Tamper-evident design with immutable ledger entries
- ✅ Multi-layer verification (tracing, authentication, validation, oversight)
- ✅ International compliance (EU Regulation 2023/1115)
- ✅ Industry consensus and interoperability

---

## 🎨 Brand Guidelines

### Colors
```css
--primary-teal: #5BD1D7      /* Bright Teal */
--secondary-teal: #089Ca2     /* Deep Teal */
--neutral-gray: #5A5A5A       /* Dark Gray */
--background-white: #FFFFFF   /* White */
```

### Typography
- **Primary Font**: Roboto
- **Design Style**: Flat/minimalistic with generous white space

---

## 🔒 Security Features

- 🔐 **TLS 1.3** encryption for all traffic
- 🛡️ **AWS WAF** with OWASP Top 10 rules
- 🔑 **Secrets management** via AWS Secrets Manager
- 📝 **Audit logging** with CloudTrail
- 💾 **Automated backups** with 30-day retention

---

## 🗺️ Roadmap

### Q2 2025
- ✅ Testnet scaling to 500K+ COAs
- 🎯 Mainnet launch with audited contracts
- 🎯 750K+ COAs minting milestone
- 🎯 Validator node sales

### Q3 2025
- 🧠 CoAi MVP with anomaly detection (<2% anomaly rate)
- 📊 Public trade intelligence dashboard
- 🛠️ GPU-powered validators pilot (NVIDIA NIM containers)

### Q4 2025
- 🎉 1M COAs milestone
- 🚀 First decentralized AI inference execution
- 🌐 Cross-industry insights platform

---

## 🤝 Strategic Partnerships

<div align="center">

[![Avalanche](https://img.shields.io/badge/Avalanche-Blizzard%20Fund-E84142?style=for-the-badge)](https://www.avax.network/)
[![NVIDIA](https://img.shields.io/badge/NVIDIA-Inception-76B900?style=for-the-badge)](https://www.nvidia.com/en-us/startups/)
[![Plug and Play](https://img.shields.io/badge/Plug%20and%20Play-RWA%20Accelerator-FF6B35?style=for-the-badge)](https://www.plugandplaytechcenter.com/)
[![ASTM](https://img.shields.io/badge/ASTM-D8558%20Standard-0033A0?style=for-the-badge)](https://www.astm.org/d8558-24.html)

</div>

---

## 📊 Network Effects & Value Flywheel

```
More COAs Minted → Network Value ↑ → Enhanced Validator Activity
      ↑                                           ↓
Industry Adoption ← Stakeholder Value ← More Token Utility
```

### Compounding Mechanisms
- 📈 **Data Network Effects**: AI improves with transaction volume
- 🔍 **Cross-industry Insights**: Pattern detection across sectors
- 📐 **Standards Adoption**: Wider implementation = more utility
- ⚡ **Validator Economics**: More transactions = better decentralization

---

## 📞 Contact & Resources

- 🌐 **Website**: [blockticity.io](https://blockticity.io)
- 📚 **Documentation**: [docs.blockticity.io](https://docs.blockticity.io)
- 🔍 **Block Explorer**: [subnets-test.avax.network/btest](https://subnets-test.avax.network/btest)
- 🐦 **Twitter**: [@blockticity](https://twitter.com/blockticity)
- 💼 **LinkedIn**: [Blockticity](https://linkedin.com/company/blockticity)
- 📧 **Email**: contact@blockticity.io

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- ASTM International for standards collaboration
- Avalanche Foundation for Fintech AI Innovation Grant
- NVIDIA Inception Program for AI infrastructure support
- Plug and Play Tech Center for accelerator mentorship
- XDC Network for enterprise blockchain integration

---

<div align="center">

### Built with ❤️ by the Blockticity Team

**Trustless Trade at Scale**

</div>
