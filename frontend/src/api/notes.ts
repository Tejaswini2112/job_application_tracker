import { apiFetch, assertOk, parseResponse } from "./http";
import type { Note } from "./types";

export async function updateNote(
  noteId: string,
  body: string
): Promise<Note> {
  const res = await apiFetch(`/notes/${noteId}`, {
    method: "PATCH",
    body: JSON.stringify({ body }),
  });
  return parseResponse<Note>(res);
}

export async function deleteNote(noteId: string): Promise<void> {
  const res = await apiFetch(`/notes/${noteId}`, { method: "DELETE" });
  await assertOk(res);
}
