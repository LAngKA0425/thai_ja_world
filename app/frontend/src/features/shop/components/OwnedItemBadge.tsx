"use client";

interface OwnedItemBadgeProps {
  isOwned: boolean;
  isEquipped?: boolean;
}

export default function OwnedItemBadge({
  isOwned,
  isEquipped = false,
}: OwnedItemBadgeProps) {
  if (!isOwned) return null;

  if (isEquipped) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-2xs font-bold">
        <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
        착용중
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-2xs font-bold">
      <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
      보유중
    </span>
  );
}
