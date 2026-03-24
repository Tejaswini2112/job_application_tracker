import { useEffect, useState } from "react";
import { apiFetch, parseJson } from "../api/client";

type Summary = {
  totalApplications: number;
  responseRate: number;
  interviewsScheduled: number;
};

export function Dashboard() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await apiFetch("/analytics/summary");
        if (!res.ok) {
          setError("Could not load analytics");
          return;
        }
        const data = await parseJson<Summary>(res);
        if (!cancelled) setSummary(data);
      } catch {
        if (!cancelled) setError("Could not load analytics");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (error) {
    return (
      <div className="container">
        <p className="error">{error}</p>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="container">
        <p className="muted">Loading…</p>
      </div>
    );
  }

  const pct = Math.round(summary.responseRate * 1000) / 10;

  return (
    <div className="container">
      <h1>Dashboard</h1>
      <div className="row" style={{ gap: "1rem", alignItems: "stretch" }}>
        <div className="card" style={{ flex: "1 1 200px" }}>
          <h2>Total applications</h2>
          <p style={{ fontSize: "1.75rem", margin: 0 }}>{summary.totalApplications}</p>
        </div>
        <div className="card" style={{ flex: "1 1 200px" }}>
          <h2>Response rate</h2>
          <p style={{ fontSize: "1.75rem", margin: 0 }}>{pct}%</p>
          <p className="muted" style={{ margin: "0.25rem 0 0" }}>
            Share with status other than Applied
          </p>
        </div>
        <div className="card" style={{ flex: "1 1 200px" }}>
          <h2>Interviews</h2>
          <p style={{ fontSize: "1.75rem", margin: 0 }}>{summary.interviewsScheduled}</p>
        </div>
      </div>
    </div>
  );
}
