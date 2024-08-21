// !!! NOTICE: This test interacts with the Sepolia network and requires a Sepolia account with funds to pay for gas.
// !!! NOTICE: Be aware of the gas fees and account balance when running this test.

const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CauldronV4", function () {
  let cauldronV4Contract;
  let owner;

  beforeEach(async function () {
    const privateKey = process.env.ETHEREUM_PRIVATE_KEY;
    const provider = new ethers.providers.JsonRpcProvider(
      "https://eth-sepolia.public.blastapi.io"
    );
    owner = new ethers.Wallet(privateKey, provider);

    const contractName = "CauldronV4";
    const contractArtifact = require(`../artifacts/contracts/${contractName}.sol/${contractName}.json`);
    const contractABI = contractArtifact.abi;
    cauldronV4Contract = new ethers.Contract(
      "0xa8698F8696daeb8DcfCD483DA71F046763729A4f",
      contractABI,
      owner
    );
  });

  it("should get owner", async function () {
    expect(owner.address).to.equal(
      "0x130C4810D57140e1E62967cBF742CaEaE91b6ecE"
    );
  });

  it("should get CauldronV4", async function () {
    expect(cauldronV4Contract.address).to.equal(
      "0xa8698F8696daeb8DcfCD483DA71F046763729A4f" // TODO: update BurnContract address
    );
  });

  it("should connect with proper bentoBox and ScalarCoin", async function () {
    const bentoBoxAddress = await cauldronV4Contract.bentoBox();
    const scalarCoinAddress = await cauldronV4Contract.magicInternetMoney();
    expect(bentoBoxAddress).to.equal(
      "0x8D7c98dDA975fbe4F4589E808Ae5F1876Fdb1Ff5" // TODO: update BentoBox address
    );
    expect(scalarCoinAddress).to.equal(
      "0xB5065Df90c390a7c5318f822b0Fa96Cde2f33051" // TODO: update sBTC address
    );
  });
});
