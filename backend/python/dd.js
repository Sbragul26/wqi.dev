import { useState, useEffect } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

const API_URL = "http://127.0.0.1:5000"; // Flask API URL

export default function Home() {
  const [marketData, setMarketData] = useState([]);
  const [prediction, setPrediction] = useState(null);
  const [aiRunning, setAiRunning] = useState(false);
  const [form, setForm] = useState({
    orderType: "market",
    leverage: 5,
    amount: 100,
    stopLoss: 1.5,
    takeProfit: 2.5,
  });

  useEffect(() => {
    const socket = io("wss://stream.binance.com:9443/ws/btcusdt@trade");
    socket.on("message", (data) => {
      const trade = JSON.parse(data);
      setMarketData((prev) => [
        ...prev.slice(-20), // Keep last 20 data points
        { time: new Date(trade.T).toLocaleTimeString(), price: trade.p },
      ]);
    });
    return () => socket.close();
  }, []);

  const fetchPrediction = async () => {
    try {
      const res = await axios.get(`${API_URL}/predict`);
      setPrediction(res.data);
    } catch (err) {
      console.error("Error fetching prediction:", err);
    }
  };

  const toggleAI = async () => {
    try {
      await axios.post(`${API_URL}/toggle_ai`);
      setAiRunning(!aiRunning);
    } catch (err) {
      console.error("Error toggling AI:", err);
    }
  };

  const handleTrade = async () => {
    try {
      await axios.post(`${API_URL}/trade`, form);
      alert("Trade executed!");
    } catch (err) {
      console.error("Trade error:", err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center p-5">
      <h1 className="text-3xl font-bold">AI Trading Dashboard</h1>

      {/* Live Market Data */}
      <div className="w-full max-w-2xl mt-5">
        <h2 className="text-xl">Live Market Data</h2>
        <LineChart width={500} height={200} data={marketData}>
          <XAxis dataKey="time" />
          <YAxis />
          <Tooltip />
          <CartesianGrid stroke="#ccc" />
          <Line type="monotone" dataKey="price" stroke="#82ca9d" />
        </LineChart>
      </div>

      {/* AI Prediction */}
      <div className="mt-5 p-4 bg-gray-800 rounded-lg">
        <h2 className="text-xl">AI Prediction</h2>
        <button className="mt-2 p-2 bg-blue-500 rounded" onClick={fetchPrediction}>
          Get Prediction
        </button>
        {prediction && (
          <p className="mt-2">
            Predicted Price: <strong>{prediction.price}</strong> USD
          </p>
        )}
      </div>

      {/* Trade Execution */}
      <div className="mt-5 p-4 bg-gray-800 rounded-lg">
        <h2 className="text-xl">Trade Execution</h2>
        <select
          className="mt-2 p-2 bg-gray-700 rounded"
          onChange={(e) => setForm({ ...form, orderType: e.target.value })}
        >
          <option value="market">Market Order</option>
          <option value="limit">Limit Order</option>
        </select>
        <input
          type="number"
          className="mt-2 p-2 bg-gray-700 rounded"
          placeholder="Leverage"
          value={form.leverage}
          onChange={(e) => setForm({ ...form, leverage: e.target.value })}
        />
        <input
          type="number"
          className="mt-2 p-2 bg-gray-700 rounded"
          placeholder="Amount (USDT)"
          value={form.amount}
          onChange={(e) => setForm({ ...form, amount: e.target.value })}
        />
        <input
          type="number"
          className="mt-2 p-2 bg-gray-700 rounded"
          placeholder="Stop Loss (%)"
          value={form.stopLoss}
          onChange={(e) => setForm({ ...form, stopLoss: e.target.value })}
        />
        <input
          type="number"
          className="mt-2 p-2 bg-gray-700 rounded"
          placeholder="Take Profit (%)"
          value={form.takeProfit}
          onChange={(e) => setForm({ ...form, takeProfit: e.target.value })}
        />
        <button className="mt-2 p-2 bg-green-500 rounded" onClick={handleTrade}>
          Execute Trade
        </button>
      </div>

      {/* AI Control */}
      <button className={`mt-5 p-2 ${aiRunning ? "bg-red-500" : "bg-green-500"} rounded`} onClick={toggleAI}>
        {aiRunning ? "Stop AI Trading" : "Start AI Trading"}
      </button>
    </div>
  );
}
