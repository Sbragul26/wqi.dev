import React, { useState } from 'react';
import Navbar from "../components/navbar";

const Trade = () => {
  const [formData, setFormData] = useState({
    // Basic User Preferences
    tradingPair: '',
    tradeType: '',
    orderType: '',
    entryPrice: '',
    investmentAmount: '',
    leverage: '1x',
    marginMode: '',
    
    // Risk Management
    stopLossPrice: '',
    takeProfitPrice: '',
    riskToleranceLevel: '',
    
    // AI & Automation
    autoHedging: false,
    dynamicLeverage: false,
    liquidationPrevention: false
  });

  const [currentSection, setCurrentSection] = useState(1);
  const totalSections = 3;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    // Here you would typically send the data to your backend
    alert('Trading setup completed successfully!');
  };

  const nextSection = () => {
    if (currentSection < totalSections) {
      setCurrentSection(currentSection + 1);
      window.scrollTo(0, 0);
    }
  };

  const prevSection = () => {
    if (currentSection > 1) {
      setCurrentSection(currentSection - 1);
      window.scrollTo(0, 0);
    }
  };

  // Helper function to render section indicator
  const renderSectionIndicator = () => {
    return (
      <div className="flex items-center justify-center my-6">
        {[1, 2, 3].map((num) => (
          <div key={num} className="flex items-center">
            <div 
              onClick={() => setCurrentSection(num)}
              className={`w-10 h-10 rounded-full flex items-center justify-center cursor-pointer transition-all duration-300 ${
                currentSection === num ? 'bg-indigo-600 text-gray-100' : 'bg-gray-700 text-gray-300'
              }`}
            >
              {num}
            </div>
            {num < totalSections && (
              <div className={`w-16 h-1 ${currentSection > num ? 'bg-indigo-600' : 'bg-gray-700'}`}></div>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="flex w-screen min-h-screen bg-gray-900 text-gray-200">
      {/* Navbar on the left */}
      <div className="w-70 flex-shrink-0">
        <Navbar />
      </div>
      
      {/* Main content on the right */}
      <div className="flex-1 p-6 overflow-auto">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-100 mb-2">Trading Setup Configuration</h2>
          <p className="text-center text-gray-400 mb-6">Complete your trading preferences in 3 simple steps</p>
          
          {renderSectionIndicator()}
          
          <div className="bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700 transition-all duration-500">
            <form onSubmit={handleSubmit}>
              
              {/* Section 1: Basic User Preferences */}
              {currentSection === 1 && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold text-gray-100 mb-4 flex items-center">
                    <span className="bg-indigo-600 text-gray-100 w-8 h-8 rounded-full flex items-center justify-center mr-2">1</span>
                    Trade Setup Inputs
                  </h2>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Trading Pair</label>
                      <select 
                        name="tradingPair" 
                        value={formData.tradingPair} 
                        onChange={handleChange}
                        className="w-full p-3 border border-gray-600 rounded-md bg-gray-700 text-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        required
                      >
                        <option value="">Select Trading Pair</option>
                        <option value="BTC/USDT">BTC/USDT</option>
                        <option value="ETH/USDT">ETH/USDT</option>
                        <option value="APT/USDT">APT/USDT</option>
                        <option value="SOL/USDT">SOL/USDT</option>
                        <option value="BNB/USDT">BNB/USDT</option>
                      </select>
                      <p className="mt-1 text-xs text-gray-400">The crypto pair to trade</p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Trade Type</label>
                      <div className="flex space-x-4">
                        <label className="inline-flex items-center">
                          <input
                            type="radio"
                            name="tradeType"
                            value="Long (BUY)"
                            checked={formData.tradeType === "Long (BUY)"}
                            onChange={handleChange}
                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 bg-gray-700 border-gray-600"
                          />
                          <span className="ml-2 text-gray-300">Long (BUY)</span>
                        </label>
                        <label className="inline-flex items-center">
                          <input
                            type="radio"
                            name="tradeType"
                            value="Short (SELL)"
                            checked={formData.tradeType === "Short (SELL)"}
                            onChange={handleChange}
                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 bg-gray-700 border-gray-600"
                          />
                          <span className="ml-2 text-gray-300">Short (SELL)</span>
                        </label>
                      </div>
                      <p className="mt-1 text-xs text-gray-400">Direction of the trade</p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Order Type</label>
                      <select 
                        name="orderType" 
                        value={formData.orderType} 
                        onChange={handleChange}
                        className="w-full p-3 border border-gray-600 rounded-md bg-gray-700 text-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        required
                      >
                        <option value="">Select Order Type</option>
                        <option value="Market">Market</option>
                        <option value="Limit">Limit</option>
                        <option value="Stop-Loss">Stop-Loss</option>
                        <option value="Take-Profit">Take-Profit</option>
                      </select>
                      <p className="mt-1 text-xs text-gray-400">How the order is placed</p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Entry Price (for Limit Orders)</label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">$</span>
                        <input 
                          type="number" 
                          name="entryPrice" 
                          value={formData.entryPrice} 
                          onChange={handleChange}
                          placeholder="0.00"
                          className="w-full p-3 pl-8 border border-gray-600 rounded-md bg-gray-700 text-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </div>
                      <p className="mt-1 text-xs text-gray-400">The price at which to enter</p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Investment Amount</label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">$</span>
                        <input 
                          type="number" 
                          name="investmentAmount" 
                          value={formData.investmentAmount} 
                          onChange={handleChange}
                          placeholder="1000"
                          className="w-full p-3 pl-8 border border-gray-600 rounded-md bg-gray-700 text-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          required
                        />
                      </div>
                      <p className="mt-1 text-xs text-gray-400">How much you are investing</p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Leverage</label>
                      <div className="flex items-center mt-2">
                        <input
                          type="range"
                          min="1"
                          max="20"
                          step="1"
                          value={parseInt(formData.leverage)}
                          onChange={(e) => setFormData({...formData, leverage: `${e.target.value}x`})}
                          className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                        />
                        <span className="ml-4 font-medium text-indigo-400">{formData.leverage}</span>
                      </div>
                      <div className="flex justify-between text-xs text-gray-400 mt-1">
                        <span>1x</span>
                        <span>5x</span>
                        <span>10x</span>
                        <span>20x</span>
                      </div>
                      <p className="mt-1 text-xs text-gray-400">The multiplier for the trade</p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Margin Mode</label>
                      <div className="flex space-x-4">
                        <label className="inline-flex items-center">
                          <input
                            type="radio"
                            name="marginMode"
                            value="Cross"
                            checked={formData.marginMode === "Cross"}
                            onChange={handleChange}
                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 bg-gray-700 border-gray-600"
                          />
                          <span className="ml-2 text-gray-300">Cross Margin</span>
                        </label>
                        <label className="inline-flex items-center">
                          <input
                            type="radio"
                            name="marginMode"
                            value="Isolated"
                            checked={formData.marginMode === "Isolated"}
                            onChange={handleChange}
                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 bg-gray-700 border-gray-600"
                          />
                          <span className="ml-2 text-gray-300">Isolated Margin</span>
                        </label>
                      </div>
                      <p className="mt-1 text-xs text-gray-400">Cross Margin or Isolated Margin</p>
                    </div>
                  </div>
                  
                  <div className="flex justify-end mt-8">
                    <button
                      type="button"
                      onClick={nextSection}
                      className="px-6 py-3 bg-indigo-600 text-black rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-800 transition"
                    >
                      Next Step
                    </button>
                  </div>
                </div>
              )}
              
              {/* Section 2: Risk Management */}
              {currentSection === 2 && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold text-gray-100 mb-4 flex items-center">
                    <span className="bg-indigo-600 text-gray-100 w-8 h-8 rounded-full flex items-center justify-center mr-2">2</span>
                    Risk Management Inputs
                  </h2>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Stop-Loss Price</label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">$</span>
                        <input 
                          type="number" 
                          name="stopLossPrice" 
                          value={formData.stopLossPrice} 
                          onChange={handleChange}
                          placeholder="47,000"
                          className="w-full p-3 pl-8 border border-gray-600 rounded-md bg-gray-700 text-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </div>
                      <p className="mt-1 text-xs text-gray-400">Automatically exit trade at a loss</p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Take-Profit Price</label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">$</span>
                        <input 
                          type="number" 
                          name="takeProfitPrice" 
                          value={formData.takeProfitPrice} 
                          onChange={handleChange}
                          placeholder="52,000"
                          className="w-full p-3 pl-8 border border-gray-600 rounded-md bg-gray-700 text-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </div>
                      <p className="mt-1 text-xs text-gray-400">Automatically exit trade at a profit</p>
                    </div>
                    
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-300 mb-3">Risk Tolerance Level</label>
                      <div className="flex items-center justify-between space-x-4">
                        <label className={`flex-1 flex flex-col items-center p-4 border rounded-lg cursor-pointer transition-all ${formData.riskToleranceLevel === 'Low' ? 'border-indigo-500 bg-gray-700' : 'border-gray-600 bg-gray-800'}`}>
                          <input
                            type="radio"
                            name="riskToleranceLevel"
                            value="Low"
                            checked={formData.riskToleranceLevel === "Low"}
                            onChange={handleChange}
                            className="sr-only"
                          />
                          <div className="w-10 h-10 rounded-full bg-green-900 flex items-center justify-center mb-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                          <span className="font-medium text-gray-200">Low Risk</span>
                          <span className="text-xs text-gray-400 mt-1">Conservative approach</span>
                        </label>
                        
                        <label className={`flex-1 flex flex-col items-center p-4 border rounded-lg cursor-pointer transition-all ${formData.riskToleranceLevel === 'Medium' ? 'border-indigo-500 bg-gray-700' : 'border-gray-600 bg-gray-800'}`}>
                          <input
                            type="radio"
                            name="riskToleranceLevel"
                            value="Medium"
                            checked={formData.riskToleranceLevel === "Medium"}
                            onChange={handleChange}
                            className="sr-only"
                          />
                          <div className="w-10 h-10 rounded-full bg-yellow-900 flex items-center justify-center mb-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                          </div>
                          <span className="font-medium text-gray-200">Medium Risk</span>
                          <span className="text-xs text-gray-400 mt-1">Balanced approach</span>
                        </label>
                        
                        <label className={`flex-1 flex flex-col items-center p-4 border rounded-lg cursor-pointer transition-all ${formData.riskToleranceLevel === 'High' ? 'border-indigo-500 bg-gray-700' : 'border-gray-600 bg-gray-800'}`}>
                          <input
                            type="radio"
                            name="riskToleranceLevel"
                            value="High"
                            checked={formData.riskToleranceLevel === "High"}
                            onChange={handleChange}
                            className="sr-only"
                          />
                          <div className="w-10 h-10 rounded-full bg-red-900 flex items-center justify-center mb-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                          </div>
                          <span className="font-medium text-gray-200">High Risk</span>
                          <span className="text-xs text-gray-400 mt-1">Aggressive approach</span>
                        </label>
                      </div>
                      <p className="mt-3 text-xs text-gray-400">AI adjusts strategy based on risk</p>
                    </div>
                  </div>
                  
                  <div className="flex justify-between mt-8">
                    <button
                      type="button"
                      onClick={prevSection}
                      className="px-6 py-3 border border-gray-800 text-gray-800 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-800 focus:ring-offset-2 focus:ring-offset-gray-800 transition"
                    >
                      Previous Step
                    </button>
                    <button
                      type="button"
                      onClick={nextSection}
                      className="px-6 py-3 bg-indigo-600 text-black rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-800 transition"
                    >
                      Next Step
                    </button>
                  </div>
                </div>
              )}
              
              {/* Section 3: AI & Automation */}
              {currentSection === 3 && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold text-gray-100 mb-4 flex items-center">
                    <span className="bg-indigo-600 text-gray-100 w-8 h-8 rounded-full flex items-center justify-center mr-2">3</span>
                    AI & Automation Preferences
                  </h2>
                  
                  <div className="space-y-6">
                    <div className="bg-gray-700 p-6 rounded-lg border border-gray-600">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium text-gray-200">Auto Hedging</h3>
                          <p className="text-sm text-gray-400 mt-1">AI opens hedge positions to protect against adverse market movements</p>
                        </div>
                        <label className="inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            name="autoHedging" 
                            checked={formData.autoHedging} 
                            onChange={handleChange}
                            className="sr-only"
                          />
                          <div className={`relative w-14 h-7 transition-colors duration-200 ease-in-out rounded-full ${formData.autoHedging ? 'bg-indigo-600' : 'bg-gray-600'}`}>
                            <div className={`absolute left-1 top-1 bg-gray-200 w-5 h-5 rounded-full transition-transform duration-200 ease-in-out ${formData.autoHedging ? 'transform translate-x-7' : ''}`}></div>
                          </div>
                        </label>
                      </div>
                    </div>
                    
                    <div className="bg-gray-700 p-6 rounded-lg border border-gray-600">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium text-gray-200">Dynamic Leverage</h3>
                          <p className="text-sm text-gray-400 mt-1">AI adjusts leverage to prevent liquidation based on market volatility</p>
                        </div>
                        <label className="inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            name="dynamicLeverage" 
                            checked={formData.dynamicLeverage} 
                            onChange={handleChange}
                            className="sr-only"
                          />
                          <div className={`relative w-14 h-7 transition-colors duration-200 ease-in-out rounded-full ${formData.dynamicLeverage ? 'bg-indigo-600' : 'bg-gray-600'}`}>
                            <div className={`absolute left-1 top-1 bg-gray-200 w-5 h-5 rounded-full transition-transform duration-200 ease-in-out ${formData.dynamicLeverage ? 'transform translate-x-7' : ''}`}></div>
                          </div>
                        </label>
                      </div>
                    </div>
                    
                    <div className="bg-gray-700 p-6 rounded-lg border border-gray-600">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium text-gray-200">Liquidation Prevention</h3>
                          <p className="text-sm text-gray-400 mt-1">AI manages margin to avoid liquidation during high volatility</p>
                        </div>
                        <label className="inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            name="liquidationPrevention" 
                            checked={formData.liquidationPrevention} 
                            onChange={handleChange}
                            className="sr-only"
                          />
                          <div className={`relative w-14 h-7 transition-colors duration-200 ease-in-out rounded-full ${formData.liquidationPrevention ? 'bg-indigo-600' : 'bg-gray-600'}`}>
                            <div className={`absolute left-1 top-1 bg-gray-200 w-5 h-5 rounded-full transition-transform duration-200 ease-in-out ${formData.liquidationPrevention ? 'transform translate-x-7' : ''}`}></div>
                          </div>
                        </label>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-indigo-900 border border-indigo-700 rounded-lg p-4 mt-6">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-indigo-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3 flex-1 md:flex md:justify-between">
                        <p className="text-sm text-indigo-300">
                          AI features help protect your investment but cannot guarantee profits. Trading involves risk.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between mt-8">
                    <button
                      type="button"
                      onClick={prevSection}
                      className="px-6 py-3 border border-gray-600 text-gray-800 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-800 transition"
                    >
                      Previous Step
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-3 bg-green-600 text-black rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-gray-800 transition"
                    >
                      Complete Setup
                    </button>
                  </div>
                </div>
              )}
              
            </form>
          </div>
          
          {/* Form Preview */}
          <div className="mt-8 bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700">
            <h3 className="text-lg font-semibold text-gray-100 mb-4">Trading Setup Preview</h3>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              {formData.tradingPair && (
                <div className="bg-gray-700 p-3 rounded border border-gray-600">
                  <span className="text-gray-400">Trading Pair:</span>
                  <span className="block font-medium text-gray-200">{formData.tradingPair}</span>
                </div>
              )}
              
              {formData.tradeType && (
                <div className="bg-gray-700 p-3 rounded border border-gray-600">
                  <span className="text-gray-400">Trade Type:</span>
                  <span className={`block font-medium ${formData.tradeType.includes('Long') ? 'text-green-400' : 'text-red-400'}`}>{formData.tradeType}</span>
                </div>
              )}
              
              {formData.investmentAmount && (
                <div className="bg-gray-700 p-3 rounded border border-gray-600">
                  <span className="text-gray-400">Investment:</span>
                  <span className="block font-medium text-gray-200">${formData.investmentAmount}</span>
                </div>
              )}
              
              {formData.leverage && (
                <div className="bg-gray-700 p-3 rounded border border-gray-600">
                  <span className="text-gray-400">Leverage:</span>
                  <span className="block font-medium text-gray-200">{formData.leverage}</span>
                </div>
              )}
              
              {formData.stopLossPrice && (
                <div className="bg-gray-700 p-3 rounded border border-gray-600">
                  <span className="text-gray-400">Stop-Loss:</span>
                  <span className="block font-medium text-gray-200">${formData.stopLossPrice}</span>
                </div>
              )}
              
              {formData.takeProfitPrice && (
                <div className="bg-gray-700 p-3 rounded border border-gray-600">
                  <span className="text-gray-400">Take-Profit:</span>
                  <span className="block font-medium text-gray-200">${formData.takeProfitPrice}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Trade;