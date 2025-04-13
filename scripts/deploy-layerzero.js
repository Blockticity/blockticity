const hre = require("hardhat");

async function main() {
  // 👇 Fuji (Avalanche Testnet) LayerZero endpoint
  const lzEndpoint = "0x3c2269811836af69497E5F486A85D7316753cf62";

  const LayerZeroCOA = await hre.ethers.getContractFactory("BlockticityLayerZero");
  const contract = await LayerZeroCOA.deploy(lzEndpoint);

  await contract.deployed();

  console.log(`✅ BlockticityLayerZero deployed at: ${contract.address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
