// Albums / 사진첩 타입 정의
export interface Album {
  id: string;
  ownerId: string;
  title: string;
  description: string;
  isPublic: boolean;
  sortOrder: number;
  photoCount: number;
  coverImageUrl?: string;
  createdAt: string;
}

export interface Photo {
  id: string;
  albumId: string;
  imageUrl: string;
  caption: string;
  sortOrder: number;
  createdAt: string;
}

export interface AlbumCreateRequest {
  title: string;
  description?: string;
  isPublic: boolean;
}

export interface PhotoUploadRequest {
  albumId: string;
  caption?: string;
}

export interface AlbumListResponse {
  albums: Album[];
  total: number;
}

export interface PhotoListResponse {
  photos: Photo[];
  total: number;
}
