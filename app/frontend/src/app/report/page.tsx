"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import BottomNav from "@/components/BottomNav";
import Button from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import { apiFetch } from "@/lib/api";
import ko from "@/messages/ko.json";

const reportTypes = ["incident", "scam", "tip"] as const;

export default function ReportPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [type, setType] = useState<string>("incident");
  const [content, setContent] = useState("");
  const [link, setLink] = useState("");
  const [contact, setContact] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await apiFetch("/admin/reports", {
        method: "POST",
        body: JSON.stringify({
          type,
          content,
          link: link || null,
          contact: contact || null,
        }),
      });
      toast("success", ko.report.success);
      router.push("/");
    } catch (err: any) {
      toast("error", err.message);
      setSubmitting(false);
    }
  };

  return (
    <main className="max-w-lg mx-auto px-4 pt-6 pb-20">
      <header className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">{ko.report.title}</h1>
        <p className="text-xs text-gray-400 mt-1">{ko.report_btn.desc}</p>
      </header>

      {/* Open KakaoTalk link */}
      {process.env.NEXT_PUBLIC_OPEN_KAKAO_URL && (
        <a
          href={process.env.NEXT_PUBLIC_OPEN_KAKAO_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 bg-yellow-50 border border-yellow-200 rounded-2xl p-4 mb-6 hover:bg-yellow-100 transition-colors"
        >
          <span className="text-2xl">💬</span>
          <div>
            <p className="text-sm font-semibold text-yellow-800">오픈카톡으로 제보하기</p>
            <p className="text-2xs text-yellow-600">빠른 제보는 오픈카톡을 이용해주세요</p>
          </div>
        </a>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <p className="text-xs font-medium text-gray-500 mb-2">{ko.report.type}</p>
          <div className="flex gap-2">
            {reportTypes.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setType(t)}
                className={`px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                  type === t
                    ? "bg-red-600 text-white"
                    : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                }`}
              >
                {(ko.report.types as Record<string, string>)[t]}
              </button>
            ))}
          </div>
        </div>

        <Textarea
          placeholder={ko.report.reason}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="min-h-[120px]"
          required
        />

        <Input
          placeholder={ko.report.link}
          value={link}
          onChange={(e) => setLink(e.target.value)}
        />

        <Input
          placeholder={ko.report.contact}
          value={contact}
          onChange={(e) => setContact(e.target.value)}
        />

        <Button type="submit" size="lg" className="w-full bg-red-600 hover:bg-red-700" loading={submitting} disabled={!content}>
          {ko.report.submit}
        </Button>
      </form>

      <BottomNav />
    </main>
  );
}
