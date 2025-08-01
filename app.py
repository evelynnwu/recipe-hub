from flask import Flask, jsonify, request
from flask_cors import CORS
from scraper import parse_recipe

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
    
    recipe_data = parse_recipe(url)
    return jsonify(recipe_data)


if __name__ == '__main__':
    app.run(debug=True)