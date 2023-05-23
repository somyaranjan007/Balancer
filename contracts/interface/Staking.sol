/* SPDX-License-Identifier: LGPL-v3 */
pragma solidity ^0.8.9;

address constant STAKING_PRECOMPILE_ADDRESS = 0x0000000000000000000000000000000000000800;
StakingI constant STAKING_CONTRACT = StakingI(STAKING_PRECOMPILE_ADDRESS);

string constant MSG_DELEGATE = "/cosmos.staking.v1beta1.MsgDelegate";
string constant MSG_UNDELEGATE = "/cosmos.staking.v1beta1.MsgUndelegate";

interface StakingI {
    function delegate(
        address delegatorAddress,
        string memory validatorAddress,
        uint256 amount
    ) external returns (int64 completionTime);

    function undelegate(
        address delegatorAddress,
        string memory validatorAddress,
        uint256 amount
    ) external returns (int64 completionTime);

    function approve(
        address spender,
        uint256 amount,
        string[] calldata methods
    ) external returns (bool approved);
}