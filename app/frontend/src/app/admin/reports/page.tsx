"use client";
import { useEffect, useState } from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { AdminCardSkeleton } from "@/components/ui/Skeleton";
import EmptyState from "@/components/ui/EmptyState";
import { ConfirmModal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import { IconEyeOff, IconEye } from "@/components/ui/Icons";
import { timeAgo } from "@/lib/timeago";
import { apiFetch } from "@/lib/api";
import ko from "@/messages/ko.json";

interface Report {
  id: string;
  reporter_id: string;
  target_type: string;
  target_id: string;
  reason: string;
  status: string;
  created_at: string;
}

export default function ReportsPage() {
  const { toast } = useToast();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmAction, setConfirmAction] = useState<{
    type: "hide" | "unhide";
    targetType: string;
    targetId: string;
  } | null>(null);

  useEffect(() => {
    apiFetch<Report[]>("/moderation/reports")
      .then(setReports)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleHideAction = async (targetType: string, targetId: string, hidden: boolean) => {
    try {
      await apiFetch("/moderation/hide", {
        method: "POST",
        body: JSON.stringify({ target_type: targetType, target_id: targetId, hidden }),
      });
      toast("success", hidden ? ko.admin.hide : ko.admin.unhide);
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
      <h2 className="text-lg font-bold text-gray-900 mb-1">{ko.admin.reports}</h2>
      <p className="text-xs text-gray-400 mb-5">{ko.admin.reports_desc}</p>

      {reports.length === 0 && (
        <EmptyState icon="report" title={ko.admin.no_reports} />
      )}

      <div className="space-y-3">
        {reports.map((r) => (
          <Card key={r.id} className="p-4">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <Badge variant={r.target_type === "post" ? "warning" : "default"}>
                  {r.target_type}
                </Badge>
                <span className="text-2xs text-gray-300">{r.target_id.slice(0, 8)}</span>
              </div>
              <span className="text-2xs text-gray-300">{timeAgo(r.created_at)}</span>
            </div>

            <p className="text-sm text-gray-700 mb-3">{r.reason}</p>

            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() =>
                  setConfirmAction({ type: "hide", targetType: r.target_type, targetId: r.target_id })
                }
              >
                <IconEyeOff size={14} className="mr-1" />
                {ko.admin.hide}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  setConfirmAction({ type: "unhide", targetType: r.target_type, targetId: r.target_id })
                }
              >
                <IconEye size={14} className="mr-1" />
                {ko.admin.unhide}
              </Button>
            </div>
          </Card>
        ))}
      </div>

      <ConfirmModal
        open={!!confirmAction}
        onClose={() => setConfirmAction(null)}
        onConfirm={() => {
          if (confirmAction) {
            handleHideAction(
              confirmAction.targetType,
              confirmAction.targetId,
              confirmAction.type === "hide"
            );
          }
        }}
        title={confirmAction?.type === "hide" ? ko.admin.hide : ko.admin.unhide}
        message={confirmAction?.type === "hide" ? ko.admin.confirm_hide : ko.admin.confirm_unhide}
      />
    </div>
  );
}
