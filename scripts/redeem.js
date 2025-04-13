const { ethers } = require("hardhat");
const fs = require("fs");

// 👇 Load JSON-based allowlist
const allowlist = JSON.parse(fs.readFileSync("./scripts/allowlist.json", "utf-8"));

// 👇 Your deployed contract address here
const contractAddress = "0xYourDeployedCOAContractAddress";

// 👇 This wallet must currently own the token (e.g., Blockticity custody wallet)
async function main() {
  const [deployer] = await ethers.getSigners();
  const COA = await ethers.getContractAt("BlockticityCOA", contractAddress);

  console.log(`Using deployer: ${deployer.address}`);

  for (const entry of allowlist) {
    const { wallet, tokenId, claimed } = entry;

    if (claimed) {
      console.log(`❌ Token ${tokenId} already marked as claimed — skipping`);
      continue;
    }

    console.log(`🔄 Attempting to redeem token ID ${tokenId} to ${wallet}...`);

    try {
      const tx = await COA["safeTransferFrom(address,address,uint256)"](
        deployer.address,
        wallet,
        tokenId
      );
      await tx.wait();
      console.log(`✅ Token ID ${tokenId} transferred to ${wallet}`);

      // Mark as claimed (for backend JSON update)
      entry.claimed = true;
    } catch (err) {
      console.error(`❌ Failed to redeem token ${tokenId} → ${wallet}: ${err.message}`);
    }
  }

  // Optional: Write back updated status to allowlist.json
  fs.writeFileSync("./scripts/allowlist.json", JSON.stringify(allowlist, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
