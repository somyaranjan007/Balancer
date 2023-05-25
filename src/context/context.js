import { createContext, useState } from "react";
import { ethers } from 'ethers';

import ABI from "../contract/Portfolio.json";

export const portfolioAppState = createContext();

const ContextProvider = ({ children }) => {

    const [address, setAddress] = useState("");
    const [connected, setConnected] = useState(false);
    const [evmosContract, setEvmosContract] = useState();
    const [signer, setSigner] = useState();
    const [provider, setProvider] = useState();
    
    const [userTotalAmounts, setUserTotalAmounts] = useState(0);

    const [userStakedAmount, setUserStakedAmount] = useState(0);
    const [userStakedRewards, setUserStakedRewards] = useState(0);
    const [userDetails, setUserDetails] = useState([]);
    const [userTotalTokenAmount, setUserTotalTokenAmount] = useState(0);

    const validator = "evmosvaloper158wwas4v6fgcu2x3plg70s6u0fm0lle237kltr";
    const contractAddress = "0x76200abb94c3b225069E5E58C8242CDC05ef9771";
    const contractABI = ABI.abi;

    const connectWallet = async () => {
        if (window.ethereum) {
            try {
                await window.ethereum.request({ method: "eth_requestAccounts" });
                const newProvider = new ethers.providers.Web3Provider(window.ethereum);
                await window.ethereum.enable();
                
                setProvider(newProvider);
                setSigner(newProvider.getSigner());
                setAddress(window.ethereum.selectedAddress);
                setConnected(true);

                const contract = new ethers.Contract(contractAddress, contractABI, newProvider.getSigner());
                setEvmosContract(contract);

                const _userStakedAmount = await contract.getUserTotalStakedAmount();
                setUserStakedAmount(Number(_userStakedAmount._hex));

                const _userStakedRewards = await contract.getUserStakedRewards();
                setUserStakedRewards(Number(_userStakedRewards._hex));

                const _userDetail = await contract.getUserDetails();
                setUserDetails(_userDetail);

                const _userTotalTokenAmount = await contract.getUserTotalTokenAmount();
                setUserTotalTokenAmount(Number(_userTotalTokenAmount._hex));

            } catch (error) {
                console.error(error);
            }
        } else {
            console.error("Please install Metamask!");
        }
    }

    console.log(signer);
    return (
        <portfolioAppState.Provider value={{
            address,
            connected,
            evmosContract,
            connectWallet,
            
            provider,
            contractAddress,
            
            userTotalAmounts,
            setUserTotalAmounts,

            validator,
            signer,

            setUserStakedAmount,
            userStakedAmount,

            setUserStakedRewards,
            userStakedRewards,

            setUserDetails,
            userDetails,

            setUserTotalTokenAmount,
            userTotalTokenAmount

        }}>
            {children}
        </portfolioAppState.Provider>
    )
}

export default ContextProvider;