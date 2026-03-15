"use client";

import type { Album } from "../types/albums.types";

interface AlbumCardProps {
  album: Album;
  onClick: () => void;
}

export default function AlbumCard({ album, onClick }: AlbumCardProps) {
  return (
    <button
      onClick={onClick}
      className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden text-left w-full"
    >
      <div className="aspect-square bg-gray-100 flex items-center justify-center">
        {album.coverImageUrl ? (
          <img
            src={album.coverImageUrl}
            alt={album.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-2xl">📷</span>
        )}
      </div>
      <div className="p-2">
        <p className="text-sm font-medium text-gray-700 truncate">{album.title}</p>
        <div className="flex items-center gap-1 mt-0.5">
          <span className="text-xs text-gray-400">{album.photoCount}장</span>
          {!album.isPublic && (
            <span className="text-xs text-gray-400">🔒</span>
          )}
        </div>
      </div>
    </button>
  );
}
