from datetime import datetime, timezone

from flask import Blueprint, jsonify, request

from auth import login_required
from db import get_database

blog_bp = Blueprint("blog", __name__, url_prefix="/api")
admin_blog_bp = Blueprint("admin_blog", __name__, url_prefix="/api/admin")

REQUIRED_FIELDS = ["slug", "title"]

UPDATABLE_FIELDS = [
    "title",
    "subtitle",
    "short_description",
    "content",
    "published_at",
]


def get_blog_collection():
    return get_database()["blog_posts"]


def serialize_post(post: dict) -> dict:
    return {
        "id": str(post["_id"]),
        "slug": post.get("slug"),
        "title": post.get("title"),
        "subtitle": post.get("subtitle"),
        "short_description": post.get("short_description"),
        "content": post.get("content"),
        "published_at": post.get("published_at"),
    }


def _sort_key(post: dict) -> str:
    return post.get("published_at") or ""


def _missing_fields(payload: dict) -> list:
    return [field for field in REQUIRED_FIELDS if not str(payload.get(field, "")).strip()]


@blog_bp.get("/blog")
def list_posts():
    serialized = [serialize_post(p) for p in get_blog_collection().find()]
    serialized.sort(key=_sort_key, reverse=True)
    return jsonify(serialized)


@blog_bp.get("/blog/<slug>")
def get_post(slug: str):
    post = get_blog_collection().find_one({"slug": slug})
    if not post:
        return jsonify({"error": "Post not found"}), 404
    return jsonify(serialize_post(post))


@admin_blog_bp.post("/blog")
@login_required
def create_post():
    payload = request.get_json(silent=True) or {}
    missing = _missing_fields(payload)
    if missing:
        return jsonify({"error": f"Missing required fields: {', '.join(missing)}"}), 400

    collection = get_blog_collection()
    slug = str(payload["slug"]).strip()
    if collection.find_one({"slug": slug}):
        return jsonify({"error": "A post with this slug already exists"}), 409

    now = datetime.now(timezone.utc)
    post = {
        "slug": slug,
        "title": str(payload["title"]).strip(),
        "subtitle": str(payload.get("subtitle", "")).strip(),
        "short_description": str(payload.get("short_description", "")).strip(),
        "content": str(payload.get("content", "")).strip(),
        "published_at": str(payload.get("published_at", "")).strip() or None,
        "created_at": now,
        "updated_at": now,
    }
    result = collection.insert_one(post)
    post["_id"] = result.inserted_id
    return jsonify(serialize_post(post)), 201


@admin_blog_bp.put("/blog/<slug>")
@login_required
def update_post(slug: str):
    payload = request.get_json(silent=True) or {}

    collection = get_blog_collection()
    existing = collection.find_one({"slug": slug})
    if not existing:
        return jsonify({"error": "Post not found"}), 404

    updates = {field: payload[field] for field in UPDATABLE_FIELDS if field in payload}
    updates["updated_at"] = datetime.now(timezone.utc)

    collection.update_one({"slug": slug}, {"$set": updates})
    return jsonify(serialize_post(collection.find_one({"slug": slug})))


@admin_blog_bp.delete("/blog/<slug>")
@login_required
def delete_post(slug: str):
    result = get_blog_collection().delete_one({"slug": slug})
    if result.deleted_count == 0:
        return jsonify({"error": "Post not found"}), 404
    return jsonify({"message": "Post deleted"})
