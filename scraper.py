import requests
from bs4 import BeautifulSoup
from google import genai
from dotenv import load_dotenv
from recipe_scrapers import scrape_html

load_dotenv()
client = genai.Client()

response = client.models.generate_content(
    model="gemini-2.5-flash", contents="Explain how AI works in a few words"
)
print(response.text)

URL = "https://www.allrecipes.com/recipe/158968/spinach-and-feta-turkey-burgers/"
page = requests.get(URL).text

scraper = scrape_html(page, org_url=URL)
print(scraper.title())
print(scraper.instructions())
print(scraper.ingredients())
