import { apiFetch, parseResponse } from "./http";
import type { AnalyticsSummary } from "./types";

export async function getAnalyticsSummary(): Promise<AnalyticsSummary> {
  const res = await apiFetch("/analytics/summary");
  return parseResponse<AnalyticsSummary>(res);
}
