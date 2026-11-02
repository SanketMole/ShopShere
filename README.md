# Product Listing Website

A full-stack product listing website built using React, Flask, and SQLite. The application displays products with images, descriptions, prices, and categories. Users can search for products, apply filters, and view individual product details.

## Technologies Used

- **Frontend:** React, Vite, CSS
- **Backend:** Python, Flask
- **Database:** SQLite
- **API:** REST API
- **Version Control:** Git and GitHub

## Features

- Display products in a responsive grid.
- Show product images, names, descriptions, prices, and categories.
- View individual product details.
- Search for products by name.
- Filter products by category.
- Filter products by minimum and maximum price.
- Retrieve product information through REST API endpoints.
- Store product information in a relational SQLite database.
- Validate price filter inputs and return appropriate HTTP status codes.

## Project Structure

```text
ecommerce-project/
├── backend/
│   ├── app.py
│   ├── init_db.py
│   └── requirements.txt
├── database/
│   ├── schema.sql
│   └── seed.sql
├── frontend/
│   ├── public/
│   │   └── images/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── index.css
│   │   └── main.jsx
│   ├── package.json
│   └── package-lock.json
├── screenshots/
├── .gitignore
└── README.md
```

## Prerequisites

Install the following software before running the project:

- Python 3
- Node.js and npm
- Git

## Installation and Setup

### 1. Clone the Repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
cd ecommerce-project
```

Replace `YOUR_GITHUB_REPOSITORY_URL` with the actual URL of your GitHub repository.

### 2. Set Up the Database

From the project root, create and initialize the SQLite database:

```bash
python3 backend/init_db.py
```

This command creates the database using `database/schema.sql` and inserts the sample products from `database/seed.sql` if the products table is empty.

### 3. Set Up the Backend

Open a terminal in the project root and run:

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

Start the Flask server:

```bash
python app.py
```

The backend runs at:

`http://127.0.0.1:5000`

Keep this terminal running.

### 4. Set Up the Frontend

Open a second terminal in the project root and run:

```bash
cd frontend
npm install
npm run dev
```

Open the local address displayed by Vite, normally:

`http://localhost:5173`

Keep this terminal running while using the application.

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/health` | Check backend availability |
| GET | `/api/products` | Retrieve all products |
| GET | `/api/products/<id>` | Retrieve a specific product |

### Product Search and Filtering

The products endpoint supports query parameters.

| Parameter | Description | Example |
|---|---|---|
| `search` | Search products by name | `/api/products?search=headphones` |
| `category` | Filter by category | `/api/products?category=Electronics` |
| `min_price` | Set minimum price | `/api/products?min_price=500` |
| `max_price` | Set maximum price | `/api/products?max_price=3000` |

Parameters can be combined. For example:

`/api/products?category=Electronics&min_price=500&max_price=3000`

### HTTP Status Codes

- `200 OK`: The request succeeded.
- `400 Bad Request`: The request contains invalid filter values.
- `404 Not Found`: The requested product does not exist.
- `500 Internal Server Error`: An unexpected database error occurred.

## Database

The application uses SQLite to store product information.

The `products` table contains the following fields:

| Field | Description |
|---|---|
| `id` | Unique product identifier |
| `name` | Product name |
| `description` | Product description |
| `price` | Product price |
| `category` | Product category |
| `image_url` | Path to the product image |

The database schema is defined in `database/schema.sql`, and the sample product records are provided in `database/seed.sql`.

## Screenshots

Screenshots of the application are included in the `screenshots/` directory.

They demonstrate the product listing page, product details, and the search and filtering features.

## Notes

- The frontend and backend must both be running to use the complete application.
- Product images are stored in `frontend/public/images/`.
- The SQLite database is generated locally during setup and is excluded from the Git repository.
- The sample data can be recreated using the provided SQL files and database initialization script.

## Author

Developed as a full-stack web development project.
