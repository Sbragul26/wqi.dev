import requests
import json

COINGECKO_API = "https://api.coingecko.com/api/v3/simple/price"

def get_exchange_rates(crypto_list):
    """ Fetch exchange rates for all requested cryptocurrencies in a single API call """
    ids = ",".join(crypto_list)
    params = {'ids': ids, 'vs_currencies': 'usd'}
    
    try:
        response = requests.get(COINGECKO_API, params=params, timeout=5)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"❌ Error fetching data: {e}")
        return None

def calculate_exchange(from_coin, to_coin, amount, exchange_rates):
    """ Calculate the estimated amount received """
    if from_coin in exchange_rates and to_coin in exchange_rates:
        from_price = exchange_rates[from_coin]['usd']
        to_price = exchange_rates[to_coin]['usd']
        return (amount * from_price) / to_price
    return None

def main():
    """ User input and exchange calculation """
    from_coin = input("Enter the cryptocurrency you want to send (e.g., ethereum): ").strip().lower()
    to_coin = input("Enter the cryptocurrency you want to receive (e.g., monero): ").strip().lower()
    
    try:
        amount = float(input(f"Enter the amount of {from_coin.upper()} to exchange: "))
    except ValueError:
        print("❌ Invalid amount! Please enter a valid number.")
        return
    
    # Fetch exchange rates for both coins in one request
    exchange_rates = get_exchange_rates([from_coin, to_coin])
    
    if not exchange_rates:
        print("❌ Unable to fetch exchange rates. Try again later.")
        return

    estimated_amount = calculate_exchange(from_coin, to_coin, amount, exchange_rates)

    if estimated_amount is not None:
        print(f"\n🔄 Exchanging {amount} {from_coin.upper()} → {to_coin.upper()}")
        print(f"💰 You will receive approximately: {estimated_amount:.6f} {to_coin.upper()}\n")
    else:
        print("❌ Error: Invalid cryptocurrency name. Check the spelling and try again.")

if __name__ == "__main__":
    main()
