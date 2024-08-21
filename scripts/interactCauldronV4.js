const { ethers } = require("hardhat");
async function main() {
  const [deployer] = await ethers.getSigners();
  console.log(
    "Deploying the contracts with the account:",
    await deployer.getAddress()
  );
  console.log("Account balance:", (await deployer.getBalance()).toString());

  const contractName = "CauldronV4";
  const contractArtifact = require(`../artifacts/contracts/${contractName}.sol/${contractName}.json`);
  const contractABI = contractArtifact.abi;
  const cauldronV4Contract = new ethers.Contract(
    "0xa8698F8696daeb8DcfCD483DA71F046763729A4f",
    contractABI,
    deployer
  );
  console.log(
    "Cauldron Bentobox address: ",
    await cauldronV4Contract.bentoBox()
  );
  console.log(
    "Cauldron masterContract address: ",
    await cauldronV4Contract.masterContract()
  );
  console.log(
    "Cauldron magicInternetMoney address: ",
    await cauldronV4Contract.magicInternetMoney()
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
