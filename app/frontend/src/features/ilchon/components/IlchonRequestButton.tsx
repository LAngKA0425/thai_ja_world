"use client";

import { useState } from "react";
import { sendIlchonRequest } from "../api/ilchon.api";
import { ILCHON_COMMENT_MAX_LENGTH } from "../constants/ilchon.constants";
import ko from "@/messages/ko.json";

interface IlchonRequestButtonProps {
  targetUserId: string;
  onSent?: () => void;
}

export default function IlchonRequestButton({
  targetUserId,
  onSent,
}: IlchonRequestButtonProps) {
  const [showInput, setShowInput] = useState(false);
  const [comment, setComment] = useState("");
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (sending) return;
    setSending(true);
    try {
      await sendIlchonRequest(targetUserId, comment.trim() || undefined);
      setShowInput(false);
      setComment("");
      onSent?.();
    } catch {
      // TODO: error handling
    } finally {
      setSending(false);
    }
  };

  if (!showInput) {
    return (
      <button
        onClick={() => setShowInput(true)}
        className="px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 rounded-lg"
      >
        {ko.minihome.ilchon_request}
      </button>
    );
  }

  return (
    <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100 space-y-2">
      <input
        type="text"
        maxLength={ILCHON_COMMENT_MAX_LENGTH}
        placeholder="일촌평 (선택)"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        className="w-full text-sm bg-gray-50 rounded-lg p-2 outline-none"
      />
      <div className="flex gap-2">
        <button
          onClick={() => setShowInput(false)}
          className="flex-1 px-3 py-1.5 text-xs text-gray-500 bg-gray-50 rounded-lg"
        >
          취소
        </button>
        <button
          onClick={handleSend}
          disabled={sending}
          className="flex-1 px-3 py-1.5 text-xs font-medium text-white bg-blue-500 rounded-lg disabled:opacity-40"
        >
          {sending ? "전송 중..." : "신청"}
        </button>
      </div>
    </div>
  );
}
