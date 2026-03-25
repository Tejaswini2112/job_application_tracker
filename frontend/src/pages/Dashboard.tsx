import { useCallback, useEffect, useState } from "react";
import { getAnalyticsSummary } from "../api/analytics";
import { ApiError, getErrorMessage } from "../api/http";
import type { AnalyticsSummary } from "../api/types";

export function Dashboard() {
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const loadSummary = useCallback(async () => {
    setError(null);
    setSummary(null);
    setLoading(true);
    try {
      const data = await getAnalyticsSummary();
      setSummary(data);
    } catch (e) {
      setError(
        e instanceof ApiError
          ? e.message
          : getErrorMessage(e, "Could not load analytics")
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadSummary();
  }, [loadSummary]);

  if (loading && !error) {
    return (
      <div className="container">
        <p className="muted">Loading…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container stack">
        <p className="error">{error}</p>
        <button type="button" className="primary" onClick={() => void loadSummary()}>
          Retry
        </button>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="container">
        <p className="muted">No data.</p>
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
