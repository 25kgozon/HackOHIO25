import os
from flask import Flask, redirect, session, jsonify, request
from authlib.integrations.flask_client import OAuth
from dotenv import load_dotenv

# Load environment variables from .env
load_dotenv()

app = Flask(__name__)
app.secret_key = os.getenv("FLASK_KEY", "supersecretkey")

# --- Detect frontend base URL dynamically ---
def get_frontend_base():
    # Use environment variable if available
    env_frontend = os.getenv("FRONTEND_URI")
    if env_frontend:
        return env_frontend.rstrip("/")
    # Fallback: detect based on request origin (useful for production)
    origin = request.headers.get("Origin")
    if origin:
        return origin.rstrip("/")
    # Default to local React dev server
    return "http://localhost:5173"

# --- OAuth setup ---
oauth = OAuth(app)
google = oauth.register(
    name='google',
    client_id=os.getenv("CLIENT_ID"),
    client_secret=os.getenv("CLIENT_SECRET"),
    server_metadata_url='https://accounts.google.com/.well-known/openid-configuration',
    client_kwargs={'scope': 'openid email profile'}
)


# --------------------- ROUTES ---------------------

@app.route('/api/login')
def login():
    """
    Redirect user to Google's OAuth 2.0 consent screen.
    """
    redirect_uri = f"{get_frontend_base()}/api/authorize"
    return google.authorize_redirect(redirect_uri)


@app.route('/api/authorize')
def authorize():
    """
    Callback endpoint for Google OAuth.
    Exchanges authorization code for token and fetches user info.
    Redirects user to the Courses page on the frontend.
    """
    token = google.authorize_access_token()
    user_info = google.userinfo()
    session['user'] = user_info

    frontend_redirect = f"{get_frontend_base()}/courses"
    return redirect(frontend_redirect)


@app.route('/api/logout')
def logout():
    """
    Log out the user by clearing the session and redirecting to the login page.
    """
    session.pop('user', None)
    frontend_redirect = f"{get_frontend_base()}/login"
    return redirect(frontend_redirect)


@app.route('/api/user')
def get_user():
    """
    Endpoint for frontend to fetch logged-in user info.
    """
    user = session.get('user')
    if not user:
        return jsonify({"logged_in": False}), 401
    return jsonify({"logged_in": True, "user": user})


# --------------------- MAIN ---------------------
if __name__ == "__main__":
    app.run(host="127.0.0.1", port=8010, debug=True)

