"use client";
import { useEffect, useState } from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { AdminCardSkeleton } from "@/components/ui/Skeleton";
import EmptyState from "@/components/ui/EmptyState";
import { ConfirmModal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import { IconEye } from "@/components/ui/Icons";
import { timeAgo } from "@/lib/timeago";
import { apiFetch } from "@/lib/api";
import ko from "@/messages/ko.json";

interface HiddenItem {
  id: string;
  target_type: string;
  target_id: string;
  title?: string;
  body?: string;
  hidden_at: string;
}

export default function HiddenContentPage() {
  const { toast } = useToast();
  const [items, setItems] = useState<HiddenItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [unhideTarget, setUnhideTarget] = useState<HiddenItem | null>(null);

  useEffect(() => {
    // TODO: API missing — GET /api/v1/moderation/hidden
    apiFetch<HiddenItem[]>("/moderation/hidden")
      .then(setItems)
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  const handleUnhide = async (item: HiddenItem) => {
    try {
      await apiFetch("/moderation/hide", {
        method: "POST",
        body: JSON.stringify({
          target_type: item.target_type,
          target_id: item.target_id,
          hidden: false,
        }),
      });
      setItems(items.filter((i) => i.id !== item.id));
      toast("success", ko.admin.unhide);
    } catch (err: any) {
      toast("error", err.message);
    }
  };

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
      <h2 className="text-lg font-bold text-gray-900 mb-1">{ko.admin.hidden}</h2>
      <p className="text-xs text-gray-400 mb-5">{ko.admin.hidden_desc}</p>

      {items.length === 0 && (
        <EmptyState icon="hidden" title={ko.admin.no_hidden} />
      )}

      <div className="space-y-3">
        {items.map((item) => (
          <Card key={item.id} className="p-4">
            <div className="flex items-start justify-between mb-2">
              <Badge variant="warning">{item.target_type}</Badge>
              <span className="text-2xs text-gray-300">
                {item.hidden_at ? timeAgo(item.hidden_at) : ""}
              </span>
            </div>

            {item.title && (
              <p className="text-sm font-medium text-gray-900 mb-1">{item.title}</p>
            )}
            {item.body && (
              <p className="text-xs text-gray-500 line-clamp-2 mb-3">{item.body}</p>
            )}
            {!item.title && !item.body && (
              <p className="text-xs text-gray-400 mb-3">
                {item.target_type} · {item.target_id.slice(0, 8)}
              </p>
            )}

            <Button
              variant="secondary"
              size="sm"
              onClick={() => setUnhideTarget(item)}
            >
              <IconEye size={14} className="mr-1" />
              {ko.admin.unhide}
            </Button>
          </Card>
        ))}
      </div>

      <ConfirmModal
        open={!!unhideTarget}
        onClose={() => setUnhideTarget(null)}
        onConfirm={() => {
          if (unhideTarget) handleUnhide(unhideTarget);
        }}
        title={ko.admin.unhide}
        message={ko.admin.confirm_unhide}
      />
    </div>
  );
}
