"use client";

// TODO: 커뮤니티 피드 전용 뷰 구현 (기존 홈 피드와 분리)
const PLACEHOLDER_POSTS = [
  { title: "방콕 생활 꿀팁 공유합니다", type: "자유", comments: 12, time: "10분 전" },
  { title: "태국어 기초 회화 모음", type: "정보", comments: 8, time: "30분 전" },
  { title: "이번 주 한인 모임 후기", type: "후기", comments: 15, time: "1시간 전" },
];

export default function CommunityFeedPreview() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100/80 shadow-card overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-sky-50 to-blue-50/60 border-b border-sky-100/30">
        <span className="text-sm">💬</span>
        <span className="text-xs font-bold text-sky-700">커뮤니티</span>
        <span className="ml-auto inline-flex items-center gap-1 text-2xs text-sky-400 font-semibold">
          <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
          실시간
        </span>
      </div>
      <div className="divide-y divide-gray-50">
        {PLACEHOLDER_POSTS.map((post, i) => (
          <div key={i} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50/50 transition-colors">
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-gray-800 truncate">{post.title}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-2xs text-primary-500 font-semibold">{post.type}</span>
                <span className="text-2xs text-gray-300">💬 {post.comments}</span>
                <span className="text-2xs text-gray-300 ml-auto">{post.time}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
