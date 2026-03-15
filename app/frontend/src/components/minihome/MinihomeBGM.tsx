"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Card from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";

interface BgmTrack {
  id: string;
  title: string;
  artist?: string;
  url: string;
  isRepresentative: boolean;
}

interface MinihomeBGMProps {
  tracks: BgmTrack[];
  loading?: boolean;
  isOwner?: boolean;
  onSetRepresentative?: (bgmId: string) => void;
}

export default function MinihomeBGM({ tracks, loading, isOwner, onSetRepresentative }: MinihomeBGMProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [currentTrackId, setCurrentTrackId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const currentTrack = tracks.find((t) => t.id === currentTrackId);

  const handlePlay = useCallback((trackId: string) => {
    const track = tracks.find((t) => t.id === trackId);
    if (!track) return;

    if (currentTrackId === trackId && isPlaying) {
      // 같은 트랙 → 일시정지
      audioRef.current?.pause();
      setIsPlaying(false);
      return;
    }

    if (currentTrackId === trackId && !isPlaying) {
      // 같은 트랙 → 재개
      audioRef.current?.play().catch(() => {});
      setIsPlaying(true);
      return;
    }

    // 다른 트랙 → 새로 재생
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
    }

    const audio = new Audio(track.url);
    audio.volume = 0.5;
    audioRef.current = audio;

    audio.onended = () => {
      setIsPlaying(false);
      setCurrentTrackId(null);
    };
    audio.onerror = () => {
      setIsPlaying(false);
    };

    setCurrentTrackId(trackId);
    audio.play().then(() => {
      setIsPlaying(true);
    }).catch(() => {
      setIsPlaying(false);
    });
  }, [currentTrackId, isPlaying, tracks]);

  const handleStop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
    }
    setIsPlaying(false);
    setCurrentTrackId(null);
  }, []);

  // 컴포넌트 언마운트 시 오디오 정리
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
      }
    };
  }, []);

  if (loading) {
    return (
      <Card className="p-4">
        <Skeleton className="w-20 h-4 mb-3" />
        <Skeleton className="w-full h-12" />
      </Card>
    );
  }

  const representative = tracks.find((t) => t.isRepresentative);

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-bold text-gray-900">BGM</p>
        <span className="text-2xs text-gray-400">{tracks.length}곡</span>
      </div>

      {tracks.length === 0 ? (
        <div className="py-6 text-center">
          <p className="text-sm text-gray-400">설정된 BGM이 없어요</p>
          <p className="text-2xs text-gray-300 mt-1">상점에서 BGM을 구매해보세요</p>
        </div>
      ) : (
        <div className="space-y-2">
          {/* 대표곡 표시 */}
          {representative && (
            <div className="bg-violet-50 rounded-xl p-2 mb-2">
              <span className="text-2xs font-bold text-violet-500">대표곡: {representative.title}</span>
            </div>
          )}

          {/* 현재 재생 중 */}
          {currentTrack && isPlaying && (
            <div className="bg-primary-50 rounded-xl p-3 flex items-center gap-3">
              <button
                onClick={handleStop}
                className="w-8 h-8 rounded-lg bg-primary-500 flex items-center justify-center flex-shrink-0"
              >
                <svg width={14} height={14} viewBox="0 0 24 24" fill="white">
                  <rect x="6" y="4" width="4" height="16" rx="1" />
                  <rect x="14" y="4" width="4" height="16" rx="1" />
                </svg>
              </button>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-primary-700 truncate">{currentTrack.title}</p>
                {currentTrack.artist && (
                  <p className="text-2xs text-primary-400 truncate">{currentTrack.artist}</p>
                )}
              </div>
              <button
                onClick={handleStop}
                className="text-2xs text-primary-500 font-medium flex-shrink-0"
              >
                정지
              </button>
            </div>
          )}

          {/* 트랙 리스트 */}
          {tracks.map((track) => {
            const isCurrent = track.id === currentTrackId;
            if (isCurrent && isPlaying) return null; // 재생 중인 건 위에 표시

            return (
              <div
                key={track.id}
                className="bg-gray-50 rounded-xl p-3 flex items-center gap-3"
              >
                <button
                  onClick={() => handlePlay(track.id)}
                  className="w-8 h-8 rounded-lg bg-gray-200 flex items-center justify-center hover:bg-gray-300 transition-colors flex-shrink-0"
                >
                  {isCurrent && !isPlaying ? (
                    <svg width={12} height={12} viewBox="0 0 24 24" fill="#6B7280">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  ) : (
                    <svg width={12} height={12} viewBox="0 0 24 24" fill="#6B7280">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  )}
                </button>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-xs font-medium text-gray-700 truncate">{track.title}</p>
                    {track.isRepresentative && (
                      <span className="text-2xs bg-violet-100 text-violet-600 px-1.5 py-0.5 rounded-full flex-shrink-0">대표</span>
                    )}
                  </div>
                  {track.artist && (
                    <p className="text-2xs text-gray-400 truncate">{track.artist}</p>
                  )}
                </div>
                {isOwner && onSetRepresentative && !track.isRepresentative && (
                  <button
                    onClick={() => onSetRepresentative(track.id)}
                    className="text-2xs text-violet-500 font-medium flex-shrink-0 hover:text-violet-700"
                  >
                    대표곡
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}
