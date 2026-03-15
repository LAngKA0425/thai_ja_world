"use client";
import { useEffect, useState } from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";
import { Textarea } from "@/components/ui/Input";
import EmptyState from "@/components/ui/EmptyState";
import { useToast } from "@/components/ui/Toast";
import { apiFetch } from "@/lib/api";
import ko from "@/messages/ko.json";

interface Draft {
  id: string;
  source_id: string;
  title: string;
  body: string;
  summary: string | null;
  status: string;
  created_at: string;
}

const statusBadge: Record<string, "default" | "success" | "warning" | "danger"> = {
  new: "warning",
  reviewed: "default",
  rejected: "danger",
  converted: "success",
};

export default function IngestPage() {
  const { toast } = useToast();
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("new");
  const [preview, setPreview] = useState<Draft | null>(null);
  const [editBody, setEditBody] = useState("");

  const fetchDrafts = () => {
    setLoading(true);
    apiFetch<Draft[]>(`/admin/drafts?status=${filter}`)
      .then(setDrafts)
      .catch(() => setDrafts([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchDrafts(); }, [filter]);

  const handleAction = async (draftId: string, action: string, extra?: any) => {
    try {
      await apiFetch(`/admin/drafts/${draftId}/action`, {
        method: "POST",
        body: JSON.stringify({ action, ...extra }),
      });
      toast("success", `${action} 완료`);
      setPreview(null);
      fetchDrafts();
    } catch (err: any) {
      toast("error", err.message);
    }
  };

  return (
    <div>
      <h2 className="text-lg font-bold text-gray-900 mb-1">{ko.admin.ingest}</h2>
      <p className="text-xs text-gray-400 mb-4">{ko.admin.ingest_desc}</p>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-4">
        {["new", "reviewed", "converted", "rejected"].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              filter === s ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {loading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 p-4 animate-skeleton">
              <div className="h-5 bg-gray-100 rounded w-2/3 mb-2" />
              <div className="h-4 bg-gray-100 rounded w-full" />
            </div>
          ))}
        </div>
      )}

      {!loading && drafts.length === 0 && (
        <EmptyState icon="feed" title="초안이 없습니다" />
      )}

      <div className="space-y-3">
        {drafts.map((d) => (
          <Card key={d.id} className="p-4">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant={statusBadge[d.status] || "default"}>{d.status}</Badge>
                  <span className="text-2xs text-gray-400">
                    {new Date(d.created_at).toLocaleString("ko")}
                  </span>
                </div>
                <h3 className="text-sm font-semibold text-gray-900 line-clamp-1">{d.title}</h3>
                <p className="text-xs text-gray-500 line-clamp-2 mt-1">{d.body}</p>
              </div>
            </div>

            {d.status === "new" && (
              <div className="flex gap-2 mt-3 pt-3 border-t border-gray-50">
                <Button size="sm" variant="primary" onClick={() => handleAction(d.id, "approve")}>
                  {ko.admin.approve}
                </Button>
                <Button size="sm" variant="ghost" onClick={() => { setPreview(d); setEditBody(d.body); }}>
                  미리보기
                </Button>
                <Button size="sm" variant="ghost" className="text-danger-500" onClick={() => handleAction(d.id, "reject")}>
                  {ko.admin.reject}
                </Button>
              </div>
            )}
          </Card>
        ))}
      </div>

      {/* Preview / Edit Modal */}
      <Modal
        open={!!preview}
        onClose={() => setPreview(null)}
        title={preview?.title || ""}
        actions={
          <>
            <Button variant="secondary" size="md" className="flex-1" onClick={() => setPreview(null)}>
              {ko.common.cancel}
            </Button>
            <Button
              variant="ghost"
              size="md"
              onClick={() => {
                if (preview) handleAction(preview.id, "edit", { body: editBody });
              }}
            >
              수정 저장
            </Button>
            <Button
              variant="primary"
              size="md"
              className="flex-1"
              onClick={() => {
                if (preview) handleAction(preview.id, "approve");
              }}
            >
              {ko.admin.approve}
            </Button>
          </>
        }
      >
        <Textarea
          value={editBody}
          onChange={(e) => setEditBody(e.target.value)}
          className="min-h-[200px]"
        />
      </Modal>
    </div>
  );
}
