
import { useEffect, useState } from "react";
import "./AdminDashboard.css";
import CSSGenerator from "./CSSGenerator";

const API = "http://127.0.0.1:5000/api/admin";

function AdminDashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [simulating, setSimulating] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [activeTab, setActiveTab] = useState("analytics");

  // Fetch analytics from Flask
  async function loadAnalytics() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API}/analytics`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Could not load analytics");
      }

      setAnalytics(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // Generate 100 simulated visitors
  async function simulateTraffic() {
    setSimulating(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch(`${API}/simulate-traffic`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ count: 100 })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Traffic simulation failed");
      }

      setMessage(`${data.visitors_added} visitors generated successfully!`);

      // Refresh analytics after simulation
      await loadAnalytics();

    } catch (err) {
      setError(err.message);
    } finally {
      setSimulating(false);
    }
  }

  // Load analytics when component opens
  useEffect(() => {
    loadAnalytics();
  }, []);

  const totalVisitors = analytics?.total_visitors || 0;

  return (
    <div className="admin-dashboard">

                <div className="admin-tabs">
        <button
            className={activeTab === "analytics" ? "active" : ""}
            onClick={() => setActiveTab("analytics")}
        >
            Visitor Analytics
        </button>

        <button
            className={activeTab === "css" ? "active" : ""}
            onClick={() => setActiveTab("css")}
        >
            CSS Generator
        </button>
        </div>

      {activeTab === "analytics" ? (
            <>
        <div className="admin-heading">
        <div>
          <span className="admin-eyebrow">SHOPSHERE MANAGEMENT</span>
          <h1>Admin Dashboard</h1>
          <p>Monitor your website traffic and visitor statistics.</p>
        </div>

        <div className="admin-actions">
          <button
            className="refresh-button"
            onClick={loadAnalytics}
            disabled={loading}
          >
            Refresh
          </button>

          <button
            className="simulate-button"
            onClick={simulateTraffic}
            disabled={simulating}
          >
            {simulating ? "Generating..." : "Simulate Traffic"}
          </button>
        </div>
      </div>
      

      {message && (
        <div className="success-message">{message}</div>
      )}

      {error && (
        <div className="error-message">{error}</div>
      )}

      {loading && !analytics ? (
        <p className="dashboard-message">Loading analytics...</p>
      ) : analytics ? (
        <>
          {/* Visitor Summary Cards */}
          <div className="analytics-cards">

            <div className="analytics-card">
              <span>Total Visitors</span>
              <h2>{analytics.total_visitors}</h2>
              <p>All recorded visitors</p>
            </div>

            <div className="analytics-card">
              <span>Simulated Visitors</span>
              <h2>{analytics.simulated_visitors}</h2>
              <p>Generated test traffic</p>
            </div>

            <div className="analytics-card">
              <span>Actual Visitors</span>
              <h2>{analytics.actual_visitors}</h2>
              <p>Non-simulated records</p>
            </div>

            <div className="analytics-card">
              <span>Countries Reached</span>
              <h2>
                {analytics.country_distribution.length}
              </h2>
              <p>Unique countries in records</p>
            </div>

          </div>

          {/* Country Distribution */}
          <section className="country-section">

            <div className="country-heading">
              <div>
                <span className="admin-eyebrow">GEOGRAPHICAL ANALYTICS</span>
                <h2>Visitor Distribution by Country</h2>
              </div>

              <span className="visitor-total">
                {totalVisitors} visitors
              </span>
            </div>

            {analytics.country_distribution.length === 0 ? (
              <p className="dashboard-message">
                No visitor data available. Generate simulated traffic.
              </p>
            ) : (
              <div className="country-list">

                {analytics.country_distribution.map((item) => {
                  const percentage = totalVisitors > 0
                    ? (item.total_visitors / totalVisitors) * 100
                    : 0;

                  return (
                    <div
                      className="country-item"
                      key={item.country}
                    >

                      <div className="country-info">
                        <strong>{item.country}</strong>

                        <span>
                          {item.total_visitors} visitors
                          ({percentage.toFixed(1)}%)
                        </span>
                      </div>

                      <div className="progress-track">
                        <div
                          className="progress-fill"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>

                    </div>
                  );
                })}

              </div>
            )}

          </section>

          <p className="analytics-note">
            Analytics include both simulated and actual visitor records.
            Simulated traffic is test data, not real website traffic.
          </p>
        </>
      ) : null}

  </>
) : (
  <CSSGenerator />
)}

</div>
);
}

export default AdminDashboard;
