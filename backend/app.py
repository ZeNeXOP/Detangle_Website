import os
from datetime import datetime, timezone

from flask import Flask, jsonify, request
from flask_cors import CORS
from pymongo import MongoClient
from pymongo.collection import Collection
from dotenv import load_dotenv


def get_collection() -> Collection:
    mongo_uri = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
    database_name = os.getenv("MONGODB_DB_NAME", "detangle_db")
    collection_name = os.getenv("MONGODB_COLLECTION_NAME", "registrations")

    client = MongoClient(mongo_uri)
    database = client[database_name]
    return database[collection_name]


def create_app() -> Flask:
    load_dotenv()
    app = Flask(__name__)
    cors_origins = os.getenv("FRONTEND_ORIGIN", "*")
    CORS(app, resources={r"/api/*": {"origins": cors_origins}})
    registrations = get_collection()

    @app.get("/api/health")
    def health_check():
        return jsonify({"status": "ok"})

    @app.post("/api/registrations")
    def create_registration():
        payload = request.get_json(silent=True) or {}
        required_fields = ["full_name", "email", "phone", "workshop_id"]

        missing_fields = [
            field
            for field in required_fields
            if not str(payload.get(field, "")).strip()
        ]
        if missing_fields:
            missing_fields_string = ", ".join(missing_fields)
            return (
                jsonify(
                    {"error": f"Missing required fields: {missing_fields_string}"}
                ),
                400,
            )

        registration = {
            "full_name": str(payload.get("full_name", "")).strip(),
            "email": str(payload.get("email", "")).strip().lower(),
            "phone": str(payload.get("phone", "")).strip(),
            "workshop_id": str(payload.get("workshop_id", "")).strip(),
            "experience_level": str(
                payload.get("experience_level", "beginner")
            ).strip(),
            "notes": str(payload.get("notes", "")).strip(),
            "status": "pending",
            "payment_status": "pending",
            "created_at": datetime.now(timezone.utc),
        }

        result = registrations.insert_one(registration)
        return (
            jsonify(
                {
                    "message": "Registration received successfully.",
                    "registration_id": str(result.inserted_id),
                }
            ),
            201,
        )

    return app


app = create_app()


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.getenv("PORT", "5000")), debug=True)
