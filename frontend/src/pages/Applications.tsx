import { Fragment, useCallback, useEffect, useState } from "react";
import { apiFetch, parseJson } from "../api/client";

type Application = {
  id: string;
  companyName: string;
  role: string;
  jobLink: string;
  applicationDate: string;
  status: string;
  createdAt: string;
  updatedAt: string;
};

type Note = {
  id: string;
  applicationId: string;
  body: string;
  createdAt: string;
  updatedAt: string;
};

const STATUSES = ["APPLIED", "INTERVIEW", "REJECTED", "OFFER"] as const;

export function Applications() {
  const [items, setItems] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [companyName, setCompanyName] = useState("");
  const [role, setRole] = useState("");
  const [jobLink, setJobLink] = useState("");
  const [applicationDate, setApplicationDate] = useState(() =>
    new Date().toISOString().slice(0, 10)
  );

  const [expanded, setExpanded] = useState<string | null>(null);
  const [notesByApp, setNotesByApp] = useState<Record<string, Note[]>>({});
  const [noteDraft, setNoteDraft] = useState<Record<string, string>>({});
  const [editingNote, setEditingNote] = useState<{
    id: string;
    body: string;
  } | null>(null);

  const load = useCallback(async () => {
    setError(null);
    const res = await apiFetch("/applications");
    if (!res.ok) {
      setError("Failed to load applications");
      return;
    }
    const data = await parseJson<Application[]>(res);
    setItems(data);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await load();
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [load]);

  async function loadNotes(applicationId: string) {
    const res = await apiFetch(`/applications/${applicationId}/notes`);
    if (!res.ok) return;
    const arr = await parseJson<Note[]>(res);
    setNotesByApp((prev) => ({ ...prev, [applicationId]: arr }));
  }

  async function toggleExpand(id: string) {
    if (expanded === id) {
      setExpanded(null);
      return;
    }
    setExpanded(id);
    await loadNotes(id);
  }

  async function addApplication(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const res = await apiFetch("/applications", {
      method: "POST",
      body: JSON.stringify({
        companyName,
        role,
        jobLink,
        applicationDate: new Date(applicationDate).toISOString(),
      }),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError((body as { error?: string }).error ?? "Could not add application");
      return;
    }
    setCompanyName("");
    setRole("");
    setJobLink("");
    await load();
  }

  async function updateStatus(id: string, status: string) {
    const res = await apiFetch(`/applications/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
    if (!res.ok) return;
    await load();
  }

  async function removeApplication(id: string) {
    if (!confirm("Delete this application and its notes?")) return;
    const res = await apiFetch(`/applications/${id}`, { method: "DELETE" });
    if (!res.ok) return;
    if (expanded === id) setExpanded(null);
    await load();
  }

  async function addNote(applicationId: string) {
    const body = noteDraft[applicationId]?.trim();
    if (!body) return;
    const res = await apiFetch(`/applications/${applicationId}/notes`, {
      method: "POST",
      body: JSON.stringify({ body }),
    });
    if (!res.ok) return;
    setNoteDraft((prev) => ({ ...prev, [applicationId]: "" }));
    await loadNotes(applicationId);
  }

  async function saveNote() {
    if (!editingNote || !expanded) return;
    const res = await apiFetch(`/notes/${editingNote.id}`, {
      method: "PATCH",
      body: JSON.stringify({ body: editingNote.body }),
    });
    if (!res.ok) return;
    setEditingNote(null);
    await loadNotes(expanded);
  }

  async function deleteNote(noteId: string, applicationId: string) {
    if (!confirm("Delete this note?")) return;
    const res = await apiFetch(`/notes/${noteId}`, { method: "DELETE" });
    if (!res.ok) return;
    await loadNotes(applicationId);
  }

  if (loading) {
    return (
      <div className="container">
        <p className="muted">Loading…</p>
      </div>
    );
  }

  return (
    <div className="container">
      <h1>Applications</h1>

      <div className="card stack">
        <h2>Add application</h2>
        <form className="stack" onSubmit={addApplication}>
          <div className="row" style={{ alignItems: "flex-end" }}>
            <label style={{ flex: "1 1 160px" }}>
              Company
              <input
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                required
              />
            </label>
            <label style={{ flex: "1 1 160px" }}>
              Role
              <input value={role} onChange={(e) => setRole(e.target.value)} required />
            </label>
          </div>
          <label>
            Job link
            <input
              type="url"
              value={jobLink}
              onChange={(e) => setJobLink(e.target.value)}
              required
              placeholder="https://..."
            />
          </label>
          <label>
            Applied on
            <input
              type="date"
              value={applicationDate}
              onChange={(e) => setApplicationDate(e.target.value)}
              required
            />
          </label>
          {error && <p className="error">{error}</p>}
          <button type="submit" className="primary">
            Add
          </button>
        </form>
      </div>

      <div className="card">
        <h2>Your applications</h2>
        {items.length === 0 ? (
          <p className="muted">No applications yet.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Company</th>
                <th>Role</th>
                <th>Status</th>
                <th>Date</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {items.map((a) => (
                <Fragment key={a.id}>
                  <tr>
                    <td>{a.companyName}</td>
                    <td>{a.role}</td>
                    <td>
                      <select
                        value={a.status}
                        onChange={(e) => updateStatus(a.id, e.target.value)}
                      >
                        {STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>{a.applicationDate.slice(0, 10)}</td>
                    <td className="row">
                      <button type="button" onClick={() => toggleExpand(a.id)}>
                        {expanded === a.id ? "Hide notes" : "Notes"}
                      </button>
                      <button type="button" className="danger" onClick={() => removeApplication(a.id)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                  {expanded === a.id && (
                    <tr key={`${a.id}-notes`}>
                      <td colSpan={5}>
                        <div className="stack" style={{ padding: "0.5rem 0" }}>
                          <h3 style={{ margin: 0, fontSize: "1rem" }}>Notes</h3>
                          <div className="row">
                            <textarea
                              style={{ flex: 1, minHeight: 72 }}
                              placeholder="New note…"
                              value={noteDraft[a.id] ?? ""}
                              onChange={(e) =>
                                setNoteDraft((prev) => ({
                                  ...prev,
                                  [a.id]: e.target.value,
                                }))
                              }
                            />
                            <button
                              type="button"
                              className="primary"
                              onClick={() => addNote(a.id)}
                            >
                              Add note
                            </button>
                          </div>
                          {(notesByApp[a.id] ?? []).map((n) => (
                            <div
                              key={n.id}
                              className="card"
                              style={{ marginBottom: 0, padding: "0.75rem" }}
                            >
                              {editingNote?.id === n.id ? (
                                <div className="stack">
                                  <textarea
                                    value={editingNote.body}
                                    onChange={(e) =>
                                      setEditingNote({
                                        id: n.id,
                                        body: e.target.value,
                                      })
                                    }
                                  />
                                  <div className="row">
                                    <button type="button" className="primary" onClick={saveNote}>
                                      Save
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setEditingNote(null)}
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <div className="row" style={{ justifyContent: "space-between" }}>
                                  <p style={{ margin: 0, whiteSpace: "pre-wrap" }}>{n.body}</p>
                                  <div className="row">
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setEditingNote({ id: n.id, body: n.body })
                                      }
                                    >
                                      Edit
                                    </button>
                                    <button
                                      type="button"
                                      className="danger"
                                      onClick={() => deleteNote(n.id, a.id)}
                                    >
                                      Delete
                                    </button>
                                  </div>
                                </div>
                              )}
                              <p className="muted" style={{ margin: "0.35rem 0 0" }}>
                                {new Date(n.createdAt).toLocaleString()}
                              </p>
                            </div>
                          ))}
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
