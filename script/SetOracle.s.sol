// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0;

import { ProxyOracle } from "../src/oracles/ProxyOracle.sol";
import { BaseScript } from "./Base.s.sol";
import { ChainLinkOracleAdaptor } from "../src/oracles/ChainLinkOracleAdaptor.sol";
import { IOracle } from "../src/interfaces/IOracle.sol";

contract SetOracleScript is BaseScript {
    address proxy_oracle = 0xb24169E1A05786E4C993e15C3dBd3f1eB441DB50;

    function run() external broadcast {
        ChainLinkOracleAdaptor oracle =
            new ChainLinkOracleAdaptor(0x1b44F3514812d835EB1BDB0acB33d3fA3351Ee43, 18, "sBTC/sUSD", "sBTC/sUSD");
        ProxyOracle(proxy_oracle).changeOracleImplementation(IOracle(oracle));
    }
}
