from flask import Flask, render_template, request
from scraper import parse_recipe

app = Flask(__name__)

@app.route('/')
def home():
    return render_template('index.html')


@app.route('/parse', methods=['POST'])
def parse():
    url = request.form['url']
    recipe_data = parse_recipe(url)  # Use your scraper

    if recipe_data['success']:
        return recipe_data['title']
        #return render_template('recipe.html', recipe=recipe_data)
    else:
        return f"Error: {recipe_data['error']}"


if __name__ == '__main__':
    app.run(debug=True)