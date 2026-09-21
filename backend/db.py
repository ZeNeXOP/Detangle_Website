import os

from dotenv import load_dotenv
from pymongo import MongoClient
from pymongo.database import Database

# Loaded here (not just in app.py) so this module works standalone —
# e.g. `python db.py` to (re)apply schema validation without starting Flask.
load_dotenv()

_client: MongoClient | None = None


def get_database() -> Database:
    global _client
    if _client is None:
        mongo_uri = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
        _client = MongoClient(mongo_uri)
    database_name = os.getenv("MONGODB_DB_NAME", "detangle_db")
    return _client[database_name]


# ── Schema validation ─────────────────────────────────────────────
# Defense-in-depth: the Flask routes already validate input, but this
# enforces the same shape directly at the database level, catching
# anything inserted by hand (Atlas UI, a script, a future bug) too.

EVENT_SCHEMA = {
    "$jsonSchema": {
        "bsonType": "object",
        "required": ["slug", "title", "status"],
        "properties": {
            "slug": {"bsonType": "string"},
            "title": {"bsonType": "string"},
            "status": {"enum": ["upcoming", "past"]},
            "type": {
                "bsonType": ["string", "null"],
                "enum": [
                    None,
                    "workshop",
                    "therapy_session",
                    "online_session",
                    "group_session",
                    "program",
                ],
            },
            "short_description": {"bsonType": "string"},
            "long_description": {"bsonType": "string"},
            "start_datetime": {"bsonType": ["string", "null"]},
            "upcoming_cutoff_hours": {"bsonType": ["number", "null"]},
            "location": {"bsonType": "string"},
            "price": {"bsonType": ["number", "null"]},
            "poster_url": {"bsonType": ["string", "null"]},
            "gallery_image_urls": {"bsonType": "array", "items": {"bsonType": "string"}},
            "gallery_video_urls": {"bsonType": "array", "items": {"bsonType": "string"}},
            "whatsapp_cta_text": {"bsonType": "string"},
            "created_at": {"bsonType": "date"},
            "updated_at": {"bsonType": "date"},
        },
    }
}

ADMIN_USER_SCHEMA = {
    "$jsonSchema": {
        "bsonType": "object",
        "required": ["email", "password_hash"],
        "properties": {
            "email": {"bsonType": "string"},
            "password_hash": {"bsonType": "string"},
        },
    }
}

BOOKING_SCHEMA = {
    "$jsonSchema": {
        "bsonType": "object",
        "required": ["full_name", "email", "phone", "status", "payment_status"],
        "properties": {
            "full_name": {"bsonType": "string"},
            "email": {"bsonType": "string"},
            "phone": {"bsonType": "string"},
            "notes": {"bsonType": "string"},
            "status": {"enum": ["pending", "accepted", "rejected"]},
            "payment_status": {"bsonType": "string"},
            "created_at": {"bsonType": "date"},
        },
    }
}


def _apply_validator(database: Database, collection_name: str, validator: dict) -> None:
    if collection_name in database.list_collection_names():
        database.command(
            "collMod",
            collection_name,
            validator=validator,
            validationLevel="strict",
            validationAction="error",
        )
        print(f"Updated validator on existing collection: {collection_name}")
    else:
        database.create_collection(
            collection_name,
            validator=validator,
            validationLevel="strict",
            validationAction="error",
        )
        print(f"Created collection with validator: {collection_name}")


def _migrate_legacy_registrations(database: Database) -> None:
    """One-time cleanup: the bookings collection used to be called
    "registrations" (pre-rename). Move any leftover documents over
    instead of leaving them stranded in an unused collection."""
    existing = set(database.list_collection_names())

    if "registrations" not in existing:
        return

    if "bookings" in existing:
        print(
            "WARNING: both 'registrations' and 'bookings' collections exist. "
            "Not renaming automatically — merge or delete 'registrations' by hand."
        )
        return

    database["registrations"].rename("bookings")
    print("Migrated collection: registrations -> bookings")


def setup_schemas() -> None:
    database = get_database()

    _migrate_legacy_registrations(database)

    _apply_validator(database, "events", EVENT_SCHEMA)
    _apply_validator(database, "admin_users", ADMIN_USER_SCHEMA)
    _apply_validator(database, "bookings", BOOKING_SCHEMA)

    database["events"].create_index("slug", unique=True)
    database["admin_users"].create_index("email", unique=True)
    print("Indexes ensured: events.slug (unique), admin_users.email (unique)")

    print("Schema setup complete.")


if __name__ == "__main__":
    setup_schemas()
