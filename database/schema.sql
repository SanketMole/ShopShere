CREATE TABLE IF NOT EXISTS products (
id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    price REAL NOT NULL CHECK (price >= 0),
    category TEXT NOT NULL,
    image_url TEXT NOT NULL
);


-- Visitor Analytics Table
CREATE TABLE IF NOT EXISTS visitors (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ip_address TEXT NOT NULL,
    country TEXT NOT NULL,
    visited_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    is_simulated INTEGER DEFAULT 0
);

-- Indexes for faster analytics queries
CREATE INDEX IF NOT EXISTS idx_visitors_country
ON visitors(country);

CREATE INDEX IF NOT EXISTS idx_visitors_visited_at
ON visitors(visited_at);
