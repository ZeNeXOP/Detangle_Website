from functools import wraps

from flask import Blueprint, jsonify, request, session
from werkzeug.security import check_password_hash

from db import get_database

auth_bp = Blueprint("auth", __name__, url_prefix="/api/admin")


def get_admin_users_collection():
    return get_database()["admin_users"]


def login_required(view):
    @wraps(view)
    def wrapped(*args, **kwargs):
        if not session.get("admin_id"):
            return jsonify({"error": "Authentication required"}), 401
        return view(*args, **kwargs)

    return wrapped


@auth_bp.post("/login")
def login():
    payload = request.get_json(silent=True) or {}
    email = str(payload.get("email", "")).strip().lower()
    password = str(payload.get("password", ""))

    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400

    admin = get_admin_users_collection().find_one({"email": email})
    if not admin or not check_password_hash(admin["password_hash"], password):
        return jsonify({"error": "Invalid email or password"}), 401

    session.clear()
    session["admin_id"] = str(admin["_id"])
    session["admin_email"] = admin["email"]
    session.permanent = True

    return jsonify({"message": "Logged in", "email": admin["email"]})


@auth_bp.post("/logout")
def logout():
    session.clear()
    return jsonify({"message": "Logged out"})


@auth_bp.get("/session")
def get_session():
    if not session.get("admin_id"):
        return jsonify({"authenticated": False})
    return jsonify({"authenticated": True, "email": session.get("admin_email")})
