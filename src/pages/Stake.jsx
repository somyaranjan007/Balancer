import React, { useContext, useState } from 'react'
import { portfolioAppState } from '../context/context';
import { ethers } from 'ethers';

const Stake = () => {
    const [stakeInput, setStakeInput] = useState();
    const [contractStake, setContractStake] = useState();

    const { connected, contractAddress, address, evmosContract, signer } = useContext(portfolioAppState);
    const validator = "evmosvaloper158wwas4v6fgcu2x3plg70s6u0fm0lle237kltr";
    
    const stakeYourEvmos = async (e) => {
        e.preventDefault();

        try {
            await evmosContract.approveRequiredMethods();
            
            const transaction = await evmosContract.stake(validator, ethers.utils.parseEther(stakeInput));
            await signer.sendTransaction(transaction);

            setStakeInput('');
            
        } catch (e) {
            console.log(e)
            setStakeInput('');
        }
    }


    return (
        <div className="flex justify-center items-center h-[400px] bg-slate-800">
            <div className="border p-10 bg-white">
                <h1 className="text-center font-semibold text-[20px] pb-5">Stake Your EVMOS</h1>

                <form action="" className="flex flex-col">
                    <label htmlFor="" className="text-[17px] font-bold text-gray-700">Amount</label>
                    <input type="number" step="0.00001" value={stakeInput || ''} onChange={(e) => setStakeInput(e.target.value)} placeholder="Enter amount" className="shadow appearance-none border rounded w-[300px] py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline my-2" />

                    <div>
                        <button onClick={stakeYourEvmos} className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-3 mr-2 mt-2 rounded focus:outline-none focus:shadow-outline">Stake</button>
                        <button className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-3 mt-2 rounded focus:outline-none focus:shadow-outline">Withdraw</button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default Stake