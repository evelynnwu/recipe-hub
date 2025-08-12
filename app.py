from flask import Flask, jsonify, request, Response
from flask_cors import CORS
from urllib.request import urlopen, Request
from recipe_scrapers import scrape_html
import json
import logging

app = Flask(__name__)
CORS(app)  # Enable CORS for React frontend

# Enable detailed logging
logging.basicConfig(level=logging.DEBUG)
app.logger.setLevel(logging.DEBUG)

@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({"status": "healthy"})

@app.route('/api/parse', methods=['POST'])
def parse():
    try:
        data = request.get_json()
        url = data.get('url')
        app.logger.info(f"Parsing URL: {url}")
        
        if not url:
            return jsonify({"success": False, "error": "URL is required"}), 400

        # Add User-Agent header to avoid 403 errors
        req = Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'})
        html = urlopen(req).read().decode("utf-8")
        scraper = scrape_html(html, org_url=url)
        recipe_json = scraper.to_json()  # This is already a JSON string
        app.logger.info(recipe_json)
        
        app.logger.info(f"Successfully parsed recipe: {recipe_json}")
        
        return jsonify(recipe_json)
        
    except Exception as e:
        error_msg = f"Error parsing recipe: {str(e)}"
        app.logger.error(error_msg)
        return jsonify({"success": False, "error": error_msg}), 500


if __name__ == '__main__':
    app.run(debug=True)