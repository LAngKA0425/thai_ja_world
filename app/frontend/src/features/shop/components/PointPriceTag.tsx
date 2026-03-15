"use client";

interface PointPriceTagProps {
  price: number;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

export default function PointPriceTag({
  price,
  size = "md",
  showLabel = true,
}: PointPriceTagProps) {
  const sizeClasses = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-lg",
  };

  return (
    <span className={`inline-flex items-center gap-1 font-bold text-yellow-600 ${sizeClasses[size]}`}>
      <span className="text-yellow-500">💰</span>
      {price.toLocaleString()}
      {showLabel && <span className="text-gray-400 font-medium text-2xs">TP</span>}
    </span>
  );
}
