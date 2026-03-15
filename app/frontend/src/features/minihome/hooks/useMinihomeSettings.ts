"use client";

import { useState, useCallback } from "react";
import type { MinihomeSettings } from "../types/minihome.types";

export function useMinihomeSettings(initial: MinihomeSettings) {
  const [settings, setSettings] = useState<MinihomeSettings>(initial);
  const [saving, setSaving] = useState(false);

  const save = useCallback(async (newSettings: MinihomeSettings) => {
    setSaving(true);
    try {
      // TODO: API call to save settings
      setSettings(newSettings);
    } finally {
      setSaving(false);
    }
  }, []);

  return { settings, saving, save };
}
