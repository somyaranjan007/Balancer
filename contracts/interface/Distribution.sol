// SPDX-License-Identifier: LGPL-v3
pragma solidity ^0.8.9;

address constant DISTRIBUTION_PRECOMPILE_ADDRESS = 0x0000000000000000000000000000000000000801;

string constant MSG_WITHDRAW_DELEGATOR_REWARD = "/cosmos.distribution.v1beta1.MsgWithdrawDelegatorReward";
string constant MSG_SET_WITHDRAWER_ADDRESS = "/cosmos.distribution.v1beta1.MsgSetWithdrawAddress";

DistributionI constant DISTRIBUTION_CONTRACT = DistributionI(DISTRIBUTION_PRECOMPILE_ADDRESS);

struct Coin {
    string denom;
    uint256 amount;
}

interface DistributionI {
    function setWithdrawAddress(address delegatorAddress, string memory withdrawerAddress) external returns (bool success);
    function withdrawDelegatorRewards(address delegatorAddress, string memory validatorAddress) external returns (Coin[] calldata amount);
    function approve(address spender, string[] calldata methods) external returns (bool approved);
}