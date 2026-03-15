import { useState, useCallback } from "react";
import type { NotificationPreference } from "../types/notifications.types";

// TODO: 실제 API 연동 시 fetchPreferences / updatePreferences 로 교체

const DEFAULT_PREFS: NotificationPreference = {
  community: true,
  social: true,
  quest: true,
  reservation: true,
  pushEnabled: false,
  emailEnabled: false,
};

export function useNotificationPreferences() {
  const [prefs, setPrefs] = useState<NotificationPreference>(DEFAULT_PREFS);
  const [saving, setSaving] = useState(false);

  const togglePref = useCallback(
    (key: keyof NotificationPreference) => {
      setPrefs((prev) => ({ ...prev, [key]: !prev[key] }));
      // TODO: API 호출 - updatePreferences({ [key]: !prefs[key] })
    },
    []
  );

  return { prefs, saving, togglePref };
}
