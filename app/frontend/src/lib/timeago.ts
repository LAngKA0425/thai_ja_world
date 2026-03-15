import ko from "@/messages/ko.json";

export function timeAgo(dateStr: string): string {
  const now = Date.now();
  const date = new Date(dateStr).getTime();
  const diff = now - date;

  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return ko.common.just_now;
  if (minutes < 60) return `${minutes}${ko.common.ago_minutes}`;
  if (hours < 24) return `${hours}${ko.common.ago_hours}`;
  return `${days}${ko.common.ago_days}`;
}
