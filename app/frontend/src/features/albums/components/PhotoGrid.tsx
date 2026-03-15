"use client";

import { useState, useEffect } from "react";
import type { Photo } from "../types/albums.types";
import { fetchPhotos } from "../api/albums.api";

interface PhotoGridProps {
  albumId: string;
}

export default function PhotoGrid({ albumId }: PhotoGridProps) {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPhotos(albumId)
      .then((res) => setPhotos(res.photos))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [albumId]);

  if (loading) {
    return <div className="p-4 text-center text-sm text-gray-400">로딩 중...</div>;
  }

  if (photos.length === 0) {
    return (
      <div className="p-8 text-center text-sm text-gray-400">
        사진이 아직 없어요
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-1">
      {photos.map((photo) => (
        <div key={photo.id} className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
          <img
            src={photo.imageUrl}
            alt={photo.caption || "사진"}
            className="w-full h-full object-cover"
          />
        </div>
      ))}
    </div>
  );
}
