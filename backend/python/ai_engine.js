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

        // Define the transaction payload using BCS encoding
        const entryFunctionPayload = new TxnBuilderTypes.TransactionPayloadEntryFunction(
            TxnBuilderTypes.EntryFunction.natural(
                `${CONTRACT_ADDRESS}::${MODULE_NAME}`,
                FUNCTION_NAME,
                [],
                [BCS.bcsSerializeStr(action)] // Encode action string
            )
        );

        // ✅ FIX: Get sequence_number correctly
        const accountInfo = await client.getAccount(account.address());
        const sequence_number = BigInt(accountInfo.sequence_number);

        // Create raw transaction
        const rawTxn = new TxnBuilderTypes.RawTransaction(
            TxnBuilderTypes.AccountAddress.fromHex(account.address()),
            sequence_number,
            entryFunctionPayload,
            BigInt(1000), // max_gas_amount
            BigInt(100), // gas_unit_price
            BigInt(Math.floor(Date.now() / 1000) + 600), // expiration_timestamp_secs
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
        console.error("❌ Error logging AI action:", error);
    }
}

// Execute AI trade logging
(async () => {
    await saveAIAction("AI executed a LONG trade with 5x leverage on BTC/USDT");
    await saveAIAction("AI closed SHORT position on ETH/USDT");
})();
