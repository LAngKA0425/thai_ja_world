"use client";

import type { GuestbookEntry } from "../types/guestbook.types";
import { deleteGuestbookEntry } from "../api/guestbook.api";

interface GuestbookEntryCardProps {
  entry: GuestbookEntry;
  isOwner: boolean;
  onDelete: (entryId: string) => void;
}

export default function GuestbookEntryCard({
  entry,
  isOwner,
  onDelete,
}: GuestbookEntryCardProps) {
  const handleDelete = async () => {
    try {
      await deleteGuestbookEntry(entry.id);
      onDelete(entry.id);
    } catch {
      // TODO: error handling
    }
  };

  return (
    <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm font-medium text-gray-700">
          {entry.authorNickname}
        </span>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">
            {new Date(entry.createdAt).toLocaleDateString("ko-KR")}
          </span>
          {isOwner && (
            <button
              onClick={handleDelete}
              className="text-xs text-red-400 hover:text-red-500"
            >
              삭제
            </button>
          )}
        </div>
      </div>
      <p className="text-sm text-gray-600 whitespace-pre-wrap">{entry.content}</p>
    </div>
  );
}
