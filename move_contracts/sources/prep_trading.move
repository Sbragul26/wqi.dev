module my_address::TradingModule {
    use std::signer;
    use aptos_framework::aptos_coin;

    /// Define a Counter resource that holds a single u64 value
    struct Counter has key {
        value: u64,
    }

    /// Initialize the Counter resource in the account
    public entry fun init_counter(account: &signer) {
        move_to(account, Counter { value: 0 });
    }

    /// Increment the Counter value by 1
    public entry fun increment(account: &signer) acquires Counter {
        let counter = borrow_global_mut<Counter>(signer::address_of(account));
        counter.value = counter.value + 1;
    }

    /// Retrieve the current counter value
    public fun get_value(account: address): u64 acquires Counter {
        borrow_global<Counter>(account).value
    }

    /// Mint and deposit AptosCoin into the account
    public entry fun deposit(account: &signer, amount: u64) {
        let recipient = signer::address_of(account);
        aptos_coin::mint(account, recipient, amount);
    }
}


