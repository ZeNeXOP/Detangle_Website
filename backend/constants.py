"""Shared constants for the bookable services (as opposed to scheduled
events, which live in the events collection). Kept separate from db.py
and bookings.py so both can import it without a circular import."""

SERVICE_LABELS = {
    "therapy_session": "Therapy Session",
    "reiki_session": "Reiki Session",
    "sound_healing_session": "Sound Healing Session",
    "aura_cleansing_session": "Aura Cleansing Session",
    "chakra_balancing_session": "Chakra Balancing Session",
}

SERVICE_TYPES = list(SERVICE_LABELS.keys())
