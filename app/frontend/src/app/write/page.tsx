"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import BottomNav from "@/components/BottomNav";
import Button from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import Badge, { getPostTypeBadgeVariant } from "@/components/ui/Badge";
import { useToast } from "@/components/ui/Toast";
import { apiFetch } from "@/lib/api";
import ko from "@/messages/ko.json";

const postTypes = ["review", "tip", "market", "meetup", "job"] as const;

export default function WritePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [type, setType] = useState<string>("");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [area, setArea] = useState("");
  const [tags, setTags] = useState("");
  const [imageUrls, setImageUrls] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!type) return;
    setSubmitting(true);

    const images = imageUrls
      .split("\n")
      .map((u) => u.trim())
      .filter((u) => u.length > 0);

    try {
      await apiFetch("/posts", {
        method: "POST",
        body: JSON.stringify({
          type,
          title,
          body,
          area: area || null,
          tags: tags || null,
          images: images.length > 0 ? images : null,
        }),
      });
      router.push("/");
    } catch (err: any) {
      toast("error", err.message);
      setSubmitting(false);
    }
  };

  return (
    <main className="max-w-lg mx-auto px-4 pt-6 pb-20">
      <header className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">
          {ko.nav.write}
        </h1>
      </header>

      {/* Type selector */}
      <div className="mb-6">
        <p className="text-xs font-medium text-gray-500 mb-2.5">
          {ko.post.select_type}
        </p>
        <div className="flex flex-wrap gap-2">
          {postTypes.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setType(t)}
              className={`
                px-3.5 py-2 rounded-xl text-sm font-medium transition-all duration-150
                ${
                  type === t
                    ? "bg-primary-500 text-white shadow-card"
                    : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                }
              `}
            >
              {(ko.post.types as Record<string, string>)[t]}
            </button>
          ))}
        </div>
      </div>

      {/* Form */}
      {type && (
        <form onSubmit={handleSubmit} className="space-y-4 animate-fade-in">
          <div className="flex items-center gap-2 mb-2">
            <Badge variant={getPostTypeBadgeVariant(type)}>
              {(ko.post.types as Record<string, string>)[type]}
            </Badge>
          </div>

          <Input
            placeholder={ko.post.title}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <Textarea
            placeholder={ko.post.body}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            className="min-h-[160px]"
            required
          />

          <Input
            placeholder={ko.post.area}
            value={area}
            onChange={(e) => setArea(e.target.value)}
          />

          <Input
            placeholder={`${ko.post.tags} (${ko.post.tags_hint})`}
            value={tags}
            onChange={(e) => setTags(e.target.value)}
          />

          <Textarea
            placeholder={`${ko.post.images} (${ko.post.images_hint})`}
            value={imageUrls}
            onChange={(e) => setImageUrls(e.target.value)}
            className="min-h-[80px]"
          />

          {/* Image preview */}
          {imageUrls.trim() && (
            <div className="flex gap-2 overflow-x-auto py-1">
              {imageUrls.split("\n").filter(u => u.trim()).map((url, i) => (
                <div key={i} className="flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden bg-gray-100 border border-gray-200">
                  <img
                    src={url.trim()}
                    alt=""
                    className="w-full h-full object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).src = ""; (e.target as HTMLImageElement).alt = "⚠"; }}
                  />
                </div>
              ))}
            </div>
          )}

          <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-2xs text-blue-600">
            {ko.post.contact_safe}
          </div>

          <Button
            type="submit"
            size="lg"
            className="w-full"
            loading={submitting}
            disabled={!title || !body}
          >
            {ko.post.submit}
          </Button>
        </form>
      )}

      <BottomNav />
    </main>
  );
}
