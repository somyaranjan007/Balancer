import React, { useContext, useState } from 'react'
import { portfolioAppState } from '../context/context';
import { ethers } from 'ethers';

const Stake = () => {

    const [stakeInput, setStakeInput] = useState();
    const { evmosContract, validator, signer, setUserStakedAmount } = useContext(portfolioAppState);
    
    const stakeYourEvmos = async (e) => {
        e.preventDefault();

        try {
            await evmosContract.approveRequiredMethods();
            
            const transaction = await evmosContract.stake(validator, ethers.utils.parseEther(stakeInput), { gasLimit: 1000000 });
            await signer.sendTransaction(transaction);

            const _userStakedAmount = await evmosContract.getUserTotalStakedAmount();
            setUserStakedAmount(Number(_userStakedAmount._hex));

            setStakeInput('');
            
        } catch (error) {
            console.log(error);
            setStakeInput('');
        }
    }

    return (
        <div className="flex justify-center items-center h-[400px] bg-slate-800">
            <div className="rounded p-10 bg-slate-700 text-white">
                <h1 className="text-center font-semibold text-[20px] pb-5">Stake Your EVMOS</h1>

                <form action="" className="flex flex-col" onSubmit={stakeYourEvmos}>
                    <label htmlFor="" className="text-[17px] font-bold">Amount</label>
                    <input type="number" required step="0.00001" value={stakeInput || ''} onChange={(e) => setStakeInput(e.target.value)} placeholder="Enter amount" className="shadow appearance-none border rounded w-[300px] py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline my-2" />

                    <div>
                        <button className="bg-blue-500 w-full hover:bg-blue-600 text-white font-bold py-2 px-3 mr-2 mt-2 rounded focus:outline-none focus:shadow-outline">Stake</button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default Stake