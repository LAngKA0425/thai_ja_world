"use client";
import { useEffect, useState } from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import EmptyState from "@/components/ui/EmptyState";
import { useToast } from "@/components/ui/Toast";
import { apiFetch } from "@/lib/api";
import ko from "@/messages/ko.json";

interface Notification {
  id: string;
  type: string;
  severity: string;
  title: string;
  payload: any;
  is_read: boolean;
  created_at: string;
}

const severityBadge: Record<string, "default" | "warning" | "danger"> = {
  info: "default",
  warn: "warning",
  critical: "danger",
};

export default function NotificationsPage() {
  const { toast } = useToast();
  const [items, setItems] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = () => {
    setLoading(true);
    apiFetch<Notification[]>("/admin/notifications")
      .then(setItems)
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetch(); }, []);

  const handleRead = async (id: string) => {
    try {
      await apiFetch(`/admin/notifications/${id}/read`, { method: "POST" });
      setItems(items.map((n) => n.id === id ? { ...n, is_read: true } : n));
    } catch {}
  };

  const handleReadAll = async () => {
    try {
      await apiFetch("/admin/notifications/read-all", { method: "POST" });
      setItems(items.map((n) => ({ ...n, is_read: true })));
      toast("success", "모두 읽음 처리됨");
    } catch {}
  };

  const unreadCount = items.filter((n) => !n.is_read).length;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold text-gray-900">{ko.admin.notifications}</h2>
          <p className="text-xs text-gray-400">미확인 {unreadCount}건</p>
        </div>
        {unreadCount > 0 && (
          <Button size="sm" variant="ghost" onClick={handleReadAll}>모두 읽음</Button>
        )}
      </div>

      {loading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 p-4 animate-skeleton">
              <div className="h-4 bg-gray-100 rounded w-2/3" />
            </div>
          ))}
        </div>
      )}

      {!loading && items.length === 0 && (
        <EmptyState icon="feed" title="알림이 없습니다" />
      )}

      <div className="space-y-2">
        {items.map((n) => (
          <Card
            key={n.id}
            className={`p-4 ${!n.is_read ? "border-l-4 border-l-primary-500" : ""}`}
            onClick={() => !n.is_read && handleRead(n.id)}
          >
            <div className="flex items-center gap-2 mb-1">
              <Badge variant={severityBadge[n.severity] || "default"}>{n.type}</Badge>
              <span className="text-2xs text-gray-400">
                {new Date(n.created_at).toLocaleString("ko")}
              </span>
              {!n.is_read && <span className="w-2 h-2 rounded-full bg-primary-500 ml-auto" />}
            </div>
            <p className="text-sm text-gray-900">{n.title}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
