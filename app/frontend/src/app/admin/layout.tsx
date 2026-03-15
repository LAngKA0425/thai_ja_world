"use client";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { IconChart, IconFlag, IconHash, IconProfile, IconEyeOff, IconBack, IconSend, IconShield, IconComment } from "@/components/ui/Icons";
import ko from "@/messages/ko.json";

const adminTabs = [
  { href: "/admin", label: ko.admin.dashboard, Icon: IconChart },
  { href: "/admin/ingest", label: ko.admin.ingest, Icon: IconSend },
  { href: "/admin/scheduled", label: ko.admin.scheduled, Icon: IconShield },
  { href: "/admin/users", label: ko.admin.users, Icon: IconProfile },
  { href: "/admin/notifications", label: ko.admin.notifications, Icon: IconFlag },
  { href: "/admin/reports", label: ko.admin.reports, Icon: IconComment },
  { href: "/admin/keywords", label: ko.admin.keywords, Icon: IconHash },
  { href: "/admin/hidden", label: ko.admin.hidden, Icon: IconEyeOff },
  { href: "/admin/gamification", label: "게임화", Icon: IconChart },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top bar */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gray-900 flex items-center justify-center">
              <IconChart size={16} className="text-white" />
            </div>
            <span className="text-base font-bold text-gray-900">{ko.admin.title}</span>
          </div>
          <Link
            href="/"
            className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 transition-colors"
          >
            <IconBack size={14} />
            {ko.admin.back_to_app}
          </Link>
        </div>

        {/* Tab navigation */}
        <div className="max-w-2xl mx-auto px-4">
          <nav className="flex gap-1 overflow-x-auto no-scrollbar -mb-px">
            {adminTabs.map((tab) => {
              const active = pathname === tab.href;
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className={`
                    flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium whitespace-nowrap
                    border-b-2 transition-colors
                    ${
                      active
                        ? "border-gray-900 text-gray-900"
                        : "border-transparent text-gray-400 hover:text-gray-600"
                    }
                  `}
                >
                  <tab.Icon size={15} className={active ? "text-gray-900" : "text-gray-400"} />
                  {tab.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-2xl mx-auto px-4 py-6">{children}</main>
    </div>
  );
}
