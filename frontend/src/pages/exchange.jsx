import Navbar from "../components/navbar";
import { useState, useEffect } from "react";
import axios from "axios";

const Exchange = () => {
  const [fromCoin, setFromCoin] = useState("");
  const [toCoin, setToCoin] = useState("");
  const [amount, setAmount] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [animateNumber, setAnimateNumber] = useState(false);
  const [theme, setTheme] = useState("dark");

  const popularCoins = [
    { name: "Bitcoin", symbol: "BTC", color: "#F7931A" },
    { name: "Ethereum", symbol: "ETH", color: "#627EEA" },
    { name: "Solana", symbol: "SOL", color: "#00FFA3" },
    { name: "Cardano", symbol: "ADA", color: "#0033AD" },
  ];

  const handleSwap = () => {
    setFromCoin(toCoin);
    setToCoin(fromCoin);
  };

  const handleConvert = async () => {
    if (!fromCoin || !toCoin || !amount) {
      setError("Please fill all fields.");
      return;
    }
    setError("");
    setIsLoading(true);

    try {
      const response = await axios.get(
        `http://localhost:8080/convert?from_coin=${fromCoin}&to_coin=${toCoin}&amount=${amount}`
      );
      setIsLoading(false);
      setAnimateNumber(true);
      setTimeout(() => {
        setResult(response.data);
        setAnimateNumber(false);
      }, 500);
    } catch (err) {
      console.error("Error fetching exchange rate:", err);
      setError("Failed to fetch exchange rate. Try again.");
      setIsLoading(false);
    }
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const themeClasses = {
    dark: {
      background: "bg-gradient-to-br from-gray-900 to-gray-800",
      card: "bg-gray-800 bg-opacity-70 border-gray-700",
      input: "bg-gray-700 border-gray-600 text-white",
      text: "text-white",
      subtext: "text-gray-400",
    },
    light: {
      background: "bg-gradient-to-br from-blue-50 to-indigo-50",
      card: "bg-white bg-opacity-80 border-gray-200",
      input: "bg-white border-gray-300 text-gray-800",
      text: "text-gray-800",
      subtext: "text-gray-500",
    },
  };

  return (
    <div className={`w-screen min-h-screen ${themeClasses[theme].background} ${themeClasses[theme].text} overflow-hidden flex transition-colors duration-500`}>
      {/* Sidebar Navigation */}
      <div className="w-1/4 min-w-[250px] h-screen">
        <Navbar />
      </div>

      {/* Main Exchange UI */}
      <div className="flex-grow flex flex-col items-center justify-center p-8 mr-30">
        <div className="absolute top-4 right-4">
          <button 
            onClick={toggleTheme} 
            className="p-2 rounded-full bg-opacity-20 hover:bg-opacity-30 transition-all"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>
        </div>

        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex items-center space-x-3 mb-2">
              <div className="flex space-x-1">
                {['#3B82F6', '#8B5CF6', '#EC4899', '#F59E0B'].map((color, index) => (
                  <div key={index} className="w-2 h-2 rounded-full" style={{ backgroundColor: color }}></div>
                ))}
              </div>
              <span className={`text-sm ${themeClasses[theme].subtext} font-medium uppercase tracking-wider`}>Crypto Exchange</span>
              <div className="flex space-x-1">
                {['#F59E0B', '#EC4899', '#8B5CF6', '#3B82F6'].map((color, index) => (
                  <div key={index} className="w-2 h-2 rounded-full" style={{ backgroundColor: color }}></div>
                ))}
              </div>
            </div>
            <h2 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500">
              Crypto Converter
            </h2>
            <p className={`${themeClasses[theme].subtext} mt-2 text-sm`}>Fast, secure cryptocurrency exchange rates</p>
          </div>

          <div className={`${themeClasses[theme].card} backdrop-blur-xl p-6 rounded-2xl shadow-xl border transition-all duration-500`}>
            {/* Popular coins */}
            <div className="mb-5">
              <p className={`text-xs font-medium mb-2 ${themeClasses[theme].subtext} uppercase tracking-wider`}>Popular Coins</p>
              <div className="flex flex-wrap gap-2">
                {popularCoins.map((coin) => (
                  <button
                    key={coin.symbol}
                    onClick={() => !fromCoin ? setFromCoin(coin.name.toLowerCase()) : setToCoin(coin.name.toLowerCase())}
                    className="flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium border border-opacity-20 transition-all hover:shadow-sm"
                    style={{ 
                      backgroundColor: `${coin.color}20`, 
                      borderColor: coin.color,
                      color: coin.color 
                    }}
                  >
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: coin.color }}></span>
                    {coin.symbol}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div className="group">
                <label className={`block text-sm font-medium ${themeClasses[theme].subtext} mb-1 group-focus-within:text-blue-500 transition-colors`}>
                  From Coin
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="e.g., bitcoin"
                    className={`w-full p-3 rounded-lg ${themeClasses[theme].input} border focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-30 focus:outline-none transition-all text-sm`}
                    value={fromCoin}
                    onChange={(e) => setFromCoin(e.target.value)}
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 text-blue-500">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="flex justify-center my-1">
                <button 
                  onClick={handleSwap}
                  className="bg-blue-500 bg-opacity-10 hover:bg-opacity-20 rounded-full p-1.5 transform transition-all hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                </button>
              </div>

              <div className="group">
                <label className={`block text-sm font-medium ${themeClasses[theme].subtext} mb-1 group-focus-within:text-blue-500 transition-colors`}>
                  To Coin
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="e.g., ethereum"
                    className={`w-full p-3 rounded-lg ${themeClasses[theme].input} border focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-30 focus:outline-none transition-all text-sm`}
                    value={toCoin}
                    onChange={(e) => setToCoin(e.target.value)}
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 text-blue-500">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="group">
                <label className={`block text-sm font-medium ${themeClasses[theme].subtext} mb-1 group-focus-within:text-blue-500 transition-colors`}>
                  Amount
                </label>
                <div className="relative">
                  <input
                    type="number"
                    placeholder="Enter amount"
                    className={`w-full p-3 rounded-lg ${themeClasses[theme].input} border focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-30 focus:outline-none transition-all text-sm`}
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 text-blue-500">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </div>

              <button
                onClick={handleConvert}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 p-3 rounded-lg text-white font-medium hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transform transition-all hover:scale-[1.02] active:scale-[0.98] shadow-md text-sm"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Converting...
                  </span>
                ) : (
                  <span className="flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 8l3 5m0 0l3-5m-3 5v4m-3-5h6m-6 3h6m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Convert Now
                  </span>
                )}
              </button>
            </div>

            {error && (
              <div className="mt-4 rounded-lg bg-red-500 bg-opacity-20 border border-red-500 p-3 text-center">
                <p className="text-red-500 dark:text-red-300 flex items-center justify-center text-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {error}
                </p>
              </div>
            )}

            {result && (
              <div className={`mt-5 rounded-lg ${theme === 'dark' ? 'bg-blue-900/30' : 'bg-blue-50'} p-4 text-center border ${theme === 'dark' ? 'border-blue-700/50' : 'border-blue-200'} transition-all duration-500`}>
                <p className={`${themeClasses[theme].subtext} mb-2 text-xs font-medium uppercase tracking-wider`}>Conversion Result</p>
                <div className="flex items-center justify-center">
                  <div className="text-lg">
                    <span className="font-medium">{result.amount}</span>
                    <span className={`${themeClasses[theme].subtext} ml-1 uppercase text-xs`}>{result.from_coin}</span>
                  </div>
                  <div className="mx-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </div>
                  <div className="text-lg">
                    <span className={`font-bold ${animateNumber ? 'animate-pulse' : ''} text-green-500`}>{result.estimated_receive}</span>
                    <span className={`${themeClasses[theme].subtext} ml-1 uppercase text-xs`}>{result.to_coin}</span>
                  </div>
                </div>
                <div className="mt-3 pt-2 border-t border-gray-200 dark:border-gray-700 flex justify-between text-xs">
                  <span className={themeClasses[theme].subtext}>Updated just now</span>
                  <span className="text-blue-500 font-medium">Details</span>
                </div>
              </div>
            )}

            {!result && !error && (
              <div className={`mt-4 text-center ${themeClasses[theme].subtext} text-xs rounded-lg border border-dashed ${theme === 'dark' ? 'border-gray-700' : 'border-gray-300'} p-4`}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mx-auto mb-2 text-blue-500 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
                <p>Enter details and click "Convert Now"</p>
              </div>
            )}
          </div>

          <div className="mt-4 text-center text-xs flex justify-center space-x-4">
            <div className="flex items-center text-green-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span>Secure</span>
            </div>
            <div className="flex items-center text-blue-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span>Fast</span>
            </div>
            <div className="flex items-center text-purple-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span>No fees</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Exchange;