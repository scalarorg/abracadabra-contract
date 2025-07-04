// SPDX-License-Identifier: MIT
// Compatible with OpenZeppelin Contracts ^5.0.0
pragma solidity ^0.8.0;

import { ERC20 } from "@BoringSolidity/ERC20.sol";
import { BoringOwnable } from "@BoringSolidity/BoringOwnable.sol";
import { BoringMath } from "@BoringSolidity/libraries/BoringMath.sol";

// contract ScalarToken is ERC20WithSupply, Ownable {
//     constructor(address initialOwner)
//         ERC20("ScalarToken", "STK")
//         Ownable(initialOwner)
//     {
//         _mint(msg.sender, 100000 * 10 ** 18);
//     }

//     function mint(address to, uint256 amount) public onlyOwner {
//         _mint(to, amount);
//     }
// }
/// @title Cauldron
/// @dev This contract allows contract calls to any contract (except BentoBox)
/// from arbitrary callers thus, don't trust calls from this contract in any circumstances.
contract sBTC is ERC20, BoringOwnable {
    using BoringMath for uint256;
    // ERC20 'variables'

    string public symbol = "sBTC";
    string public name = "Scalar BTC";
    uint8 public decimals = 18;
    uint256 public override totalSupply;

    function mint(address to, uint256 amount) public onlyOwner {
        require(to != address(0), "sBTC: no mint to zero address");
        totalSupply = totalSupply + amount;
        balanceOf[to] += amount;
        emit Transfer(address(0), to, amount);
    }

    function burn(uint256 amount) public {
        require(amount <= balanceOf[msg.sender], "sBTC: not enough");

        balanceOf[msg.sender] -= amount;
        totalSupply -= amount;
        emit Transfer(msg.sender, address(0), amount);
    }
}
