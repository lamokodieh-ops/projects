from flask import Flask
from flask_cors import CORS

from config import SECRET_KEY, ensure_dirs
from db import init_db
from routes.generate import generate_bp
from routes.materials import materials_bp


def create_app() -> Flask:
    ensure_dirs()
    init_db()
    app = Flask(__name__)
    app.config["SECRET_KEY"] = SECRET_KEY
    CORS(app, resources={r"/api/*": {"origins": "*"}})
    app.register_blueprint(materials_bp)
    app.register_blueprint(generate_bp)
    return app


app = create_app()

if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5002, debug=True)