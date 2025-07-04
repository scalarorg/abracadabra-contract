const { ethers } = require("hardhat");
const path = require("path");
async function main() {
  // This is just a convenience check

  const [deployer, user1, user2] = await ethers.getSigners();
  console.log(
    "Deploying the contracts with the account:",
    await deployer.getAddress()
  );

  console.log("Account balance:", (await deployer.getBalance()).toString());

  // Deploy the ScalarCoin contract
  const Token = await ethers.getContractFactory("StableCoin");
  const token = await Token.deploy();
  await token.deployed();
  console.log("Token address:", token.address);
  // Deploy the WETH contract
  const WETH = await ethers.getContractFactory("WETH");
  const weth = await WETH.deploy();
  await weth.deployed();
  console.log("WETH address:", weth.address);
  // Deploy the sBTC contract
  const SBTC = await ethers.getContractFactory("sBTC");
  const sbtc = await SBTC.deploy();
  await sbtc.deployed();
  console.log("sBTC address:", sbtc.address);
  // Deploy the DegenBox contract
  const DegenBox = await ethers.getContractFactory("DegenBox");
  const degenBox = await DegenBox.deploy(weth.address);
  await degenBox.deployed();
  console.log("DegenBox address:", degenBox.address);
  // Deploy the CauldronV4 contract
  const CauldronV4 = await ethers.getContractFactory("CauldronV4");
  const cauldronV4 = await CauldronV4.deploy(degenBox.address, token.address);
  await cauldronV4.deployed();

  // Deploy oracle
  const Oracle = await ethers.getContractFactory("FixedPriceOracle");
  const decimals = 18;
  const fixedPrice = 1e13;
  const desc = "sBTC/USD";
  const oracle = await Oracle.deploy(desc, fixedPrice, decimals);
  await oracle.deployed();

  // Proxy oracle
  const OracleProxy = await ethers.getContractFactory("ProxyOracle");
  const oracleProxy = await OracleProxy.deploy();
  await oracleProxy.deployed();

  // Set oracle
  console.log(
    "Oracle Implementation address before set:",
    await oracleProxy.oracleImplementation()
  );
  const txChangeOracle = await oracleProxy.changeOracleImplementation(
    oracle.address
  );
  await txChangeOracle.wait();

  console.log(
    "Oracle Implementation address:",
    await oracleProxy.oracleImplementation()
  );

  // Clone CauldronV4
  const CauldronFactory = await ethers.getContractFactory("CauldronFactory");
  const cauldronFactory = await CauldronFactory.deploy(cauldronV4.address);
  await cauldronFactory.deployed();
  console.log("CauldronFactory address:", cauldronFactory.address);
  // Setting variables for sBTC market
  const collateralAddress = sbtc.address; // Address of the collateral token
  const oracleAddress = oracleProxy.address; // Address of the oracle
  const oracleData = "0x"; // Data required by the oracle
  const INTEREST_PER_SECOND = (ethers.BigNumber.from(600) * 316880878) / 100; // Example value
  const LIQUIDATION_MULTIPLIER = ethers.BigNumber.from(600) * 1e1 + 1e5; // Example value
  const COLLATERIZATION_RATE = ethers.BigNumber.from(8000) * 1e1; // Example value
  const BORROW_OPENING_FEE = ethers.BigNumber.from(50) * 1e1; // Example value

  // ABI encode the values
  const initData = ethers.utils.defaultAbiCoder.encode(
    ["address", "address", "bytes", "uint64", "uint256", "uint256", "uint256"],
    [
      collateralAddress,
      oracleAddress,
      oracleData,
      INTEREST_PER_SECOND,
      LIQUIDATION_MULTIPLIER,
      COLLATERIZATION_RATE,
      BORROW_OPENING_FEE,
    ]
  );

  // Clone CauldronV4 for sBTC market
  const tx = await cauldronFactory.createCauldron(initData);
  const receipt = await tx.wait();
  const event = receipt.events.find(
    (event) => event.event === "CauldronCloned"
  );
  const sBTCMarketAddress = event.args[0];
  console.log("Clone address:", sBTCMarketAddress);

  const contractName = "CauldronV4";
  const contractArtifact = require(`../artifacts/contracts/${contractName}.sol/${contractName}.json`);
  const contractABI = contractArtifact.abi;
  const sBTCMarketContract = new ethers.Contract(
    sBTCMarketAddress,
    contractABI,
    deployer
  );

  // Set whitelistMasterContract to CauldronV4
  const txWhitelist = await degenBox.whitelistMasterContract(
    cauldronV4.address,
    true
  );
  await txWhitelist.wait();
  console.log(
    "Master contract whitelisted",
    await degenBox.whitelistedMasterContracts(cauldronV4.address)
  );
  const maxUint256 = ethers.constants.MaxUint256;

  // Approve degenBox to spend ScalarCoin
  const txApproveSUSD = await token.approve(degenBox.address, maxUint256);
  await txApproveSUSD.wait();

  // Approve degenBox to spend sBTC tokens
  const txApproveSBTC = await sbtc.approve(degenBox.address, maxUint256);
  await txApproveSBTC.wait();

  // Approve degenBox to spend WETH tokens
  const txApproveWETH = await weth.approve(degenBox.address, maxUint256);
  await txApproveWETH.wait();

  const SBTCDecimals = 18;
  const SUSDDecimals = 18;

  const amountSBTC = ethers.utils.parseUnits("10000", SBTCDecimals)
  const amountSUSD = ethers.utils.parseUnits("3000000", SUSDDecimals)

  // mint sBTC to deployer
  const txMintsBTC = await sbtc.mint(
    deployer.address,
    amountSBTC
  );
  console.log("Mint sBTC tx hash: ", txMintsBTC);
  await txMintsBTC.wait();
  const txMintSUSD = await token.mint(
    deployer.address,
    amountSUSD
  );
  await txMintSUSD.wait();

  const txSUSDDeposit = await degenBox.deposit(
    token.address,
    deployer.address,
    sBTCMarketContract.address,
    amountSUSD,
    0
  );
  await txSUSDDeposit.wait();

  // Deploy the MarketLens contract
  const MarketLens = await ethers.getContractFactory("MarketLens");
  const marketLens = await MarketLens.deploy();
  await marketLens.deployed();
  console.log(
    await marketLens.getMarketInfoCauldronV3(sBTCMarketContract.address)
  );
  const collateralPrice = await marketLens.getCollateralPrice(
    sBTCMarketContract.address
  );
  console.log("Collateral price: ", ethers.utils.formatUnits(collateralPrice, 18));


  // stableCoin: "0x83Da78aE946947E9971F0722E1a9f4AeFeD94361",
  // sbtc: "0xDd3eC5c66d262E54D7f6Db7567C6b24d20C03a03",
  // market: "0xa44644C296605c3736708d2fC6e5014f678B4fED",
  // lens: "0xDACFbE30e6f65d58273EB062CEaC326b6A0BE45D"

  // Save the contract's artifacts and address in the frontend directory
  const fs = require("fs");
  fs.writeFileSync(
    path.join("contract-addresses.json"),
    JSON.stringify({
      stableCoin: token.address,
      sbtc: sbtc.address,
      lens: marketLens.address,
      market: sBTCMarketAddress,
      WETH: weth.address,
      DegenBox: degenBox.address,
      CauldronV4: cauldronV4.address,
      FixedPriceOracle: oracle.address,
      ProxyOracle: oracleProxy.address,
      CauldronFactory: cauldronFactory.address,
    }, undefined, 2)
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });



