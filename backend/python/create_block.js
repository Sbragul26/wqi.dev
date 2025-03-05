import { AptosClient, AptosAccount, TxnBuilderTypes, BCS } from "aptos";

// Aptos Testnet Settings
const NODE_URL = "https://fullnode.testnet.aptoslabs.com"; 
const client = new AptosClient(NODE_URL);

// AI Trading Account (Replace with your actual private key!)
const privateKeyHex = "1299d4ba9cd6aaca2dcf1f3b352fdf0446c1c24c6fe148ca61ae6f4489a66575";  
const account = AptosAccount.fromAptosAccountObject({ privateKeyHex });

// Your Smart Contract Details
const CONTRACT_ADDRESS = "0xe0f5d08c01462815ff2ae4816eaa6678f77fa26722d4e9ee456acfe966414b45";  
const MODULE_NAME = "ai_trading_log";
const FUNCTION_NAME = "log_trade";

// Function to log AI actions to Aptos blockchain
async function saveAIAction(action) {
    try {
        console.log(`📌 Logging AI Action: ${action}...`);

        // ✅ Get fresh account info to ensure correct sequence number
        const accountInfo = await client.getAccount(account.address());
        const sequence_number = BigInt(accountInfo.sequence_number);

        // Define the transaction payload using BCS encoding
        const entryFunctionPayload = new TxnBuilderTypes.TransactionPayloadEntryFunction(
            TxnBuilderTypes.EntryFunction.natural(
                `${CONTRACT_ADDRESS}::${MODULE_NAME}`,
                FUNCTION_NAME,
                [],
                [BCS.bcsSerializeStr(action)] // Encode action string
            )
        );

        // ✅ FIX: Increase gas amount to avoid out-of-gas errors
        const rawTxn = new TxnBuilderTypes.RawTransaction(
            TxnBuilderTypes.AccountAddress.fromHex(account.address()),
            sequence_number,
            entryFunctionPayload,
            BigInt(50000), // 🔺 Increased max_gas_amount
            BigInt(500),   // 🔺 Increased gas_unit_price
            BigInt(Math.floor(Date.now() / 1000) + 1200), // expiration_timestamp_secs (20 min)
            new TxnBuilderTypes.ChainId(2) // 2 = Testnet Chain ID
        );

        // Sign the transaction
        const bcsTxn = await client.signTransaction(account, rawTxn);

        // Submit the transaction
        const txnResponse = await client.submitTransaction(bcsTxn);

        // Wait for confirmation
        await client.waitForTransaction(txnResponse.hash);

        console.log(`✅ Action Saved to Blockchain: ${txnResponse.hash}`);
        return txnResponse.hash;
    } catch (error) {
        console.error("❌ Error logging AI action:", error.message || error);
        
        // 🔹 Additional Debugging
        if (error.response) {
            console.error("🔹 Blockchain Response:", error.response.data);
        }
    }
}

// Execute AI trade logging with delays to avoid network congestion
(async () => {
    await saveAIAction("AI executed a LONG trade with 5x leverage on BTC/USDT");
    await new Promise(resolve => setTimeout(resolve, 5000)); // ✅ Wait 5s before next transaction
    await saveAIAction("AI closed SHORT position on ETH/USDT");
})();
