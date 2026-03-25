import { Fragment, useCallback, useEffect, useState } from "react";
import {
  addApplication,
  addNote as apiAddNote,
  deleteApplication,
  getApplications,
  getNotes,
  updateApplication,
} from "../api/applications";
import { ApiError, getErrorMessage } from "../api/http";
import { deleteNote as apiDeleteNote, updateNote as apiUpdateNote } from "../api/notes";
import type { Application, Note } from "../api/types";

const STATUSES = ["APPLIED", "INTERVIEW", "REJECTED", "OFFER"] as const;

export function Applications() {
  const [items, setItems] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingApp, setSavingApp] = useState(false);
  const [notesLoadingId, setNotesLoadingId] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<string | null>(null);
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
    try {
      const data = await getApplications();
      setItems(data);
    } catch (e) {
      setError(
        e instanceof ApiError
          ? e.message
          : getErrorMessage(e, "Failed to load applications")
      );
    }
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
    setNotesLoadingId(applicationId);
    setError(null);
    try {
      const arr = await getNotes(applicationId);
      setNotesByApp((prev) => ({ ...prev, [applicationId]: arr }));
    } catch (e) {
      setError(
        e instanceof ApiError ? e.message : getErrorMessage(e, "Could not load notes")
      );
    } finally {
      setNotesLoadingId(null);
    }
  }

  async function toggleExpand(id: string) {
    if (expanded === id) {
      setExpanded(null);
      return;
    }
    setExpanded(id);
    await loadNotes(id);
  }

  async function onSubmitApplication(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSavingApp(true);
    try {
      await addApplication({
        companyName,
        role,
        jobLink,
        applicationDate: new Date(applicationDate).toISOString(),
      });
      setCompanyName("");
      setRole("");
      setJobLink("");
      await load();
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : getErrorMessage(err, "Could not add application")
      );
    } finally {
      setSavingApp(false);
    }
  }

  async function updateStatus(id: string, status: string) {
    setPendingAction(`status-${id}`);
    setError(null);
    try {
      await updateApplication(id, { status });
      await load();
    } catch (e) {
      setError(
        e instanceof ApiError ? e.message : getErrorMessage(e, "Could not update status")
      );
    } finally {
      setPendingAction(null);
    }
  }

  async function removeApplication(id: string) {
    if (!confirm("Delete this application and its notes?")) return;
    setPendingAction(`del-${id}`);
    setError(null);
    try {
      await deleteApplication(id);
      if (expanded === id) setExpanded(null);
      await load();
    } catch (e) {
      setError(
        e instanceof ApiError ? e.message : getErrorMessage(e, "Could not delete application")
      );
    } finally {
      setPendingAction(null);
    }
  }

  async function submitNote(applicationId: string) {
    const body = noteDraft[applicationId]?.trim();
    if (!body) return;
    setPendingAction(`note-add-${applicationId}`);
    setError(null);
    try {
      await apiAddNote(applicationId, body);
      setNoteDraft((prev) => ({ ...prev, [applicationId]: "" }));
      await loadNotes(applicationId);
    } catch (e) {
      setError(
        e instanceof ApiError ? e.message : getErrorMessage(e, "Could not add note")
      );
    } finally {
      setPendingAction(null);
    }
  }

  async function saveNote() {
    if (!editingNote || !expanded) return;
    setPendingAction(`note-save-${editingNote.id}`);
    setError(null);
    try {
      await apiUpdateNote(editingNote.id, editingNote.body);
      setEditingNote(null);
      await loadNotes(expanded);
    } catch (e) {
      setError(
        e instanceof ApiError ? e.message : getErrorMessage(e, "Could not save note")
      );
    } finally {
      setPendingAction(null);
    }
  }

  async function handleDeleteNote(noteId: string, applicationId: string) {
    if (!confirm("Delete this note?")) return;
    setPendingAction(`note-del-${noteId}`);
    setError(null);
    try {
      await apiDeleteNote(noteId);
      await loadNotes(applicationId);
    } catch (e) {
      setError(
        e instanceof ApiError ? e.message : getErrorMessage(e, "Could not delete note")
      );
    } finally {
      setPendingAction(null);
    }
  }

  if (loading) {
    return (
      <div className="container">
        <p className="muted">Loading…</p>
      </div>
    );
  }

  return (
    <div className="container stack">
      {error && (
        <div className="card row" style={{ justifyContent: "space-between" }}>
          <p className="error" style={{ margin: 0 }}>
            {error}
          </p>
          <div className="row">
            <button type="button" onClick={() => setError(null)}>
              Dismiss
            </button>
            <button type="button" className="primary" onClick={() => void load()}>
              Retry
            </button>
          </div>
        </div>
      )}
      <h1>Applications</h1>

      <div className="card stack">
        <h2>Add application</h2>
        <form className="stack" onSubmit={onSubmitApplication}>
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
          <button type="submit" className="primary" disabled={savingApp}>
            {savingApp ? "Adding…" : "Add"}
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
                        disabled={pendingAction === `status-${a.id}`}
                        onChange={(e) => void updateStatus(a.id, e.target.value)}
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
                      <button type="button" onClick={() => void toggleExpand(a.id)}>
                        {expanded === a.id ? "Hide notes" : "Notes"}
                      </button>
                      <button
                        type="button"
                        className="danger"
                        disabled={pendingAction === `del-${a.id}`}
                        onClick={() => void removeApplication(a.id)}
                      >
                        {pendingAction === `del-${a.id}` ? "…" : "Delete"}
                      </button>
                    </td>
                  </tr>
                  {expanded === a.id && (
                    <tr key={`${a.id}-notes`}>
                      <td colSpan={5}>
                        <div className="stack" style={{ padding: "0.5rem 0" }}>
                          <h3 style={{ margin: 0, fontSize: "1rem" }}>Notes</h3>
                          {notesLoadingId === a.id ? (
                            <p className="muted">Loading notes…</p>
                          ) : null}
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
                              disabled={pendingAction === `note-add-${a.id}`}
                              onClick={() => void submitNote(a.id)}
                            >
                              {pendingAction === `note-add-${a.id}` ? "Adding…" : "Add note"}
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
                                    <button
                                      type="button"
                                      className="primary"
                                      disabled={pendingAction === `note-save-${editingNote.id}`}
                                      onClick={() => void saveNote()}
                                    >
                                      {pendingAction === `note-save-${n.id}` ? "Saving…" : "Save"}
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
                                      disabled={pendingAction === `note-del-${n.id}`}
                                      onClick={() => void handleDeleteNote(n.id, a.id)}
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
