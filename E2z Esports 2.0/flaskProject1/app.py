from flask import jsonify

from flaskProject1.A2Z_Esports.backend.app import app


@app.route('/')
def index():
    return jsonify(message="Welcome to A2Z Esports API")

@app.route('/api/test')
def test_api():
    return jsonify(message="API test endpoint")
