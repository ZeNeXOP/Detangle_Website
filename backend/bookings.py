import os
from datetime import datetime, timezone

from flask import Blueprint, jsonify, request

from constants import SERVICE_LABELS, SERVICE_TYPES
from db import get_database
from events import get_events_collection
from notifications import notify_new_service_booking

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

    booking_type = payload.get("booking_type")
    if booking_type not in ("service", "event"):
        return jsonify({"error": "booking_type must be 'service' or 'event'."}), 400

    booking = {
        "full_name": str(payload.get("full_name", "")).strip(),
        "email": str(payload.get("email", "")).strip().lower(),
        "phone": str(payload.get("phone", "")).strip(),
        "notes": str(payload.get("notes", "")).strip(),
        "status": "pending",
        "payment_status": "pending",
        "booking_type": booking_type,
        "service_type": None,
        "event_slug": None,
        "event_title": None,
        "created_at": datetime.now(timezone.utc),
    }

    message = "Booking received successfully."

    if booking_type == "service":
        service_type = payload.get("service_type")
        if service_type not in SERVICE_TYPES:
            return jsonify({"error": "Choose a valid service to book."}), 400

        service_label = SERVICE_LABELS[service_type]
        booking["service_type"] = service_type

        result = get_bookings_collection().insert_one(booking)

        notify_new_service_booking(
            service_label=service_label,
            full_name=booking["full_name"],
            email=booking["email"],
            phone=booking["phone"],
            notes=booking["notes"],
        )

        message = (
            f'Your request for the "{service_label}" has been sent. '
            "Noopur will get back to you via WhatsApp within 24 hours."
        )

    else:  # event
        event_slug = str(payload.get("event_slug", "")).strip()
        if not event_slug:
            return jsonify({"error": "event_slug is required for an event booking."}), 400

        event = get_events_collection().find_one({"slug": event_slug})
        booking["event_slug"] = event_slug
        booking["event_title"] = event["title"] if event else str(payload.get("event_title", "")).strip()

        result = get_bookings_collection().insert_one(booking)
        message = "Your interest has been noted. Continue on WhatsApp to confirm with Noopur."

    return (
        jsonify(
            {
                "message": message,
                "booking_id": str(result.inserted_id),
            }
        ),
        201,
    )
