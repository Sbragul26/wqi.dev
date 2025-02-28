import requests
from tabulate import tabulate

def fetch_cryptos():
    url = "https://api.coingecko.com/api/v3/coins/markets"
    params = {
        'vs_currency': 'usd',
        'order': 'market_cap_desc',
        'per_page': 50,
        'page': 1,
        'sparkline': 'false'
    }

    response = requests.get(url, params=params)

    if response.status_code == 200:
        cryptos = response.json()
        table_data = [[index + 1, crypto['name'], crypto['symbol'].upper(), f"${crypto['current_price']}"] for index, crypto in enumerate(cryptos)]
        headers = ["Rank", "Name", "Symbol", "Price (USD)"]
        print(tabulate(table_data, headers=headers, tablefmt="grid"))
    else:
        print("Failed to fetch data from CoinGecko API.")

fetch_cryptos()
