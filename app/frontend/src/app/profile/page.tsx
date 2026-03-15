"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import BottomNav from "@/components/BottomNav";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { IconShield, IconLogout, IconKey, IconFingerprint } from "@/components/ui/Icons";
import { useToast } from "@/components/ui/Toast";
import { apiFetch, ApiError, clearTokens } from "@/lib/api";
import ko from "@/messages/ko.json";
import PointBalanceBadge from "@/features/points/components/PointBalanceBadge";
import ProfileMinihomeButton from "@/features/profile/components/ProfileMinihomeButton";
import ProfileBadgeRow from "@/features/profile/components/ProfileBadgeRow";
import NotificationPreferencesCard from "@/features/notifications/components/NotificationPreferencesCard";
import ProfileAvatarCard from "@/features/profile/components/ProfileAvatarCard";
import ProfileOwnedItemsPreview from "@/features/profile/components/ProfileOwnedItemsPreview";
import ProfileMinihomeThemePreview from "@/features/profile/components/ProfileMinihomeThemePreview";
import ProfileMinihomeEntry from "@/features/profile/components/ProfileMinihomeEntry";
import PointBalanceCard from "@/components/points/PointBalanceCard";
import { getMyPointBalance } from "@/lib/points";

interface UserInfo {
  id: string;
  email: string;
  nickname: string;
  role: string;
  isBanned: boolean;
}

