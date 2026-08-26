import json
from datetime import datetime, timezone

import requests

def parse_iso_date(value):
    # Epic timestamps use a 'Z' suffix, which datetime.fromisoformat
    # only understands natively on Python 3.11+.
    if not value:
        return None
    try:
        return datetime.fromisoformat(value.replace('Z', '+00:00'))
    except ValueError:
        return None

def pick_image(game):
    # Prefer wide banner art; fall back to the first image that has a URL.
    images = game.get('keyImages') or []
    ordered = ([img for img in images if img.get('type') == 'OfferImageWide'] +
               [img for img in images if img.get('type') != 'OfferImageWide'])
    for img in ordered:
        if img.get('url'):
            return img['url']
    return None

def fetch_free_games():
    # Epic's internal public endpoint for store promotions

    url = "https://store-site-backend-static.ak.epicgames.com/freeGamesPromotions"

    response = requests.get(url, timeout=30)
    response.raise_for_status()

    data = response.json()
    elements = data['data']['Catalog']['searchStore']['elements']
    now = datetime.now(timezone.utc)
    free_games = []

    for game in elements:
        price = game.get('price', {}).get('totalPrice', {})
        # discountPrice == 0 means it is currently 100% off
        if price.get('discountPrice') != 0:
            continue

        promotions = game.get('promotions') or {}
        windows = promotions.get('promotionalOffers') or []

        # Only accept a promotion whose own start/end dates cover "right now"
        # so past or upcoming offers never leak into the site data.
        active_end = None
        for window in windows:
            for offer in window.get('promotionalOffers') or []:
                start = parse_iso_date(offer.get('startDate'))
                end = parse_iso_date(offer.get('endDate'))
                if start and end and start <= now < end:
                    active_end = end
                    break
            if active_end is not None:
                break

        if active_end is None:
            continue

        free_games.append({
            "title": game.get('title'),
            "description": game.get('description'),
            "image": pick_image(game),
            "expiryDate": active_end.isoformat().replace('+00:00', 'Z')
        })

    #put data to json file to update static site
    with open('games.json', 'w') as f:
        json.dump(free_games, f, indent=4)

if __name__ == "__main__":
    fetch_free_games()
