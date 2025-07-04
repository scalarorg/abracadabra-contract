// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0;

import { ProxyOracle } from "../src/oracles/ProxyOracle.sol";
import { FixedPriceOracle } from "../src/oracles/FixedPriceOracle.sol";
import { DegenBox } from "../src/DegenBox.sol";
import { BaseScript } from "./Base.s.sol";
import { IMintableBurnableERC20 } from "../src/interfaces/IMintableBurnableERC20.sol";
import { ICauldronV2 } from "../src/interfaces/ICauldronV2.sol";
import { console2 } from "forge-std/console2.sol";

interface IDegenBox {
    function deposit(
        IMintableBurnableERC20 token_,
        address from,
        address to,
        uint256 amount,
        uint256 share
    )
        external
        payable
        returns (uint256 amountOut, uint256 shareOut);
}

interface IMarketLens {
    function getCollateralPrice(ICauldronV2 cauldron) external view returns (uint256);
}

contract PrepareLiquidityScript is BaseScript {
    address public constant SUSD = 0x68C8f8Cf7983b7caC2BE9Ba25817e211B3Da7377;
    address public constant SBTC = 0x55df835d1e881dA3a75ad7C676c4233234133815;
    address public constant DEGEN_BOX = 0x388873725F97BBEAa02ee082029ebdE72C654430;
    address public constant SBTC_MARKET = 0x9D83C9F703dce6ea9efcE8473587233bfcd8ef51;
    address public constant MARKET_LENS = 0x350f611839C26FA96DFb4C893a60cEeC7F2A483E;

    function run() external broadcast {
        console2.log("Broadcaster:", msg.sender);
        IMintableBurnableERC20(SBTC).mint(msg.sender, 1000 ether);
        IMintableBurnableERC20(SUSD).mint(msg.sender, 1e9 ether);
        IDegenBox(DEGEN_BOX).deposit(IMintableBurnableERC20(SUSD), msg.sender, SBTC_MARKET, 1e9 ether, 0);

        uint256 collateralPrice = IMarketLens(MARKET_LENS).getCollateralPrice(ICauldronV2(SBTC_MARKET));

        console2.log(collateralPrice);
    }
}
