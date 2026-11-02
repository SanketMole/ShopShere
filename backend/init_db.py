import sqlite3
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
DB_PATH = BASE_DIR / "database" / "products.db"
SCHEMA_PATH = BASE_DIR / "database" / "schema.sql"
SEED_PATH = BASE_DIR / "database" / "seed.sql"

with sqlite3.connect(DB_PATH) as connection:
    connection.executescript(SCHEMA_PATH.read_text())

    count = connection.execute(
        "SELECT COUNT(*) FROM products"
    ).fetchone()[0]

    if count == 0:
        connection.executescript(SEED_PATH.read_text())

    total = connection.execute(
        "SELECT COUNT(*) FROM products"
    ).fetchone()[0]

print(f"Database initialized: {DB_PATH}")
print(f"Total products: {total}")
