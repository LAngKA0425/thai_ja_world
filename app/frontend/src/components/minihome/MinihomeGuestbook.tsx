"use client";

import { useState } from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";

interface GuestbookEntryItem {
  id: string;
  authorNickname: string;
  content: string;
  createdAt: string;
}

interface MinihomeGuestbookProps {
  entries: GuestbookEntryItem[];
  loading?: boolean;
  isOwner: boolean;
  onWrite?: (content: string) => Promise<void>;
}

export default function MinihomeGuestbook({
  entries,
  loading,
  isOwner,
  onWrite,
}: MinihomeGuestbookProps) {
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!content.trim() || !onWrite) return;
    setSubmitting(true);
    try {
      await onWrite(content.trim());
      setContent("");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Card className="p-4">
        <Skeleton className="w-20 h-4 mb-3" />
        <Skeleton className="w-full h-16 mb-2" />
        <Skeleton className="w-full h-16" />
      </Card>
    );
  }

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-bold text-gray-900">방명록</p>
        <span className="text-2xs text-gray-400">{entries.length}개</span>
      </div>

      {/* 작성 폼 — 타인 홈 방문 시 또는 본인 홈 */}
      {onWrite && (
        <div className="mb-4">
          <textarea
            className="w-full border border-gray-200 rounded-xl p-3 text-sm text-gray-700 placeholder-gray-300 resize-none focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-300"
            rows={2}
            placeholder={isOwner ? "내 방명록에 글 남기기..." : "방명록에 글을 남겨보세요..."}
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
          <Button
            size="sm"
            className="mt-2 w-full"
            onClick={handleSubmit}
            loading={submitting}
            disabled={!content.trim()}
          >
            작성하기
          </Button>
        </div>
      )}

      {entries.length === 0 ? (
        <div className="py-8 text-center">
          <p className="text-sm text-gray-400">아직 방명록이 없어요</p>
          <p className="text-2xs text-gray-300 mt-1">첫 번째 방명록을 남겨보세요!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {entries.map((entry) => (
            <div key={entry.id} className="bg-gray-50 rounded-xl p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-gray-700">{entry.authorNickname}</span>
                <span className="text-2xs text-gray-300">{entry.createdAt}</span>
              </div>
              <p className="text-xs text-gray-600 leading-relaxed">{entry.content}</p>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
