"use client";

export function AvatarAdminOverview() {
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
      <h3 className="text-sm font-bold text-gray-700 mb-2">👤 아바타 관리</h3>
      <div className="text-xs text-gray-500 space-y-1">
        <p>총 아이템 수: —</p>
        <p>카테고리별: —</p>
        <p>기간제 아이템: —</p>
      </div>
    </div>
  );
}
