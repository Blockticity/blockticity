const jwt = require("jsonwebtoken");
const { createRemoteJWKSet, jwtVerify } = require("jose");

// 🔐 Replace with your actual Privy App ID
const PRIVY_JWKS_URL = "https://auth.privy.io/api/v1/apps/cm9aidvqs00hbl40ney7ta2rj/jwks.json";
const JWKS = createRemoteJWKSet(new URL(PRIVY_JWKS_URL));

async function verifyPrivyToken(sessionToken) {
  try {
    const { payload } = await jwtVerify(sessionToken, JWKS, {
      issuer: "privy.io",
    });

    console.log("✅ Valid Privy session");
    console.log("👤 User ID:", payload.sub);
    console.log("📧 Email:", payload.email_address);
    console.log("👛 Wallet:", payload.wallet_address);

    return {
      userId: payload.sub,
      email: payload.email_address,
      wallet: payload.wallet_address
    };
  } catch (err) {
    console.error("❌ Invalid Privy session token:", err.message);
    return null;
  }
}

// 🧪 Example usage
const mockToken = "PASTE-A-REAL-TOKEN-HERE";
verifyPrivyToken(mockToken);
