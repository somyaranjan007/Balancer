import React, { useContext } from 'react'
import { Link } from "react-router-dom";
import { portfolioAppState } from '../context/context';

const Header = () => {

    const { connectWallet, connected } = useContext(portfolioAppState);

    return (
        <div className="flex justify-between items-center h-[68px] px-10 bg-gray-900 text-white">
            <div>
                <h1 className="text-[30px] font-semibold">BalanceDex</h1>
            </div>

            <div className="flex items-center">
                <ul className="flex items-center">
                    <li className="pl-6 text-[16px]"><Link to="/">Home</Link></li>
                    <li className="pl-6 text-[16px]"><Link to="/stake">Stake</Link></li>
                    <li className="pl-6 text-[16px]"><Link to="/portfolio">Portfolio</Link></li>
                </ul>

                <button onClick={connectWallet} className="ml-6 text-[16px] border px-3 py-1 rounded bg-white text-black font-semibold">{connected ? "Connected" : "Connect"}</button>
            </div>
        </div>
    )
}

export default Header