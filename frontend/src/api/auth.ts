import { apiFetch, parseResponse } from "./http";
import type { AuthPayload, User } from "./types";

export async function login(
  email: string,
  password: string
): Promise<AuthPayload> {
  const res = await apiFetch("/auth/login", {
    method: "POST",
    skipAuth: true,
    body: JSON.stringify({ email, password }),
  });
  return parseResponse<AuthPayload>(res);
}

export async function register(payload: {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}): Promise<AuthPayload> {
  const res = await apiFetch("/auth/register", {
    method: "POST",
    skipAuth: true,
    body: JSON.stringify(payload),
  });
  return parseResponse<AuthPayload>(res);
}

export async function getCurrentUser(): Promise<User> {
  const res = await apiFetch("/auth/me");
  return parseResponse<User>(res);
}
