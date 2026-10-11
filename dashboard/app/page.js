"use client";
import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const CHARCOAL = "#241E24";
const RED = "#D40204";
const GREY_BG = "#F5F4F4";
const BORDER = "#E0DEDE";
const MUTED = "#6C666C";

export default function Home() {
  const [signals, setSignals] = useState([]);
  const [companyStats, setCompanyStats] = useState([]);
  const [stressResults, setStressResults] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/signals/latest")
      .then((res) => res.json())
      .then((data) => setSignals(data))
      .catch((err) => console.error("Failed to load signals:", err));

    fetch("http://127.0.0.1:8000/signals/by-company")
      .then((res) => res.json())
      .then((data) => setCompanyStats(data))
      .catch((err) => console.error("Failed to load company stats:", err));

    fetch("http://127.0.0.1:8000/stress-test/run")
      .then((res) => res.json())
      .then((data) => setStressResults(data))
      .catch((err) => console.error("Failed to load stress test:", err))
      .finally(() => setLoading(false));
  }, []);

  const filteredSignals = selectedCompany
    ? signals.filter((s)=>s.company===selectedCompany)
    : signals;

  return (
    <>
      <header className="header">
        <div className="header-inner">
          <span className="brand">S&amp;P Global &amp; Crisil</span>
          <span className="brand-sep">/</span>
          <span className="brand-sub">AI/NLP Risk Engine</span>
        </div>
      </header>

      <main className="main">
        <section className="card">
          <div className="card-head">
            <h2>Impact by Company</h2>
            <p className="hint">Click a bar to filter the signals table below.</p>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart
              data={companyStats}
              onClick={(e) => {
                if (e && e.activeLabel) {
                  setSelectedCompany(e.activeLabel === selectedCompany ? null : e.activeLabel);
                }
              }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke={BORDER} />
              <XAxis dataKey="company" tick={{ fill: MUTED, fontSize: 12 }} />
              <YAxis tick={{ fill: MUTED, fontSize: 12 }} />
              <Tooltip
                contentStyle={{ borderRadius: 8, border: `1px solid ${BORDER}`, fontSize: 13 }}
              />
              <Legend wrapperStyle={{ fontSize: 13 }} />
              <Bar dataKey="avg_impact" name="Avg Impact Score" fill={CHARCOAL} cursor="pointer" radius={[4, 4, 0, 0]} />
              <Bar dataKey="high_impact_count" name="High-Impact Events (>7)" fill={RED} cursor="pointer" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          {selectedCompany && (
            <div className="filter-pill">
              Filtering: <strong>{selectedCompany}</strong>
              <button onClick={() => setSelectedCompany(null)}>Clear</button>
            </div>
          )}
        </section>

        <section className="card">
          <div className="card-head">
            <h2>Latest Risk Signals {selectedCompany ? `— ${selectedCompany}` : ""}</h2>
          </div>
          {loading ? (
            <p className="hint">Loading...</p>
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
                      <td className={s.sentiment > 0 ? "pos" : s.sentiment < 0 ? "neg" : "neu"}>
                        {s.sentiment}
                      </td>
                      <td>{s.event_type}</td>
                      <td className={s.impact > 7 ? "impact-high" : ""}>{s.impact}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="card">
          <div className="card-head">
            <h2>Stress Test Results</h2>
          </div>
          {stressResults.length === 0 ? (
            <p className="hint">No high-impact risk events currently triggering a stress test.</p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={stressResults.map((r) => ({
                  name: r.event_type,
                  Before: r.before_total,
                  After: r.after_total,
                }))}
              >
                <CartesianGrid strokeDasharray="3 3" stroke={BORDER} />
                <XAxis dataKey="name" tick={{ fill: MUTED, fontSize: 12 }} />
                <YAxis tick={{ fill: MUTED, fontSize: 12 }} />
                <Tooltip contentStyle={{ borderRadius: 8, border: `1px solid ${BORDER}`, fontSize: 13 }} />
                <Legend wrapperStyle={{ fontSize: 13 }} />
                <Bar dataKey="Before" fill={CHARCOAL} radius={[4, 4, 0, 0]} />
                <Bar dataKey="After" fill={RED} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </section>
      </main>

      <style jsx global>{`
        * { box-sizing: border-box; }
        html, body {
          margin: 0;
          padding: 0;
          background: ${GREY_BG};
          color: ${CHARCOAL};
          font-family: -apple-system, "Segoe UI", Calibri, Arial, sans-serif;
        }
      `}</style>

      <style jsx>{`
        .header {
          background: ${CHARCOAL};
          padding: 1rem 1.5rem;
        }
        .header-inner {
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          align-items: baseline;
          gap: 0.6rem;
          flex-wrap: wrap;
        }
        .brand {
          color: #fff;
          font-weight: 700;
          font-size: 1.1rem;
          letter-spacing: 0.02em;
        }
        .brand-sep {
          color: ${RED};
          font-weight: 700;
        }
        .brand-sub {
          color: #d4d0d1;
          font-size: 0.95rem;
        }

        .main {
          max-width: 1200px;
          margin: 0 auto;
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .card {
          background: #fff;
          border: 1px solid ${BORDER};
          border-radius: 10px;
          padding: 1.25rem;
        }
        .card-head {
          margin-bottom: 0.75rem;
        }
        .card-head h2 {
          margin: 0 0 0.25rem 0;
          font-size: 1.15rem;
          color: ${CHARCOAL};
        }
        .hint {
          margin: 0;
          color: ${MUTED};
          font-size: 0.85rem;
        }

        .filter-pill {
          margin-top: 0.75rem;
          display: inline-flex;
          align-items: center;
          gap: 0.6rem;
          background: ${GREY_BG};
          border: 1px solid ${BORDER};
          border-radius: 999px;
          padding: 0.35rem 0.9rem;
          font-size: 0.85rem;
        }
        .filter-pill button {
          border: none;
          background: ${CHARCOAL};
          color: #fff;
          border-radius: 999px;
          padding: 0.2rem 0.7rem;
          font-size: 0.75rem;
          cursor: pointer;
        }

        .table-scroll {
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
        }
        table {
          width: 100%;
          min-width: 480px;
          border-collapse: collapse;
          font-size: 0.9rem;
        }
        th {
          text-align: left;
          padding: 0.6rem 0.75rem;
          background: ${CHARCOAL};
          color: #fff;
          font-weight: 600;
          white-space: nowrap;
        }
        td {
          padding: 0.6rem 0.75rem;
          border-bottom: 1px solid ${BORDER};
          white-space: nowrap;
        }
        tr:last-child td {
          border-bottom: none;
        }
        .mono {
          font-weight: 600;
        }
        .pos {
          color: #1a7a3c;
        }
        .neg {
          color: ${RED};
        }
        .neu {
          color: ${MUTED};
        }
        .impact-high {
          color: ${RED};
          font-weight: 700;
        }

        @media (max-width: 640px) {
          .header {
            padding: 0.85rem 1rem;
          }
          .brand {
            font-size: 1rem;
          }
          .brand-sub {
            font-size: 0.85rem;
          }
          .main {
            padding: 1rem;
            gap: 1rem;
          }
          .card {
            padding: 1rem;
            border-radius: 8px;
          }
          .card-head h2 {
            font-size: 1rem;
          }
          table {
            font-size: 0.82rem;
          }
          th, td {
            padding: 0.5rem 0.6rem;
          }
        }
      `}</style>
    </>
  );
}