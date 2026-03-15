"use client";
import { useEffect, useState } from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import EmptyState from "@/components/ui/EmptyState";
import { useToast } from "@/components/ui/Toast";
import { apiFetch } from "@/lib/api";
import ko from "@/messages/ko.json";

interface ScheduledPost {
  id: string;
  status: string;
  publish_at: string;
  post_payload: { title?: string; body?: string; type?: string };
  error: string | null;
  retry_count: number;
  created_at: string;
}

const statusBadge: Record<string, "default" | "success" | "warning" | "danger"> = {
  draft: "default",
  scheduled: "warning",
  published: "success",
  canceled: "default",
  failed: "danger",
};

export default function ScheduledPage() {
  const { toast } = useToast();
  const [items, setItems] = useState<ScheduledPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");

  const fetch = () => {
    setLoading(true);
    const q = filter ? `?status=${filter}` : "";
    apiFetch<ScheduledPost[]>(`/admin/scheduled${q}`)
      .then(setItems)
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetch(); }, [filter]);

  const handleCancel = async (id: string) => {
    try {
      await apiFetch(`/admin/scheduled/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ status: "canceled" }),
      });
      toast("success", "예약 취소됨");
      fetch();
    } catch (err: any) {
      toast("error", err.message);
    }
  };

  const handlePublishNow = async (id: string) => {
    try {
      await apiFetch(`/admin/scheduled/${id}/publish-now`, { method: "POST" });
      toast("success", "즉시 발행됨");
      fetch();
    } catch (err: any) {
      toast("error", err.message);
    }
  };

  return (
    <div>
      <h2 className="text-lg font-bold text-gray-900 mb-1">{ko.admin.scheduled}</h2>
      <p className="text-xs text-gray-400 mb-4">{ko.admin.scheduled_desc}</p>

      <div className="flex gap-2 mb-4">
        {["", "scheduled", "published", "failed", "canceled"].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              filter === s ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"
            }`}
          >
            {s || "전체"}
          </button>
        ))}
      </div>

      {loading && (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 p-4 animate-skeleton">
              <div className="h-5 bg-gray-100 rounded w-1/2 mb-2" />
              <div className="h-4 bg-gray-100 rounded w-full" />
            </div>
          ))}
        </div>
      )}

      {!loading && items.length === 0 && (
        <EmptyState icon="feed" title="예약된 글이 없습니다" />
      )}

      <div className="space-y-3">
        {items.map((sp) => (
          <Card key={sp.id} className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant={statusBadge[sp.status] || "default"}>{sp.status}</Badge>
              <span className="text-2xs text-gray-400">
                발행: {new Date(sp.publish_at).toLocaleString("ko")}
              </span>
            </div>
            <h3 className="text-sm font-semibold text-gray-900">{sp.post_payload?.title || "(제목없음)"}</h3>
            <p className="text-xs text-gray-500 line-clamp-2 mt-1">{sp.post_payload?.body || ""}</p>

            {sp.error && (
              <p className="text-xs text-red-500 mt-2 bg-red-50 rounded-lg p-2">{sp.error}</p>
            )}

            {(sp.status === "scheduled" || sp.status === "draft") && (
              <div className="flex gap-2 mt-3 pt-3 border-t border-gray-50">
                <Button size="sm" variant="primary" onClick={() => handlePublishNow(sp.id)}>
                  {ko.admin.publish_now}
                </Button>
                <Button size="sm" variant="ghost" className="text-danger-500" onClick={() => handleCancel(sp.id)}>
                  {ko.admin.cancel_schedule}
                </Button>
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
