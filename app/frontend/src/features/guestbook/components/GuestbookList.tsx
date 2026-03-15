"use client";

import { useState, useEffect } from "react";
import GuestbookEntryCard from "./GuestbookEntryCard";
import GuestbookComposer from "./GuestbookComposer";
import type { GuestbookEntry } from "../types/guestbook.types";
import { fetchGuestbookEntries } from "../api/guestbook.api";
import { GUESTBOOK_PAGE_SIZE } from "../constants/guestbook.constants";

interface GuestbookListProps {
  ownerId: string;
  isOwner: boolean;
}

export default function GuestbookList({ ownerId, isOwner }: GuestbookListProps) {
  const [entries, setEntries] = useState<GuestbookEntry[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchGuestbookEntries(ownerId, page, GUESTBOOK_PAGE_SIZE)
      .then((res) => {
        setEntries(res.entries);
        setTotal(res.total);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [ownerId, page]);

  const handleNewEntry = (entry: GuestbookEntry) => {
    setEntries((prev) => [entry, ...prev]);
    setTotal((prev) => prev + 1);
  };

  const handleDelete = (entryId: string) => {
    setEntries((prev) => prev.filter((e) => e.id !== entryId));
    setTotal((prev) => prev - 1);
  };

  if (loading) {
    return <div className="p-4 text-center text-sm text-gray-400">로딩 중...</div>;
  }

  return (
    <div className="space-y-3">
      <GuestbookComposer ownerId={ownerId} onSubmit={handleNewEntry} />
      {entries.length === 0 ? (
        <div className="p-8 text-center text-sm text-gray-400">
          아직 방명록이 비어있어요
        </div>
      ) : (
        entries.map((entry) => (
          <GuestbookEntryCard
            key={entry.id}
            entry={entry}
            isOwner={isOwner}
            onDelete={handleDelete}
          />
        ))
      )}
      {total > GUESTBOOK_PAGE_SIZE && (
        <div className="flex justify-center gap-2 pt-2">
          <button
            className="text-xs text-gray-400 disabled:opacity-30"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            이전
          </button>
          <span className="text-xs text-gray-500">{page}</span>
          <button
            className="text-xs text-gray-400 disabled:opacity-30"
            disabled={page * GUESTBOOK_PAGE_SIZE >= total}
            onClick={() => setPage((p) => p + 1)}
          >
            다음
          </button>
        </div>
      )}
    </div>
  );
}
