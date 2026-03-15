"use client";

import { useState, useEffect } from "react";
import IlchonCommentPreview from "./IlchonCommentPreview";
import type { IlchonRelation } from "../types/ilchon.types";
import { fetchIlchonList } from "../api/ilchon.api";

interface IlchonListProps {
  userId: string;
  isOwner: boolean;
}

export default function IlchonList({ userId, isOwner }: IlchonListProps) {
  const [relations, setRelations] = useState<IlchonRelation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchIlchonList(userId)
      .then((res) => setRelations(res.relations))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [userId]);

  if (loading) {
    return <div className="p-4 text-center text-sm text-gray-400">로딩 중...</div>;
  }

  const accepted = relations.filter((r) => r.status === "accepted");

  if (accepted.length === 0) {
    return (
      <div className="p-8 text-center text-sm text-gray-400">
        아직 일촌이 없어요
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {accepted.map((rel) => (
        <IlchonCommentPreview key={rel.id} relation={rel} currentUserId={userId} />
      ))}
    </div>
  );
}
