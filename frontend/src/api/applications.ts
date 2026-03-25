import { apiFetch, assertOk, parseResponse } from "./http";
import type { Application, Note } from "./types";

export async function getApplications(): Promise<Application[]> {
  const res = await apiFetch("/applications");
  return parseResponse<Application[]>(res);
}

export async function addApplication(payload: {
  companyName: string;
  role: string;
  jobLink: string;
  applicationDate: string;
}): Promise<Application> {
  const res = await apiFetch("/applications", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return parseResponse<Application>(res);
}

export async function updateApplication(
  id: string,
  payload: Partial<{
    companyName: string;
    role: string;
    jobLink: string;
    applicationDate: string;
    status: string;
  }>
): Promise<Application> {
  const res = await apiFetch(`/applications/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
  return parseResponse<Application>(res);
}

export async function deleteApplication(id: string): Promise<void> {
  const res = await apiFetch(`/applications/${id}`, { method: "DELETE" });
  await assertOk(res);
}

export async function getNotes(applicationId: string): Promise<Note[]> {
  const res = await apiFetch(`/applications/${applicationId}/notes`);
  return parseResponse<Note[]>(res);
}

export async function addNote(
  applicationId: string,
  body: string
): Promise<Note> {
  const res = await apiFetch(`/applications/${applicationId}/notes`, {
    method: "POST",
    body: JSON.stringify({ body }),
  });
  return parseResponse<Note>(res);
}
