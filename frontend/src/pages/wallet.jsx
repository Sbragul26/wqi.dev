import React, { useState, useEffect } from "react";
import Navbar from "../components/navbar"; // Import Navbar component

const Wallet = () => {
  const [hasWallet, setHasWallet] = useState(false);
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    checkForWallet();
    window.addEventListener("focus", checkForWallet);
    return () => window.removeEventListener("focus", checkForWallet);
  }, []);

  const checkForWallet = () => {
    const walletDetected =
      typeof window !== "undefined" &&
      (window.ethereum || window.martian || window.aptos || window.pontem);

    setHasWallet(!!walletDetected);
    console.log("Wallet detected:", !!walletDetected);

    if (window.ethereum) console.log("Ethereum wallet found");
    if (window.martian) console.log("Martian wallet found");
    if (window.aptos) console.log("Aptos wallet found");
    if (window.pontem) console.log("Pontem wallet found");
  };

  const connectExistingWallet = async () => {
    console.log("Connecting to existing wallet...");
    try {
      if (window.ethereum) {
        await window.ethereum.request({ method: "eth_requestAccounts" });
        console.log("Connected to Ethereum wallet");
      } else if (window.martian) {
        await window.martian.connect();
        console.log("Connected to Martian wallet");
      } else if (window.aptos) {
        await window.aptos.connect();
        console.log("Connected to Aptos wallet");
      }
    } catch (error) {
      console.error("Error connecting to wallet:", error);
      alert("Failed to connect. Please try again.");
    }
  };

  return (
    <div className="bg-gray-900 min-h-screen w-screen text-white">
      <Navbar /> {/* Added Navbar component */}

      <div className="flex flex-col items-center justify-center min-h-screen ml-55">
        <h1 className="text-3xl font-bold mb-6">Connect Your Wallet</h1>

        {hasWallet ? (
          <button
            onClick={connectExistingWallet}
            className="bg-blue-600 hover:bg-blue-700 text-black font-bold py-3 px-6 rounded-lg"
          >
            Connect Existing Wallet
          </button>
        ) : (
          <button
            onClick={() => setShowPopup(true)}
            className="bg-red-600 hover:bg-red-700 text-black font-bold py-3 px-6 rounded-lg"
          >
            I Don't Have a Wallet
          </button>
        )}

        {/* Show the popup if the user doesn't have a wallet */}
        {showPopup && <WalletPopup onClose={() => setShowPopup(false)} />}
      </div>
    </div>
  );
};

const WalletPopup = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-xl p-8 max-w-md w-full relative">
        {/* Close button */}
        <div className="flex justify-between mb-6">
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            ✖
          </button>
          <h2 className="text-white text-xl font-bold">Get a Wallet</h2>
        </div>

        {/* Wallet icons */}
        <div className="flex flex-col items-center mb-8">
          <p className="text-white text-center mb-8">
            Your wallet is the gateway to all things Web3.
          </p>

          <button
            onClick={() => window.open("https://martianwallet.xyz/download", "_blank")}
            className="bg-white text-gray-900 w-full py-4 px-6 rounded-full font-bold flex items-center justify-between"
          >
            Choose Your First Wallet
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Wallet;
