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

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [passkeyLoading, setPasskeyLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await apiFetch<{ access_token: string; refresh_token: string }>(
        "/auth/login",
        { method: "POST", body: JSON.stringify({ email, password }) }
      );
      setTokens(res.access_token, res.refresh_token);
      toast("success", ko.auth.login_success);
      router.push("/");
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handlePasskeyLogin = async () => {
    if (!window.PublicKeyCredential) {
      toast("error", ko.auth.passkey_not_supported);
      return;
    }
    setPasskeyLoading(true);
    setError("");
    try {
      const options = await apiFetch<PublicKeyCredentialRequestOptions>(
        "/auth/passkey/login/options",
        { method: "POST" }
      );
      const credential = await navigator.credentials.get({ publicKey: options });
      const res = await apiFetch<{ access_token: string; refresh_token: string }>(
        "/auth/passkey/login/complete",
        { method: "POST", body: JSON.stringify(credential) }
      );
      setTokens(res.access_token, res.refresh_token);
      toast("success", ko.auth.login_success);
      router.push("/");
    } catch (err: any) {
      setError(err.message || "패스키 로그인에 실패했습니다");
    } finally {
      setPasskeyLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col justify-center px-6">
      <div className="max-w-sm w-full mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-1">
            {ko.app_name}
          </h1>
          <p className="text-sm text-gray-400">{ko.auth.login}</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <Input
            type="email"
            placeholder={ko.auth.email}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            type="password"
            placeholder={ko.auth.password}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={error}
            required
          />

          <Button type="submit" size="lg" className="w-full" loading={loading}>
            {ko.auth.login}
          </Button>
        </form>

        {/* 구분선 */}
        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-xs text-gray-300">또는</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        {/* 패스키 로그인 */}
        <Button
          variant="secondary"
          size="lg"
          className="w-full"
          loading={passkeyLoading}
          onClick={handlePasskeyLogin}
        >
          <IconFingerprint size={18} className="mr-2 text-blue-500" />
          {ko.auth.passkey_login}
        </Button>
        <p className="text-center text-2xs text-gray-300 mt-1.5">
          {ko.auth.passkey_login_desc}
        </p>

        <p className="text-center mt-6 text-sm text-gray-400">
          {ko.auth.no_account}{" "}
          <Link href="/register" className="text-primary-500 font-medium">
            {ko.auth.register}
          </Link>
        </p>
      </div>
    </main>
  );
}
