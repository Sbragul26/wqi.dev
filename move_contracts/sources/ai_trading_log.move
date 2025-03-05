module my_address::ai_trading_log {
    use std::vector;
    use std::signer;
    use std::string; // Import string module

    /// Define a struct to store trade actions
    struct TradeAction has key {
        actions: vector<string::String> // Use `string::String` instead of `String`
    }

    /// Initialize the TradeAction resource for the account
    public entry fun init(account: &signer) {
        move_to(account, TradeAction { actions: vector::empty<string::String>() });
    }

    /// Log AI trade action
    public entry fun log_trade(account: &signer, action: string::String) acquires TradeAction {
        let trade_action = borrow_global_mut<TradeAction>(signer::address_of(account));
        vector::push_back(&mut trade_action.actions, action);
    }

    /// Retrieve all logged AI trade actions
    public fun get_trades(account: address): vector<string::String> acquires TradeAction {
        borrow_global<TradeAction>(account).actions
    }
}
