"use client";

export default function PointEarnGuide() {
  return (
    <div className="bg-blue-50 rounded-xl p-4">
      <h3 className="text-sm font-bold text-blue-700 mb-2">TP 적립 방법</h3>
      <ul className="space-y-1 text-xs text-blue-600">
        <li>• 매일 출석 체크: +10 TP</li>
        <li>• 게시글 작성: +5 TP</li>
        <li>• 방명록 남기기: +2 TP</li>
        <li>• 일일 퀘스트 완료: +20 TP</li>
      </ul>
    </div>
  );
}
