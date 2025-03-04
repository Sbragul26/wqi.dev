import { AptosClient } from 'aptos';
import { Types } from 'aptos';

class AptosBalanceChecker {
    constructor(accountAddress) {
        // Validate the account address
        if (!accountAddress) {
            throw new Error("❌ Account address must be provided");
        }

        // Testnet configuration
        this.NODE_URL = "https://fullnode.testnet.aptoslabs.com";

        // Initialize Aptos client
        this.client = new AptosClient(this.NODE_URL);

        // Set the specific account address to check
        this.accountAddress = accountAddress;
    }

    // Check Account Balance
    async checkBalance() {
        try {
            console.log(`🔍 Checking balance for address: ${this.accountAddress}`);

            // Fetch account resources
            const resources = await this.client.getAccountResources(this.accountAddress);

            // Find the coin balance resource
            const coinResource = resources.find(
                (resource) => resource.type === "0x1::coin::CoinStore<0x1::aptos_coin::AptosCoin>"
            );

            if (!coinResource) {
                console.error("❌ Could not find coin balance resource");
                return null;
            }

            // Extract balance from the resource
            const balance = coinResource.data.coin.value;
            
            // Convert balance from smallest unit (Octas) to APT
            const aptBalance = Number(balance) / 100_000_000;

            console.log(`💰 Current Balance: ${aptBalance.toFixed(4)} APT`);
            
            // Fetch and display account details
            try {
                const accountResource = await this.client.getAccount(this.accountAddress);
                console.log("📋 Account Details:");
                console.log(`   Sequence Number: ${accountResource.sequence_number}`);
                console.log(`   Authentication Key: ${accountResource.authentication_key}`);
            } catch (detailError) {
                console.warn("⚠️ Could not fetch additional account details");
            }

            return aptBalance;
        } catch (error) {
            console.error("❌ Balance check failed:", error.message);
            console.error("Full error details:", error);
            return null;
        }
    }

    // Main execution
    async run() {
        await this.checkBalance();
    }
}

// Replace with the specific Aptos account address you want to check
const ACCOUNT_TO_CHECK = "0xe0f5d08c01462815ff2ae4816eaa6678f77fa26722d4e9ee456acfe966414b45";

// Initialize and run
const balanceChecker = new AptosBalanceChecker(ACCOUNT_TO_CHECK);
balanceChecker.run();