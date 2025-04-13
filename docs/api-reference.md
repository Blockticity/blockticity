# 📘 Blockticity API Reference

This document outlines the core API endpoints supporting the NFT redemption and verification workflows. These endpoints are intended for use by frontend clients (e.g., Privy-integrated dApps) and third-party redemption partners.

---

## 🔐 `POST /api/verify-session`

**Description**: Verifies a Privy session token and returns authenticated user details.

**Request Body**:

```json
{
  "session_token": "eyJhbGciOi..."
}

**Response**:
```json
{
  "email": "user@example.com",
  "wallet_address": "0x1234...abcd",
  "verified": true
}

That will close the ` ```json ` block cleanly.
