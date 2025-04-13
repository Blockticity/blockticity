const hre = require("hardhat");

async function main() {
  const COA = await hre.ethers.getContractFactory("BlockticityCOA");
  const contract = await COA.deploy();

  await contract.deployed();
  console.log(`✅ BlockticityCOA deployed at: ${contract.address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
