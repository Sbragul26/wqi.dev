import { AptosClient } from "aptos";

const NODE_URL = "https://fullnode.testnet.aptoslabs.com"; 
const client = new AptosClient(NODE_URL);

// List of transaction hashes
const txHashes = [
    "0xa31378a1802db24688b7ac38c1ee75b8995fe57b25b79a3872ca77e23b495088",
    "0xf863c9ea51c40916f7f18b17c65df44ea0f5a12208db8b443886346a717d0ad7",
    "0x326cce178740ea1b97a9f912e8efeaa804bdfac1cb01e211d65cda2f489ac8fd",
    "0xb45c32074df02a5ef5c2d9fc824c5d09818141bdc674e992e333c8eb7f437c2c",
];

async function fetchTransactionDetails() {
    for (const txHash of txHashes) {
        try {
            const txDetails = await client.getTransactionByHash(txHash);
            console.log(`\n🔹 Transaction Hash: ${txHash}`);
            console.log("🔍 Details:", JSON.stringify(txDetails, null, 2));
        } catch (error) {
            console.error(`❌ Error fetching details for ${txHash}:`, error);
        }
    }
}

fetchTransactionDetails();
