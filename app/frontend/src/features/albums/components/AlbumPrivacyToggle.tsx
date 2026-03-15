"use client";

import { useState } from "react";
import { updateAlbumPrivacy } from "../api/albums.api";

interface AlbumPrivacyToggleProps {
  albumId: string;
  initialIsPublic: boolean;
  onChanged: (isPublic: boolean) => void;
}

export default function AlbumPrivacyToggle({
  albumId,
  initialIsPublic,
  onChanged,
}: AlbumPrivacyToggleProps) {
  const [isPublic, setIsPublic] = useState(initialIsPublic);
  const [updating, setUpdating] = useState(false);

  const toggle = async () => {
    setUpdating(true);
    try {
      const updated = await updateAlbumPrivacy(albumId, !isPublic);
      setIsPublic(updated.isPublic);
      onChanged(updated.isPublic);
    } catch {
      // TODO: error handling
    } finally {
      setUpdating(false);
    }
  };

  return (
    <button
      onClick={toggle}
      disabled={updating}
      className="flex items-center gap-1 text-xs text-gray-500 bg-gray-50 rounded-lg px-2 py-1"
    >
      {isPublic ? "🔓 공개" : "🔒 비공개"}
    </button>
  );
}
