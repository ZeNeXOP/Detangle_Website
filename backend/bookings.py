import os
from datetime import datetime, timezone

from flask import Blueprint, jsonify, request

from db import get_database

bookings_bp = Blueprint("bookings", __name__, url_prefix="/api")


def get_bookings_collection():
    collection_name = os.getenv("MONGODB_COLLECTION_NAME", "bookings")
    return get_database()[collection_name]


@bookings_bp.post("/bookings")
def create_booking():
    payload = request.get_json(silent=True) or {}
    required_fields = ["full_name", "email", "phone"]

    missing_fields = [
        field for field in required_fields if not str(payload.get(field, "")).strip()
    ]
    if missing_fields:
        missing_fields_string = ", ".join(missing_fields)
        return (
            jsonify({"error": f"Missing required fields: {missing_fields_string}"}),
            400,
        )

    booking = {
        "full_name": str(payload.get("full_name", "")).strip(),
        "email": str(payload.get("email", "")).strip().lower(),
        "phone": str(payload.get("phone", "")).strip(),
        "notes": str(payload.get("notes", "")).strip(),
        "status": "pending",
        "payment_status": "pending",
        "created_at": datetime.now(timezone.utc),
    }

    result = get_bookings_collection().insert_one(booking)
    return (
        jsonify(
            {
                "message": "Booking received successfully.",
                "booking_id": str(result.inserted_id),
            }
        ),
        201,
    )
