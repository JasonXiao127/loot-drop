import requests
import json

def fetch_free_games():
    # Epic's internal public endpoint for store promotions
    
    url = "https://store-site-backend-static.ak.epicgames.com/freeGamesPromotions"
    
    response = requests.get(url)
    if response.status_code != 200:
        print("Failed to fetch data from Epic")
        return

    data = response.json()
    elements = data['data']['Catalog']['searchStore']['elements']
    free_games = []

    for game in elements:
        promotions = game.get('promotions')
        # Check if the game has an active promotional offer running
        if promotions and promotions.get('promotionalOffers'):
            offers = promotions['promotionalOffers'][0]['promotionalOffers']
            for offer in offers:
                price = game.get('price', {}).get('totalPrice', {})
                # discountPrice == 0 means it is currently 100% off
                if price.get('discountPrice') == 0:
                    free_games.append({
                        "title": game.get('title'),
                        "description": game.get('description'),
                        "image": game.get('keyImages', [{}])[0].get('url'),
                        "expiryDate": offer.get('endDate')
                    })
                    break

    #put data to json file to update static site
    with open('games.json', 'w') as f:
        json.dump(free_games, f, indent=4)

if __name__ == "__main__":
    fetch_free_games()