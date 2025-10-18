import os
import sys

from flask import Flask, send_from_directory
from flask_cors import CORS

# Add the backend directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from api.routes import api_bp
from config.settings import Config


def create_app():
    """Application factory pattern"""
    app = Flask(__name__, static_folder="../frontend", static_url_path="")

    # Load configuration
    app.config.from_object(Config)

    # Enable CORS for all routes
    CORS(app)

    # Register blueprints
    app.register_blueprint(api_bp, url_prefix="/api/v1")

    # Serve the PWA
    @app.route("/")
    def serve_pwa():
        return send_from_directory(app.static_folder, "index.html")

    # Catch-all route for PWA routing
    @app.route("/<path:path>")
    def serve_pwa_files(path):
        if os.path.exists(os.path.join(app.static_folder, path)):
            return send_from_directory(app.static_folder, path)
        else:
            # Return index.html for client-side routing
            return send_from_directory(app.static_folder, "index.html")

    return app


if __name__ == "__main__":
    app = create_app()
    app.run(debug=True, host="0.0.0.0", port=5000)
