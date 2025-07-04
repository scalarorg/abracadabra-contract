// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0;

import { ProxyOracle } from "../src/oracles/ProxyOracle.sol";
import { FixedPriceOracle } from "../src/oracles/FixedPriceOracle.sol";
import { DegenBox } from "../src/DegenBox.sol";
import { BaseScript } from "./Base.s.sol";
import { IMintableBurnableERC20 } from "../src/interfaces/IMintableBurnableERC20.sol";
import { ICauldronV2 } from "../src/interfaces/ICauldronV2.sol";
import { ICauldronV3 } from "../src/interfaces/ICauldronV3.sol";
import { MarketLens } from "../src/lens/MarketLens.sol";
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
    function getMarketInfoCauldronV3(ICauldronV3 cauldron) external view returns (MarketLens.MarketInfo memory);
}

contract PrepareLiquidityScript is BaseScript {
    address public constant SUSD = 0x4eB9BeA4ba5E18c9dbca58f320916c4740C9abD1;
    address public constant SBTC = 0x3806E25A0ea6e312A47E2CeE5518436F41be836b;
    address public constant DEGEN_BOX = 0xBF19E842AeEc98Cd9D3028f3c68b868a90AbD708;
    address public constant SBTC_MARKET = 0x0Eb23d1C99378388F9f6f1Efd811856a217f94DD;
    address public constant MARKET_LENS = 0xB1b6894c7fF9B7cfd93F3285B2f91Ab44cd941eD;

    function run() external broadcast {
        console2.log("Broadcaster:", msg.sender);
        // IMintableBurnableERC20(SBTC).mint(msg.sender, 1000 ether);
        // IMintableBurnableERC20(SUSD).mint(msg.sender, 1e9 ether);
        // IDegenBox(DEGEN_BOX).deposit(IMintableBurnableERC20(SUSD), msg.sender, SBTC_MARKET, 1e9 ether, 0);

        uint256 collateralPrice = IMarketLens(MARKET_LENS).getCollateralPrice(ICauldronV2(SBTC_MARKET));

        console2.log(collateralPrice);

        MarketLens.MarketInfo memory marketInfo =
            IMarketLens(MARKET_LENS).getMarketInfoCauldronV3(ICauldronV3(SBTC_MARKET));

        console2.log(marketInfo.oracleExchangeRate);
    }
}
