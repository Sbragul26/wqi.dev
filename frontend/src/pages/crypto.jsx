import React, { useState, useEffect } from "react";

// Place this inside your Home component, after any other functions but before the return statement
const Crypto = () => {
  const [cryptoData, setCryptoData] = useState([]);
  const [cryptoLoading, setCryptoLoading] = useState(true);
  const [news, setNews] = useState([]);
  const [newsLoading, setNewsLoading] = useState(true);

  // Fetch cryptocurrency data
  useEffect(() => {
    const fetchCryptoData = async () => {
      try {
        setCryptoLoading(true);
        const response = await fetch(
          "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=5&page=1&sparkline=false"
        );
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data = await response.json();
        setCryptoData(data);
      } catch (error) {
        console.error("Error fetching crypto data:", error);
      } finally {
        setCryptoLoading(false);
      }
    };

    fetchCryptoData();
  }, []);

  // Fetch news data
  useEffect(() => {
    const fetchNewsData = async () => {
      try {
        setNewsLoading(true);
        const response = await fetch(
          "https://cryptopanic.com/api/free/v1/posts/?auth_token=016eea0818a71bd1b4e627f16a5580e20e48f53c&filter=hot&currencies=BTC%2CETH"
        );
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data = await response.json();
        // Limit to 5 news items
        setNews(data.results.slice(0, 5));
      } catch (error) {
        console.error("Error fetching news:", error);
      } finally {
        setNewsLoading(false);
      }
    };

    fetchNewsData();
  }, []);

  // Format percentage changes
  const formatPercentage = (percent) => {
    if (!percent && percent !== 0) return "N/A";
    return percent.toFixed(2) + "%";
  };

  return (
    <div className="grid grid-cols-1 gap-8">
      {/* Cryptocurrency Prices */}
      <div className="bg-gray-800 rounded-xl p-4">
        <div className="flex justify-between mb-4">
          <div className="flex space-x-4">
            <button className="text-sm font-medium pb-2 border-b-2 border-indigo-500 text-black">
              Popular
            </button>
          </div>
          <a href="/prices" className="text-xs text-gray-400 hover:text-white flex items-center">
            View All 350+ Coins &gt;
          </a>
        </div>

        {cryptoLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
          </div>
        ) : (
          <div className="space-y-4">
            {cryptoData.map((crypto) => (
              <div key={crypto.id} className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full overflow-hidden">
                    <img
                      src={crypto.image}
                      alt={crypto.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <span className="font-medium">{crypto.symbol.toUpperCase()}</span>
                    <span className="text-xs text-gray-400 ml-1">{crypto.name}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="font-medium">
                    ${crypto.current_price.toLocaleString()}
                  </span>
                  <span
                    className={`text-sm ${
                      crypto.price_change_percentage_24h >= 0
                        ? "text-green-400"
                        : "text-red-400"
                    }`}
                  >
                    {crypto.price_change_percentage_24h >= 0 ? "+" : ""}
                    {formatPercentage(crypto.price_change_percentage_24h)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* News */}
      <div className="bg-gray-800 rounded-xl p-4">
        <div className="flex justify-between mb-4">
          <h2 className="text-xl font-medium">News</h2>
          <a href="/news" className="text-xs text-gray-400 hover:text-white flex items-center">
            View All News &gt;
          </a>
        </div>

        {newsLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
          </div>
        ) : (
          <div className="space-y-4">
            {news.map((article) => (
              <div key={article.id} className="border-b border-gray-700 pb-4 last:border-b-0 last:pb-0">
                <a
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block hover:text-indigo-400"
                >
                  <h3 className="font-medium line-clamp-2">{article.title}</h3>
                </a>
                <div className="flex justify-between mt-2">
                  <span className="text-xs text-gray-400">
                    {new Date(article.published_at).toLocaleDateString()}
                  </span>
                  <span className="text-xs text-gray-400">
                    Source: {article.source.title}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};


export default Crypto;