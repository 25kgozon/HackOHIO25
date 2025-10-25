# auth.py
import os
from flask import Flask, redirect, url_for, session
from authlib.integrations.flask_client import OAuth
from dotenv import load_dotenv

# Load .env variables
load_dotenv()

app = Flask(__name__)
app.secret_key = os.getenv("flask_key", "supersecretkey")  # You should generate a strong one

# Configure OAuth
oauth = OAuth(app)
google = oauth.register(
    name='google',
    client_id=os.getenv("client_id"),
    client_secret=os.getenv("client_secret"),
    access_token_url='https://accounts.google.com/o/oauth2/token',
    access_token_params=None,
    authorize_url='https://accounts.google.com/o/oauth2/auth',
    authorize_params=None,
    api_base_url='https://www.googleapis.com/oauth2/v1/',
    client_kwargs={'scope': 'openid email profile'},
)

@app.route('/api/login')
def login():
    redirect_uri = url_for('authorize', _external=True)
    return google.authorize_redirect(redirect_uri)

@app.route('/api/authorize')
def authorize():
    token = google.authorize_access_token()
    resp = google.get('userinfo')
    user_info = resp.json()
    # Store user info in session
    session['user'] = user_info
    return f"Hello, {user_info['name']}! You are logged in."

@app.route('/api/logout')
def logout():
    session.pop('user', None)
    return "You have been logged out."

if __name__ == "__main__":
    app.run(host="127.0.0.1", port=8020, debug=True)
