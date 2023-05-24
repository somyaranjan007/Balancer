/* SPDX-License-Identifier: MIT */
pragma solidity ^0.8.9;

import "./interface/Bech32.sol";
import "./interface/Distribution.sol";
import "./interface/IUniswapRouter.sol";
import "./interface/Staking.sol";
import "../node_modules/@openzeppelin/contracts/utils/math/SafeMath.sol";
import "../node_modules/@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract Portfolio {
    using SafeMath for uint256;

    /// @dev Define uniswap router for swaping tokens.
    IUniswapV2Router01 public constant router =
        IUniswapV2Router01(0x72bd489d3cF0e9cC36af6e306Ff53E56d0f9EFb4);

    /// @dev Define all the available staking methods.
    string[] private stakingMethods = [MSG_DELEGATE, MSG_UNDELEGATE];

    /// @dev Define all the available distribution methods.
    string[] private distributionMethods = [
        MSG_SET_WITHDRAWER_ADDRESS,
        MSG_WITHDRAW_DELEGATOR_REWARD
    ];

    /// @dev Define all the struct using in this contract.
    /// @dev Define TokenDetail Struct for the token information.
    struct TokenDetails {
        address tokenAddress;
        uint256 tokenPercent;
        uint256 tokenAmount;
    }

    event TestEvent(uint256, address);

    /// @dev Define mapping for getting specific user data.
    /// @dev Define userRewards mapping for storing specific user rewards.
    mapping(address => uint256) public userRewards;
    mapping(address => TokenDetails[]) public userDetail;
    mapping(address => uint256) public userTotalAmount;

    mapping(address => TokenDetails[]) public tokenAmountIncrease;
    mapping(address => TokenDetails[]) public tokenAmountDecrease;
    
    /// @dev Approves the required transactions for delegation and withdrawal of staking rewards transactions.
    /// @dev This creates a Cosmos Authorization Grants for the given methods.
    /// @dev This emits an Approval event.
    function approveRequiredMethods() public {
        bool success = STAKING_CONTRACT.approve(
            msg.sender,
            type(uint256).max,
            stakingMethods
        );
        require(success, "Failed to approve delegate method");
        success = DISTRIBUTION_CONTRACT.approve(
            msg.sender,
            distributionMethods
        );
        require(success, "Failed to approve withdraw delegator rewards method");
    }

    /// @dev stake a given amount of tokens. Returns the completion time of the staking transaction.
    /// @dev This emits an Delegate event.
    /// @param _validatorAddr The address of the validator.
    /// @param _amount The amount of tokens to stake in evmos.
    /// @return completionTime The completion time of the staking transaction.
    function stake(
        string memory _validatorAddr,
        uint256 _amount
    ) public returns (int64 completionTime) {
        emit TestEvent( userTotalAmount[msg.sender] , msg.sender);
        userTotalAmount[msg.sender] = SafeMath.add(userTotalAmount[msg.sender], _amount);
        emit TestEvent( userTotalAmount[msg.sender] , msg.sender);
        return STAKING_CONTRACT.delegate(msg.sender, _validatorAddr, _amount);
    }

    /// @dev Change the address, that can withdraw the rewards of a delegator.
    function setWithdraw() public {
        bool success = DISTRIBUTION_CONTRACT.setWithdrawAddress(
            msg.sender,
            BECH32CONTRACT.hexToBech32(address(this), "evmos")
        );
        require(success, "Failed!");
    }

    /// @dev withdraw delegation rewards from the specified validator address
    /// @dev This emits an WithdrawDelegatorRewards event.
    /// @param _validatorAddr The address of the validator.
    /// @return amount The amount of Coin withdrawn.
    function withdrawRewards(
        string memory _validatorAddr
    ) public returns (Coin[] memory amount) {
        amount = DISTRIBUTION_CONTRACT.withdrawDelegatorRewards(
            msg.sender,
            _validatorAddr
        );

        for (uint256 i = 0; i < amount.length; i++) {
            userRewards[msg.sender] += amount[i].amount;
        }
    }

    function checkUserRewards() public view returns (uint256) {
        return userRewards[msg.sender];
    }

    /// @dev check the user have enough evmos tokens.
    /// @dev Define amountIn and amountOut for tokens.
    /// @dev Define path array for swaping the tokens.
    /// @dev Define amount for storing the return amount of swap token.
    /// @dev using tempTokenDetails for storing the token details.
    /// @dev using userAddressTokenDetails for storing specific user data.
    /// @dev then we clearing the registered array.
    /// @param _tokenAddress and _tokenPercent.
    function tokenDestribution(
        address _tokenAddress,
        uint256 _tokenPercent
    ) public {
        require(userRewards[msg.sender] > 0, "Sender doesn't have rewards!");

        uint256 amountIn = SafeMath.div(SafeMath.mul(userRewards[msg.sender], _tokenPercent), 100);

        uint256 amountOut = getAmount(
            amountIn,
            0xf1361Dc7DFB724bd29FE7ade0CdF9785F2Bc20E6,
            _tokenAddress
        )[1];

        address[] memory path = new address[](2);
        path[0] = 0xf1361Dc7DFB724bd29FE7ade0CdF9785F2Bc20E6;
        path[1] = _tokenAddress;

        IERC20(0xf1361Dc7DFB724bd29FE7ade0CdF9785F2Bc20E6).approve(address(router), amountIn);

        uint256 amount = router.swapExactTokensForTokens(
            amountIn,
            amountOut,
            path,
            msg.sender,
            block.timestamp
        )[1];

        userDetail[msg.sender].push(
            TokenDetails({
                tokenAddress: _tokenAddress,
                tokenPercent: _tokenPercent,
                tokenAmount: amount
            })
        );
    }

    function getUserDetails(
        address _user
    ) public view returns (TokenDetails[] memory) {
        return userDetail[_user];
    }

    function calculatePortfolio() public {
        for (uint256 i = 0; i < userDetail[msg.sender].length; i++) {
            uint256 amountIn = userDetail[msg.sender][i].tokenAmount;
            uint256 amountOut = getAmount(
                amountIn,
                userDetail[msg.sender][i].tokenAddress,
                0xf1361Dc7DFB724bd29FE7ade0CdF9785F2Bc20E6
            )[1];
            userTotalAmount[msg.sender] = SafeMath.add(userTotalAmount[msg.sender], amountOut);
        }
    }

    function balancePortfolio() public {
        for (uint256 i = 0; i < userDetail[msg.sender].length; i++) {
            uint256 amountIn = SafeMath.div(SafeMath.mul(userTotalAmount[msg.sender], userDetail[msg.sender][i].tokenPercent), 100);
                
            uint256 amountOut = getAmount(
                amountIn,
                0xf1361Dc7DFB724bd29FE7ade0CdF9785F2Bc20E6,
                userDetail[msg.sender][i].tokenAddress
            )[1];

            if (amountOut > userDetail[msg.sender][i].tokenAmount) {
                tokenAmountIncrease[msg.sender].push(
                    TokenDetails({
                        tokenAddress: userDetail[msg.sender][i].tokenAddress,
                        tokenPercent: userDetail[msg.sender][i].tokenPercent,
                        tokenAmount: amountOut - userDetail[msg.sender][i].tokenAmount
                    })
                );
                
            } else if (amountOut < userDetail[msg.sender][i].tokenAmount) {
                tokenAmountDecrease[msg.sender].push(
                    TokenDetails({
                        tokenAddress: userDetail[msg.sender][i].tokenAddress,
                        tokenPercent: userDetail[msg.sender][i].tokenPercent,
                        tokenAmount: userDetail[msg.sender][i].tokenAmount - amountOut
                    })
                );   
            }
        }
    }

    function buyToken() public {
        for (uint256 i = 0; i < tokenAmountDecrease[msg.sender].length; i++) {
            for (uint256 j = 0; j < userDetail[msg.sender].length; j++) {
                if (tokenAmountDecrease[msg.sender][i].tokenAddress == userDetail[msg.sender][j].tokenAddress) {
                    address[] memory path = new address[](2);
                    path[0] = userDetail[msg.sender][j].tokenAddress;
                    path[1] = 0xf1361Dc7DFB724bd29FE7ade0CdF9785F2Bc20E6;

                    uint256 amount = router.swapExactTokensForTokens(
                        tokenAmountDecrease[msg.sender][i].tokenAmount,
                        getAmount(
                            tokenAmountDecrease[msg.sender][i].tokenAmount,
                            userDetail[msg.sender][j].tokenAddress,
                            0xf1361Dc7DFB724bd29FE7ade0CdF9785F2Bc20E6
                        )[1],
                        path,
                        address(this),
                        block.timestamp
                    )[1];

                    userDetail[msg.sender][j].tokenAmount -= tokenAmountDecrease[msg.sender][i].tokenAmount;
                }
            }
        }
    } 

    function sellToken() public {
        for (uint256 i = 0; i < tokenAmountIncrease[msg.sender].length; i++) {
            for (uint256 j = 0; j < userDetail[msg.sender].length; j++) {
                if (tokenAmountIncrease[msg.sender][i].tokenAddress == userDetail[msg.sender][j].tokenAddress) {
                    address[] memory path = new address[](2);
                    path[0] = 0xf1361Dc7DFB724bd29FE7ade0CdF9785F2Bc20E6;
                    path[1] = userDetail[msg.sender][j].tokenAddress;

                    uint256 amountIn = getAmount(
                        tokenAmountIncrease[msg.sender][i].tokenAmount,
                        userDetail[msg.sender][j].tokenAddress,
                        0xf1361Dc7DFB724bd29FE7ade0CdF9785F2Bc20E6
                    )[1];

                    IERC20(0xf1361Dc7DFB724bd29FE7ade0CdF9785F2Bc20E6).approve(address(router), amountIn);

                    uint256 amount = router.swapExactTokensForTokens(
                        amountIn,
                        tokenAmountIncrease[msg.sender][i].tokenAmount,
                        path,
                        msg.sender,
                        block.timestamp
                    )[1];

                    userDetail[msg.sender][j].tokenAmount += amount;
                }
            }
        }
    }

    function getAmount(
        uint256 amountIn,
        address tokenA,
        address tokenB
    ) public view returns (uint256[] memory amounts) {
        address[] memory path = new address[](2);
        path[0] = tokenA;
        path[1] = tokenB;
        amounts = router.getAmountsOut(amountIn, path);
    }
}
