"use client";

// TODO: 브리핑 전용 뷰 구현 (운영자 브리핑 + 자동 요약)
export default function BriefingPreview() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100/80 shadow-card overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-50 to-orange-50/60 border-b border-amber-100/30">
        <span className="text-sm">📋</span>
        <span className="text-xs font-bold text-amber-700">오늘의 브리핑</span>
        <span className="ml-auto text-2xs text-amber-400 font-semibold">매일 업데이트</span>
      </div>
      <div className="p-4">
        <div className="p-3 rounded-xl bg-amber-50/50 border border-amber-100/30">
          <p className="text-xs font-semibold text-gray-700 mb-1.5">🇹🇭 태국 한인 뉴스 요약</p>
          <p className="text-2xs text-gray-500 leading-relaxed">
            브리핑 서비스가 곧 시작됩니다. 매일 아침 태국 한인 커뮤니티의 핫이슈, 공지사항, 긴급정보를 한눈에 확인하세요.
          </p>
          <div className="flex gap-1.5 mt-2.5">
            <span className="inline-flex items-center px-2 py-0.5 bg-amber-100/80 rounded-md text-2xs font-semibold text-amber-600">핫이슈</span>
            <span className="inline-flex items-center px-2 py-0.5 bg-orange-100/80 rounded-md text-2xs font-semibold text-orange-600">공지</span>
            <span className="inline-flex items-center px-2 py-0.5 bg-red-100/80 rounded-md text-2xs font-semibold text-red-600">긴급</span>
          </div>
        </div>
      </div>
    </div>
  );
}
