const hre = require("hardhat");

async function main() {
  console.log("🚀 Deploying FarmChain contract...\n");

  const FarmChain = await hre.ethers.getContractFactory("FarmChain");
  const farmchain = await FarmChain.deploy();

  await farmchain.waitForDeployment();

  const address = await farmchain.getAddress();

  console.log("✅ FarmChain deployed to:", address);
  console.log("\n📝 Add this to your backend .env file:");
  console.log(`CONTRACT_ADDRESS=${address}`);
  console.log("\n🔗 View on Etherscan:");
  console.log(`https://sepolia.etherscan.io/address/${address}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });