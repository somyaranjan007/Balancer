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

    /// @dev Define TEVMOS address.
    address public constant tEVMOS = 0xf1361Dc7DFB724bd29FE7ade0CdF9785F2Bc20E6;

    /// @dev Define uniswap router for swaping tokens.
    IUniswapV2Router01 public constant router =
        IUniswapV2Router01(0x72bd489d3cF0e9cC36af6e306Ff53E56d0f9EFb4);

    /// @dev Define all the available staking methods.
    string[] private stakingMethods = [MSG_DELEGATE, MSG_UNDELEGATE];

    /// @dev Define all the available distribution methods.
    string[] private distributionMethods = [MSG_SET_WITHDRAWER_ADDRESS, MSG_WITHDRAW_DELEGATOR_REWARD];

    /// @dev Define all the struct using in this contract.
    /// @dev Define TokenDetail Struct for the token information.
    struct TokenDetails {
        address tokenAddress;
        uint256 tokenPercent;
        uint256 tokenAmount;
    }

    /// @dev Define mapping for getting specific user data.
    /// @dev Define userApproveMethods mapping for checking the user approve method or not.
    /// @dev Define userTotalAmount mapping for fetching the staked amount of the user.
    /// @dev Define userRewards mapping for storing specific user rewards.
    /// @dev Define userDetail mapping for fetching the user token's data.
    /// @dev Define tokenAmountIncrease and tokenAmountDecrease mapping for checking token stability.
    mapping(address => bool) userApproveMethods;
    mapping(address => uint256) userTotalTokenAmount;
    mapping(address => uint256) userTotalStakedAmount;
    mapping(address => uint256) userContractStakedRewards;
    mapping(address => uint256) userStakedRewards;
    mapping(address => TokenDetails[]) userDetail;
    mapping(address => TokenDetails[]) tokenAmountIncrease;
    mapping(address => TokenDetails[]) tokenAmountDecrease;
    
    /// @dev Define get function for all the mapping.
    function getUserApproveMethods() public view returns(bool) {return userApproveMethods[msg.sender];}
    function getUserTotalTokenAmount() public view returns(uint256) {return userTotalTokenAmount[msg.sender];}
    function getUserTotalStakedAmount() public view returns(uint256) {return userTotalStakedAmount[msg.sender];}
    function getUserContractStakedRewards() public view returns(uint256) {return userContractStakedRewards[msg.sender];}
    function getUserStakedRewards() public view returns(uint256) {return userStakedRewards[msg.sender];}
    function getUserDetails() public view returns (TokenDetails[] memory) {return userDetail[msg.sender];}
    function getTokenAmountIncrease() public view returns(TokenDetails[] memory) {return tokenAmountIncrease[msg.sender];}
    function getTokenAmountDecrease() public view returns(TokenDetails[] memory) {return tokenAmountDecrease[msg.sender];}
    
    /// @dev Approves the required transactions for delegation and withdrawal of staking rewards transactions.
    /// @dev This creates a Cosmos Authorization Grants for the given methods.
    /// @dev This emits an Approval event.
    function approveRequiredMethods() public {
        userApproveMethods[msg.sender] = true;

        bool success = STAKING_CONTRACT.approve(msg.sender, type(uint256).max, stakingMethods);
        require(success, "Failed to approve delegate method");

        success = DISTRIBUTION_CONTRACT.approve(msg.sender, distributionMethods);
        require(success, "Failed to approve withdraw delegator rewards method");
    }

    /// @dev stake a given amount of tokens. Returns the completion time of the staking transaction.
    /// @dev This emits an Delegate event.
    /// @param _validatorAddr The address of the validator.
    /// @param _amount The amount of tokens to stake in evmos.
    /// @return completionTime The completion time of the staking transaction.
    function stake(string memory _validatorAddr, uint256 _amount) public returns (int64 completionTime) {
        userTotalStakedAmount[msg.sender] = SafeMath.add(userTotalStakedAmount[msg.sender], _amount);
        return STAKING_CONTRACT.delegate(msg.sender, _validatorAddr, _amount);
    }

    /// @dev Change the address, that can withdraw the rewards of a delegator.
    function setWithdraw() public {
        bool success = DISTRIBUTION_CONTRACT.setWithdrawAddress(msg.sender,BECH32CONTRACT.hexToBech32(address(this), "evmos"));
        require(success, "Withdrawer Can't Be Changed!");
    }

    /// @dev withdraw delegation rewards from the specified validator address
    /// @dev This emits an WithdrawDelegatorRewards event.
    /// @param _validatorAddr The address of the validator.
    /// @return amount The amount of Coin withdrawn.
    function withdrawRewards(string memory _validatorAddr) public returns (Coin[] memory amount) {
        amount = DISTRIBUTION_CONTRACT.withdrawDelegatorRewards(msg.sender, _validatorAddr);

        for (uint256 i = 0; i < amount.length; i++) {
            userContractStakedRewards[msg.sender] = SafeMath.add(userContractStakedRewards[msg.sender], amount[i].amount);
        }
    }

    /// @dev check the user have enough evmos tokens.
    /// @dev Define amountIn and amountOut for tokens.
    /// @dev Define path array for swaping the tokens.
    /// @dev Define amount for storing the return amount of swap token.
    /// @dev using tempTokenDetails for storing the token details.
    /// @dev using userAddressTokenDetails for storing specific user data.
    /// @dev then we clearing the registered array.
    /// @param _tokenAddress and _tokenPercent.
    function tokenDestribution(address _tokenAddress, uint256 _tokenPercent) public {
        require(userContractStakedRewards[msg.sender] > 0, "Sender doesn't have rewards!");

        uint256 amountIn = SafeMath.div(SafeMath.mul(userContractStakedRewards[msg.sender], _tokenPercent), 100);
        uint256 amountOut = getAmount(amountIn, tEVMOS, _tokenAddress)[1];

        userContractStakedRewards[msg.sender] = SafeMath.sub(userContractStakedRewards[msg.sender], amountIn);

        address[] memory path = new address[](2); path[0] = tEVMOS; path[1] = _tokenAddress;
        IERC20(tEVMOS).approve(address(router), amountIn);

        uint256 amount = router.swapExactTokensForTokens(amountIn, amountOut, path, msg.sender, block.timestamp)[1];
        userDetail[msg.sender].push(TokenDetails({tokenAddress: _tokenAddress, tokenPercent: _tokenPercent, tokenAmount: amount}));
    }

    /// @notice This Calculate Portfolio function calculate user current balance in tEVMOS.
    /// @dev I have created two variable, amountIn and amountOut amountIn is token amount and amountOut is EVMOS on the behalf of token amount.
    function calculatePortfolio() public {
        for (uint256 i = 0; i < userDetail[msg.sender].length; i++) {
            uint256 amountIn = userDetail[msg.sender][i].tokenAmount;
            uint256 amountOut = getAmount(amountIn, userDetail[msg.sender][i].tokenAddress, tEVMOS)[1];

            userTotalTokenAmount[msg.sender] = SafeMath.add(userTotalTokenAmount[msg.sender], amountOut);
        }
    }

    function balancePortfolio() public {
        for (uint256 i = 0; i < userDetail[msg.sender].length; i++) {
            uint256 amountIn = SafeMath.div(SafeMath.mul(userTotalTokenAmount[msg.sender], userDetail[msg.sender][i].tokenPercent), 100);
                
            uint256 amountOut = getAmount(amountIn, tEVMOS, userDetail[msg.sender][i].tokenAddress)[1];

            if (amountOut > userDetail[msg.sender][i].tokenAmount) {
                tokenAmountIncrease[msg.sender].push(TokenDetails({tokenAddress: userDetail[msg.sender][i].tokenAddress, tokenPercent: userDetail[msg.sender][i].tokenPercent, tokenAmount: SafeMath.sub(amountOut, userDetail[msg.sender][i].tokenAmount)}));  
            } else if (amountOut < userDetail[msg.sender][i].tokenAmount) {
                tokenAmountDecrease[msg.sender].push(TokenDetails({tokenAddress: userDetail[msg.sender][i].tokenAddress, tokenPercent: userDetail[msg.sender][i].tokenPercent, tokenAmount: SafeMath.sub(userDetail[msg.sender][i].tokenAmount, amountOut)}));   
            }
        }
    }

    function buyToken() public {
        for (uint256 i = 0; i < tokenAmountDecrease[msg.sender].length; i++) {
            for (uint256 j = 0; j < userDetail[msg.sender].length; j++) {
                if (tokenAmountDecrease[msg.sender][i].tokenAddress == userDetail[msg.sender][j].tokenAddress) {
                    address[] memory path = new address[](2);
                    path[0] = userDetail[msg.sender][j].tokenAddress; path[1] = tEVMOS;

                    uint256 amountIn = tokenAmountDecrease[msg.sender][i].tokenAmount;
                    uint256 amountOut = getAmount(tokenAmountDecrease[msg.sender][i].tokenAmount, userDetail[msg.sender][j].tokenAddress, tEVMOS)[1];
                    uint256 amount = router.swapExactTokensForTokens(amountIn, amountOut, path, address(this), block.timestamp)[1];

                    userDetail[msg.sender][j].tokenAmount = SafeMath.sub(userDetail[msg.sender][j].tokenAmount, tokenAmountDecrease[msg.sender][i].tokenAmount);
                }
            }
        }
    } 

    function sellToken() public {
        for (uint256 i = 0; i < tokenAmountIncrease[msg.sender].length; i++) {
            for (uint256 j = 0; j < userDetail[msg.sender].length; j++) {
                if (tokenAmountIncrease[msg.sender][i].tokenAddress == userDetail[msg.sender][j].tokenAddress) {
                    address[] memory path = new address[](2);
                    path[0] = tEVMOS; path[1] = userDetail[msg.sender][j].tokenAddress;

                    uint256 amountIn = getAmount(tokenAmountIncrease[msg.sender][i].tokenAmount, userDetail[msg.sender][j].tokenAddress, tEVMOS)[1];
                    uint256 amountOut = tokenAmountIncrease[msg.sender][i].tokenAmount;

                    IERC20(tEVMOS).approve(address(router), amountIn);

                    uint256 amount = router.swapExactTokensForTokens(amountIn, amountOut, path, msg.sender, block.timestamp)[1];
                    userDetail[msg.sender][j].tokenAmount = SafeMath.add(userDetail[msg.sender][j].tokenAmount, amount) ;
                }
            }
        }
    }

    function withdrawUserRewards() public {
        require(userContractStakedRewards[msg.sender] > 0, "Doesn't have rewards!");
        userStakedRewards[msg.sender] = SafeMath.add(userStakedRewards[msg.sender], userContractStakedRewards[msg.sender]);
        IERC20(tEVMOS).transfer(msg.sender, userContractStakedRewards[msg.sender]);
    }

    function unStake(string memory _validatorAddr, uint256 _amount) public returns (int64 completionTime) {
        require(userTotalStakedAmount[msg.sender] >= _amount, "Doesn't have enough amount!");
        
        userTotalStakedAmount[msg.sender] = SafeMath.sub(userTotalStakedAmount[msg.sender], _amount);
        return STAKING_CONTRACT.undelegate(msg.sender, _validatorAddr, _amount);
    }

    function getAmount(uint256 amountIn, address tokenA, address tokenB) public view returns (uint256[] memory amounts) {
        address[] memory path = new address[](2); 
        path[0] = tokenA; path[1] = tokenB; 
        amounts = router.getAmountsOut(amountIn, path);
    }
}
