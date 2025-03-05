import React, { useEffect, useState} from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/navbar';
import Search from '../components/search';
import Crypto from '../pages/crypto';
const WalletPopup = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-xl p-8 max-w-md w-full relative">
        {/* Back and close buttons */}
        <div className="flex justify-between mb-6">
          <button onClick={onClose} className="text-black">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
          </button>
          <h2 className="text-white text-xl font-bold">Get a Wallet</h2>
          <button onClick={onClose} className="text-black">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        
        {/* Wallet icons */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative w-64 h-64 mb-8">
            {/* Center blue wallet icon */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
              <div className="bg-blue-600 rounded-xl w-16 h-16 flex items-center justify-center shadow-lg">
                <div className="bg-white w-6 h-6 rounded-sm"></div>
              </div>
            </div>
            
            {/* Top left wallet icon (fox/metamask) */}
            <div className="absolute top-0 left-0">
              <div className="bg-white rounded-xl w-14 h-14 flex items-center justify-center shadow-lg">
                <div className="bg-orange-600 w-8 h-8 rounded-sm transform rotate-45"></div>
              </div>
            </div>
            
            {/* Top right wallet icon (shield) */}
            <div className="absolute top-0 right-0">
              <div className="bg-white rounded-xl w-14 h-14 flex items-center justify-center shadow-lg">
                <div className="text-blue-500 text-2xl">🛡️</div>
              </div>
            </div>
            
            {/* Bottom left wallet icon */}
            <div className="absolute bottom-0 left-0">
              <div className="bg-white rounded-xl w-14 h-14 flex items-center justify-center shadow-lg">
                <div className="text-orange-500 text-2xl">🔺</div>
              </div>
            </div>
            
            {/* Bottom right wallet icon (wave) */}
            <div className="absolute bottom-0 right-0">
              <div className="bg-teal-500 rounded-xl w-14 h-14 flex items-center justify-center shadow-lg text-white text-2xl">
                ~
              </div>
            </div>
            
            {/* Curved lines connecting wallets */}
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 200 200">
              <path d="M100,100 C80,70 50,80 30,30" stroke="#333" fill="none" strokeWidth="1" />
              <path d="M100,100 C120,70 150,80 170,30" stroke="#333" fill="none" strokeWidth="1" />
              <path d="M100,100 C80,130 50,120 30,170" stroke="#333" fill="none" strokeWidth="1" />
              <path d="M100,100 C120,130 150,120 170,170" stroke="#333" fill="none" strokeWidth="1" />
            </svg>
          </div>
          
          <h2 className="text-white text-2xl font-bold mb-4">Start Exploring Web3</h2>
          <p className="text-white text-center mb-8">
            Your wallet is the gateway to all things Ethereum, the magical technology that makes it possible to explore web3.
          </p>
          
          <button 
            onClick={() => window.open('https://martianwallet.xyz/download', '_blank')}
            className="bg-white text-gray-900 w-full py-4 px-6 rounded-full font-bold flex items-center justify-between"
          >
            Choose Your First Wallet
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 18l6-6-6-6"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};


const ConnectWalletButton = () => {
  const [showOptions, setShowOptions] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [hasWallet, setHasWallet] = useState(false);
  
  // Check for wallet on component mount and window focus
  useEffect(() => {
    checkForWallet();
    
    // Also check when window gets focus (user might have installed wallet in another tab)
    window.addEventListener('focus', checkForWallet);
    return () => window.removeEventListener('focus', checkForWallet);
  }, []);
  
  // Function to check for wallet presence
  const checkForWallet = () => {
    // Check common wallet providers
    const walletDetected = 
      typeof window !== 'undefined' && 
      (window.ethereum || 
       window.martian || 
       window.aptos || 
       window.pontem ||
       document.querySelector('[data-wallet]'));
    
    setHasWallet(!!walletDetected);
    console.log("Wallet detected:", !!walletDetected);
    
    // Log which wallet was found
    if (window.ethereum) console.log("Ethereum wallet found");
    if (window.martian) console.log("Martian wallet found");
    if (window.aptos) console.log("Aptos wallet found");
    if (window.pontem) console.log("Pontem wallet found");
  };
  
  const handleWalletConnect = () => {
    if (hasWallet) {
      setShowOptions(true);
    } else {
      setShowPopup(true);
    }
  };
  
  const connectExistingWallet = async () => {
    console.log("Connecting to existing wallet");
    
    try {
      // Try to connect to different wallet types
      if (window.ethereum) {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        console.log("Connected to Ethereum wallet");
      } 
      else if (window.martian) {
        await window.martian.connect();
        console.log("Connected to Martian wallet");
      }
      else if (window.aptos) {
        await window.aptos.connect();
        console.log("Connected to Aptos wallet");
      }
      // Add more wallet types as needed
      
      // Close the options menu
      setShowOptions(false);
    } catch (error) {
      console.error("Error connecting to wallet:", error);
      alert("Failed to connect to wallet. Please try again.");
    }
  };
  
  // Close dropdown when clicking outside
  useEffect(() => {
    if (!showOptions) return;
    
    const handleClickOutside = (event) => {
      if (!event.target.closest('.wallet-dropdown') && !event.target.closest('.wallet-button')) {
        setShowOptions(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showOptions]);
  
 
  
  return (
    <div className="relative">
      <button 
        className="wallet-button bg-blue-600 hover:bg-blue-700 text-black font-medium py-2 px-4 rounded-lg mr-4"
        onClick={handleWalletConnect}
      >
        Connect Wallet
      </button>
      
      {/* Options dropdown if user has a wallet */}
      {showOptions && (
        <div className="wallet-dropdown absolute top-full mt-2 right-0 bg-gray-800 rounded-lg shadow-lg p-2 z-40 w-48">
          <button 
            onClick={connectExistingWallet}
            className="text-white hover:bg-gray-700 rounded px-4 py-2 w-full text-left"
          >
            Connect Existing Wallet
          </button>
          <button 
            onClick={() => {
              setShowOptions(false);
              setShowPopup(true);
            }}
            className="text-white hover:bg-gray-700 rounded px-4 py-2 w-full text-left"
          >
            I Don't Have a Wallet
          </button>
        </div>
      )}
      
      {/* Wallet installation popup */}
      {showPopup && <WalletPopup onClose={() => setShowPopup(false)} />}
    </div>
  );
};

const Home = () => {
  const navigate = useNavigate(); 
  const [rotation, setRotation] = useState(0);
  
  // Animation for the coin semicircle
  useEffect(() => {
    const interval = setInterval(() => {
      setRotation(prev => (prev + 0.2) % 360);
    }, 50);
    
    return () => clearInterval(interval);
  }, []);
  const handleStartTrading = () => {
    navigate('/trade'); // Navigate to trade page
  };

  return (
    <div className="w-screen h-screen flex bg-black text-white overflow-hidden ">

      <div className="w-70 bg-gray-900 h-full ">
        <Navbar />
      </div>
      
      <div className="flex-1 h-screen overflow-y-auto">
        <div className="p-7 mt-1 flex items-center justify-end">
          {/* Using ConnectWalletButton instead of plain button */}
          <ConnectWalletButton />
          
           <button 
            onClick={handleStartTrading} 
            className="bg-green-600 hover:bg-green-700 text-black font-medium py-2 px-4 rounded-lg mr-6"
          >
            Start Trading
          </button>
          
          {/* Search component */}
          <Search placeholder="Search..." />
        </div>
        
        {/* Key Features content */}
        <div className="mt-[-0px] px-8 pb-8">

          <div className="text-center mb-8">
            <h2 className="text-4xl font-bold mb-2">Key Features</h2>
            <p className="text-gray-400">
              Unlock the Power of waveX: Key Features to Elevate Your Crypto Trading Experience
            </p>
          </div>
          
          <div className="grid grid-cols-3 gap-6">
            {/* Zero Price Impact section */}
            <div className="bg-gray-900 rounded-lg p-6">
              <h2 className="text-xl font-bold mb-3">Zero Price Impact & Minimal Slippage</h2>
              <p className="text-gray-400 text-sm mb-4">
                Execute large trades with zero price impact and minimal slippage using our oracle-based system.
              </p>
              
              <button className="bg-white text-black px-4 py-2 rounded mb-6">
                Explore 
              </button>
              
              {/* Chart */}
              <div className="relative h-56 mt-2">
                <div className="absolute inset-0 grid grid-cols-5 grid-rows-5">
                  {[...Array(5)].map((_, row) => (
                    [...Array(5)].map((_, col) => (
                      <div key={`${row}-${col}`} className="border border-gray-800" />
                    ))
                  ))}
                </div>
                
                <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                  <path 
                    d="M0,70 C20,80 30,40 50,60 S70,30 100,10"
                    stroke="#2196F3"
                    strokeWidth="3"
                    fill="none"
                    className="drop-shadow-lg"
                  />
                </svg>
                
                <div className="absolute bottom-0 left-0 w-full flex justify-between text-xs text-gray-500 transform translate-y-6">
                  <span>April</span>
                  <span>May</span>
                  <span>June</span>
                  <span>July</span>
                  <span>August</span>
                </div>
              </div>
            </div>
            
           {/* TradeGuard Section */}
            <div className="bg-gray-900 rounded-lg p-6">
              <h2 className="text-xl font-bold mb-3">TradeGuard: AI-Powered Risk Management</h2>
              <p className="text-gray-400 text-sm mb-4">
                TradeGuard is an AI-driven DeFi agent on the Aptos blockchain, providing real-time risk management by dynamically hedging positions, optimizing leverage, and executing liquidation prevention strategies.
              </p>

              <div className="grid grid-cols-2 gap-4 mt-8">
                <div className="bg-gray-800 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-blue-400">24/7</div>
                  <div className="text-xs text-gray-400">Automated Protection</div>
                </div>
                <div className="bg-gray-800 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-green-400">0%</div>
                  <div className="text-xs text-gray-400">Manual Intervention</div>
                </div>
                <div className="bg-gray-800 rounded-lg p-4 text-center">
                  <div className="text-1xl font-bold text-purple-400">AI-Powered</div>
                  <div className="text-sm text-gray-400">Risk Management</div>
                </div>
                <div className="bg-gray-800 rounded-lg p-4 text-center">
                  <div className="text-1xl font-bold text-yellow-400">On-Chain</div>
                  <div className="text-sm text-gray-400">Smart Execution</div>
                </div>
              </div>
            </div>
            
            {/* Diverse Markets section with semicircle of coins */}
            <div className="bg-gray-900 rounded-lg p-6 relative overflow-hidden">
              <h2 className="text-xl font-bold mb-3">Diverse Markets</h2>
              <p className="text-gray-400 text-sm mb-4">
                Access a wide variety of markets, including commodities, forex, premium sectors, and cryptocurrencies.
              </p>
              
              {/* Semicircle container */}
              <div className="relative h-64 flex justify-center">
                {/* Center "W" logo */}
                <div className="absolute z-20 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gray-800 rounded-full w-14 h-14 flex items-center justify-center border-2 border-gray-700 shadow-lg">
                  <span className="text-xl font-bold text-blue-500">TG</span>
                </div>
                
                {/* Fixed semicircle */}
                <svg className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" width="240" height="240" viewBox="0 0 240 240">
                  <path 
                    d="M120,0 A120,120 0 1,1 0,120"
                    fill="none"
                    stroke="#333"
                    strokeWidth="1"
                    strokeDasharray="2,2"
                  />
                </svg>
                
                {/* Rotating coins container */}
                <div 
                  className="absolute w-full h-full"
                  style={{ 
                    width: "240px", 
                    height: "240px",
                    top: "50%",
                    left: "50%",
                    transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
                    transformOrigin: "center"
                  }}
                >
                  {/* Bitcoin */}
                  <div className="absolute" style={{ top: "0", left: "50%", transform: "translate(-50%, -50%)" }}>
                    <div className="bg-yellow-500 rounded-full w-12 h-12 flex items-center justify-center text-white font-bold shadow-lg">₿</div>
                  </div>
                  
                  {/* Ethereum */}
                  <div className="absolute" style={{ top: "35px", right: "35px", transform: "translate(50%, -50%)" }}>
                    <div className="bg-blue-600 rounded-full w-12 h-12 flex items-center justify-center text-white font-bold shadow-lg">Ξ</div>
                  </div>
                  
                  {/* Tether */}
                  <div className="absolute" style={{ top: "120px", right: "0", transform: "translate(50%, -50%)" }}>
                    <div className="bg-teal-500 rounded-full w-12 h-12 flex items-center justify-center text-white font-bold shadow-lg">₮</div>
                  </div>
                  
                  {/* USDC */}
                  <div className="absolute" style={{ bottom: "35px", right: "35px", transform: "translate(50%, 50%)" }}>
                    <div className="bg-blue-400 rounded-full w-12 h-12 flex items-center justify-center text-white font-bold shadow-lg">$</div>
                  </div>
                  
                  {/* Binance Coin */}
                  <div className="absolute" style={{ bottom: "0", left: "50%", transform: "translate(-50%, 50%)" }}>
                    <div className="bg-orange-500 rounded-full w-12 h-12 flex items-center justify-center text-white font-bold shadow-lg">B</div>
                  </div>
                  
                  {/* Ripple */}
                  <div className="absolute" style={{ bottom: "35px", left: "35px", transform: "translate(-50%, 50%)" }}>
                    <div className="bg-blue-300 rounded-full w-12 h-12 flex items-center justify-center text-white font-bold shadow-lg">X</div>
                  </div>
                  
                  {/* Cardano */}
                  <div className="absolute" style={{ top: "120px", left: "0", transform: "translate(-50%, -50%)" }}>
                    <div className="bg-blue-800 rounded-full w-12 h-12 flex items-center justify-center text-white font-bold shadow-lg">A</div>
                  </div>
                  
                  {/* Solana */}
                  <div className="absolute" style={{ top: "35px", left: "35px", transform: "translate(-50%, -50%)" }}>
                    <div className="bg-purple-500 rounded-full w-12 h-12 flex items-center justify-center text-white font-bold shadow-lg">S</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-10 transform translate-x-200">
            <Crypto />
          </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Home;