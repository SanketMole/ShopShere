
import sqlite3

# Connect to the existing database
connection = sqlite3.connect("../database/products.db")

cursor = connection.cursor()

# Retrieve all table names
query = """
SELECT name
FROM sqlite_master
WHERE type = 'table';
"""

cursor.execute(query)

tables = cursor.fetchall()

print("\nAvailable database tables:")

for table in tables:
    print("-", table[0])

connection.close()
