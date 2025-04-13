const hre = require("hardhat");

async function main() {
  await hre.run("compile");
  console.log("✔️ Contracts compiled successfully");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
