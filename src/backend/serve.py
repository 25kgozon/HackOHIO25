from logging import debug
from flask import Flask, jsonify, request

try:
    from db import DB
except ImportError:
    from .db import DB


db = DB()
app = Flask(__name__)



if __name__ == "__main__":
    app.run(
        host="127.0.0.1",
        port=8010,
        debug=True

    )
