"use client";

// TODO: 프로필 꾸미기 기능 연결 (닉네임 색상, 뱃지, 칭호)
interface ProfileDecorationPreviewProps {
  nickname?: string;
  nicknameColorClass?: string;
  titleText?: string;
}

export default function ProfileDecorationPreview({
  nickname = "닉네임",
  nicknameColorClass = "text-gray-900",
  titleText,
}: ProfileDecorationPreviewProps) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50/80 border border-gray-100/50">
      <div className="w-10 h-10 rounded-2xl bg-primary-100 flex items-center justify-center">
        <span className="text-sm font-bold text-primary-600">{nickname.charAt(0).toUpperCase()}</span>
      </div>
      <div>
        {titleText && (
          <span className="inline-flex items-center px-1.5 py-0.5 bg-amber-50 rounded text-2xs font-bold text-amber-600 mb-0.5">
            {titleText}
          </span>
        )}
        <p className={`text-sm font-bold ${nicknameColorClass}`}>{nickname}</p>
      </div>
    </div>
  );
}
