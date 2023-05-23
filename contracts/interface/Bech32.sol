/* SPDX-License-Identifier: LGPL-v3 */
pragma solidity ^0.8.9; 

address constant Bech32_PRECOMPILE_ADDRESS = 0x0000000000000000000000000000000000000400;

Bech32I constant BECH32CONTRACT = Bech32I(Bech32_PRECOMPILE_ADDRESS); 

interface Bech32I {
    function hexToBech32(address addr, string memory prefix) external returns (string memory bech32Address);
    function bech32ToHex(string memory bech32Address) external returns (address addr);
}