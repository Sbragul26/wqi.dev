import React, { useState, useEffect } from "react";
import Navbar from "../components/navbar";

const News = () => {
  const [news, setNews] = useState([]);

  useEffect(() => {
    fetch("https://cryptopanic.com/api/free/v1/posts/?auth_token=016eea0818a71bd1b4e627f16a5580e20e48f53c&filter=hot&currencies=BTC%2CETH")
      .then((response) => response.json())
      .then((data) => setNews(data.results))
      .catch((error) => console.error("Error fetching news:", error));
  }, []);

  return (
    <div className="bg-gray-900 text-white min-h-screen flex">
      <Navbar className="w-1/4 min-h-screen bg-gray-800" />
      <div className="w-3/4 p-6">
        <h2 className="text-2xl font-bold text-left mb-6">Crypto News</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {news.map((article) => (
            <div key={article.id} className="bg-gray-800 shadow-lg rounded-lg p-4 border border-gray-700">
              <h2 className="text-lg font-semibold mb-2">{article.title}</h2>
              <p className="text-sm text-gray-400">Source: {article.source.title}</p>
              <div className="mt-2 flex justify-between text-sm text-gray-300">
                <span>👍 {article.votes.positive}</span>
                <span>🔥 {article.votes.important}</span>
                <span>💾 {article.votes.saved}</span>
              </div>
              <a
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 block text-blue-400 hover:underline"
              >
                Read More
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default News;
