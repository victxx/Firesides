const { ethers } = require("ethers");
const fs = require("fs");
const path = require("path");

// Path to the compiled contract artifact. Ensure that you compile the contract first (e.g., via Hardhat or Truffle).
const artifactPath = path.resolve(__dirname, "../artifacts/Firesides.json");

if (!fs.existsSync(artifactPath)) {
  console.error("Contract artifact not found. Please compile your contract first.");
  process.exit(1);
}

const contractArtifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));

// Set up provider and wallet. Adjust the provider URL as needed (e.g., for a local network).
const provider = new ethers.providers.JsonRpcProvider("http://localhost:8545");

// Replace with your own private key (for testing only, do not commit your real key!).
const privateKey = "YOUR_PRIVATE_KEY_HERE";
const wallet = new ethers.Wallet(privateKey, provider);

async function main() {
  console.log("Deploying the Firesides contract...");
  const factory = new ethers.ContractFactory(contractArtifact.abi, contractArtifact.bytecode, wallet);
  const contract = await factory.deploy();
  await contract.deployed();
  console.log("Contract deployed at:", contract.address);
}

main().catch(error => {
  console.error("Error deploying contract:", error);
  process.exit(1);
}); 