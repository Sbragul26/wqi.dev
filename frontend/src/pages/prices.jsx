import React, { useState, useEffect } from 'react';
import { ArrowDown, ArrowUp, ChevronDown, ChevronUp, Search, RefreshCw, Filter } from 'lucide-react';
import Navbar from '../components/navbar';

const Prices = () => {
  // State for crypto data
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [sortConfig, setSortConfig] = useState({
    key: 'market_cap_rank',
    direction: 'asc'
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedRows, setExpandedRows] = useState({});
  const [viewMode, setViewMode] = useState('compact'); // 'compact' or 'detailed'
  
  // Pagination state - CHANGED: items per page from 30 to 10
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Fetch data directly from CoinGecko API
  const fetchCryptoData = async () => {
    try {
      setLoading(true);
      // Use the direct CoinGecko API endpoint
      const response = await fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=false');
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const cryptoData = await response.json();
      setData(cryptoData);
      setError(null);
    } catch (err) {
      setError('Failed to fetch cryptocurrency data. Please try again later.');
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchCryptoData();
  }, []);

  // Format large numbers
  const formatNumber = (num) => {
    if (!num && num !== 0) return 'N/A';
    if (num >= 1e12) return (num / 1e12).toFixed(2) + 'T';
    if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
    if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
    if (num >= 1e3) return (num / 1e3).toFixed(2) + 'K';
    return num.toFixed(2);
  };

  // Format price
  const formatPrice = (price) => {
    if (!price && price !== 0) return 'N/A';
    if (price >= 1000) return '$' + formatNumber(price);
    if (price >= 1) return '$' + price.toFixed(2);
    return '$' + price.toFixed(6);
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric'
    });
  };

  // Handle sorting
  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Handle refresh
  const handleRefresh = () => {
    fetchCryptoData();
  };

  // Sort data based on current configuration
  const sortedData = [...data].sort((a, b) => {
    if (a[sortConfig.key] === null) return 1;
    if (b[sortConfig.key] === null) return -1;
    if (a[sortConfig.key] < b[sortConfig.key]) {
      return sortConfig.direction === 'asc' ? -1 : 1;
    }
    if (a[sortConfig.key] > b[sortConfig.key]) {
      return sortConfig.direction === 'asc' ? 1 : -1;
    }
    return 0;
  });

  // Filter data based on search term
  const filteredData = sortedData.filter(crypto => 
    crypto.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    crypto.symbol.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination logic
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Pagination handlers
  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goToPage = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  // Toggle row expansion
  const toggleRowExpansion = (id) => {
    setExpandedRows(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Render sort indicator
  const getSortIndicator = (key) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />;
  };

  return (
    <div className="w-screen min-h-screen bg-gray-900 text-white flex">
      {/* Side Navbar */}
      <div className="h-screen bg-gray-800">
        <Navbar />
      </div>
      
      {/* Main Content */}
      <div className="flex-1 p-4 overflow-x-hidden ml-80">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-1">
          <div className="mb-5 md:mb-0">
            <h2 className="text-2xl font-bold">Cryptocurrency Market</h2>
            <p className="text-sm text-gray-400 ml-2 mt-2">
              {loading 
                ? 'Loading cryptocurrency data...' 
                : `Live prices and stats for ${data.length} cryptocurrencies • Showing ${paginatedData.length} per page`
              }
            </p>
          </div>
          <div className="flex flex-wrap gap-5 items-center">
            <div className="relative">
              <input
                type="text"
                placeholder="Search coins..."
                className="pl-10 pr-7 py-2 bg-gray-800 rounded-lg text-sm w-full md:w-89 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search size={16} className="absolute left-3 top-2.5 text-gray-400" />
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setViewMode('compact')}
                className={`px-3 py-2 text-xs rounded-md ${viewMode === 'compact' ? 'bg-indigo-500 text-black' : 'bg-gray-800 text-gray-700'}`}
              >
                Compact
              </button>
              <button 
                onClick={() => setViewMode('detailed')}
                className={`px-3 py-2 text-xs rounded-md ${viewMode === 'detailed' ? 'bg-indigo-500 text-black' : 'bg-gray-800 text-gray-700'}`}
              >
                Detailed
              </button>
            </div>
            <button 
               className="p-2 rounded-full bg-gray-800 hover:bg-gray-700 text-black mr-4" 
              onClick={handleRefresh}
              disabled={loading}
            >
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            </button>
          </div>
        </div>

        {/* Error display */}
        {error && (
          <div className="mb-6 p-4 bg-red-900/30 border border-red-700 rounded-lg text-red-400">
            <p>{error}</p>
            <button 
              className="mt-2 px-3 py-1 bg-red-800 hover:bg-red-700 rounded-md text-sm"
              onClick={handleRefresh}
            >
              Try Again
            </button>
          </div>
        )}

        {/* Loading state */}
        {loading ? (
          <div className="flex items-center justify-center h-64 bg-gray-800 rounded-xl">
            <div className="flex flex-col items-center">
              <RefreshCw size={32} className="animate-spin text-indigo-500 mb-4" />
              <p>Loading cryptocurrency data...</p>
            </div>
          </div>
        ) : (
          /* Table */
          <div className="bg-gray-800 rounded-xl overflow-hidden w-[90%] ml-1 mt-15">
            <div className="overflow-x-auto  w-full">
              {filteredData.length === 0 ? (
                <div className="flex items-center justify-center h-64">
                  <p className="text-gray-400">No cryptocurrencies found matching your search criteria.</p>
                </div>
              ) : (
                <table className="w-full min-w-full">

                  <thead>
                    <tr className="text-xs text-gray-400 border-b border-gray-700">
                      <th className="p-4 text-left cursor-pointer" onClick={() => requestSort('market_cap_rank')}>
                        <div className="flex items-center">
                          <span>#</span>
                          {getSortIndicator('market_cap_rank')}
                        </div>
                      </th>
                      <th className="p-4 text-left cursor-pointer" onClick={() => requestSort('name')}>
                        <div className="flex items-center">
                          <span>Name</span>
                          {getSortIndicator('name')}
                        </div>
                      </th>
                      <th className="p-4 text-right cursor-pointer" onClick={() => requestSort('current_price')}>
                        <div className="flex items-center justify-end">
                          <span>Price</span>
                          {getSortIndicator('current_price')}
                        </div>
                      </th>
                      <th className="p-4 text-right cursor-pointer" onClick={() => requestSort('price_change_percentage_24h')}>
                        <div className="flex items-center justify-end">
                          <span>24h %</span>
                          {getSortIndicator('price_change_percentage_24h')}
                        </div>
                      </th>
                      {viewMode === 'detailed' && (
                        <>
                          <th className="p-4 text-right cursor-pointer" onClick={() => requestSort('market_cap')}>
                            <div className="flex items-center justify-end">
                              <span>Market Cap</span>
                              {getSortIndicator('market_cap')}
                            </div>
                          </th>
                          <th className="p-4 text-right cursor-pointer" onClick={() => requestSort('total_volume')}>
                            <div className="flex items-center justify-end">
                              <span>Volume (24h)</span>
                              {getSortIndicator('total_volume')}
                            </div>
                          </th>
                          <th className="p-4 text-right cursor-pointer" onClick={() => requestSort('circulating_supply')}>
                            <div className="flex items-center justify-end">
                              <span>Circulating Supply</span>
                              {getSortIndicator('circulating_supply')}
                            </div>
                          </th>
                        </>
                      )}
                      <th className="p-4 text-center">
                        <Filter size={14} />
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedData.map((crypto) => (
                      <React.Fragment key={crypto.id}>
                        <tr 
                          className="border-b border-gray-700 hover:bg-gray-700 cursor-pointer"
                          onClick={() => toggleRowExpansion(crypto.id)}
                        >
                          <td className="p-4 whitespace-nowrap">
                            {crypto.market_cap_rank}
                          </td>
                          <td className="p-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="w-8 h-8 bg-gray-700 rounded-full mr-3 flex items-center justify-center overflow-hidden">
                                {crypto.image ? (
                                  <img src={crypto.image} alt={crypto.name} className="w-full h-full object-cover" />
                                ) : (
                                  <img src="/api/placeholder/32/32" alt={crypto.name} className="rounded-full" />
                                )}
                              </div>
                              <div>
                                <div className="font-medium">{crypto.name}</div>
                                <div className="text-xs text-gray-400 uppercase">{crypto.symbol}</div>
                              </div>
                            </div>
                          </td>
                          <td className="p-4 text-right whitespace-nowrap font-medium">
                            {formatPrice(crypto.current_price)}
                          </td>
                          <td className="p-4 text-right whitespace-nowrap">
                            <div 
                              className={`inline-flex items-center px-2 py-1 rounded ${
                                crypto.price_change_percentage_24h < 0 ? 'bg-red-900/30 text-red-400' : 'bg-green-900/30 text-green-400'
                              }`}
                            >
                              {crypto.price_change_percentage_24h < 0 ? 
                                <ArrowDown size={12} className="mr-1" /> : 
                                <ArrowUp size={12} className="mr-1" />
                              }
                              {Math.abs(crypto.price_change_percentage_24h || 0).toFixed(2)}%
                            </div>
                          </td>
                          {viewMode === 'detailed' && (
                            <>
                              <td className="p-4 text-right whitespace-nowrap">
                                ${formatNumber(crypto.market_cap)}
                              </td>
                              <td className="p-4 text-right whitespace-nowrap">
                                ${formatNumber(crypto.total_volume)}
                              </td>
                              <td className="p-4 text-right whitespace-nowrap">
                                {formatNumber(crypto.circulating_supply)} {crypto.symbol.toUpperCase()}
                              </td>
                            </>
                          )}
                          <td className="p-4 text-center">
                            {expandedRows[crypto.id] ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                          </td>
                        </tr>
                        {expandedRows[crypto.id] && (
                          <tr className="bg-gray-700">
                            <td colSpan={viewMode === 'compact' ? 5 : 8} className="p-4">
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                  <h3 className="text-sm font-medium mb-3">Price Statistics</h3>
                                  <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                      <span className="text-gray-400">Price Change (24h)</span>
                                      <span className={crypto.price_change_24h < 0 ? 'text-red-400' : 'text-green-400'}>
                                        {formatPrice(crypto.price_change_24h)}
                                      </span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-gray-400">24h Low / 24h High</span>
                                      <span>{formatPrice(crypto.low_24h)} / {formatPrice(crypto.high_24h)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-gray-400">All-Time High</span>
                                      <span>{formatPrice(crypto.ath)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-gray-400">All-Time Low</span>
                                      <span>{formatPrice(crypto.atl)}</span>
                                    </div>
                                  </div>
                                </div>
                                
                                <div>
                                  <h3 className="text-sm font-medium mb-3">Market Stats</h3>
                                  <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                      <span className="text-gray-400">Market Cap</span>
                                      <span>${formatNumber(crypto.market_cap)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-gray-400">Market Cap Change (24h)</span>
                                      <span className={crypto.market_cap_change_percentage_24h < 0 ? 'text-red-400' : 'text-green-400'}>
                                        {(crypto.market_cap_change_percentage_24h || 0).toFixed(2)}%
                                      </span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-gray-400">Volume (24h)</span>
                                      <span>${formatNumber(crypto.total_volume)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-gray-400">Volume / Market Cap</span>
                                      <span>{((crypto.total_volume || 0) / (crypto.market_cap || 1)).toFixed(4)}</span>
                                    </div>
                                  </div>
                                </div>
                                
                                <div>
                                  <h3 className="text-sm font-medium mb-3">Supply Information</h3>
                                  <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                      <span className="text-gray-400">Circulating Supply</span>
                                      <span>{formatNumber(crypto.circulating_supply)} {crypto.symbol.toUpperCase()}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-gray-400">Total Supply</span>
                                      <span>{crypto.total_supply ? `${formatNumber(crypto.total_supply)} ${crypto.symbol.toUpperCase()}` : 'N/A'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-gray-400">Max Supply</span>
                                      <span>{crypto.max_supply ? `${formatNumber(crypto.max_supply)} ${crypto.symbol.toUpperCase()}` : 'Unlimited'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-gray-400">Last Updated</span>
                                      <span>{formatDate(crypto.last_updated)}</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              
                              {/* Supply Progress Bar */}
                              {crypto.max_supply && (
                                <div className="mt-4">
                                  <div className="flex justify-between text-xs mb-1">
                                    <span>Circulating Supply Progress</span>
                                    <span>{((crypto.circulating_supply / crypto.max_supply) * 100).toFixed(2)}%</span>
                                  </div>
                                  <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                                    <div 
                                      className="h-full bg-indigo-500"
                                      style={{
                                        width: `${Math.min((crypto.circulating_supply / crypto.max_supply) * 100, 100)}%`
                                      }}
                                    ></div>
                                  </div>
                                </div>
                              )}
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}
        
        {/* Pagination control - FIXED: alignment, visibility, and styling */}
        <div className="flex justify-center mt-7">
  <div className="inline-flex items-center rounded-md shadow-sm space-x-2">
    {/* Previous Button */}
    <button 
      className={`px-5 py-2 text-sm font-medium ${currentPage === 1 ? 'bg-gray-700 text-gray-800 cursor-not-allowed' : 'bg-gray-800 text-black hover:bg-gray-700'} rounded-l-md border border-gray-600`}
      onClick={goToPreviousPage}
      disabled={currentPage === 1}
    >
      Previous
    </button>

    {/* Page Numbers */}
    {[...Array(Math.min(totalPages, 5))].map((_, i) => {
      let pageToShow;
      if (totalPages <= 5) {
        pageToShow = i + 1;
      } else if (currentPage <= 3) {
        pageToShow = i + 1;
      } else if (currentPage >= totalPages - 2) {
        pageToShow = totalPages - 4 + i;
      } else {
        pageToShow = currentPage - 2 + i;
      }
      
      return (
        <button 
          key={pageToShow}
          className={`px-4 py-2 mx-1 text-sm font-medium border border-gray-800 ${
            currentPage === pageToShow ? 'bg-indigo-800 text-black' : 'bg-gray-800 text-gray-800 hover:bg-gray-700'
          }`}
          onClick={() => goToPage(pageToShow)}
        >
          {pageToShow}
        </button>
      );
    })}

    {/* Next Button */}
    <button 
      className={`px-5 py-2 text-sm font-medium ${currentPage === totalPages ? 'bg-gray-700 text-gray-800 cursor-not-allowed' : 'bg-gray-800 text-black hover:bg-gray-700'} rounded-r-md border border-gray-600`}
      onClick={goToNextPage}
      disabled={currentPage === totalPages}
    >
      Next
    </button>
  </div>
</div>
      </div>
    </div>
  );
};

export default Prices;