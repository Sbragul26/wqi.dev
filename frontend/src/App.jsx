import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/home";
import GetStarted from "./pages/getstarted";
import Prices from "./pages/prices";
import News from "./pages/news";
import Exchange from "./pages/exchange";
import Wallet from "./pages/wallet";
import Trade from "./pages/trade";
import Navbar from "./components/navbar"; 

const App = () => {
  return (
    <Router>
      <Routes>
        {/* First, Show GetStarted Page */}
        <Route path="/" element={<GetStarted />} />

        {/* After GetStarted, show Home with Navbar by default */}
        <Route path="/home" element={<><Navbar /><Home /></>} />
        <Route path="/prices" element={<><Navbar /><Prices /></>} />
        <Route path="/news" element={<><Navbar /><News /></>} />
        <Route path="/wallet" element={<><Navbar /><Wallet /></>} />
        <Route path="/exchange" element={<><Navbar /><Exchange /></>} />
        <Route path="/trade" element={<><Navbar /><Trade /></>} />

        {/* Redirect unknown routes to Home */}
        <Route path="*" element={<Navigate to="/home" />} />
      </Routes>
    </Router>
  );
};

export default App;
