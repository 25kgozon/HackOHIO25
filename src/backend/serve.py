from boto3.docs import method
from dotenv import load_dotenv
from pydantic import NonPositiveInt

# Load environment variables from .env
load_dotenv()

from uuid import UUID, uuid4

import os
from flask import Flask, make_response, redirect, session, jsonify, request
from authlib.integrations.flask_client import OAuth

from db import *
from s3 import *

db = DB()



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



FRONTEND_AUTH = os.getenv("FRONTEND_URI","http://localhost:5173/api/authorize")


def url_for(path):
    url = FRONTEND_AUTH
    if url.endswith("/"):
        url = url[:-1]
    url += path

    return url  
        



@app.route('/api/login')
def login():
    """
    Redirect user to Google's OAuth 2.0 consent screen
    """

    role = request.args.get('role')
    if not role in ["teacher", "student"]:
        return "Unknown role: " + str(role), 403


    session["role"] = role
    return google.authorize_redirect(url_for("/api/authorize"))

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
    session['user']['role'] = session['role']
    db.upsert_user(user_info["sub"], 
                   user_info["email"],
                   ({"teacher": UserRole.TEACHER, "student": UserRole.STUDENT})[session["role"]],
                   None,
                   user_info["name"], {}
                   )
    return redirect(url_for("/handle_frontend_login"))

@app.route('/api/logout')
def logout():
    """
    Log out the user by clearing the session
    """
    session.pop('user', None)
    return redirect(url_for("/"))

@app.route('/api/user')
def get_user():
    """
    Endpoint for frontend to fetch logged-in user info
    """
    user = session.get('user')
    if not user:
        return jsonify({"logged_in": False}, 401)
    return jsonify({"logged_in": True, "user": user})

@app.route("/api/classes")
def get_classes():
    user = session.get('user')
    if not user:
        return jsonify({"logged_in": False}, 401)
    return jsonify(db.get_user_classes(user["sub"]))


@app.route("/api/join_class", methods=["POST"])
def join_class():
    user = session.get('user')
    if not user:
         return jsonify({"logged_in": False}, 401)
    if user["role"] != "teacher":
        return jsonify({"error": "Not a student"}, 401)
    
    data = request.get_json()

    if db.join_class_by_code(user["sub"], data["code"]) is None:
        return jsonify({"status": "error"})
    else:
        return jsonify({"status": "ok"})



@app.route("/api/create_class", methods=["POST"])
def create_class():
    user = session.get('user')
    if not user:
        return jsonify({"logged_in": False}, 401)
    if user["role"] != "teacher":
        return jsonify({"error": "Not a teacher"}, 401)
    data = request.get_json()

    
    classes = db.get_user(user["sub"])["classes"]
    id = UUID(db.create_class(user["sub"], data["name"], data["desc"]))
    classes.append(id)
    db.update_user_classes(user["sub"], classes)
    
    return jsonify({"id": id})


@app.route("/api/delete_class", methods=["POST"])
def delete_class():
    user = session.get('user')
    if not user:
        return jsonify({"logged_in": False}, 401)
    if user["role"] != "teacher":
        return jsonify({"error": "Not a teacher"}, 401)

    data = request.get_json()
    db.delete_classes(UUID(data["id"]))
    return jsonify(":>")


@app.route("/api/create_assignment", methods=["POST"])
def create_assignment():
    user = session.get('user')
    if not user:
        return jsonify({"logged_in": False}, 401)
    if user["role"] != "teacher":
        return jsonify({"error": "Not a teacher"}, 401)

    data = request.get_json()

    id = db.create_assignment(
        data["class_id"],    
        data["ass name"],
        data["ass desc"],
        data["ass attrs"], # Dict, leave blank for now
        data["ass grade info"], # Put in a dict
        data["context"]
    )
    return jsonify({"id": id})
@app.route("/api/delete_assignment", methods=["POST"])
def delete_assignment():
    user = session.get('user')
    if not user:
        return jsonify({"logged_in": False}, 401)
    if user["role"] != "teacher":
        return jsonify({"error": "Not a teacher"}, 401)

    data = request.get_json()
    db.delete_assignment(data["class id"], data["assignment id"])
    return jsonify(":>")

