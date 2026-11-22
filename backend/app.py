from flask import Flask, jsonify, request
from flask_cors import CORS
import sqlite3
import random
import ipaddress
from pathlib import Path

app = Flask(__name__)
CORS(app)

BASE_DIR = Path(__file__).resolve().parent.parent
DB_PATH = BASE_DIR / "database" / "products.db"


# Synthetic IP ranges used ONLY for traffic simulation.
# These are private IP addresses, not real visitor locations.

SIMULATED_IP_RANGES = {
    "10.0.1.0/24": "India",
    "10.0.2.0/24": "United States",
    "10.0.3.0/24": "United Kingdom",
    "10.0.4.0/24": "Germany",
    "10.0.5.0/24": "Australia",
    "10.0.6.0/24": "Canada",
    "10.0.7.0/24": "Japan"
}


def generate_simulated_visitor():

    # Randomly select an IP range
    ip_range = random.choice(list(SIMULATED_IP_RANGES.keys()))

    # Identify the corresponding country
    country = SIMULATED_IP_RANGES[ip_range]

    # Convert the IP range into a network object
    network = ipaddress.ip_network(ip_range)

    # Generate a random usable IP address
    random_ip = random.randint(
        int(network.network_address) + 1,
        int(network.broadcast_address) - 1
    )

    ip_address = str(ipaddress.ip_address(random_ip))

    return ip_address, country


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

@app.route("/api/admin/simulate-traffic", methods=["POST"])
def simulate_traffic():

    # Read the requested number of visitors
    data = request.get_json(silent=True) or {}

    try:
        count = int(data.get("count", 50))
    except (TypeError, ValueError):
        return jsonify({"error": "Count must be an integer"}), 400

    # Restrict the number of simulated visitors
    if count < 1 or count > 500:
        return jsonify({
            "error": "Count must be between 1 and 500"
        }), 400

    visitors = []

    # Generate visitor records
    for _ in range(count):

        ip_address, country = generate_simulated_visitor()

        visitors.append((
            ip_address,
            country,
            1
        ))

    try:
        with get_db() as connection:

            connection.executemany("""
                INSERT INTO visitors
                (ip_address, country, is_simulated)
                VALUES (?, ?, ?)
            """, visitors)

        return jsonify({
            "message": "Traffic simulated successfully",
            "visitors_added": count
        }), 201

    except sqlite3.Error:
        app.logger.exception("Traffic simulation failed")
        return jsonify({"error": "Database error"}), 500


@app.route("/api/admin/analytics", methods=["GET"])
def get_analytics():

    try:
        with get_db() as connection:

            # Get total, simulated and actual visitor counts
            summary = connection.execute("""
                SELECT
                    COUNT(*) AS total_visitors,
                    SUM(CASE WHEN is_simulated = 1
                        THEN 1 ELSE 0 END) AS simulated_visitors,
                    SUM(CASE WHEN is_simulated = 0
                        THEN 1 ELSE 0 END) AS actual_visitors
                FROM visitors
            """).fetchone()

            # Get country-wise visitor distribution
            countries = connection.execute("""
                SELECT
                    country,
                    COUNT(*) AS total_visitors,
                    SUM(CASE WHEN is_simulated = 1
                        THEN 1 ELSE 0 END) AS simulated_visitors,
                    SUM(CASE WHEN is_simulated = 0
                        THEN 1 ELSE 0 END) AS actual_visitors
                FROM visitors
                GROUP BY country
                ORDER BY total_visitors DESC
            """).fetchall()

        return jsonify({
            "total_visitors": summary["total_visitors"],
            "simulated_visitors": summary["simulated_visitors"],
            "actual_visitors": summary["actual_visitors"],
            "country_distribution": [
                {
                    "country": row["country"],
                    "total_visitors": row["total_visitors"],
                    "simulated_visitors": row["simulated_visitors"],
                    "actual_visitors": row["actual_visitors"]
                }
                for row in countries
            ]
        }), 200

    except sqlite3.Error:
        app.logger.exception("Analytics retrieval failed")
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
