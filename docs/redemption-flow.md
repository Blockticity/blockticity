# Blockticity NFT Redemption Flow

This document outlines the standard redemption process for NFT-backed Certificates of Authenticity (COAs), particularly in cases where NFTs are pre-minted and later claimed by end users after an off-chain event (e.g., Shopify order, QR scan, or email verification).

---

## 🔁 High-Level Flow

1. **Item Ordered (Off-Chain)**
   - Customer purchases a physical item (e.g. signed memorabilia) via Shopify or verified channel.

2. **Trigger Claim Eligibility**
   - Shopify webhook or admin triggers NFT claim availability.
   - Customer receives a secure redemption link via email, QR code, or embedded portal.

3. **Privy Wallet Login**
   - Customer connects via Privy (social login or embedded wallet).
   - Claim app checks if their wallet/email is eligible.

4. **Claim NFT**
   - NFT has already been pre-minted and assigned a `tokenId`.
   - Once verified, the NFT is transferred from Blockticity’s custody wallet to the claimant's wallet.
   - Metadata remains immutable and verifiable via Blockticity’s COA system.

5. **NFT Viewable Onchain**
   - The customer can view the NFT on the Avalanche Subnet or bridged chain.
   - Additional utility or rewards can be unlocked based on token ownership.

---

## 🔐 Notes on Security

- Redemptions are gated by wallet or email hash eligibility.
- Each NFT can only be claimed once (checked on backend).
- Ownership is updated on-chain with full metadata traceability.

---

## 🔧 Tech Stack Used

- **Smart Contracts**: ERC721 (pre-minted), transfer on claim
- **Wallet Auth**: [Privy](https://www.privy.io/)
- **Backend**: Node.js, Express, Hardhat
- **Frontend**: Vue (soon React), optionally embedded in Shopify

---

## 🧪 Testing Checklist

- [ ] Privy login → wallet generated or connected
- [ ] Claim eligibility lookup works
- [ ] NFT successfully transferred to claimant
- [ ] On-chain ownership confirmed

---

## 🧩 Optional Extensions

- QR-based redemption at physical events
- Redemption bonus rewards via BTIC token
- Cross-chain COA mirroring via LayerZero

---

> 🔗 This flow powers the Players Ink redemption pilot for 500,000 NFTs tied to signed memorabilia.

