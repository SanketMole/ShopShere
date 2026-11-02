import { useEffect, useState } from "react";
import "./App.css";

const API = "http://127.0.0.1:5000/api/products";

function App() {
  const [products, setProducts] = useState([]);
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadProducts() {
    setLoading(true);
    setError("");

    const params = new URLSearchParams();

    if (search.trim()) params.set("search", search.trim());
    if (category) params.set("category", category);
    if (minPrice !== "") params.set("min_price", minPrice);
    if (maxPrice !== "") params.set("max_price", maxPrice);

    try {
      const response = await fetch(`${API}?${params.toString()}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Could not load products");
      }

      setProducts(data);
      setSelected(null);
    } catch (err) {
      setError(err.message || "Unable to connect to the server");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProducts();
  }, []);

  async function openProduct(id) {
    setError("");

    try {
      const response = await fetch(`${API}/${id}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Could not load product");
      }

      setSelected(data);
    } catch (err) {
      setError(err.message || "Unable to load product details");
    }
  }

  function resetFilters() {
    setSearch("");
    setCategory("");
    setMinPrice("");
    setMaxPrice("");
    setSelected(null);
    setTimeout(() => {
      document.getElementById("search-form")?.requestSubmit();
    }, 0);
  }

  return (
    <div className="app">
      <header className="navbar">
        <a
          className="brand"
          href="#home"
          onClick={() => {
            setSelected(null);
            resetFilters();
          }}
        >
          <span className="brand-icon">S</span>
          ShopSphere
        </a>

        <span className="nav-label">Simple shopping. Better choices.</span>
      </header>

      <main className="container" id="home">
        {selected ? (
          <section className="details">
            <button
              className="back-button"
              onClick={() => setSelected(null)}
            >
              ← Back to products
            </button>

            <div className="detail-card">
              <div className="detail-image">
                <img
                  src={selected.image_url}
                  alt={selected.name}
                />
              </div>

              <div className="detail-info">
                <span className="category-tag">
                  {selected.category}
                </span>

                <h1>{selected.name}</h1>

                <p className="detail-description">
                  {selected.description}
                </p>

                <p className="detail-price">
                  ₹{Number(selected.price).toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  })}
                </p>

                <p className="product-id">
                  Product ID: {selected.id}
                </p>

                <button
                  className="primary-button"
                  onClick={() => setSelected(null)}
                >
                  Continue browsing
                </button>
              </div>
            </div>
          </section>
        ) : (
          <>
            <section className="hero">
              <div>
                <span className="eyebrow">YOUR EVERYDAY STORE</span>
                <h1>Find something<br />you'll love.</h1>
                <p>
                  Explore our collection of everyday essentials,
                  gadgets and accessories.
                </p>
              </div>

              <div className="hero-decoration">
                <span>✦</span>
                <span>SHOP</span>
                <span>SMARTER</span>
              </div>
            </section>

            <section className="catalogue">
              <div className="section-heading">
                <div>
                  <span className="eyebrow">OUR COLLECTION</span>
                  <h2>Explore products</h2>
                </div>

                <span className="result-count">
                  {products.length} products
                </span>
              </div>

              <form
                id="search-form"
                className="filters"
                onSubmit={(event) => {
                  event.preventDefault();
                  loadProducts();
                }}
              >
                <input
                  type="search"
                  placeholder="Search products..."
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />

                <select
                  value={category}
                  onChange={(event) => setCategory(event.target.value)}
                >
                  <option value="">All categories</option>
                  <option value="Electronics">Electronics</option>
                  <option value="Fashion">Fashion</option>
                  <option value="Accessories">Accessories</option>
                  <option value="Home">Home</option>
                </select>

                <input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Min ₹"
                  aria-label="Minimum price"
                  value={minPrice}
                  onChange={(event) => setMinPrice(event.target.value)}
                />

                <input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Max ₹"
                  aria-label="Maximum price"
                  value={maxPrice}
                  onChange={(event) => setMaxPrice(event.target.value)}
                />

                <button type="submit" className="primary-button">
                  Search
                </button>

                <button
                  type="button"
                  className="reset-button"
                  onClick={resetFilters}
                >
                  Reset
                </button>
              </form>

              {error && <div className="error">{error}</div>}

              {loading ? (
                <p className="message">Loading products...</p>
              ) : products.length === 0 ? (
                <p className="message">
                  No products found. Try different search filters.
                </p>
              ) : (
                <div className="product-grid">
                  {products.map((product) => (
                    <article className="product-card" key={product.id}>
                      <button
                        className="image-button"
                        onClick={() => openProduct(product.id)}
                        aria-label={`View ${product.name}`}
                      >
                        <img
                          src={product.image_url}
                          alt={product.name}
                          loading="lazy"
                        />
                        <span className="view-label">View details ↗</span>
                      </button>

                      <div className="product-info">
                        <span className="product-category">
                          {product.category}
                        </span>

                        <h3>{product.name}</h3>

                        <p className="product-description">
                          {product.description}
                        </p>

                        <div className="card-bottom">
                          <span className="product-price">
                            ₹{Number(product.price).toLocaleString("en-IN")}
                          </span>

                          <button
                            className="details-button"
                            onClick={() => openProduct(product.id)}
                          >
                            Details →
                          </button>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </main>

      <footer className="footer">
        <strong>ShopSphere</strong>
        <span>A simple product catalogue demo</span>
      </footer>
    </div>
  );
}

export default App;