function SecurityPasskeyCard() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handlePasskeyRegister = async () => {
    if (!window.PublicKeyCredential) {
      toast("error", ko.auth.passkey_not_supported);
      return;
    }
    setLoading(true);
    try {
      const options = await apiFetch<PublicKeyCredentialCreationOptions>(
        "/auth/passkey/register/options",
        { method: "POST" }
      );
      const credential = await navigator.credentials.create({ publicKey: options });
      await apiFetch("/auth/passkey/register/complete", {
        method: "POST",
        body: JSON.stringify(credential),
      });
      toast("success", ko.auth.passkey_register_success);
    } catch (err: any) {
      toast("error", err.message || "패스키 등록에 실패했습니다");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-4">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-9 h-9 rounded-xl bg-blue-500 flex items-center justify-center">
          <IconKey size={18} className="text-white" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-gray-900">{ko.auth.passkey_security}</p>
          <p className="text-2xs text-gray-400">{ko.auth.passkey_security_desc}</p>
        </div>
      </div>
      <Button
        variant="secondary"
        size="sm"
        className="w-full"
        loading={loading}
        onClick={handlePasskeyRegister}
      >
        <IconFingerprint size={14} className="mr-1.5 text-blue-500" />
        {ko.auth.passkey_re_register}
      </Button>
    </Card>
  );
}

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<UserInfo | null>(null);
  const [pointBalance, setPointBalance] = useState(0);
  const [pointLoading, setPointLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<UserInfo>("/auth/me")
      .then(setUser)
      .catch((err) => {
        if (err instanceof ApiError && (err.status === 401 || err.status === 403)) {
          clearTokens();
          router.push("/login");
        } else {
          setLoadError(err.message || "프로필을 불러오는 중 오류가 발생했습니다");
        }
      });
    getMyPointBalance()
      .then((res) => setPointBalance(res.availablePoints))
      .catch(() => {})
      .finally(() => setPointLoading(false));
  }, [router]);

  const handleLogout = () => {
    clearTokens();
    router.push("/login");
  };

  if (loadError) {
    return (
      <main className="max-w-lg mx-auto px-4 pt-6 pb-20">
        <Card className="p-8 text-center">
          <p className="text-sm text-red-500 mb-2">오류 발생</p>
          <p className="text-xs text-gray-400 mb-4">{loadError}</p>
          <Button variant="secondary" size="sm" onClick={() => window.location.reload()}>
            다시 시도
          </Button>
        </Card>
        <BottomNav />
      </main>
    );
  }

  if (!user) {
    return (
      <main className="max-w-lg mx-auto px-4 pt-6 pb-20">
        <Skeleton className="w-32 h-7 mb-6" />
        <div className="space-y-3">
          <Skeleton className="w-full h-20 rounded-2xl" />
          <Skeleton className="w-full h-12 rounded-xl" />
        </div>
        <BottomNav />
      </main>
    );
  }

  return (
    <main className="max-w-lg mx-auto px-4 pt-6 pb-20">
      <header className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">
          {ko.nav.profile}
        </h1>
      </header>

      <Card className="p-5 mb-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-primary-100 flex items-center justify-center">
            <span className="text-lg font-bold text-primary-600">
              {user.nickname.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <p className="text-base font-semibold text-gray-900">{user.nickname}</p>
            <p className="text-xs text-gray-400">{user.email}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-400 pt-3 border-t border-gray-100">
          <span>{ko.auth.role}:</span>
          <span className="font-medium text-gray-600">{user.role}</span>
        </div>
      </Card>

      {/* ── 포인트 카드 ── */}
      <div className="mb-4">
        <PointBalanceCard balance={pointBalance} loading={pointLoading} />
      </div>

      {/* ── 싸이월드 서비스 바로가기 ── */}
      <div className="mb-4">
        <Card className="p-4">
          <p className="text-xs font-bold text-gray-500 mb-3">나의 서비스</p>
          <div className="grid grid-cols-2 gap-2">
            <Link href={`/minihome/${user.id}`}>
              <div className="flex items-center gap-2.5 bg-violet-50 rounded-xl p-3 hover:bg-violet-100 transition-colors">
                <span className="text-lg">🏡</span>
                <span className="text-xs font-semibold text-violet-700">내 미니홈피</span>
              </div>
            </Link>
            <Link href="/avatar">
              <div className="flex items-center gap-2.5 bg-pink-50 rounded-xl p-3 hover:bg-pink-100 transition-colors">
                <span className="text-lg">👤</span>
                <span className="text-xs font-semibold text-pink-700">아바타 꾸미기</span>
              </div>
            </Link>
            <Link href="/shop">
              <div className="flex items-center gap-2.5 bg-amber-50 rounded-xl p-3 hover:bg-amber-100 transition-colors">
                <span className="text-lg">🛍️</span>
                <span className="text-xs font-semibold text-amber-700">상점</span>
              </div>
            </Link>
            <Link href={`/minihome/${user.id}`}>
              <div className="flex items-center gap-2.5 bg-sky-50 rounded-xl p-3 hover:bg-sky-100 transition-colors">
                <span className="text-lg">🎨</span>
                <span className="text-xs font-semibold text-sky-700">미니홈피 꾸미기</span>
              </div>
            </Link>
          </div>
        </Card>
      </div>

      {/* ── 확장 서비스: 포인트 + 뱃지 + 미니홈피 (scaffold) ── */}
      <div className="mb-4 space-y-3">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-bold text-gray-500">내 활동</span>
          <PointBalanceBadge points={pointBalance} size="sm" />
        </div>
        <ProfileBadgeRow />
        <ProfileMinihomeButton userId={user.id} />
        <ProfileMinihomeEntry userId={user.id} />
      </div>

      {/* ── 아바타 · 꾸미기 · 보유 아이템 (scaffold) ── */}
      <div className="mb-4 space-y-3">
        <ProfileAvatarCard />
        <ProfileOwnedItemsPreview />
        <ProfileMinihomeThemePreview />
      </div>

      {/* ── 보안 설정 (패스키) ── */}
      <div className="mb-4">
        <SecurityPasskeyCard />
      </div>

      {/* ── 알림 설정 ── */}
      <div className="mb-4">
        <NotificationPreferencesCard />
      </div>

      {(user.role === "admin" || user.role === "moderator") && (
        <Link href="/admin" className="block mb-3">
          <Card hover className="p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gray-900 flex items-center justify-center">
              <IconShield size={18} className="text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">{ko.admin.title}</p>
            </div>
          </Card>
        </Link>
      )}

      <Button
        variant="danger-outline"
        size="lg"
        className="w-full mt-2"
        onClick={handleLogout}
      >
        <IconLogout size={16} className="mr-1.5" />
        {ko.auth.logout}
      </Button>

      <BottomNav />
    </main>
  );
}