@app.route("/api/update_assignment", methods=["POST"])
def update_assignment():
    user = session.get('user')
    if not user:
        return jsonify({"logged_in": False}), 401
    if user["role"] != "teacher":
        return jsonify({"error": "Not a teacher"}), 401

    data = request.get_json()

    db.edit_assignment(
        data["assignment id"],      # <-- no dot here
        data.get("name"),           # Can be None
        data.get("desc"),
        data.get("attrs"),
        data.get("gradeInfo"),
        data.get("context")
    )

    return jsonify(":>")




@app.route("/api/get_class_assignments", methods=["POST"])
def get_ass():
    user = session.get('user')
    if not user:
        return jsonify({"logged_in": False}, 401)

    data = request.get_json()


    return jsonify(
        db.get_class_assignments(data["class id"])
    )


@app.route("/api/file/<path:path>")
def get_file(path):
    return redirect(generate_download_url(path))


"""
document.querySelector('input').onchange = async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  console.log('Uploading:', file.name);

  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    const result = await response.json();
    if (!response.ok) {
      console.error('Upload failed:', result);
    } else {
      console.log('Upload successful:', result);
    }
  } catch (err) {
    console.error('Error uploading file:', err);
  }
};
"""


@app.route("/api/create_student_file", methods=["POST"])
def create_student_file():
    user = session.get('user')
    if not user:
        return jsonify({"logged_in": False}, 401)
    
    data = request.get_json()

    fid = db.create_file(user["sub"], "student.pdf", FileRole.STUDENT_RESPONSE,UUID(data["assignment"]), "")
    return jsonify({"id": fid})  # <-- wrap in dict

@app.route("/api/create_teacher_file", methods=["POST"])
def create_teacher_file():
    user = session.get('user')
    if not user:
        return jsonify({"logged_in": False}), 401

    data = request.get_json()


    if db.get_assignment(UUID(data["assignment"])) is None:
        print("PANIC PANIC PANIC", data["assignment"])
        return "PANIC", 401

    fid = db.create_file(user["sub"], "teacher.pdf", FileRole.TEACHER_KEY, UUID(data["assignment"]), "")
    return jsonify({"id": fid})  # <-- wrap in dict with "id"




@app.route("/api/upload/<path:path>", methods=["POST"])
def upload_to_s3(path):
    if "file" not in request.files:
        return jsonify({"error": "No file part"}), 400
    dbfile = db.get_file(path)
    if dbfile is None:
        return jsonify({"error": "No such file exists"}), 404

    file = request.files["file"]
    if file.filename == "":
        return jsonify({"error": "No selected file"}), 400

    s3.upload_fileobj(
        file,
        BUCKET,
        path  # use path here, not 'key'
    )



    db.enqueue_file_task(TaskType.OCR, [path], "{}")
    print(dbfile)
    
    if dbfile["file_role"] == FileRole.TEACHER_KEY.value:
        db.set_file_assignments(
            dbfile["file_assignment"], [UUID(path)]
        )
        print("set file")
        
        
    if dbfile["file_role"] == FileRole.STUDENT_RESPONSE.value:
        ass = db.get_assignment(dbfile["file_assignment"])
        if len(ass["files"]) == 0:
            return jsonify("Assignment has not key"), 500
        db.enqueue_text_task(TaskType.SUMMARIZE, [""], [
            UUID(path), ass["files"][0]
        ])


    

    return jsonify({"message": "Upload successful", "url": generate_download_url(path)})



@app.route("/api/submission/<path:path>")
def get_sub(path):
    user = session.get('user')
    if not user:
        return jsonify({"logged_in": False}), 401


    return db.get_file_by_user_on_assignment(user["sub"], UUID(path))




if __name__ == "__main__":
    # Use host=0.0.0.0 if testing in Docker or remote VM
    app.run(host="127.0.0.1", port=8010, debug=True)
