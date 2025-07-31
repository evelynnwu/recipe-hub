# test.py
import requests

response = requests.post(
    'http://localhost:5000/parse',
    data={'url': 'https://www.allrecipes.com/recipe/158968/spinach-and-feta-turkey-burgers/'}
)

print("Response:", response.text)