// Client-side test

// Set masterContract approval to user1
// const txApproval = await degenBox
//   .connect(user1)
//   .setMasterContractApproval(
//     user1.address,
//     cauldronV4.address,
//     true,
//     0,
//     ethers.constants.HashZero,
//     ethers.constants.HashZero
//   );
// await txApproval.wait();

// // User deposit ETH to the market
// // amount = 100 token
// console.log(
//   "User1 account balance before mint:",
//   (await user1.getBalance()).toString()
// );

// console.log(
//   "User WETH balance before deposit: ",
//   (await degenBox.balanceOf(weth.address, user1.address)).toString()
// );
// console.log(
//   "User1 account balance before deposit:",
//   (await user1.getBalance()).toString()
// );
// const depositAmount = ethers.utils.parseEther("1");
// const tx4 = await degenBox
//   .connect(user1)
//   .deposit(etherAddress, user1.address, user1.address, depositAmount, 0, {
//     value: depositAmount,
//   });
// // deposit function return (uint256 amountOut, uint256 shareOut), get the shareOut
// const receipt4 = await tx4.wait();
// const event2 = receipt4.events.find((event) => event.event === "LogDeposit");
// const shareAmount = event2.args[3];
// console.log("Share amount: ", shareAmount);
// console.log(
//   "User WETH balance after deposit: ",
//   (await degenBox.balanceOf(weth.address, user1.address)).toString()
// );
// console.log(
//   "User1 account balance after deposit:",
//   (await user1.getBalance()).toString()
// );
// // Add collateral for user1
// const tx5 = await sBTCMarketContract
//   .connect(user1)
//   .addCollateral(user1.address, false, shareAmount);
// await tx5.wait();
// console.log(
//   "User1 WETH before borrow: ",
//   (await degenBox.balanceOf(weth.address, user1.address)).toString()
// );
// // Calculate the borrow amount
// const oracleDataTemp = await sBTCMarketContract.oracleData();
// const [_, oracleRate] = await oracleProxy.callStatic.get(oracleDataTemp);
// const amountOut = (depositAmount * oracleRate) / 1e18;
// // const amountOut = (1e8 * depositAmount) / oracleRate;
// const borrowAmount = Math.floor((amountOut * 50) / 100);
// // User1 borrow
// const txBorrow = await sBTCMarketContract
//   .connect(user1)
//   .borrow(user1.address, borrowAmount);
// const receiptBorrow = await txBorrow.wait();

// const eventBorrow = receiptBorrow.events.find(
//   (event) => event.event === "LogBorrow"
// );
// const borrowTotalAmount = eventBorrow.args[2];

// // Withdraw
// console.log(
//   "User1 USD before withdraw: ",
//   (await degenBox.balanceOf(token.address, user1.address)).toString()
// );
// console.log(
//   "User1 WETH before withdraw: ",
//   (await degenBox.balanceOf(weth.address, user1.address)).toString()
// );
// const txWithdraw = await degenBox
//   .connect(user1)
//   .withdraw(token.address, user1.address, user1.address, borrowAmount, 0);
// const receiptWithdraw = await txWithdraw.wait();
// const eventWithdraw = receiptWithdraw.events.find(
//   (event) => event.event === "LogWithdraw"
// );
// const withdrawAmount = eventWithdraw.args[3];
// console.log("Withdraw amount: ", withdrawAmount);