from flask import Flask
from flask import jsonify
app = Flask(__name__)


@app.route('/')
def index():
    return jsonify(message="Welcome to A2Z Esports API")

@app.route('/api/test')
def test_api():
    return jsonify(message="API test endpoint")

if __name__ == "__main__":
    app.run(debug=True)
