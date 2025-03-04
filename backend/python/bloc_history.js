import { AptosClient } from 'aptos';

class AptosTransactionHistory {
    constructor() {
        // Aptos Testnet Configuration
        this.NODE_URL = "https://fullnode.testnet.aptoslabs.com";
        this.client = new AptosClient(this.NODE_URL);

        // Your Aptos account address
        this.ACCOUNT_ADDRESS = "0xe0f5d08c01462815ff2ae4816eaa6678f77fa26722d4e9ee456acfe966414b45"; 
    }

    // Fetch and display transaction history
    async fetchTransactionHistory() {
        try {
            const transactions = await this.client.getAccountTransactions(this.ACCOUNT_ADDRESS);

            if (transactions.length === 0) {
                console.log("📜 No transactions found.");
                return;
            }

            console.log("📜 Transaction History:");
            transactions.forEach(tx => {
                console.log(`🔹 Tx Hash: ${tx.hash} | Success: ${tx.success} | Time: ${new Date(tx.timestamp / 1000).toISOString()}`);
            });

            return transactions;
        } catch (error) {
            console.error("❌ Failed to retrieve transactions:", error);
        }
    }
}

// Execute the script
(async () => {
    const history = new AptosTransactionHistory();
    await history.fetchTransactionHistory();
})();
