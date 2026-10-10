"use client";
import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

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
    <main style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>AI/NLP Risk Engine Dashboard</h1>

      <section style={{ marginTop: "2rem" }}>
        <h2>Latest Risk Signals</h2>
        {loading ? (
          <p>Loading...</p>
        ) : (
          <table border="1" cellPadding="8" style={{ borderCollapse: "collapse", width: "100%" }}>
            <thead>
              <tr>
                <th>Company</th>
                <th>Sentiment</th>
                <th>Event Type</th>
                <th>Impact</th>
              </tr>
            </thead>
            <tbody>
              {signals.map((s, i) => (
                <tr key={i}>
                  <td>{s.company}</td>
                  <td style={{ color: s.sentiment > 0 ? "green" : s.sentiment < 0 ? "red" : "gray" }}>
                    {s.sentiment}
                  </td>
                  <td>{s.event_type}</td>
                  <td>{s.impact}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <section style={{ marginTop: "3rem" }}>
        <h2>Stress Test Results</h2>
        {stressResults.length === 0 ? (
          <p>No high-impact risk events currently triggering a stress test.</p>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stressResults.map((r) => ({
              name: r.event_type,
              Before: r.before_total,
              After: r.after_total,
            }))}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="Before" fill="#8884d8" />
              <Bar dataKey="After" fill="#d88484" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </section>
    </main>
  );
}