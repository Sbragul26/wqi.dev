module 0xe0f5d08c01462815ff2ae4816eaa6678f77fa26722d4e9ee456acfe966414b45::prep_trading{
    use std::signer;
    use aptos_framework::coin;
    use aptos_framework::aptos_coin;

    // Structure to store position details
    struct Position has key {
        owner: address,
        size: u64,
        leverage: u8,
    }

    // Function to open a leveraged position
    public entry fun open_position(account: &signer, size: u64, _leverage: u8) {
        let sender = signer::address_of(account); 
        let balance = coin::balance<aptos_coin::AptosCoin>(sender);
        
        assert!(balance >= size, 100); // Ensure sufficient balance
        coin::transfer<aptos_coin::AptosCoin>(account, sender, size);
    }

    // Function to close a position
    public entry fun close_position(account: &signer) {
        let sender = signer::address_of(account);
        let size = 1000000; // Closing a fixed-size position
        coin::transfer<aptos_coin::AptosCoin>(account, sender, size);
    }
}
