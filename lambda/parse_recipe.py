import json
import logging
from urllib.request import urlopen, Request
from recipe_scrapers import scrape_html

# Configure logging
logger = logging.getLogger()
logger.setLevel(logging.INFO)

def lambda_handler(event, context):
    """
    AWS Lambda function to parse recipes from URLs
    Replaces the Flask /api/parse endpoint
    """
    
    # Enable CORS headers
    headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
    }
    
    try:
        # Handle preflight OPTIONS request
        if event.get('httpMethod') == 'OPTIONS':
            return {
                'statusCode': 200,
                'headers': headers,
                'body': ''
            }
        
        # Parse request body
        if 'body' not in event or not event['body']:
            return {
                'statusCode': 400,
                'headers': headers,
                'body': json.dumps({"success": False, "error": "Request body is required"})
            }
        
        # Handle both direct JSON and base64 encoded bodies
        body = event['body']
        if event.get('isBase64Encoded', False):
            import base64
            body = base64.b64decode(body).decode('utf-8')
        
        data = json.loads(body)
        url = data.get('url')
        
        logger.info(f"Parsing URL: {url}")
        
        if not url:
            return {
                'statusCode': 400,
                'headers': headers,
                'body': json.dumps({"success": False, "error": "URL is required"})
            }

        # Add User-Agent header to avoid 403 errors
        req = Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'})
        html = urlopen(req).read().decode("utf-8")
        scraper = scrape_html(html, org_url=url)
        recipe_data = scraper.to_json()
        recipe_data['success'] = True
        
        logger.info(f"Successfully parsed recipe: {recipe_data.get('title', 'No title')}")
        
        return {
            'statusCode': 200,
            'headers': headers,
            'body': json.dumps(recipe_data)
        }
        
    except Exception as e:
        error_msg = f"Error parsing recipe: {str(e)}"
        logger.error(error_msg)
        return {
            'statusCode': 500,
            'headers': headers,
            'body': json.dumps({"success": False, "error": error_msg})
        }