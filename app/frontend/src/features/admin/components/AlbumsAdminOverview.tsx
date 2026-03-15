"use client";

export function AlbumsAdminOverview() {
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
      <h3 className="text-sm font-bold text-gray-700 mb-2">📷 사진첩 관리</h3>
      <div className="text-xs text-gray-500 space-y-1">
        <p>총 앨범 수: —</p>
        <p>총 사진 수: —</p>
        <p>비공개 앨범: —</p>
      </div>
    </div>
  );
}
