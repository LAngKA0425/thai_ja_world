"use client";

import { useState, useCallback } from "react";
import type { EquippedAvatar, AvatarCategory } from "../types/avatar.types";
import { equipAvatarItem, unequipAvatarItem, fetchEquippedAvatar } from "../api/avatar.api";

export function useAvatarEquip() {
  const [equipped, setEquipped] = useState<EquippedAvatar>({});
  const [loading, setLoading] = useState(false);

  const loadEquipped = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchEquippedAvatar();
      setEquipped(data);
    } finally {
      setLoading(false);
    }
  }, []);

  const equip = useCallback(async (itemId: string, category: AvatarCategory) => {
    setLoading(true);
    try {
      const result = await equipAvatarItem(itemId, category);
      setEquipped(result.equipped);
    } finally {
      setLoading(false);
    }
  }, []);

  const unequip = useCallback(async (category: AvatarCategory) => {
    setLoading(true);
    try {
      const result = await unequipAvatarItem(category);
      setEquipped(result.equipped);
    } finally {
      setLoading(false);
    }
  }, []);

  return { equipped, loading, loadEquipped, equip, unequip };
}
