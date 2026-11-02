from flask import Flask, jsonify, request
from flask_cors import CORS
import sqlite3
from pathlib import Path

app = Flask(__name__)
CORS(app)

BASE_DIR = Path(__file__).resolve().parent.parent
DB_PATH = BASE_DIR / "database" / "products.db"


def get_db():
    connection = sqlite3.connect(DB_PATH)
    connection.row_factory = sqlite3.Row
    return connection


def product_dict(row):
    return {
        "id": row["id"],
        "name": row["name"],
        "description": row["description"],
        "price": row["price"],
        "category": row["category"],
        "image_url": row["image_url"]
    }


@app.route("/api/products", methods=["GET"])
def get_products():
    search = request.args.get("search", "").strip()
    category = request.args.get("category", "").strip()
    min_price = request.args.get("min_price")
    max_price = request.args.get("max_price")

    if min_price is not None and min_price.strip() == "":
        return jsonify({"error": "min_price cannot be empty"}), 400

    if max_price is not None and max_price.strip() == "":
        return jsonify({"error": "max_price cannot be empty"}), 400

    try:
        minimum = float(min_price) if min_price is not None else None
        maximum = float(max_price) if max_price is not None else None
    except ValueError:
        return jsonify({"error": "Prices must be valid numbers"}), 400

    if minimum is not None and minimum < 0:
        return jsonify({"error": "min_price cannot be negative"}), 400

    if maximum is not None and maximum < 0:
        return jsonify({"error": "max_price cannot be negative"}), 400

    if minimum is not None and maximum is not None and minimum > maximum:
        return jsonify({"error": "min_price cannot exceed max_price"}), 400

    query = "SELECT * FROM products WHERE 1=1"
    parameters = []

    if search:
        query += " AND name LIKE ?"
        parameters.append(f"%{search}%")

    if category:
        query += " AND category = ? COLLATE NOCASE"
        parameters.append(category)

    if minimum is not None:
        query += " AND price >= ?"
        parameters.append(minimum)

    if maximum is not None:
        query += " AND price <= ?"
        parameters.append(maximum)

    query += " ORDER BY id"

    try:
        with get_db() as connection:
            rows = connection.execute(query, parameters).fetchall()

        return jsonify([product_dict(row) for row in rows]), 200

    except sqlite3.Error:
        app.logger.exception("Could not retrieve products")
        return jsonify({"error": "Database error"}), 500


@app.route("/api/products/<int:product_id>", methods=["GET"])
def get_product(product_id):
    if product_id <= 0:
        return jsonify({"error": "Product ID must be positive"}), 400

    try:
        with get_db() as connection:
            row = connection.execute(
                "SELECT * FROM products WHERE id = ?",
                (product_id,)
            ).fetchone()

        if row is None:
            return jsonify({"error": "Product not found"}), 404

        return jsonify(product_dict(row)), 200

    except sqlite3.Error:
        app.logger.exception("Could not retrieve product")
        return jsonify({"error": "Database error"}), 500


@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({"status": "ok"}), 200


if __name__ == "__main__":
    app.run(debug=True, port=5000)
