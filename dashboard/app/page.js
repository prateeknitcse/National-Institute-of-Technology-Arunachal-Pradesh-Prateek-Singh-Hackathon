"use client";
import { useEffect, useState } from "react";

export default function Home() {
  const [signals, setSignals] = useState([]);
  const [stressResults, setStressResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/signals/latest")
      .then((res) => res.json())
      .then((data) => setSignals(data))
      .catch((err) => console.error("Failed to load signals:", err));

    fetch("http://127.0.0.1:8000/stress-test/run")
      .then((res) => res.json())
      .then((data) => setStressResults(data))
      .catch((err) => console.error("Failed to load stress test:", err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "2rem" }}>
      <h1 style={{ fontSize: "2rem", marginBottom: "2rem", color: "#241E24" }}>
        S&P Global Risk Dashboard
      </h1>

      <section style={{ marginBottom: "3rem" }}>
        <h2 style={{ fontSize: "1.5rem", marginBottom: "1rem", color: "#241E24" }}>
          Latest Risk Signals
        </h2>
        {loading ? (
          <p>Loading...</p>
        ) : (
          <table style={{ 
            width: "100%", 
            borderCollapse: "collapse", 
            border: "1px solid #E0DEDE" 
          }}>
            <thead>
              <tr style={{ backgroundColor: "#241E24", color: "white" }}>
                <th style={{ padding: "0.75rem", textAlign: "left" }}>Company</th>
                <th style={{ padding: "0.75rem", textAlign: "left" }}>Sentiment</th>
                <th style={{ padding: "0.75rem", textAlign: "left" }}>Event Type</th>
                <th style={{ padding: "0.75rem", textAlign: "left" }}>Impact Score</th>
              </tr>
            </thead>
            <tbody>
              {signals.map((signal, i) => (
                <tr key={i} style={{ borderBottom: "1px solid #E0DEDE" }}>
                  <td style={{ padding: "0.75rem" }}>{signal.company}</td>
                  <td style={{ 
                    padding: "0.75rem",
                    color: signal.sentiment > 0 ? "#1a7a3c" : signal.sentiment < 0 ? "#D40204" : "#6C666C"
                  }}>
                    {signal.sentiment.toFixed(2)}
                  </td>
                  <td style={{ padding: "0.75rem" }}>{signal.event_type}</td>
                  <td style={{ 
                    padding: "0.75rem",
                    color: signal.impact > 7 ? "#D40204" : "#241E24",
                    fontWeight: signal.impact > 7 ? "bold" : "normal"
                  }}>
                    {signal.impact.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <section>
        <h2 style={{ fontSize: "1.5rem", marginBottom: "1rem", color: "#241E24" }}>
          Stress Test Results
        </h2>
        {stressResults.length === 0 ? (
          <p style={{ color: "#6C666C" }}>No high-impact events detected</p>
        ) : (
          <table style={{ 
            width: "100%", 
            borderCollapse: "collapse", 
            border: "1px solid #E0DEDE" 
          }}>
            <thead>
              <tr style={{ backgroundColor: "#241E24", color: "white" }}>
                <th style={{ padding: "0.75rem", textAlign: "left" }}>Event Type</th>
                <th style={{ padding: "0.75rem", textAlign: "left" }}>Portfolio Before</th>
                <th style={{ padding: "0.75rem", textAlign: "left" }}>Portfolio After</th>
                <th style={{ padding: "0.75rem", textAlign: "left" }}>Change</th>
              </tr>
            </thead>
            <tbody>
              {stressResults.map((result, i) => {
                const change = result.after_total - result.before_total;
                const changePercent = ((change / result.before_total) * 100).toFixed(2);
                return (
                  <tr key={i} style={{ borderBottom: "1px solid #E0DEDE" }}>
                    <td style={{ padding: "0.75rem" }}>{result.event_type}</td>
                    <td style={{ padding: "0.75rem" }}>${result.before_total.toLocaleString()}</td>
                    <td style={{ padding: "0.75rem" }}>${result.after_total.toLocaleString()}</td>
                    <td style={{ 
                      padding: "0.75rem",
                      color: change < 0 ? "#D40204" : "#1a7a3c",
                      fontWeight: "bold"
                    }}>
                      ${change.toLocaleString()} ({changePercent}%)
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}