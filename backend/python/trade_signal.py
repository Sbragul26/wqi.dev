import requests

# Mapping common symbols to CoinGecko IDs
COIN_MAPPING = {
    "btc": "bitcoin",
    "eth": "ethereum",
    "bnb": "binancecoin",
    "xrp": "ripple",
    "ada": "cardano",
    "doge": "dogecoin",
    "matic": "matic-network",
    "dot": "polkadot",
    "ltc": "litecoin",
    "sol": "solana"
}

def suggest_signal(coin_symbol):
    coin_id = COIN_MAPPING.get(coin_symbol.lower(), coin_symbol.lower())  # Map or use input as ID
    url = f"https://api.coingecko.com/api/v3/simple/price?ids={coin_id}&vs_currencies=usd"
    
    try:
        response = requests.get(url, timeout=5)
        response.raise_for_status()  # Raise error for HTTP issues
        data = response.json()
        
        if coin_id not in data:
            return f"Error: Invalid coin symbol '{coin_symbol}'. Try using full names (e.g., 'bitcoin')."
        
        current_price = data[coin_id]['usd']
        
        '''
        Change algorithm according to conn..
        '''
        if 0 < current_price < 1000:
            return f"{coin_symbol.upper()}: BUY (Price: ${current_price})"
        elif 1000 <= current_price < 5000:
            return f"{coin_symbol.upper()}: HOLD (Price: ${current_price})"
        else:
            return f"{coin_symbol.upper()}: SELL (Price: ${current_price})"
        
        '''
        ==========================================================================
        '''

    except requests.exceptions.RequestException as e:
        return f"API Request Error: {e}"
    except KeyError:
        return f"Error: Could not retrieve price for '{coin_symbol}'."

if __name__ == '__main__':
    coin_symbol = input("Enter the coin symbol: ").strip()
    print(suggest_signal(coin_symbol))
