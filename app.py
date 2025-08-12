from flask import Flask, jsonify, request
from flask_cors import CORS
from recipe_scrapers import scrape_me

app = Flask(__name__)
CORS(app)  # Enable CORS for React frontend

@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({"status": "healthy"})

@app.route('/api/parse', methods=['POST'])
def parse():
    data = request.get_json()
    url = data.get('url')
    
    if not url:
        return jsonify({"success": False, "error": "URL is required"}), 400
    
    scraper = scrape_me(url)
    return scraper.to_json()


if __name__ == '__main__':
    app.run(debug=True)