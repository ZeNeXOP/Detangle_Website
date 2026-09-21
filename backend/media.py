import os

import cloudinary
import cloudinary.uploader
from flask import Blueprint, jsonify, request

from auth import login_required

media_bp = Blueprint("media", __name__, url_prefix="/api/admin")

_configured = False


def _ensure_configured() -> None:
    global _configured
    if _configured:
        return
    cloudinary.config(
        cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
        api_key=os.getenv("CLOUDINARY_API_KEY"),
        api_secret=os.getenv("CLOUDINARY_API_SECRET"),
        secure=True,
    )
    _configured = True


@media_bp.post("/uploads")
@login_required
def upload_media():
    if not all(
        os.getenv(key)
        for key in ("CLOUDINARY_CLOUD_NAME", "CLOUDINARY_API_KEY", "CLOUDINARY_API_SECRET")
    ):
        return jsonify({"error": "Cloudinary is not configured on the server (missing env vars)"}), 500

    _ensure_configured()

    file = request.files.get("file")
    if not file:
        return jsonify({"error": "No file provided"}), 400

    try:
        result = cloudinary.uploader.upload(file, resource_type="auto", folder="detangle/events")
    except Exception as error:  # surface the real reason instead of a bare 500
        return jsonify({"error": f"Upload to Cloudinary failed: {error}"}), 502

    return (
        jsonify({"url": result["secure_url"], "resource_type": result["resource_type"]}),
        201,
    )
