"use client";

interface PurchaseStatusBadgeProps {
  isAvailable?: boolean;
  isOwned?: boolean;
  expiresAt?: string;
}

export default function PurchaseStatusBadge({
  isAvailable = true,
  isOwned = false,
  expiresAt,
}: PurchaseStatusBadgeProps) {
  if (isOwned) {
    if (expiresAt) {
      const expirationDate = new Date(expiresAt);
      const today = new Date();
      const daysLeft = Math.ceil(
        (expirationDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
      );

      return (
        <div className="inline-block bg-orange-600 text-white px-2 py-1 rounded text-2xs font-bold">
          {daysLeft > 0 ? `${daysLeft}일 남음` : "만료됨"}
        </div>
      );
    }

    return (
      <div className="inline-block bg-green-600 text-white px-2 py-1 rounded text-2xs font-bold">
        소유중
      </div>
    );
  }

  if (!isAvailable) {
    return (
      <div className="inline-block bg-gray-600 text-gray-300 px-2 py-1 rounded text-2xs font-bold">
        품절
      </div>
    );
  }

  return (
    <div className="inline-block bg-blue-600 text-white px-2 py-1 rounded text-2xs font-bold">
      판매중
    </div>
  );
}
