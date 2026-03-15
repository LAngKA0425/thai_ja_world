"use client";

import { useState, useEffect } from "react";
import AlbumCard from "./AlbumCard";
import type { Album } from "../types/albums.types";
import { fetchAlbums } from "../api/albums.api";

interface AlbumListProps {
  ownerId: string;
  isOwner: boolean;
  onSelectAlbum: (album: Album) => void;
}

export default function AlbumList({ ownerId, isOwner, onSelectAlbum }: AlbumListProps) {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAlbums(ownerId)
      .then((res) => setAlbums(res.albums))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [ownerId]);

  if (loading) {
    return <div className="p-4 text-center text-sm text-gray-400">로딩 중...</div>;
  }

  if (albums.length === 0) {
    return (
      <div className="p-8 text-center text-sm text-gray-400">
        {isOwner ? "첫 번째 앨범을 만들어보세요!" : "아직 사진첩이 비어있어요"}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3">
      {albums.map((album) => (
        <AlbumCard
          key={album.id}
          album={album}
          onClick={() => onSelectAlbum(album)}
        />
      ))}
    </div>
  );
}
