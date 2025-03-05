import fetch from "node-fetch";
import { AptosClient, AptosAccount, TxnBuilderTypes, BCS } from "aptos";
import readline from "readline";

// Aptos Testnet Settings
const NODE_URL = "https://fullnode.testnet.aptoslabs.com";
const client = new AptosClient(NODE_URL);

// AI Trading Account (Replace with your actual private key!)
const privateKeyHex = "1299d4ba9cd6aaca2dcf1f3b352fdf0446c1c24c6fe148ca61ae6f4489a66575";
const account = AptosAccount.fromAptosAccountObject({ privateKeyHex });

// Contract Details
const CONTRACT_ADDRESS = "0xe0f5d08c01462815ff2ae4816eaa6678f77fa26722d4e9ee456acfe966414b45";
const MODULE_NAME = "ai_trading_log";
const FUNCTION_NAME = "log_trade";

// Function to get user input
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});
function getUserInput(question) {
    return new Promise(resolve => rl.question(question, resolve));
}

// Fetch real-time crypto price
async function getCryptoPrice(pair) {
    try {
        const symbol = pair.split('/')[0].toLowerCase();

        // Fetch available coin IDs from CoinGecko
        const coinListResponse = await fetch("https://api.coingecko.com/api/v3/coins/list");
        const coinList = await coinListResponse.json();

        // Find the correct ID for the input symbol
        const coinData = coinList.find(coin => coin.symbol.toLowerCase() === symbol);

        if (!coinData) {
            console.error(`❌ Crypto not found: ${symbol}`);
            return "Unavailable";
        }

        console.log(`🔎 Found Coin ID: ${coinData.id}`); // Debugging

        // Fetch the real-time price in USD
        const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${coinData.id}&vs_currencies=usd`);
        const data = await response.json();

        if (data[coinData.id] && data[coinData.id].usd) {
            return data[coinData.id].usd.toFixed(2); // Ensure price is correctly formatted
        } else {
            return "Unavailable";
        }
    } catch (error) {
        console.error("❌ Error fetching crypto price:", error);
        return "Unavailable";
    }
}



// AI Prediction Function (Simulated API)
async function getTradeSuggestion(pair) {
    try {
        console.log("📡 Fetching AI prediction...");
        const realTimePrice = await getCryptoPrice(pair);
        
        const mockAIResponse = {
            real_time_price: realTimePrice,
            predicted_price: Math.random() * (60000 - 30000) + 30000, // Random price between 30k-60k
            suggested_leverage: Math.floor(Math.random() * 10) + 1, // 1x - 10x leverage
            suggested_order_type: "market",
            trade_size: (Math.random() * 500).toFixed(2),
            risk_level: Math.random() > 0.5 ? "High" : "Low"
        };
        return mockAIResponse;
    } catch (error) {
        console.error("❌ Error fetching AI suggestion:", error);
        return null;
    }
}

// Save AI Action to Aptos Blockchain
async function saveAIAction(action) {
    try {
        console.log(`📌 Logging AI Action: ${action}...`);

        const entryFunctionPayload = new TxnBuilderTypes.TransactionPayloadEntryFunction(
            TxnBuilderTypes.EntryFunction.natural(
                `${CONTRACT_ADDRESS}::${MODULE_NAME}`,
                FUNCTION_NAME,
                [],
                [BCS.bcsSerializeStr(action)]
            )
        );

        const accountInfo = await client.getAccount(account.address());
        const sequence_number = BigInt(accountInfo.sequence_number);

        const rawTxn = new TxnBuilderTypes.RawTransaction(
            TxnBuilderTypes.AccountAddress.fromHex(account.address()),
            sequence_number,
            entryFunctionPayload,
            BigInt(1000),
            BigInt(100),
            BigInt(Math.floor(Date.now() / 1000) + 600),
            new TxnBuilderTypes.ChainId(2)
        );

        const bcsTxn = await client.signTransaction(account, rawTxn);
        const txnResponse = await client.submitTransaction(bcsTxn);
        await client.waitForTransaction(txnResponse.hash);

        console.log(`✅ AI Action Saved on Blockchain! Txn Hash: ${txnResponse.hash}`);
        return txnResponse.hash;
    } catch (error) {
        console.error("❌ Error logging AI action:", error);
    }
}

// Execute AI-Powered Trade
async function executeTrade(pair) {
    const tradeData = await getTradeSuggestion(pair);
    if (!tradeData) {
        console.log("Failed to get AI prediction. Exiting...");
        rl.close();
        return;
    }

    console.log(`\n🔹 Suggested Trade for ${pair}:`);
    console.log(`🔹 Real-Time Price: ${tradeData.real_time_price} USDT`);
    console.log(`🔹 Predicted Price: ${tradeData.predicted_price.toFixed(2)} USDT`);
    console.log(`🔹 Suggested Leverage: ${tradeData.suggested_leverage}x`);
    console.log(`🔹 Suggested Order Type: ${tradeData.suggested_order_type}`);
    console.log(`🔹 Trade Size: ${tradeData.trade_size} USDT`);
    console.log(`🔹 Risk Level: ${tradeData.risk_level}`);

    // Get User Confirmation and Customization
    const confirm = await getUserInput("Do you want to use AI-suggested values? (yes/no): ");
    let leverage = tradeData.suggested_leverage;
    let orderType = tradeData.suggested_order_type;
    let tradeSize = tradeData.trade_size;

    if (confirm.toLowerCase() !== "yes") {
        leverage = await getUserInput("Enter Leverage (e.g., 5, 10, 20): ");
        orderType = await getUserInput("Enter Order Type (market/limit): ");
        tradeSize = await getUserInput("Enter Trade Size (in USDT): ");
    }

    const stopLoss = tradeData.predicted_price * 0.98;
    const takeProfit = tradeData.predicted_price * 1.05;
    const tradeDecision = tradeData.predicted_price > tradeData.real_time_price ? "LONG" : "SHORT";

    console.log(`\n🔹 Final Trade Setup:`);
    console.log(`🔹 Trade Type: ${tradeDecision}`);
    console.log(`🔹 Leverage: ${leverage}x`);
    console.log(`🔹 Order Type: ${orderType}`);
    console.log(`🔹 Trade Size: ${tradeSize} USDT`);
    console.log(`🔹 Stop Loss: ${stopLoss.toFixed(2)} USDT`);
    console.log(`🔹 Take Profit: ${takeProfit.toFixed(2)} USDT`);

    // Ask user if AI should execute
    const execute = await getUserInput("Proceed with trade execution? (yes/no): ");
    if (execute.toLowerCase() === "yes") {
        const aiMessage = `Trade: ${tradeDecision}, Leverage: ${leverage}, Order: ${orderType}, Size: ${tradeSize}, SL: ${stopLoss}, TP: ${takeProfit}`;
        await saveAIAction(aiMessage);
    } else {
        console.log("Trade execution canceled.");
    }

    rl.close();
}

// Get User Input and Start Trading
(async function main() {
    const aiEnabled = await getUserInput("Enable AI trading? (yes/no): ");
    if (aiEnabled.toLowerCase() !== "yes") {
        console.log("AI trading is disabled. Exiting...");
        rl.close();
        return;
    }

    const pair = await getUserInput("Enter the trading pair (e.g., BTC/USDT): ");
    await executeTrade(pair);
})();
