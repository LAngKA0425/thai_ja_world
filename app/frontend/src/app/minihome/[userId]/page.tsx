"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import BottomNav from "@/components/BottomNav";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { IconBack } from "@/components/ui/Icons";
import { fetchMinihomeProfile, resolveMinihomeHandle } from "@/features/minihome/api/minihome.api";
import MinihomePreviewCard from "@/features/minihome/components/MinihomePreviewCard";
import MinihomeTabs from "@/features/minihome/components/MinihomeTabs";
import MinihomeProfile from "@/components/minihome/MinihomeProfile";
import MinihomeGuestbook from "@/components/minihome/MinihomeGuestbook";
import MinihomeAlbum from "@/components/minihome/MinihomeAlbum";
import MinihomeBGM from "@/components/minihome/MinihomeBGM";
import MiniroomView from "@/components/minihome/MiniroomView";
import { getGuestbookEntries, createGuestbookEntry, getMinihomeAlbums, getMinihomeBgm, setRepresentativeBgm } from "@/lib/minihome";
import { apiFetch, ApiError } from "@/lib/api";
import ko from "@/messages/ko.json";
import type { MinihomeProfile as MinihomeProfileType, MinihomeTab, MinihomeBgm } from "@/features/minihome/types/minihome.types";
import type { GuestbookEntry } from "@/features/guestbook/types/guestbook.types";
import type { IlchonListResponse } from "@/features/ilchon/types/ilchon.types";
import IlchonRequestButton from "@/features/ilchon/components/IlchonRequestButton";
import { fetchIlchonStatus } from "@/features/ilchon/api/ilchon.api";

interface CurrentUser {
  id: string;
  nickname: string;
}

