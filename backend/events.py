from datetime import datetime, timedelta, timezone

from flask import Blueprint, jsonify, request

from auth import login_required
from db import get_database

events_bp = Blueprint("events", __name__, url_prefix="/api")
admin_events_bp = Blueprint("admin_events", __name__, url_prefix="/api/admin")

EVENT_TYPES = ["workshop", "therapy_session", "online_session", "group_session"]
EVENT_STATUSES = ["upcoming", "past"]

REQUIRED_FIELDS = ["slug", "title", "status"]

UPDATABLE_FIELDS = [
    "title",
    "status",
    "description",
    "type",
    "start_datetime",
    "upcoming_cutoff_hours",
    "location",
    "price",
    "poster_url",
    "gallery_image_urls",
    "gallery_video_urls",
    "whatsapp_cta_text",
]


def get_events_collection():
    return get_database()["events"]


def compute_status(event: dict) -> str:
    start = event.get("start_datetime")
    if not start:
        # No scheduled date to compute a transition from — fall back to
        # whichever status was manually chosen when the event was created.
        return event.get("status", "past")

    start_dt = datetime.fromisoformat(start)
    cutoff_hours = event.get("upcoming_cutoff_hours") or 0
    cutoff = start_dt - timedelta(hours=cutoff_hours)
    return "upcoming" if datetime.now(timezone.utc) < cutoff else "past"


def serialize_event(event: dict) -> dict:
    return {
        "id": str(event["_id"]),
        "slug": event.get("slug"),
        "title": event.get("title"),
        "description": event.get("description"),
        "type": event.get("type"),
        "start_datetime": event.get("start_datetime"),
        "upcoming_cutoff_hours": event.get("upcoming_cutoff_hours", 0),
        "location": event.get("location"),
        "price": event.get("price"),
        "status": compute_status(event),
        "poster_url": event.get("poster_url"),
        "gallery_image_urls": event.get("gallery_image_urls", []),
        "gallery_video_urls": event.get("gallery_video_urls", []),
        "whatsapp_cta_text": event.get("whatsapp_cta_text"),
    }


def _sort_key(event: dict) -> str:
    return event.get("start_datetime") or ""


def _missing_fields(payload: dict) -> list:
    return [field for field in REQUIRED_FIELDS if not str(payload.get(field, "")).strip()]


@events_bp.get("/events")
def list_events():
    status_filter = request.args.get("status")
    serialized = [serialize_event(e) for e in get_events_collection().find()]
    if status_filter:
        serialized = [e for e in serialized if e["status"] == status_filter]
    serialized.sort(key=_sort_key, reverse=True)
    return jsonify(serialized)


@events_bp.get("/events/<slug>")
def get_event(slug: str):
    event = get_events_collection().find_one({"slug": slug})
    if not event:
        return jsonify({"error": "Event not found"}), 404
    return jsonify(serialize_event(event))


@admin_events_bp.post("/events")
@login_required
def create_event():
    payload = request.get_json(silent=True) or {}
    missing = _missing_fields(payload)
    if missing:
        return jsonify({"error": f"Missing required fields: {', '.join(missing)}"}), 400

    if payload["status"] not in EVENT_STATUSES:
        return jsonify({"error": f"status must be one of: {', '.join(EVENT_STATUSES)}"}), 400

    if payload.get("type") and payload["type"] not in EVENT_TYPES:
        return jsonify({"error": f"type must be one of: {', '.join(EVENT_TYPES)}"}), 400

    collection = get_events_collection()
    slug = str(payload["slug"]).strip()
    if collection.find_one({"slug": slug}):
        return jsonify({"error": "An event with this slug already exists"}), 409

    now = datetime.now(timezone.utc)
    event = {
        "slug": slug,
        "title": str(payload["title"]).strip(),
        "status": payload["status"],
        "description": str(payload.get("description", "")).strip(),
        "type": payload.get("type") or None,
        "start_datetime": str(payload.get("start_datetime", "")).strip() or None,
        "upcoming_cutoff_hours": float(payload.get("upcoming_cutoff_hours") or 0),
        "location": str(payload.get("location", "")).strip(),
        "price": payload.get("price"),
        "poster_url": payload.get("poster_url"),
        "gallery_image_urls": payload.get("gallery_image_urls", []),
        "gallery_video_urls": payload.get("gallery_video_urls", []),
        "whatsapp_cta_text": str(payload.get("whatsapp_cta_text", "")).strip(),
        "created_at": now,
        "updated_at": now,
    }
    result = collection.insert_one(event)
    event["_id"] = result.inserted_id
    return jsonify(serialize_event(event)), 201


@admin_events_bp.put("/events/<slug>")
@login_required
def update_event(slug: str):
    payload = request.get_json(silent=True) or {}

    if "status" in payload and payload["status"] not in EVENT_STATUSES:
        return jsonify({"error": f"status must be one of: {', '.join(EVENT_STATUSES)}"}), 400

    if payload.get("type") and payload["type"] not in EVENT_TYPES:
        return jsonify({"error": f"type must be one of: {', '.join(EVENT_TYPES)}"}), 400

    collection = get_events_collection()
    existing = collection.find_one({"slug": slug})
    if not existing:
        return jsonify({"error": "Event not found"}), 404

    updates = {field: payload[field] for field in UPDATABLE_FIELDS if field in payload}
    updates["updated_at"] = datetime.now(timezone.utc)

    collection.update_one({"slug": slug}, {"$set": updates})
    return jsonify(serialize_event(collection.find_one({"slug": slug})))


@admin_events_bp.delete("/events/<slug>")
@login_required
def delete_event(slug: str):
    result = get_events_collection().delete_one({"slug": slug})
    if result.deleted_count == 0:
        return jsonify({"error": "Event not found"}), 404
    return jsonify({"message": "Event deleted"})
