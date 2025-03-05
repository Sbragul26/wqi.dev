import React, { useState, useEffect } from 'react';
import { AptosClient } from 'aptos';

const Blockchain = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const transactionsPerPage = 5;

  // Aptos Testnet Configuration
  const NODE_URL = "https://fullnode.testnet.aptoslabs.com";
  const ACCOUNT_ADDRESS = "0xe0f5d08c01462815ff2ae4816eaa6678f77fa26722d4e9ee456acfe966414b45";

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const client = new AptosClient(NODE_URL);
        const txs = await client.getAccountTransactions(ACCOUNT_ADDRESS);
        
        // Sort transactions by timestamp (most recent first)
        const sortedTxs = txs.sort((a, b) => b.timestamp - a.timestamp);
        
        setTransactions(sortedTxs);
        setLoading(false);
      } catch (err) {
        console.error("Failed to retrieve transactions:", err);
        setError(err);
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  // Helper function to format transaction timestamp
  const formatTimestamp = (timestamp) => {
    return new Date(timestamp / 1000).toLocaleString();
  };

  // Helper function to truncate transaction hash
  const truncateHash = (hash) => {
    return `${hash.slice(0, 6)}...${hash.slice(-4)}`;
  };

  // Pagination logic
  const indexOfLastTransaction = currentPage * transactionsPerPage;
  const indexOfFirstTransaction = indexOfLastTransaction - transactionsPerPage;
  const currentTransactions = transactions.slice(indexOfFirstTransaction, indexOfLastTransaction);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Calculate total pages
  const totalPages = Math.ceil(transactions.length / transactionsPerPage);

  if (loading) {
    return (
      <div className="bg-gray-900 rounded-lg p-6 h-full overflow-auto">
        <div className="flex justify-center items-center h-full">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-900 rounded-lg p-6 text-red-400">
        Failed to load transactions. Please try again later.
      </div>
    );
  }

  return (
    <div className="bg-gray-900 rounded-lg p-6 w-[700px] h-[700px] mt-10 ">

      <h2 className="text-xl font-bold mb-4 text-white">Blockchain Transactions</h2>
      
      {transactions.length === 0 ? (
        <div className="text-gray-400 text-center py-8">
          No transactions found.
        </div>
      ) : (
        <>
          <div className="space-y-4 mb-6">
            {currentTransactions.map((tx) => (
              <div 
                key={tx.hash} 
                className="bg-gray-800 rounded-lg p-4 hover:bg-gray-700 transition-colors"
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="text-blue-400 font-semibold">
                    Tx Hash: {truncateHash(tx.hash)}
                  </span>
                 
                </div>
                <div className="text-gray-400 text-sm">
                  <p>Timestamp: {formatTimestamp(tx.timestamp)}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination Controls */}
          <div className="flex justify-center items-center space-x-2">
            <button
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
              className={`px-4 py-2 rounded ${
                currentPage === 1 
                  ? 'bg-gray-700 text-gray-800 cursor-not-allowed' 
                  : 'bg-blue-600 text-black hover:bg-blue-700'
              }`}
            >
              Previous
            </button>
            
            <span className="text-white">
              Page {currentPage} of {totalPages}
            </span>
            
            <button
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`px-4 py-2 rounded ${
                currentPage === totalPages 
                  ? 'bg-gray-700 text-gray-800 cursor-not-allowed' 
                  : 'bg-blue-600 text-black hover:bg-blue-700'
              }`}
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default Blockchain;