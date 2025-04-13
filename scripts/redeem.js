const { ethers } = require("hardhat");

// Simulated pre-minting data
const tokenId = 1234; // Example pre-minted token
const claimantAddress = "0xUserWalletAddressHere"; // Replace with real user wallet
const contractAddress = "0xYourDeployedCOAContractAddress"; // Replace with actual deployed contract

async function main() {
  const [deployer] = await ethers.getSigners(); // Must be the current owner of the token

  console.log(`Claiming token ID ${tokenId} to ${claimantAddress} from ${deployer.address}...`);

  const COA = await ethers.getContractAt("BlockticityCOA", contractAddress);

  const tx = await COA["safeTransferFrom(address,address,uint256)"](
    deployer.address,
    claimantAddress,
    tokenId
  );

  await tx.wait();
  console.log(`✅ Token ID ${tokenId} successfully transferred to ${claimantAddress}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
