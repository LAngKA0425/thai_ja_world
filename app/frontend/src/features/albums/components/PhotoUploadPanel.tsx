"use client";

import { useState, useRef } from "react";
import { uploadPhoto } from "../api/albums.api";
import { MAX_UPLOAD_SIZE_MB, ALLOWED_IMAGE_TYPES, PHOTO_CAPTION_MAX_LENGTH } from "../constants/albums.constants";
import type { Photo } from "../types/albums.types";

interface PhotoUploadPanelProps {
  albumId: string;
  onUploaded: (photo: Photo) => void;
}

export default function PhotoUploadPanel({ albumId, onUploaded }: PhotoUploadPanelProps) {
  const [caption, setCaption] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setError("JPG, PNG, WebP 파일만 업로드 가능합니다");
      return;
    }
    if (file.size > MAX_UPLOAD_SIZE_MB * 1024 * 1024) {
      setError(`파일 크기는 ${MAX_UPLOAD_SIZE_MB}MB 이하만 가능합니다`);
      return;
    }

    setError("");
    setUploading(true);
    try {
      const photo = await uploadPhoto(albumId, file, caption.trim() || undefined);
      onUploaded(photo);
      setCaption("");
      if (fileRef.current) fileRef.current.value = "";
    } catch {
      setError("업로드에 실패했습니다");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100 space-y-2">
      <input
        ref={fileRef}
        type="file"
        accept={ALLOWED_IMAGE_TYPES.join(",")}
        onChange={handleFileSelect}
        className="w-full text-xs text-gray-500"
        disabled={uploading}
      />
      <input
        type="text"
        maxLength={PHOTO_CAPTION_MAX_LENGTH}
        placeholder="사진 설명 (선택)"
        value={caption}
        onChange={(e) => setCaption(e.target.value)}
        className="w-full text-sm bg-gray-50 rounded-lg p-2 outline-none"
      />
      {error && <p className="text-xs text-red-400">{error}</p>}
      {uploading && <p className="text-xs text-blue-400">업로드 중...</p>}
    </div>
  );
}
