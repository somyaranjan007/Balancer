import React, { useContext, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Import all the components are used in this application.
import Header from "./components/Header";

// Importing all the Pages are used in this application. 
import Home from "./pages/Home";
import Portfolio from "./pages/Portfolio";
import Stake from "./pages/Stake";

// Importing context data file.
import { portfolioAppState } from './context/context';

const App = () => {

    const { connectWallet } = useContext(portfolioAppState);

    useEffect(() => {
        connectWallet();
    }, [])

    return (
        <Router>
            <Header />
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/portfolio" element={<Portfolio />} />
                <Route path="/stake" element={<Stake />} />
            </Routes>
        </Router>
    )
}

export default App