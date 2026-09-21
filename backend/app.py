import os

from flask import Flask, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

from auth import auth_bp
from media import media_bp
from events import events_bp, admin_events_bp
from bookings import bookings_bp
from blog import blog_bp, admin_blog_bp


def create_app() -> Flask:
    load_dotenv()
    app = Flask(__name__)

    app.secret_key = os.getenv("SECRET_KEY", "dev-secret-key-change-me")
    is_dev = os.getenv("FLASK_ENV", "production") == "development"
    app.config.update(
        SESSION_COOKIE_HTTPONLY=True,
        SESSION_COOKIE_SAMESITE="Lax",
        SESSION_COOKIE_SECURE=not is_dev,
        PERMANENT_SESSION_LIFETIME=60 * 60 * 24 * 14,  # 14 days
    )

    cors_origins = os.getenv("FRONTEND_ORIGIN", "*")
    CORS(app, resources={r"/api/*": {"origins": cors_origins}}, supports_credentials=True)

    @app.get("/api/health")
    def health_check():
        return jsonify({"status": "ok"})

    app.register_blueprint(auth_bp)
    app.register_blueprint(media_bp)
    app.register_blueprint(events_bp)
    app.register_blueprint(admin_events_bp)
    app.register_blueprint(bookings_bp)
    app.register_blueprint(blog_bp)
    app.register_blueprint(admin_blog_bp)

    return app


app = create_app()


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.getenv("PORT", "5000")), debug=True)
