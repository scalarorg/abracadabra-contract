// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import { Clones } from "@openzeppelin/proxy/Clones.sol";
import { CauldronV4 } from "./CauldronV4.sol";

contract CauldronFactory {
    address public masterContract;

    event CauldronCloned(address indexed clone);

    constructor(address _masterContract) {
        masterContract = _masterContract;
    }

    function createCauldron(bytes calldata data) external returns (address) {
        address clone = Clones.clone(masterContract);
        CauldronV4(clone).init(data);
        emit CauldronCloned(clone);
        return clone;
    }
}
