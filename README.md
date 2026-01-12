# Foundry Template

A template for Foundry projects.

## Overview

This project is a template for Foundry projects.

## Prerequisites

- [Foundry](https://book.getfoundry.sh/getting-started/installation)
- [Bun](https://bun.sh/) (or Node.js)

## Installation

1. Clone the repository:

```sh
git clone https://github.com/0xdavid7/foundry-template.git
cd foundry-template
```

2. Install dependencies:

```sh
bun install
```

## Environment Setup

Create a `.env` file in the root directory with the following variables:

```sh
ALCHEMY_API_KEY=
API_KEY_ETHERSCAN=
PRIVATE_KEY=
```

## Testing

Run all tests:

```sh
make test-all
```

Run specific test:

```sh
make test <test-file>
```

## How to deploy

1. Default deployment:

```sh
make deploy
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
