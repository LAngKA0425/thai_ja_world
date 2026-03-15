"use client";

import Card from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";

interface AlbumPhoto {
  id: string;
  imageUrl: string;
  caption?: string;
}

interface MinihomeAlbumProps {
  photos: AlbumPhoto[];
  loading?: boolean;
}

export default function MinihomeAlbum({ photos, loading }: MinihomeAlbumProps) {
  if (loading) {
    return (
      <Card className="p-4">
        <Skeleton className="w-20 h-4 mb-3" />
        <div className="grid grid-cols-3 gap-2">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="aspect-square rounded-xl" />
          ))}
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-bold text-gray-900">사진첩</p>
        <span className="text-2xs text-gray-400">{photos.length}장</span>
      </div>

      {photos.length === 0 ? (
        <div className="py-8 text-center">
          <p className="text-sm text-gray-400">사진이 없어요</p>
          <p className="text-2xs text-gray-300 mt-1">추억을 사진으로 남겨보세요</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-2">
          {photos.map((photo) => (
            <div key={photo.id} className="relative aspect-square rounded-xl overflow-hidden bg-gray-100">
              <img
                src={photo.imageUrl}
                alt={photo.caption || "사진"}
                className="w-full h-full object-cover"
              />
              {photo.caption && (
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-1.5">
                  <p className="text-2xs text-white truncate">{photo.caption}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
