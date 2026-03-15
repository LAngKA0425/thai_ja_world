"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import ko from "@/messages/ko.json";
import { IconFeed, IconSearch, IconWrite, IconBookmark, IconProfile } from "@/components/ui/Icons";

const tabs = [
  { href: "/", label: ko.nav.feed, Icon: IconFeed },
  { href: "/search", label: ko.nav.search, Icon: IconSearch },
  { href: "/write", label: ko.nav.write, Icon: IconWrite },
  { href: "/bookmarks", label: ko.nav.bookmarks, Icon: IconBookmark },
  { href: "/profile", label: ko.nav.profile, Icon: IconProfile },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50">
      <div className="max-w-lg mx-auto px-3 pb-2">
        <div className="bg-white/95 backdrop-blur-2xl border border-gray-100/60 rounded-2xl shadow-float flex justify-around items-center h-[66px]">
          {tabs.map((t) => {
            const active = pathname === t.href;
            return (
              <Link
                key={t.href}
                href={t.href}
                className={`flex flex-col items-center justify-center gap-0.5 w-14 py-1.5 transition-all duration-200 rounded-xl ${
                  active ? "text-primary-600" : "text-gray-400 hover:text-gray-600"
                }`}
              >
                {t.href === "/write" ? (
                  <span className="flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-accent-400 via-primary-400 to-primary-600 text-white -mt-6 shadow-hero active:scale-90 transition-transform border-[3px] border-white">
                    <t.Icon size={22} className="text-white" />
                  </span>
                ) : (
                  <>
                    <div className={`relative p-1 rounded-xl transition-all duration-200 ${active ? "bg-primary-50" : ""}`}>
                      <t.Icon size={21} className={`transition-colors duration-200 ${active ? "text-primary-600" : "text-gray-400"}`} />
                    </div>
                    <span className={`text-2xs transition-all duration-200 ${active ? "font-bold text-primary-600" : "font-medium text-gray-400"}`}>
                      {t.label}
                    </span>
                    {active && (
                      <span className="w-1.5 h-1.5 rounded-full bg-accent-400 -mt-0.5 animate-pulse-soft" />
                    )}
                  </>
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
