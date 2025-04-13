const { verifyPrivyToken } = require("./privyVerify");
const allowlist = require("./allowlist.json");
const redeem = require("./redeem");

// Mock session token for local testing – replace with real Privy JWT if needed
const mockSessionToken = "eyJhbGciOi..."; // Replace with test token

async function main() {
  try {
    const user = await verifyPrivyToken(mockSessionToken);

    if (!user) {
      console.log("❌ Invalid Privy session.");
      return;
    }

    const email = user.email;
    const wallet = user.wallet_address;

    if (!allowlist[email]) {
      console.log(`❌ ${email} is not eligible to redeem.`);
      return;
    }

    console.log(`✅ ${email} is eligible. Proceeding to redeem...`);
    await redeem(wallet); // Or redeem(email) if tied to email-to-tokenId
  } catch (err) {
    console.error("❌ Error in redeem.test.js:", err);
  }
}

main();
