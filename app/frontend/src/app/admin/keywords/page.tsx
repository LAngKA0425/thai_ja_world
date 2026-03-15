"use client";
import { useEffect, useState } from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { AdminCardSkeleton } from "@/components/ui/Skeleton";
import EmptyState from "@/components/ui/EmptyState";
import { ConfirmModal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import { apiFetch } from "@/lib/api";
import ko from "@/messages/ko.json";

interface Keyword {
  id: string;
  word: string;
  created_at: string;
}

export default function KeywordsPage() {
  const { toast } = useToast();
  const [keywords, setKeywords] = useState<Keyword[]>([]);
  const [loading, setLoading] = useState(true);
  const [newKeyword, setNewKeyword] = useState("");
  const [adding, setAdding] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Keyword | null>(null);
  const [searchQ, setSearchQ] = useState("");

  useEffect(() => {
    apiFetch<Keyword[]>("/moderation/keywords")
      .then(setKeywords)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const addKeyword = async () => {
    if (!newKeyword.trim()) return;
    setAdding(true);
    try {
      const kw = await apiFetch<Keyword>("/moderation/keywords", {
        method: "POST",
        body: JSON.stringify({ word: newKeyword.trim() }),
      });
      setKeywords([kw, ...keywords]);
      setNewKeyword("");
    } catch (err: any) {
      toast("error", err.message);
    }
    setAdding(false);
  };

  const deleteKeyword = async (id: string) => {
    try {
      await apiFetch(`/moderation/keywords/${id}`, { method: "DELETE" });
      setKeywords(keywords.filter((k) => k.id !== id));
    } catch (err: any) {
      toast("error", err.message);
    }
  };

  const filtered = searchQ
    ? keywords.filter((k) => k.word.includes(searchQ))
    : keywords;

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <AdminCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-lg font-bold text-gray-900 mb-1">{ko.admin.keywords}</h2>
      <p className="text-xs text-gray-400 mb-5">{ko.admin.keywords_desc}</p>

      {/* Add keyword */}
      <div className="flex gap-2 mb-4">
        <div className="flex-1">
          <Input
            value={newKeyword}
            onChange={(e) => setNewKeyword(e.target.value)}
            placeholder={ko.admin.keyword_placeholder}
            onKeyDown={(e) => e.key === "Enter" && addKeyword()}
          />
        </div>
        <Button onClick={addKeyword} loading={adding}>
          {ko.common.save}
        </Button>
      </div>

      {/* Search */}
      {keywords.length > 5 && (
        <div className="mb-4">
          <Input
            value={searchQ}
            onChange={(e) => setSearchQ(e.target.value)}
            placeholder={ko.common.search}
          />
        </div>
      )}

      {/* List */}
      {filtered.length === 0 && (
        <EmptyState icon="keyword" title={ko.admin.no_keywords} />
      )}

      <div className="space-y-2">
        {filtered.map((kw) => (
          <Card key={kw.id} className="px-4 py-3 flex items-center justify-between">
            <span className="text-sm font-medium text-gray-900">{kw.word}</span>
            <Button
              variant="ghost"
              size="sm"
              className="text-danger-500 hover:bg-danger-50"
              onClick={() => setDeleteTarget(kw)}
            >
              {ko.common.delete}
            </Button>
          </Card>
        ))}
      </div>

      <ConfirmModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) deleteKeyword(deleteTarget.id);
        }}
        title={ko.common.delete}
        message={ko.admin.confirm_delete_keyword}
        danger
      />
    </div>
  );
}
