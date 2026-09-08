import os

from flask import Flask, jsonify, request
from flask_cors import CORS

from config import SECRET_KEY, api_key_matches, cors_origins, ensure_dirs, is_public_api_path
from db import init_db
from routes.generate import generate_bp
from routes.materials import materials_bp
from seed_demo import seed_mock_materials_if_empty


def create_app() -> Flask:
    ensure_dirs()
    init_db()
    seed_mock_materials_if_empty()
    app = Flask(__name__)
    app.config["SECRET_KEY"] = SECRET_KEY
    CORS(
        app,
        resources={
            r"/api/*": {
                "origins": cors_origins(),
                "allow_headers": ["Content-Type", "Accept", "X-API-Key"],
                "methods": ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
            }
        },
    )
    app.register_blueprint(materials_bp)
    app.register_blueprint(generate_bp)

    @app.before_request
    def require_api_key():
        if request.method == "OPTIONS":
            return None
        path = request.path or ""
        if not path.startswith("/api/"):
            return None
        if is_public_api_path(path):
            return None
        provided = request.headers.get("X-API-Key") or ""
        if not api_key_matches(os.environ, provided):
            return jsonify({"error": "Unauthorized"}), 401
        return None

    return app


app = create_app()

if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5002, debug=os.environ.get("FLASK_DEBUG") == "1")
