# Description

Solidity code and scripts for deploying and interacting with Abracadabra

## Sepolia Deployed Contract

| Token            | Address                                    |
| ---------------- | ------------------------------------------ |
| ScalarCoin       | 0xB5065Df90c390a7c5318f822b0Fa96Cde2f33051 |
| WETH             | 0xa9B990DA7CCde3eF3641aEEAE6d5fAEeC4432f10 |
| sBTC             | 0xa32e5903815476Aff6E784F5644b1E0e3eE2081B |
| DegenBox         | 0x8D7c98dDA975fbe4F4589E808Ae5F1876Fdb1Ff5 |
| CauldronV4       | 0xa8698F8696daeb8DcfCD483DA71F046763729A4f |
| FixedPriceOracle | 0x9DDdCA5647163448B3D7eE8Eb79b466B5842036B |
| ProxyOracle      | 0xD9139318aa0aEBdE732040Ba04F4658Cf0Bc441F |
| CauldronFactory  | 0x66f0C6fFdE88432d1a12caD0F26e09762433Ba1B |
| MarketLens       | 0x91d25b4e4838Fc02A66ad0A5831149C72BA15516 |
| sBTCMarket       | 0x1e18a44a86c79bEB9153B2A6566f6c4D05D48f12 |

## Quick start

The first things you need to do are cloning this repository and installing its
dependencies (you may need to nvm use version > 16):

```sh
npm install
```

Now you can run scripts using:

```sh
npx hardhat run scripts/script-name.js --network sepolia
```

## Scripts explain

### Deploy contract

Scripts to deploy smart contract usually begin with this pattern:

```javascript
const gatewayAddress = "0x1811AE0B97479b77258CF8aAda7768aB74e21aE9"; // Params passed to constructor of BurnContract
const gasServiceAddress = "0xbE406F0189A0B4cf3A05C286473D23791Dd44Cc6"; // Params passed to constructor of BurnContract
const sbtcAddress = "0xa32e5903815476Aff6E784F5644b1E0e3eE2081B"; // Params passed to constructor of BurnContract

const BurnContract = await ethers.getContractFactory("BurnContract");
const burnContract = await BurnContract.deploy(
  gatewayAddress,
  gasServiceAddress,
  sbtcAddress
);
await burnContract.deployed();
```

At the end of the deployment script, the contract abi and address will be saved to the `abis` folder.

```javascript
saveABI([
  {
    name: "BurnContract",
    address: burnContract.address,
  },
]);
```

### Interaction with deployed contracts

Scripts to test or interact with smart contract usually begin with this pattern:

```javascript
const contractName = "BurnContract";
const contractArtifact = require(`../artifacts/contracts/${contractName}.sol/${contractName}.json`);
const contractABI = contractArtifact.abi;
const burnContract = new ethers.Contract(
  "0x6F111e169710C6c3a33948c867aE425A74cDa1a3", // TODO: update BurnContract address
  contractABI,
  signer
);
```

This code is used to get the contract instance by contract ABI and address.  
When running any scripts, check the contract address and update it if necessary.

When calling get methods of a contract (public attributes or view functions), you just need to:

```javascript
const result = await burnContract.getSomeValue();
```

However, when calling set methods of a contract (functions that change the state of the contract), you need to sign the transaction before sending it:

```javascript
const tx = await burnContract.setSomeValue(newValue);
await tx.wait();
```
