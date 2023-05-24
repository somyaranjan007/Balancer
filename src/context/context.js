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
    const [userDetails, setUserDetails] = useState([]);
    const [userTotalAmounts, setUserTotalAmounts] = useState(0);

    const contractAddress = "0x9BAd4F0f2A72f83CE05725828e19412947F511A5";
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

                const userTotalAmount = await contract.userTotalAmount(window.ethereum.selectedAddress);
                setUserTotalAmounts(Number(userTotalAmount._hex));

                const userDetail = await contract.getUserDetails(window.ethereum.selectedAddress);
                setUserDetails(userDetail);

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
            signer,
            provider,
            contractAddress,
            userDetails,
            setUserDetails,
            userTotalAmounts,
            setUserTotalAmounts
        }}>
            {children}
        </portfolioAppState.Provider>
    )
}

export default ContextProvider;