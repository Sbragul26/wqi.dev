require("dotenv").config(); // Load environment variables
const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 8080; // Ensure it runs on 8080
const CRYPTOPANIC_API_KEY = process.env.CRYPTOPANIC_API_KEY;
const COINGECKO_API = "https://api.coingecko.com/api/v3/simple/price";

if (!CRYPTOPANIC_API_KEY) {
  console.error("Missing CRYPTOPANIC_API_KEY in environment variables");
  process.exit(1);
}

// Route to fetch CoinGecko crypto data
app.get("/api/crypto", async (req, res) => {
  try {
    const response = await axios.get("https://api.coingecko.com/api/v3/coins/markets", {
      params: {
        vs_currency: "usd",
        order: "market_cap_desc",
        per_page: 10,
        page: 1,
        sparkline: false,
      },
    });

    res.json(response.data);
  } catch (error) {
    console.error("Error fetching CoinGecko data:", error.message);
    res.status(500).json({ error: "Failed to fetch crypto data" });
  }
});

// Route to fetch CryptoPanic news
app.get("/api/news", async (req, res) => {
  try {
    const response = await axios.get("https://cryptopanic.com/api/v1/posts/", {
      params: {
        auth_token: CRYPTOPANIC_API_KEY, // Use CryptoPanic API Key
        filter: "hot", // Options: 'hot', 'latest', 'bullish', 'bearish'
        currencies: "BTC,ETH", // Filter for specific currencies
      },
    });

    res.json(response.data);
  } catch (error) {
    console.error("Error fetching CryptoPanic news:", error.response?.data || error.message);
    res.status(500).json({ error: "Failed to fetch news data", details: error.response?.data || error.message });
  }
});

// Route to fetch exchange rates and calculate conversion
app.get("/convert", async (req, res) => {
    const from_coin = (req.query.from_coin || "").trim().toLowerCase();
    const to_coin = (req.query.to_coin || "").trim().toLowerCase();
    const amount = parseFloat(req.query.amount) || 1.0;
    
    if (!from_coin || !to_coin || amount <= 0) {
        return res.status(400).json({ error: "Invalid parameters" });
    }
    
    try {
        const response = await axios.get(COINGECKO_API, {
            params: { ids: `${from_coin},${to_coin}`, vs_currencies: 'usd' }
        });
        const data = response.data;
        
        if (data[from_coin] && data[to_coin]) {
            const from_price = data[from_coin].usd;
            const to_price = data[to_coin].usd;
            const estimated_receive = (amount * from_price) / to_price;
            
            return res.json({
                from_coin: from_coin.toUpperCase(),
                to_coin: to_coin.toUpperCase(),
                amount: amount,
                estimated_receive: estimated_receive.toFixed(6)
            });
        }
        return res.status(400).json({ error: "Invalid cryptocurrency or API issue" });
    } catch (error) {
        return res.status(500).json({ error: "Internal server error" });
    }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
