"use client";

import { useState } from "react";
import type { GuestbookEntry } from "../types/guestbook.types";
import { writeGuestbookEntry } from "../api/guestbook.api";
import { GUESTBOOK_MAX_LENGTH, GUESTBOOK_PLACEHOLDER } from "../constants/guestbook.constants";

interface GuestbookComposerProps {
  ownerId: string;
  onSubmit: (entry: GuestbookEntry) => void;
}

export default function GuestbookComposer({ ownerId, onSubmit }: GuestbookComposerProps) {
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!content.trim() || submitting) return;
    setSubmitting(true);
    try {
      const entry = await writeGuestbookEntry(ownerId, content.trim());
      onSubmit(entry);
      setContent("");
    } catch {
      // TODO: error handling
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100">
      <textarea
        className="w-full text-sm text-gray-700 bg-gray-50 rounded-lg p-2 resize-none outline-none focus:ring-1 focus:ring-blue-200"
        rows={3}
        maxLength={GUESTBOOK_MAX_LENGTH}
        placeholder={GUESTBOOK_PLACEHOLDER}
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />
      <div className="flex items-center justify-between mt-2">
        <span className="text-xs text-gray-400">{content.length}/{GUESTBOOK_MAX_LENGTH}</span>
        <button
          onClick={handleSubmit}
          disabled={!content.trim() || submitting}
          className="px-3 py-1 text-xs font-medium text-white bg-blue-500 rounded-lg disabled:opacity-40"
        >
          {submitting ? "등록 중..." : "등록"}
        </button>
      </div>
    </div>
  );
}
