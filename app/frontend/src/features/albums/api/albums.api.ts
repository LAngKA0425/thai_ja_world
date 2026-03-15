"use client";

import { apiFetch } from "@/lib/api";
import type { Album, Photo, AlbumListResponse, PhotoListResponse } from "../types/albums.types";

export async function fetchAlbums(ownerId: string): Promise<AlbumListResponse> {
  return apiFetch<AlbumListResponse>(`/albums/${ownerId}`);
}

export async function fetchPhotos(albumId: string, page: number = 1): Promise<PhotoListResponse> {
  return apiFetch<PhotoListResponse>(`/albums/photos/${albumId}?page=${page}`);
}

export async function createAlbum(
  title: string,
  description: string,
  isPublic: boolean
): Promise<Album> {
  return apiFetch<Album>("/albums/create", {
    method: "POST",
    body: JSON.stringify({ title, description, isPublic }),
  });
}

export async function uploadPhoto(
  albumId: string,
  file: File,
  caption?: string
): Promise<Photo> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("album_id", albumId);
  if (caption) formData.append("caption", caption);

  return apiFetch<Photo>("/albums/photos/upload", {
    method: "POST",
    headers: { "Content-Type": "multipart/form-data" },
    body: formData as unknown as BodyInit,
  });
}

export async function deletePhoto(photoId: string): Promise<{ success: boolean }> {
  return apiFetch<{ success: boolean }>(`/albums/photos/${photoId}`, { method: "DELETE" });
}

export async function deleteAlbum(albumId: string): Promise<{ success: boolean }> {
  return apiFetch<{ success: boolean }>(`/albums/${albumId}`, { method: "DELETE" });
}

export async function updateAlbumPrivacy(
  albumId: string,
  isPublic: boolean
): Promise<Album> {
  return apiFetch<Album>(`/albums/${albumId}/privacy`, {
    method: "PATCH",
    body: JSON.stringify({ isPublic }),
  });
}
