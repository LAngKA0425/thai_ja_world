"use client";

type BadgeVariant = "default" | "review" | "tip" | "market" | "meetup" | "job" | "danger" | "success" | "warning";

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: "bg-gray-100 text-gray-600 border-gray-200/50",
  review: "bg-community-50 text-community-600 border-community-200/50",
  tip: "bg-sky-50 text-sky-700 border-sky-200/50",
  market: "bg-community-50 text-community-700 border-community-200/50",
  meetup: "bg-amber-50 text-amber-700 border-amber-200/50",
  job: "bg-violet-50 text-violet-700 border-violet-200/50",
  danger: "bg-danger-50 text-danger-600 border-red-200/50",
  success: "bg-success-50 text-success-600 border-green-200/50",
  warning: "bg-warning-50 text-warning-600 border-amber-200/50",
};

export default function Badge({ variant = "default", children, className = "" }: BadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center px-2.5 py-0.5
        text-2xs font-bold rounded-lg border
        ${variantStyles[variant]}
        ${className}
      `}
    >
      {children}
    </span>
  );
}

export function getPostTypeBadgeVariant(type: string): BadgeVariant {
  const map: Record<string, BadgeVariant> = {
    review: "review",
    tip: "tip",
    market: "market",
    meetup: "meetup",
    job: "job",
  };
  return map[type] || "default";
}
