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
- `POST /api/registrations` - create a workshop registration
