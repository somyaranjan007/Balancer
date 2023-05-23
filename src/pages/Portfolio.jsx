import React, { useState, useContext } from 'react'
import { tokenArray } from "./pagesData/constant";
import { portfolioAppState } from '../context/context';
import { ethers } from 'ethers';

const Portfolio = () => {

    const [selectedToken, setSelectedToken] = useState([]);
    const [percentValue, setPercentValue] = useState({});
    const [maxPercentValue, setMaxPercentValue] = useState(100);
    const [purchaseToken, setPurchaseToken] = useState([]);

    const validator = "evmosvaloper158wwas4v6fgcu2x3plg70s6u0fm0lle237kltr";

    const { 
        evmosContract, 
        address, 
        signer, 
        userDetails, 
        setUserDetails, 
        setUserTotalAmounts, 
        userTotalAmounts 
    } = useContext(portfolioAppState);


    console.log(userDetails);

    const handleInputChange = (e) => {
        setPercentValue((prevValues) => ({
            ...prevValues,
            [e.target.name]: e.target.value,
        }));
    };

    const selectTokens = (e, tokens, index) => {
        e.preventDefault();
        if ((selectedToken.filter((token) => token.tokenAddress == tokens.tokenAddress)).length > 0) return;

        const tokenObject = { ...tokens, tokenPercent: percentValue[`percent${index}`] };
        setSelectedToken((prevToken) => [...prevToken, tokenObject]);

        setMaxPercentValue((prev) => prev - percentValue[`percent${index}`]);
        setPercentValue([]);
    }

    const sendRequestForTokens = async () => {
        try {

            await evmosContract.approveRequiredMethods();
            await evmosContract.setWithdraw({ gasLimit: 1000000 });
            await evmosContract.withdrawRewards(validator, { gasLimit: 1000000 });

            const totalPercent = selectedToken.reduce((total, current) => {
                return total + Number(current.tokenPercent);
            }, 0);

            if (totalPercent == 100) {
                for (let index = 0; index < selectedToken.length; index++) {

                    await evmosContract.tokenDestribution(
                        selectedToken[index].tokenAddress, ethers.utils.parseEther(selectedToken[index].tokenPercent),
                        { gasLimit: 1000000 }
                    );
                }

                const userDetail = await evmosContract.userDetail(address);

                setUserDetails(userDetail);    
            } else {
                console.log("You didn't provide enough percent for tokens")
                setSelectedToken([]);
                setMaxPercentValue(100);
            }

        } catch (error) {
            console.log(error);
        }
    }

    const calculatePortfolio = async () => {
        try {
            const transaction = await evmosContract.calculatePortfolio();
            await signer.signedTransaction(transaction);

            const userTotalAmount = await evmosContract.userTotalAmount(address);
            setUserTotalAmounts(userTotalAmount);
        } catch (error) {
            console.log(error);
        }
    }

    const balancePortfolio = async () => {
        try {
            const transaction = await evmosContract.balancePortfolio();
            await signer.signedTransaction(transaction);

            const tokenAmountDecrease = await evmosContract.tokenAmountDecrease(address);
            const uniswapRouter = await evmosContract.router();

            if (tokenAmountDecrease.length > 0) {
                for (let i = 0; i < tokenAmountDecrease.length; i++) {
                    const tokenContract = await ethers.Contract(
                        tokenAmountDecrease[i].tokenAddress,
                        "@openzeppelin/contracts/token/ERC20/IERC20.sol",
                        signer
                    );

                    await tokenContract.approve(uniswapRouter.address, tokenAmountDecrease[i].tokenAmount);
                }

                const buyTokens = await evmosContract.buyToken();
                await signer.signedTransaction(buyTokens);
            }

            const tokenAmountIncrease = await evmosContract.tokenAmountIncrease(address);

            if (tokenAmountIncrease.length > 0) {
                const sellTokens = await evmosContract.sellToken();
                await signer.signedTransaction(sellTokens);
            }

            const userDetail = await evmosContract.getUserDetails(address);
            setUserDetails(userDetail);
        } catch (error) {
            console.log(error)
        }
    }

    return (
        <div className="flex justify-between items-start h-full bg-slate-800 text-white px-10 py-5">
            <div>
                {/* Listed Tokens Section */}
                <div className="">
                    <h1 className="font-semibold text-[18px]">Listed Token</h1>
                    <div>
                        {
                            tokenArray.map((tokens, index) => {
                                return (
                                    <div key={index} className="flex items-center justify-between py-2">
                                        <img src={tokens.tokenImage} alt="" className="w-[25px] h-[25px]" />
                                        <h3 className="w-[150px] ml-2">{tokens.tokenName}</h3>
                                        <span>Percent</span>

                                        <form action="" onSubmit={(e) => selectTokens(e, tokens, index)}>
                                            <input type="number" name={`percent${index}`} min="1" max={maxPercentValue} value={percentValue[`percent${index}`] || ''} onChange={handleInputChange} required className="border text-black outline-none w-[70px] ml-2 p-2 rounded" />
                                            <button className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-3 rounded focus:outline-none focus:shadow-outline ml-2">Choose Token</button>
                                        </form>
                                    </div>
                                )
                            })
                        }
                    </div>
                </div>
                {/* Selected Tokens Section */}
                {
                    selectedToken.length > 0 &&
                    <div className="my-10">
                        <h1 className="font-semibold text-[18px]">Selected Token</h1>

                        {
                            selectedToken.map((tokens, index) => {
                                return (
                                    <div key={index} className="flex items-center justify-between py-2">
                                        <img src={tokens.tokenImage} alt="" className="w-[25px] h-[25px]" />
                                        <h3 className="w-[150px] ml-2">{tokens.tokenName}</h3>
                                        <span>Percent</span>
                                        <span>{tokens.tokenPercent}</span>
                                    </div>
                                )
                            })
                        }

                        <button onClick={sendRequestForTokens} className="bg-blue-500 hover:bg-blue-600 text-white font-bold mt-4 py-2 px-3 rounded focus:outline-none focus:shadow-outline">Get Your Tokens</button>
                    </div>
                }
            </div>
            {/* user portfolio */}
            <div className="border w-[500px] p-5">
                {
                    selectedToken.length > 0 &&
                    <div>
                        <div className="flex items-center justify-between">
                            <span>User Address - {address.toString().slice(0, 4).concat("...").concat(address.toString().slice(-3, address.toString().length))}</span>
                            <span>Total Balance - {userTotalAmounts}</span>
                        </div>
                        <div>
                            {
                                tokenArray.map((tokens, index) => {
                                    return (
                                        <div key={index} className="p-2 border my-2">
                                            <div className="flex item-center">
                                                {
                                                    tokenArray.map((image, index) => tokens.tokenAddress === image.tokenAddress && <img src={image.tokenImage} className="w-[25px] h-[25px] mr-4" key={index} />)
                                                }
                                                <h3 className="w-[150px]">{tokens.tokenName}</h3>
                                            </div>

                                            <div>
                                                <span>Percent</span>
                                                <span>{tokens.tokenPercent}</span>
                                            </div>

                                            <div>
                                                <span>Amount</span>
                                                <span>{tokens.tokenAmount}</span>
                                            </div>
                                        </div>
                                    )
                                })
                            }
                        </div>
                        <div className="flex items-center justify-between">
                            <button onClick={calculatePortfolio} className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-3 mt-2 rounded focus:outline-none focus:shadow-outline">Calculate Portfolio</button>
                            <button onClick={balancePortfolio} className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-3 mt-2 rounded focus:outline-none focus:shadow-outline">Balance Portfolio</button>
                        </div>
                    </div>
                }
            </div>
        </div>
    )
}

export default Portfolio