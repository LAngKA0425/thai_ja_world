"use client";

// TODO: 구인구직 전용 리스트 뷰 구현
const PLACEHOLDER_JOBS = [
  { title: "한식당 홀 서빙", area: "방콕 아속", type: "구인", salary: "15,000฿/월" },
  { title: "한국어 과외 선생님", area: "방콕 수쿰빗", type: "구인", salary: "시급 협의" },
  { title: "통역 아르바이트 구합니다", area: "파타야", type: "구직", salary: "일당 협의" },
];

export default function JobsPreview() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100/80 shadow-card overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-violet-50 to-purple-50/60 border-b border-violet-100/30">
        <span className="text-sm">💼</span>
        <span className="text-xs font-bold text-violet-700">구인구직</span>
        <span className="ml-auto text-2xs text-violet-400 font-semibold">{PLACEHOLDER_JOBS.length}건</span>
      </div>
      <div className="divide-y divide-gray-50">
        {PLACEHOLDER_JOBS.map((job, i) => (
          <div key={i} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50/50 transition-colors">
            <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-2xs font-bold ${
              job.type === "구인" ? "bg-emerald-50 text-emerald-600" : "bg-sky-50 text-sky-600"
            }`}>
              {job.type}
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-gray-800 truncate">{job.title}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-2xs text-gray-400">📍 {job.area}</span>
                <span className="text-2xs font-semibold text-accent-500">{job.salary}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
