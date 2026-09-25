# Detangle Backend (Flask + MongoDB)

## 1) Setup

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
```

## 2) Configure environment

Copy `.env.example` to `.env` and set your MongoDB connection values.

## 3) Run API

```bash
python app.py
```

API runs at `http://localhost:5000` by default.

## Endpoints

- `GET /api/health` - health check
- `POST /api/bookings` - create a booking (`booking_type: "service"` or `"event"` — see `notifications.py`)

## Booking notifications

`POST /api/bookings` with `booking_type: "service"` sends Noopur a notification via email (Resend) and WhatsApp (Twilio). Both are optional independently — set the env vars in `.env.example` for whichever you want live; a booking still saves fine with neither configured, it just skips that channel with a log line. `booking_type: "event"` doesn't send anything server-side — the frontend opens a `wa.me` link directly using that event's own WhatsApp message.
