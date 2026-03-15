"use client";

import { apiFetch } from "@/lib/api";

export async function fetchMiniroomData(userId: string) {
  return apiFetch(`/miniroom/${userId}`);
}

export async function updateMiniroomTheme(themeId: string) {
  return apiFetch("/miniroom/theme", {
    method: "PATCH",
    body: JSON.stringify({ themeId }),
  });
}
