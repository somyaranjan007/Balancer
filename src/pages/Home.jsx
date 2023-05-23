import React, { useContext, useState } from "react";
import { portfolioAppState } from "../context/context";

const Home = () => {
    const { evmosContract, address, userTotalAmounts, setUserTotalAmounts } = useContext(portfolioAppState);

    const checkStakingBalance = async () => {
        try {
            const userTotalAmount = await evmosContract.userTotalAmount(address);
            setUserTotalAmounts(Number(userTotalAmount._hex));
        } catch(error) {
            console.log(error);
        }
    }
    
    return (
        <div className="text-white flex justify-center items-center h-[500px]">
            <div className="flex flex-col items-center justify-center px-20 py-10 bg-slate-800 rounded">
                <span>Your Staked Amount - {userTotalAmounts} TEVMOS</span>
                <button className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-3 mt-4 rounded focus:outline-none focus:shadow-outline" onClick={checkStakingBalance}>Check Balance</button>
            </div>
        </div>
    )
}

export default Home