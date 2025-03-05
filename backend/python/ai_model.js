import fetch from "node-fetch";
import { AptosClient, AptosAccount, TxnBuilderTypes, BCS } from "aptos";

// Aptos Testnet Settings
const NODE_URL = "https://fullnode.testnet.aptoslabs.com";
const client = new AptosClient(NODE_URL);

// AI Trading Account
const privateKeyHex = "1299d4ba9cd6aaca2dcf1f3b352fdf0446c1c24c6fe148ca61ae6f4489a66575"; // Replace with secure storage in production
const account = AptosAccount.fromAptosAccountObject({ privateKeyHex });

// Contract Details
const CONTRACT_ADDRESS = "0xe0f5d08c01462815ff2ae4816eaa6678f77fa26722d4e9ee456acfe966414b45";
const MODULE_NAME = "ai_trading_log";
const FUNCTION_NAME = "log_trade";

// Fetch real-time crypto price from CoinGecko
async function getCryptoPrice(pair) {
    try {
        const symbol = pair.split('/')[0].toLowerCase();
        const coinListResponse = await fetch("https://api.coingecko.com/api/v3/coins/list");
        const coinList = await coinListResponse.json();
        const coinData = coinList.find(coin => coin.symbol.toLowerCase() === symbol);

        if (!coinData) {
            console.error(`❌ Crypto not found: ${symbol}`);
            return "0.00";
        }

        const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${coinData.id}&vs_currencies=usd`);
        const data = await response.json();

        return data[coinData.id]?.usd?.toFixed(2) || "0.00";
    } catch (error) {
        console.error("❌ Error fetching crypto price:", error);
        return "0.00";
    }
}

// AI Prediction Function (Simulated - Replace with real AI model)
async function getTradeSuggestion(pair) {
    const realTimePrice = await getCryptoPrice(pair);
    return {
        real_time_price: realTimePrice,
        predicted_price: Math.random() * (60000 - 30000) + 30000, // Simulated prediction
        suggested_leverage: Math.floor(Math.random() * 10) + 1, // 1x - 10x
        suggested_order_type: "market",
        trade_size: (Math.random() * 500).toFixed(2),
        risk_level: Math.random() > 0.5 ? "High" : "Low"
    };
}

// Save AI Action to Aptos Blockchain
async function saveAIAction(action) {
    try {
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
            BigInt(1000), // Max gas units
            BigInt(100),  // Gas price
            BigInt(Math.floor(Date.now() / 1000) + 600), // Expiration timestamp
            new TxnBuilderTypes.ChainId(2) // Testnet chain ID
        );

        const bcsTxn = await client.signTransaction(account, rawTxn);
        const txnResponse = await client.submitTransaction(bcsTxn);
        await client.waitForTransaction(txnResponse.hash);

        return txnResponse.hash;
    } catch (error) {
        console.error("❌ Error logging AI action:", error);
        throw error;
    }
}

// Process trade data from command-line argument
async function processTrade(tradeData) {
    try {
        const pair = tradeData.tradingPair;
        const tradeSuggestion = await getTradeSuggestion(pair);

        // Use form data if provided, otherwise fall back to AI suggestions
        const leverage = tradeData.leverage?.replace('x', '') || tradeSuggestion.suggested_leverage;
        const orderType = tradeData.orderType || tradeSuggestion.suggested_order_type;
        const tradeSize = tradeData.investmentAmount || tradeSuggestion.trade_size;
        const stopLoss = tradeData.stopLossPrice || (tradeSuggestion.predicted_price * 0.98).toFixed(2);
        const takeProfit = tradeData.takeProfitPrice || (tradeSuggestion.predicted_price * 1.05).toFixed(2);
        const tradeDecision = tradeSuggestion.predicted_price > tradeSuggestion.real_time_price ? "LONG" : "SHORT";

        const aiMessage = `Trade: ${tradeDecision}, Leverage: ${leverage}, Order: ${orderType}, Size: ${tradeSize}, SL: ${stopLoss}, TP: ${takeProfit}`;
        const txnHash = await saveAIAction(aiMessage);

        // Create a clean, structured JSON output
        const output = {
            status: "success",
            txnHash,
            tradeDetails: {
                pair,
                tradeDecision,
                leverage,
                orderType,
                tradeSize,
                stopLoss,
                takeProfit,
                realTimePrice: tradeSuggestion.real_time_price,
                predictedPrice: tradeSuggestion.predicted_price.toFixed(2)
            }
        };

        // Print JSON directly to stdout for parsing
        console.log(JSON.stringify(output));
    } catch (error) {
        // Print error as JSON
        console.log(JSON.stringify({
            status: "error",
            message: error.message
        }));
        process.exit(1);
    }
}

// Main execution
const tradeDataArg = process.argv[2];
if (!tradeDataArg) {
    console.error("No trade data provided");
    process.exit(1);
}

const tradeData = JSON.parse(tradeDataArg);
processTrade(tradeData);