export default function MinihomePage() {
  const params = useParams();
  const router = useRouter();
  const handle = Array.isArray(params.userId) ? params.userId[0] : (params.userId as string | undefined);

  const [profile, setProfile] = useState<MinihomeProfileType | null>(null);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [resolvedUserId, setResolvedUserId] = useState<string | null>(null);
  const [handleResolution, setHandleResolution] = useState<{
    handle: string;
    resolvedBy: "user_id" | "nickname";
    userId: string;
    nickname: string;
  } | null>(null);
  const [guestbookEntries, setGuestbookEntries] = useState<GuestbookEntry[]>([]);
  const [albums, setAlbums] = useState<{ id: string; imageUrl: string; caption?: string }[]>([]);
  const [bgmTracks, setBgmTracks] = useState<MinihomeBgm[]>([]);
  const [ilchonCount, setIlchonCount] = useState(0);
  const [relationStatus, setRelationStatus] = useState<string>("none");
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<MinihomeTab>("home");

  const isOwner = currentUser?.id === resolvedUserId;

  const isUuid = (value: string) =>
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);

  useEffect(() => {
    if (!handle) return;
    const normalized = handle.startsWith("@") ? handle.slice(1) : handle;

    setResolvedUserId(null);
    setHandleResolution(null);
    setError("");

    if (isUuid(normalized)) {
      setResolvedUserId(normalized);
      setHandleResolution({
        handle: normalized,
        resolvedBy: "user_id",
        userId: normalized,
        nickname: "",
      });
      return;
    }

    resolveMinihomeHandle(normalized)
      .then((res) => {
        setResolvedUserId(res.userId);
        setHandleResolution(res);
      })
      .catch((err) => {
        if (err instanceof ApiError && err.status === 404) {
          setError("HANDLE_NOT_FOUND");
        } else {
          setError(err.message || ko.minihome.load_failed);
        }
      });
  }, [handle]);

  useEffect(() => {
    if (!resolvedUserId) return;

    // 현재 로그인 유저 확인
    apiFetch<CurrentUser>("/auth/me").then(setCurrentUser).catch(() => {});

    // 미니홈피 프로필
    fetchMinihomeProfile(resolvedUserId)
      .then(setProfile)
      .catch((err) => {
        if (err instanceof ApiError && err.status === 404) {
          setError("NOT_FOUND");
        } else {
          setError(err.message || ko.minihome.load_failed);
        }
      });

    // 방명록
    getGuestbookEntries(resolvedUserId)
      .then((res) => setGuestbookEntries(res.entries))
      .catch(() => {});

    // 사진첩
    getMinihomeAlbums(resolvedUserId)
      .then(setAlbums)
      .catch(() => {});

    // BGM
    getMinihomeBgm(resolvedUserId)
      .then(setBgmTracks)
      .catch(() => {});

    // 일촌 수
    // TODO: 백엔드 일촌 리스트 엔드포인트 연결
    apiFetch<IlchonListResponse>(`/ilchon/${resolvedUserId}`)
      .then((res) => setIlchonCount(res.total))
      .catch(() => {});

    fetchIlchonStatus(resolvedUserId)
      .then((res) => setRelationStatus(res.status))
      .catch(() => {});
  }, [resolvedUserId]);

  const handleWriteGuestbook = async (content: string) => {
    if (!resolvedUserId) return;
    const entry = await createGuestbookEntry(resolvedUserId, content);
    setGuestbookEntries((prev) => [entry, ...prev]);
  };

  if (error) {
    const isNotFound = error === "NOT_FOUND";
    const isHandleNotFound = error === "HANDLE_NOT_FOUND";
    return (
      <main className="max-w-lg mx-auto px-4 pt-6 pb-20">
        <button onClick={() => router.back()} className="flex items-center gap-1 text-sm text-gray-400 mb-4">
          <IconBack size={16} /> {ko.minihome.go_back}
        </button>
        <Card className="p-8 text-center">
          {isHandleNotFound ? (
            <>
              <p className="text-3xl mb-3">🔎</p>
              <p className="text-sm font-semibold text-gray-700 mb-2">
                입력한 미니홈피 핸들을 찾을 수 없습니다
              </p>
              <p className="text-xs text-gray-400 mb-4">
                주소 정책: <span className="font-medium">/minihome/UUID</span> 또는 <span className="font-medium">/minihome/닉네임</span>
              </p>
              <Button variant="secondary" size="sm" onClick={() => router.back()}>
                {ko.minihome.go_back_action}
              </Button>
            </>
          ) : isNotFound ? (
            <>
              <p className="text-3xl mb-3">🏡</p>
              <p className="text-sm font-semibold text-gray-700 mb-1">
                {isOwner ? ko.minihome.not_found_owner_title : ko.minihome.not_found_other_title}
              </p>
              <p className="text-xs text-gray-400 mb-4">
                {isOwner ? ko.minihome.not_found_owner_desc : ko.minihome.not_found_other_desc}
              </p>
              {isOwner && (
                <Button variant="primary" size="sm" onClick={async () => {
                  try {
                    await apiFetch("/minihome/", {
                      method: "POST",
                      body: JSON.stringify({}),
                    });
                    router.replace(`/minihome/${handle}`);
                  } catch {}
                }}>
                  {ko.minihome.create_minihome}
                </Button>
              )}
            </>
          ) : (
            <>
              <p className="text-sm text-gray-500">{error}</p>
              <Button variant="secondary" size="sm" className="mt-4" onClick={() => router.back()}>
                {ko.minihome.go_back_action}
              </Button>
            </>
          )}
        </Card>
        <BottomNav />
      </main>
    );
  }

  if (!profile) {
    return (
      <main className="max-w-lg mx-auto px-4 pt-6 pb-20">
        <Skeleton className="w-full h-40 rounded-2xl mb-4" />
        <Skeleton className="w-full h-10 rounded-xl mb-4" />
        <Skeleton className="w-full h-60 rounded-2xl" />
        <BottomNav />
      </main>
    );
  }

  return (
    <main className="max-w-lg mx-auto px-4 pt-6 pb-20">
      <button onClick={() => router.back()} className="flex items-center gap-1 text-sm text-gray-400 mb-4">
        <IconBack size={16} /> {ko.minihome.go_back}
      </button>

      {handleResolution?.resolvedBy === "nickname" && (
        <div className="mb-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] text-amber-700">
          미니홈피 주소 정책: <span className="font-medium">/minihome/UUID</span> 또는 <span className="font-medium">/minihome/닉네임</span> 지원
        </div>
      )}

      {/* 미니홈피 헤더 */}
      <div className="mb-4">
        <h1 className="text-lg font-bold text-gray-900">{profile.ownerNickname}의 미니홈피</h1>
        <p className="text-xs text-gray-400">{profile.title}</p>
        {!isOwner && relationStatus !== "none" && relationStatus !== "self" && (
          <p className="text-xs text-primary-600 mt-1">
            {ko.minihome.ilchon_status}: {ko.minihome.ilchon_status_labels?.[relationStatus as "pending" | "accepted" | "rejected"] || relationStatus}
          </p>
        )}
      </div>

      {/* 프로필 섹션 */}
      <div className="mb-4">
        <MinihomeProfile
          nickname={profile.ownerNickname}
          title={profile.title}
          statusMessage={profile.description}
          todayVisitors={profile.todayVisitors}
          totalVisitors={profile.totalVisitors}
          ilchonCount={ilchonCount}
        />
      </div>

      {/* 소유자/방문자 CTA */}
      <div className="flex gap-2 mb-4">
        {isOwner ? (
          <>
            {/* TODO: 미니홈피 편집 페이지 구현 시 연결 */}
            <Button variant="secondary" size="sm" className="flex-1" onClick={() => {}}>
              {ko.minihome.customize_action}
            </Button>
            <Link href="/shop" className="flex-1">
              <Button variant="secondary" size="sm" className="w-full">
                {ko.minihome.go_shop_action}
              </Button>
            </Link>
          </>
        ) : (
          <>
          <IlchonRequestButton
              targetUserId={resolvedUserId || ""}
              onSent={() => {
                if (!resolvedUserId) return;
                apiFetch<IlchonListResponse>(`/ilchon/${resolvedUserId}`)
                  .then((res) => setIlchonCount(res.total))
                  .catch(() => {});
              }}
            />
          </>
        )}
      </div>

      {/* 기존 탭 UI 유지 + 확장 콘텐츠 */}
      <div className="mt-4 mb-4">
        <MinihomeTabs activeTab={activeTab} onTabChange={setActiveTab} />
      </div>

      {/* 탭별 콘텐츠 영역 */}
      <div className="space-y-4">
        {activeTab === "home" && (
          <>
            <MiniroomView
              items={[]}
              loading={false}
              isOwner={isOwner}
              onCustomize={() => {
                // TODO: 미니룸 꾸미기 편집 페이지 연결
              }}
            />
            <MinihomeGuestbook
              entries={guestbookEntries.slice(0, 3).map((e) => ({
                id: e.id,
                authorNickname: e.authorNickname,
                content: e.content,
                createdAt: e.createdAt,
              }))}
              isOwner={isOwner}
              onWrite={handleWriteGuestbook}
            />
          </>
        )}

        {activeTab === "guestbook" && (
          <MinihomeGuestbook
            entries={guestbookEntries.map((e) => ({
              id: e.id,
              authorNickname: e.authorNickname,
              content: e.content,
              createdAt: e.createdAt,
            }))}
            isOwner={isOwner}
            onWrite={handleWriteGuestbook}
          />
        )}

        {activeTab === "album" && (
          <MinihomeAlbum
            photos={albums.map((a) => ({
              id: a.id,
              imageUrl: a.imageUrl,
              caption: a.caption,
            }))}
          />
        )}

        {activeTab === "miniroom" && (
          <MiniroomView
            items={[]}
            loading={false}
            isOwner={isOwner}
            onCustomize={() => {
              // TODO: 미니룸 꾸미기 편집 페이지 연결
            }}
          />
        )}

        {activeTab === "bgm" && (
          <MinihomeBGM
            tracks={bgmTracks.map((t) => ({
              id: t.id,
              title: t.title,
              artist: t.artist,
              url: t.url,
              isRepresentative: t.isRepresentative,
            }))}
            isOwner={isOwner}
            onSetRepresentative={async (bgmId) => {
              try {
                if (!resolvedUserId) return;
                await setRepresentativeBgm(resolvedUserId, bgmId);
                const updated = await getMinihomeBgm(resolvedUserId);
                setBgmTracks(updated);
              } catch {}
            }}
          />
        )}
      </div>

      <BottomNav />
    </main>
  );
}
