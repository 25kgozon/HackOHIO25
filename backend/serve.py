from logging import debug
from flask import Flask, jsonify, request

try:
    from db import DB
except ImportError:
    from .db import DB


db = DB()
app = Flask(__name__)






@app.route('/api/events')
def foo_route():
    return jsonify(db.get_all())

@app.route('/api/event/<int:path>')
def id_route(path):
    return jsonify(db.get_result(path))

@app.route("/api/add", methods=["POST"])
def add_route():
    cmd = request.get_data(as_text=True)
    return str(db.enqueue_event({
        "cmd": cmd
    }))


if __name__ == "__main__":
    app.run(
        host="127.0.0.1",
        port=8010,
        debug=True

    )
