import os
from flask import Flask, redirect, url_for, session
from authlib.integrations.flask_client import OAuth
from dotenv import load_dotenv

# Load environment variables from .env
load_dotenv()

app = Flask(__name__)
app.secret_key = os.getenv("flask_key", "supersecretkey")  # Replace with a secure key in production

# Configure OAuth
oauth = OAuth(app)
google = oauth.register(
    name='google',
    client_id=os.getenv("client_id"),
    client_secret=os.getenv("client_secret"),
    server_metadata_url='https://accounts.google.com/.well-known/openid-configuration',
    client_kwargs={'scope': 'openid email profile'}
)

# -------------------------------
# FRONTEND DASHBOARD URL
# -------------------------------
FRONTEND_COURSE_PAGE = os.getenv("FRONTEND_URL", "http://localhost:5173/courses")

# -------------------------------
# ROUTES
# -------------------------------

@app.route('/api/login')
def login():
    """
    Redirect user to Google's OAuth 2.0 consent screen
    """
    redirect_uri = url_for('authorize', _external=True)
    return google.authorize_redirect(redirect_uri)

@app.route('/api/authorize')
def authorize():
    """
    Callback endpoint for Google OAuth.
    Exchanges authorization code for token and fetches user info.
    Redirects user to CoursePage.jsx on frontend.
    """
    token = google.authorize_access_token()  # Exchange code for token
    user_info = google.userinfo()             # Fetch user info from Google
    session['user'] = user_info               # Store in session
    # Redirect to frontend course page
    return redirect(FRONTEND_COURSE_PAGE)

@app.route('/api/logout')
def logout():
    """
    Log out the user by clearing the session
    """
    session.pop('user', None)
    return redirect(FRONTEND_COURSE_PAGE)

@app.route('/api/user')
def get_user():
    """
    Endpoint for frontend to fetch logged-in user info
    """
    user = session.get('user')
    if not user:
        return {"logged_in": False}, 401
    return {"logged_in": True, "user": user}

# -------------------------------
# MAIN
# -------------------------------
if __name__ == "__main__":
    # Use host=0.0.0.0 if testing in Docker or remote VM
    app.run(host="127.0.0.1", port=8020, debug=True)
