"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Button from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import { apiFetch, setTokens } from "@/lib/api";
import { IconFingerprint } from "@/components/ui/Icons";
import ko from "@/messages/ko.json";

type Step = "form" | "complete";

export default function RegisterPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [nickname, setNickname] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<Step>("form");
  const [passkeyLoading, setPasskeyLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await apiFetch("/auth/register", {
        method: "POST",
        body: JSON.stringify({ email, nickname, password, phone: phone || null }),
      });
      toast("success", ko.auth.register_success);
      // Auto login
      const tokens = await apiFetch<{ access_token: string; refresh_token: string }>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      setTokens(tokens.access_token, tokens.refresh_token);
      // Fetch user id for minihome link
      try {
        const me = await apiFetch<{ id: string }>("/auth/me");
        setUserId(me.id);
      } catch {}
      setStep("complete");
    } catch (err: any) {
      toast("error", err.message);
      setLoading(false);
    }
  };

  const handlePasskeyRegister = async () => {
    if (!window.PublicKeyCredential) {
      toast("error", ko.auth.passkey_not_supported);
      return;
    }
    setPasskeyLoading(true);
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
      router.push("/profile");
    } catch (err: any) {
      toast("error", err.message || "패스키 등록에 실패했습니다");
    } finally {
      setPasskeyLoading(false);
    }
  };

  if (step === "complete") {
    return (
      <main className="max-w-sm mx-auto px-4 pt-16 pb-20">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">🎉</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {ko.auth.register_complete_title}
          </h1>
          <p className="text-sm text-gray-500">
            {ko.auth.register_complete_desc}
          </p>
        </div>

        {/* 패스키 등록 유도 */}
        <div className="rounded-2xl border border-blue-200 bg-blue-50/60 p-5 mb-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center">
              <IconFingerprint size={20} className="text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">
                {ko.auth.passkey_register}
              </p>
              <p className="text-xs text-gray-400">
                {ko.auth.passkey_register_desc}
              </p>
            </div>
          </div>
          <Button
            size="lg"
            className="w-full"
            loading={passkeyLoading}
            onClick={handlePasskeyRegister}
          >
            <IconFingerprint size={16} className="mr-1.5" />
            {ko.auth.passkey_register}
          </Button>
        </div>

        <button
          onClick={() => router.push("/profile")}
          className="w-full text-center text-sm text-gray-400 hover:text-gray-600 py-2 mb-3"
        >
          {ko.auth.passkey_register_skip}
        </button>

        {/* 미니홈피 / 프로필 진입 */}
        <div className="space-y-2">
          <button
            onClick={() => router.push(userId ? `/minihome/${userId}` : "/profile")}
            className="w-full flex items-center gap-3 p-4 rounded-2xl bg-gradient-to-r from-sky-50 to-blue-50/80 border border-sky-200/40 hover:shadow-sm transition-all group"
          >
            <span className="text-lg">🏠</span>
            <span className="text-sm font-semibold text-gray-900 flex-1 text-left">
              {ko.auth.go_to_minihome}
            </span>
            <span className="text-gray-300 group-hover:translate-x-1 transition-transform">›</span>
          </button>
          <button
            onClick={() => router.push("/profile")}
            className="w-full flex items-center gap-3 p-4 rounded-2xl bg-gray-50 border border-gray-100 hover:shadow-sm transition-all group"
          >
            <span className="text-lg">👤</span>
            <span className="text-sm font-semibold text-gray-900 flex-1 text-left">
              {ko.auth.go_to_profile}
            </span>
            <span className="text-gray-300 group-hover:translate-x-1 transition-transform">›</span>
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-sm mx-auto px-4 pt-16 pb-20">
      <div className="text-center mb-8">
        <div className="flex items-baseline justify-center gap-1 mb-2">
          <span className="text-3xl font-black text-accent-500">태</span>
          <span className="text-3xl font-black text-primary-500">자</span>
        </div>
        <p className="text-xs text-gray-400">{ko.brand.sub_copy}</p>
      </div>

      <h1 className="text-xl font-bold text-gray-900 mb-6">{ko.auth.register}</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          type="email"
          placeholder={ko.auth.email}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Input
          placeholder={ko.auth.nickname}
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          required
        />
        <Input
          type="password"
          placeholder={ko.auth.password}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <Input
          type="tel"
          placeholder={ko.auth.phone}
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
        <Button type="submit" size="lg" className="w-full" loading={loading}>
          {ko.auth.register}
        </Button>
      </form>

      <p className="text-center text-xs text-gray-400 mt-6">
        {ko.auth.has_account}{" "}
        <Link href="/login" className="text-primary-500 font-medium">
          {ko.auth.login}
        </Link>
      </p>
    </main>
  );
}
