import React, { useContext, useState } from "react";
import { portfolioAppState } from "../context/context";
import { ethers } from "ethers";

const Home = () => {

    const { 
        setUserStakedAmount, 
        userStakedAmount, 
        setUserStakedRewards, 
        userStakedRewards,
        evmosContract, 
        validator, 
        signer, 
    } = useContext(portfolioAppState);

    const unstakeUserStakedAmount = async () => {
        try {
            const _transaction = await evmosContract.unStake(validator, ethers.utils.parseEther(userStakedAmount), { gasLimit: 1000000 });
            await signer.sendTransaction(_transaction);

            const _userStakedAmount = await evmosContract.getUserTotalStakedAmount();
            setUserStakedAmount(Number(_userStakedAmount._hex));

        } catch (error) {
            console.log(error);
        }
    }

    const getUserStakedRewards = async () => {
        try {
            const _transaction = await evmosContract.withdrawUserRewards({ gasLimit: 1000000 });
            await signer.sendTransaction(_transaction);

            const _userStakedRewards = await evmosContract.getUserStakedRewards();
            setUserStakedRewards(Number(_userStakedRewards._hex));
            
        } catch (error) {
            console.log(error);
        }
    }

    return (
        <div className="text-white flex justify-center items-center h-[500px]">
            <div className="flex flex-col items-start justify-center px-20 py-10 bg-slate-800 rounded">
                <h1 className="text-center w-full mb-4 text-[20px]">User Account Balance</h1>
                <div className="px-10 py-6 my-2 bg-slate-700 rounded w-full flex flex-col">
                    <span className="my-2">Your Staked Amounts - {userStakedAmount} TEVMOS</span>
                    <button onClick={unstakeUserStakedAmount} className="bg-blue-500 w-full hover:bg-blue-600 text-white font-bold py-2 px-3 mr-2 mt-2 rounded focus:outline-none focus:shadow-outline">Unstake Amount</button>
                </div>
                <div className="px-10 py-6 my-2 bg-slate-700 rounded w-full flex flex-col">
                    <span className="my-2">Your Staked Rewards - {userStakedRewards} TEVMOS</span>
                    <button onClick={getUserStakedRewards} className="bg-blue-500 w-full hover:bg-blue-600 text-white font-bold py-2 px-3 mr-2 mt-2 rounded focus:outline-none focus:shadow-outline">Withdraw Rewards</button>
                </div>
            </div>
        </div>
    )
}

export default Home