"use client";

import type { IlchonRelation } from "../types/ilchon.types";

interface IlchonCommentPreviewProps {
  relation: IlchonRelation;
  currentUserId: string;
}

export default function IlchonCommentPreview({
  relation,
  currentUserId,
}: IlchonCommentPreviewProps) {
  const friendNickname =
    relation.requesterId === currentUserId
      ? relation.receiverNickname
      : relation.requesterNickname;

  return (
    <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100 flex items-center gap-3">
      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-sm">
        👤
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-700 truncate">{friendNickname}</p>
        {relation.ilchonComment && (
          <p className="text-xs text-gray-400 truncate">{relation.ilchonComment}</p>
        )}
      </div>
    </div>
  );
}
