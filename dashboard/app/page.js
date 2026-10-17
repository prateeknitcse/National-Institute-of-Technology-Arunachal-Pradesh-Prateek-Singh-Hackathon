"use client";
import { useEffect, useState } from "react";

const CHARCOAL = "#241E24";
const RED = "#D40204";
const GREY_BG = "#F5F4F4";
const BORDER = "#E0DEDE";
const MUTED = "#6C666C";
const GREEN = "#1a7a3c";
const LIGHT_RED = "#FFF5F5";
const LIGHT_GREEN = "#F0FFF4";

export default function Home() {
  const [signals, setSignals] = useState([]);
  const [companyStats, setCompanyStats] = useState([]);
  const [stressResults, setStressResults] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/signals/latest")
      .then((res) => res.json())
      .then((data) => setSignals(Array.isArray(data) ? data : []))
      .catch((err) => console.error("Failed to load signals:", err));

    fetch("http://127.0.0.1:8000/signals/by-company")
      .then((res) => res.json())
      .then((data) => setCompanyStats(Array.isArray(data) ? data : []))
      .catch((err) => console.error("Failed to load company stats:", err));

    fetch("http://127.0.0.1:8000/stress-test/run")
      .then((res) => res.json())
      .then((data) => setStressResults(Array.isArray(data) ? data : []))
      .catch((err) => console.error("Failed to load stress test:", err))
      .finally(() => setLoading(false));
  }, []);

  const maxImpact = companyStats.length > 0 
    ? Math.max(...companyStats.map(c => c.avg_impact))
    : 1;

  const filteredSignals = selectedCompany
    ? signals.filter(s => s.company === selectedCompany)
    : signals;

  const handleCompanyClick = (company) => {
    setSelectedCompany(selectedCompany === company ? null : company);
  };

  // Calculate statistics
  const totalSignals = signals.length;
  const highRiskCount = signals.filter(s => s.impact > 7).length;
  const avgSentiment = signals.length > 0 
    ? (signals.reduce((sum, s) => sum + s.sentiment, 0) / signals.length).toFixed(2)
    : "0.00";
  const companiesTracked = companyStats.length;

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        * { box-sizing: border-box; }
        html, body {
          margin: 0;
          padding: 0;
          background: ${GREY_BG};
          color: ${CHARCOAL};
          font-family: -apple-system, "Segoe UI", Calibri, Arial, sans-serif;
        }
        .header {
          background: linear-gradient(135deg, ${CHARCOAL} 0%, #1a151a 100%);
          padding: 1.25rem 1.5rem;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        .header-inner {
          max-width: 1400px;
          margin: 0 auto;
          display: flex;
          align-items: baseline;
          gap: 0.6rem;
          flex-wrap: wrap;
        }
        .brand {
          color: #fff;
          font-weight: 700;
          font-size: 1.2rem;
          letter-spacing: 0.02em;
        }
        .brand-sep {
          color: ${RED};
          font-weight: 700;
          font-size: 1.2rem;
        }
        .brand-sub {
          color: #d4d0d1;
          font-size: 1rem;
        }
        .main {
          max-width: 1400px;
          margin: 0 auto;
          padding: 2rem 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 1rem;
          margin-bottom: 0.5rem;
        }
        .stat-card {
          background: linear-gradient(135deg, #fff 0%, #fafafa 100%);
          border: 1px solid ${BORDER};
          border-radius: 12px;
          padding: 1.25rem;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05);
          transition: all 0.2s ease;
        }
        .stat-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
        .stat-label {
          font-size: 0.85rem;
          color: ${MUTED};
          text-transform: uppercase;
          letter-spacing: 0.05em;
          font-weight: 600;
          margin-bottom: 0.5rem;
        }
        .stat-value {
          font-size: 2rem;
          font-weight: 700;
          color: ${CHARCOAL};
          line-height: 1;
        }
        .stat-value.danger {
          color: ${RED};
        }
        .stat-value.success {
          color: ${GREEN};
        }
        .card {
          background: #fff;
          border: 1px solid ${BORDER};
          border-radius: 12px;
          padding: 1.5rem;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05);
        }
        .card-head {
          margin-bottom: 1rem;
          padding-bottom: 0.75rem;
          border-bottom: 2px solid ${GREY_BG};
        }
        .card-head h2 {
          margin: 0 0 0.25rem 0;
          font-size: 1.25rem;
          color: ${CHARCOAL};
          font-weight: 700;
        }
        .hint {
          margin: 0;
          color: ${MUTED};
          font-size: 0.9rem;
        }
        .company-list {
          display: flex;
          flex-direction: column;
          gap: 0.65rem;
        }
        .company-row {
          display: grid;
          grid-template-columns: 160px 1fr 90px auto;
          align-items: center;
          gap: 1rem;
          padding: 0.75rem 1rem;
          border: 2px solid transparent;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
          background: ${GREY_BG};
        }
        .company-row:hover {
          background: #fff;
          border-color: ${BORDER};
          transform: translateX(4px);
          box-shadow: 0 2px 8px rgba(0,0,0,0.08);
        }
        .company-row.selected {
          border-color: ${CHARCOAL};
          background: #fff;
          box-shadow: 0 3px 12px rgba(36, 30, 36, 0.15);
        }
        .company-name {
          font-weight: 700;
          color: ${CHARCOAL};
          font-size: 0.95rem;
        }
        .company-bar-container {
          height: 28px;
          background: #fff;
          border: 1px solid ${BORDER};
          border-radius: 6px;
          overflow: hidden;
          position: relative;
        }
        .company-row.selected .company-bar-container {
          border-color: ${CHARCOAL};
        }
        .company-bar {
          height: 100%;
          background: linear-gradient(90deg, ${CHARCOAL} 0%, #3d343d 100%);
          border-radius: 5px;
          transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
        }
        .company-bar::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.2) 100%);
        }
        .company-impact {
          font-weight: 700;
          font-size: 1rem;
          color: ${CHARCOAL};
          text-align: right;
          font-variant-numeric: tabular-nums;
        }
        .high-impact-badge {
          background: linear-gradient(135deg, ${RED} 0%, #b30103 100%);
          color: #fff;
          padding: 0.3rem 0.65rem;
          border-radius: 999px;
          font-size: 0.8rem;
          font-weight: 700;
          min-width: 28px;
          text-align: center;
          box-shadow: 0 2px 4px rgba(212, 2, 4, 0.3);
        }
        .filter-pill {
          margin-top: 1rem;
          display: inline-flex;
          align-items: center;
          gap: 0.75rem;
          background: ${CHARCOAL};
          color: #fff;
          border-radius: 999px;
          padding: 0.5rem 1.25rem;
          font-size: 0.9rem;
          font-weight: 600;
          box-shadow: 0 2px 8px rgba(36, 30, 36, 0.2);
        }
        .filter-pill button {
          border: none;
          background: ${RED};
          color: #fff;
          border-radius: 999px;
          padding: 0.25rem 0.85rem;
          font-size: 0.8rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .filter-pill button:hover {
          background: #b30103;
          transform: scale(1.05);
        }
        .table-scroll {
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
          border-radius: 8px;
        }
        table {
          width: 100%;
          min-width: 600px;
          border-collapse: separate;
          border-spacing: 0;
          font-size: 0.9rem;
        }
        thead {
          position: sticky;
          top: 0;
          z-index: 10;
        }
        th {
          text-align: left;
          padding: 0.85rem 1rem;
          background: ${CHARCOAL};
          color: #fff;
          font-weight: 600;
          white-space: nowrap;
          font-size: 0.85rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        th:first-child {
          border-top-left-radius: 8px;
        }
        th:last-child {
          border-top-right-radius: 8px;
        }
        td {
          padding: 0.85rem 1rem;
          border-bottom: 1px solid ${BORDER};
          white-space: nowrap;
          transition: background 0.15s ease;
        }
        tbody tr {
          transition: all 0.15s ease;
        }
        tbody tr:hover {
          background: ${GREY_BG};
        }
        tr:last-child td {
          border-bottom: none;
        }
        tr:last-child td:first-child {
          border-bottom-left-radius: 8px;
        }
        tr:last-child td:last-child {
          border-bottom-right-radius: 8px;
        }
        .mono {
          font-weight: 700;
          font-size: 0.95rem;
        }
        .pos {
          color: ${GREEN};
          font-weight: 700;
          background: ${LIGHT_GREEN};
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          display: inline-block;
        }
        .neg {
          color: ${RED};
          font-weight: 700;
          background: ${LIGHT_RED};
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          display: inline-block;
        }
        .neu {
          color: ${MUTED};
          font-weight: 600;
        }
        .impact-high {
          color: ${RED};
          font-weight: 800;
          font-size: 1rem;
        }
        .loading-spinner {
          display: inline-block;
          width: 20px;
          height: 20px;
          border: 3px solid ${BORDER};
          border-top-color: ${CHARCOAL};
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .empty-state {
          text-align: center;
          padding: 3rem 1rem;
          color: ${MUTED};
        }
        .empty-state svg {
          width: 64px;
          height: 64px;
          margin-bottom: 1rem;
          opacity: 0.5;
        }
        @media (max-width: 768px) {
          .header {
            padding: 1rem;
          }
          .brand {
            font-size: 1.05rem;
          }
          .brand-sub {
            font-size: 0.9rem;
          }
          .main {
            padding: 1.25rem 1rem;
            gap: 1.25rem;
          }
          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 0.75rem;
          }
          .stat-card {
            padding: 1rem;
          }
          .stat-value {
            font-size: 1.5rem;
          }
          .card {
            padding: 1.25rem;
            border-radius: 10px;
          }
          .card-head h2 {
            font-size: 1.1rem;
          }
          .company-row {
            grid-template-columns: 110px 1fr 70px auto;
            gap: 0.65rem;
            padding: 0.65rem 0.75rem;
          }
          .company-name {
            font-size: 0.85rem;
          }
          .company-bar-container {
            height: 24px;
          }
          .company-impact {
            font-size: 0.9rem;
          }
          table {
            font-size: 0.85rem;
            min-width: 500px;
          }
          th, td {
            padding: 0.65rem 0.75rem;
          }
        }
      `}} />
      
      <header className="header">
        <div className="header-inner">
          <span className="brand">S&amp;P Global &amp; Crisil</span>
          <span className="brand-sep">/</span>
          <span className="brand-sub">AI/NLP Risk Engine</span>
        </div>
      </header>

      <main className="main">
        {/* Statistics Overview */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-label">Total Signals</div>
            <div className="stat-value">{totalSignals}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">High Risk Events</div>
            <div className="stat-value danger">{highRiskCount}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Avg Sentiment</div>
            <div className={`stat-value ${parseFloat(avgSentiment) < 0 ? 'danger' : parseFloat(avgSentiment) > 0 ? 'success' : ''}`}>
              {avgSentiment}
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Companies Tracked</div>
            <div className="stat-value">{companiesTracked}</div>
          </div>
        </div>

        {/* Impact by Company */}
        <section className="card">
          <div className="card-head">
            <h2>Impact by Company</h2>
            <p className="hint">Click a company to filter the signals table below</p>
          </div>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <div className="loading-spinner"></div>
            </div>
          ) : companyStats.length === 0 ? (
            <div className="empty-state">
              <p>No company data available</p>
            </div>
          ) : (
            <div className="company-list">
              {companyStats.map((stat, i) => {
                const barWidth = (stat.avg_impact / maxImpact) * 100;
                const isSelected = selectedCompany === stat.company;
                return (
                  <div
                    key={i}
                    className={`company-row ${isSelected ? 'selected' : ''}`}
                    onClick={() => handleCompanyClick(stat.company)}
                  >
                    <div className="company-name">{stat.company}</div>
                    <div className="company-bar-container">
                      <div className="company-bar" style={{ width: `${barWidth}%` }} />
                    </div>
                    <div className="company-impact">{stat.avg_impact.toFixed(2)}</div>
                    {stat.high_impact_count > 0 && (
                      <div className="high-impact-badge">{stat.high_impact_count}</div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
          {selectedCompany && (
            <div className="filter-pill">
              Filtering: <strong>{selectedCompany}</strong>
              <button onClick={() => setSelectedCompany(null)}>Clear</button>
            </div>
          )}
        </section>

        {/* Latest Risk Signals */}
        <section className="card">
          <div className="card-head">
            <h2>Latest Risk Signals {selectedCompany ? `— ${selectedCompany}` : ""}</h2>
            <p className="hint">Showing {filteredSignals.length} signal{filteredSignals.length !== 1 ? 's' : ''}</p>
          </div>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <div className="loading-spinner"></div>
            </div>
          ) : filteredSignals.length === 0 ? (
            <div className="empty-state">
              <p>No signals found</p>
            </div>
          ) : (
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>Company</th>
                    <th>Sentiment</th>
                    <th>Event Type</th>
                    <th>Impact</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSignals.map((s, i) => (
                    <tr key={i}>
                      <td className="mono">{s.company}</td>
                      <td>
                        <span className={s.sentiment > 0 ? "pos" : s.sentiment < 0 ? "neg" : "neu"}>
                          {s.sentiment.toFixed(2)}
                        </span>
                      </td>
                      <td>{s.event_type}</td>
                      <td className={s.impact > 7 ? "impact-high" : ""}>{s.impact.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Stress Test Results */}
        <section className="card">
          <div className="card-head">
            <h2>Stress Test Results</h2>
            <p className="hint">Portfolio impact analysis for high-risk events</p>
          </div>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <div className="loading-spinner"></div>
            </div>
          ) : stressResults.length === 0 ? (
            <div className="empty-state">
              <p>No high-impact events detected — portfolio is stable</p>
            </div>
          ) : (
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>Event Type</th>
                    <th>Portfolio Before</th>
                    <th>Portfolio After</th>
                    <th>Change</th>
                  </tr>
                </thead>
                <tbody>
                  {stressResults.map((result, i) => {
                    const change = result.after_total - result.before_total;
                    const changePercent = ((change / result.before_total) * 100).toFixed(2);
                    return (
                      <tr key={i}>
                        <td className="mono">{result.event_type}</td>
                        <td>${result.before_total.toLocaleString()}</td>
                        <td>${result.after_total.toLocaleString()}</td>
                        <td>
                          <span className={change < 0 ? "neg" : "pos"}>
                            ${change.toLocaleString()} ({changePercent}%)
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </>
  );
}