"use client";

interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

const defaultIcons: Record<string, string> = {
  feed: "M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z",
  search: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z",
  bookmark: "M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z",
  report: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z",
  user: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z",
  hidden: "M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21",
  keyword: "M7 20l4-16m2 16l4-16M6 9h14M4 15h14",
};

const defaultEmoji: Record<string, string> = {
  feed: "📝",
  search: "🔍",
  bookmark: "📌",
  report: "📢",
  user: "👤",
  hidden: "🙈",
  keyword: "#️⃣",
};

const bgColors: Record<string, string> = {
  feed: "from-accent-50/60 to-primary-50/40",
  search: "from-sky-50/60 to-blue-50/40",
  bookmark: "from-amber-50/60 to-yellow-50/40",
  report: "from-red-50/60 to-rose-50/40",
  user: "from-violet-50/60 to-indigo-50/40",
  hidden: "from-gray-50/60 to-slate-50/40",
  keyword: "from-emerald-50/60 to-teal-50/40",
};

export default function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  const emoji = icon && defaultEmoji[icon] ? defaultEmoji[icon] : "📭";
  const bg = icon && bgColors[icon] ? bgColors[icon] : "from-gray-50/60 to-slate-50/40";

  return (
    <div className={`relative overflow-hidden flex flex-col items-center justify-center py-14 px-6 rounded-2xl bg-gradient-to-br ${bg} border border-gray-100/30`}>
      <div className="absolute -top-6 -right-6 w-24 h-24 bg-white/30 rounded-full" />
      <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-white/20 rounded-full" />
      <div className="relative">
        <div className="w-16 h-16 rounded-2xl bg-white/80 flex items-center justify-center mb-4 shadow-sm border border-white/60 mx-auto">
          <span className="text-3xl animate-bounce-soft">{emoji}</span>
        </div>
        <p className="text-sm font-semibold text-gray-500 mb-1 text-center">{title}</p>
        {description && (
          <p className="text-xs text-gray-400 text-center max-w-[220px] leading-relaxed">{description}</p>
        )}
        {action && <div className="mt-4">{action}</div>}
      </div>
    </div>
  );
}
