import requests
from bs4 import BeautifulSoup
from dotenv import load_dotenv
from recipe_scrapers import scrape_html

load_dotenv()
def parse_recipe(url):
    try:
        html_text = requests.get(url).text
        scraper = scrape_html(html_text, org_url=url)
        return {
            'title': scraper.title(),
            'ingredients': scraper.ingredients(),
            'instructions': scraper.instructions(),
            'prep_time': scraper.total_time(),
            'image': scraper.image(),
            'success': True
        }
    except Exception as e:
        return {'success': False, 'error': str(e)}

