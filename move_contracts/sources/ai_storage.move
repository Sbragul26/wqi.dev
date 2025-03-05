module my_address::ai_storage {
    use std::signer;
    use aptos_framework::timestamp;
    use aptos_framework::table;

    struct AIMsg has key, store {
        pair: vector<u8>,       // Trading pair (e.g., BTC/USDT)
        message: vector<u8>,    // AI message (decision details)
        timestamp: u64          // Timestamp of message storage
    }

    struct TradeData has key, store {
        pair: vector<u8>,       // Trading pair
        decision: vector<u8>,   // LONG or SHORT
        leverage: u64,          // Leverage value
        timestamp: u64          // Time of trade execution
    }

    struct AIMsgStore has key {
        messages: table::Table<vector<u8>, AIMsg>
    }

    struct TradeStore has key {
        trades: table::Table<vector<u8>, TradeData>
    }

    /// Initialize storage on the blockchain
    public entry fun initialize_storage(account: &signer) {
        let addr = signer::address_of(account);
        move_to<AIMsgStore>(account, AIMsgStore { messages: table::new<vector<u8>, AIMsg>() });
        move_to<TradeStore>(account, TradeStore { trades: table::new<vector<u8>, TradeData>() });
    }

    /// Save AI message on-chain
    public entry fun save_message(account: &signer, pair: vector<u8>, message: vector<u8>) acquires AIMsgStore {
        let _addr = signer::address_of(account);
        let store = borrow_global_mut<AIMsgStore>(_addr);
        
        let ai_message = AIMsg {
            pair,
            message,
            timestamp: timestamp::now_microseconds()
        };
        
        table::add(&mut store.messages, pair, ai_message);
    }

    /// Execute a trade and store the decision on-chain
    public entry fun execute_trade(account: &signer, pair: vector<u8>, decision: vector<u8>, leverage: u64) acquires TradeStore {
        let _addr = signer::address_of(account);
        let store = borrow_global_mut<TradeStore>(_addr);

        let trade = TradeData {
            pair,
            decision,
            leverage,
            timestamp: timestamp::now_microseconds()
        };

        table::add(&mut store.trades, pair, trade);
    }
}
