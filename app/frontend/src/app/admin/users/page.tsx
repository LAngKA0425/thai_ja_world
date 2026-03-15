"use client";
import { useState } from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import Badge from "@/components/ui/Badge";
import EmptyState from "@/components/ui/EmptyState";
import Modal from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import { IconSearch, IconBan } from "@/components/ui/Icons";
import { apiFetch } from "@/lib/api";
import ko from "@/messages/ko.json";

interface User {
  id: string;
  email: string;
  nickname: string;
  role: string;
  status: string;
  phone: string | null;
  phone_normalized: string | null;
  duplicate_phone_flag: boolean;
  admin_note: string | null;
  is_banned: boolean;
  banned_reason: string | null;
  last_login_at: string | null;
  last_ip: string | null;
  created_at: string;
  updated_at: string;
}

export default function UsersPage() {
  const { toast } = useToast();
  const [q, setQ] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dupFilter, setDupFilter] = useState(false);

  // Detail modal
  const [detail, setDetail] = useState<User | null>(null);
  const [duplicates, setDuplicates] = useState<User[]>([]);
  const [adminNote, setAdminNote] = useState("");

  // Ban modal
  const [banTarget, setBanTarget] = useState<User | null>(null);
  const [banReason, setBanReason] = useState("");

  const searchUsers = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (q.trim()) params.set("q", q);
      if (dupFilter) params.set("duplicate_phone", "true");
      const res = await apiFetch<{ items: User[]; total: number }>(`/admin/users?${params}`);
      setUsers(res.items);
      setTotal(res.total);
    } catch {
      setUsers([]);
      setTotal(0);
    }
    setSearched(true);
    setLoading(false);
  };

  const openDetail = async (user: User) => {
    setDetail(user);
    setAdminNote(user.admin_note || "");
    if (user.phone_normalized) {
      try {
        const dups = await apiFetch<User[]>(`/admin/users/${user.id}/duplicates`);
        setDuplicates(dups);
      } catch {
        setDuplicates([]);
      }
    } else {
      setDuplicates([]);
    }
  };

  const handleSuspend = async (userId: string, suspend: boolean) => {
    try {
      await apiFetch(`/admin/users/${userId}`, {
        method: "PATCH",
        body: JSON.stringify({
          status: suspend ? "suspended" : "active",
          is_banned: suspend,
          banned_reason: suspend ? banReason : null,
        }),
      });
      toast("success", suspend ? "정지됨" : "해제됨");
      setBanTarget(null);
      setBanReason("");
      searchUsers();
      setDetail(null);
    } catch (err: any) {
      toast("error", err.message);
    }
  };

  const handleSaveNote = async () => {
    if (!detail) return;
    try {
      await apiFetch(`/admin/users/${detail.id}`, {
        method: "PATCH",
        body: JSON.stringify({ admin_note: adminNote }),
      });
      toast("success", "메모 저장됨");
    } catch (err: any) {
      toast("error", err.message);
    }
  };

  const isNew24h = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    return diff < 24 * 60 * 60 * 1000;
  };

  return (
    <div>
      <h2 className="text-lg font-bold text-gray-900 mb-1">{ko.admin.users}</h2>
      <p className="text-xs text-gray-400 mb-4">{ko.admin.users_desc}</p>

      {/* Search bar */}
      <form onSubmit={searchUsers} className="mb-4">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <IconSearch size={18} className="text-gray-400" />
            </div>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={ko.admin.search_user}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 focus:bg-white transition-colors"
            />
          </div>
          <Button type="submit" size="md">{ko.common.search}</Button>
        </div>
      </form>

      {/* Filter */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => { setDupFilter(!dupFilter); }}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            dupFilter ? "bg-red-600 text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"
          }`}
        >
          {ko.admin.dup_phone}만
        </button>
        <button
          onClick={() => { setQ(""); setDupFilter(false); searchUsers(); }}
          className="px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-100 text-gray-500 hover:bg-gray-200"
        >
          전체 보기
        </button>
        {searched && <span className="text-xs text-gray-400 self-center ml-auto">총 {total}명</span>}
      </div>

      {loading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-card p-4 animate-skeleton">
              <div className="h-5 bg-gray-100 rounded w-1/3 mb-2" />
              <div className="h-4 bg-gray-100 rounded w-2/3" />
            </div>
          ))}
        </div>
      )}

      {!loading && searched && users.length === 0 && (
        <EmptyState icon="user" title={ko.admin.no_users} />
      )}

      <div className="space-y-3">
        {users.map((u) => (
          <Card key={u.id} className="p-4 cursor-pointer hover:shadow-card-hover transition-shadow" onClick={() => openDetail(u)}>
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="text-sm font-semibold text-gray-900">{u.nickname}</span>
                  {u.duplicate_phone_flag && <Badge variant="danger">{ko.admin.dup_phone}</Badge>}
                  {isNew24h(u.created_at) && <Badge variant="warning">{ko.admin.new_24h}</Badge>}
                  {u.is_banned && <Badge variant="danger">{ko.admin.suspended}</Badge>}
                  <Badge variant={u.role === "admin" ? "success" : "default"}>{u.role}</Badge>
                </div>
                <p className="text-xs text-gray-400">{u.email}</p>
                {u.phone && <p className="text-xs text-gray-400">{u.phone}</p>}
              </div>
              <div className="text-right">
                <p className="text-2xs text-gray-300">{new Date(u.created_at).toLocaleDateString("ko")}</p>
                {u.last_login_at && (
                  <p className="text-2xs text-gray-300">최근: {new Date(u.last_login_at).toLocaleDateString("ko")}</p>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Detail Modal */}
      <Modal
        open={!!detail}
        onClose={() => setDetail(null)}
        title={detail?.nickname || ""}
        actions={
          <>
            <Button variant="secondary" size="md" className="flex-1" onClick={() => setDetail(null)}>
              닫기
            </Button>
            {detail && !detail.is_banned ? (
              <Button variant="danger" size="md" className="flex-1" onClick={() => { setBanTarget(detail); setDetail(null); }}>
                {ko.admin.ban_user}
              </Button>
            ) : detail && (
              <Button variant="primary" size="md" className="flex-1" onClick={() => handleSuspend(detail.id, false)}>
                {ko.admin.unban_user}
              </Button>
            )}
          </>
        }
      >
        {detail && (
          <div className="space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-2">
              <div><span className="text-gray-400">이메일</span><p className="text-gray-900">{detail.email}</p></div>
              <div><span className="text-gray-400">전화번호</span><p className="text-gray-900">{detail.phone || "-"}</p></div>
              <div><span className="text-gray-400">상태</span><p className="text-gray-900">{detail.status}</p></div>
              <div><span className="text-gray-400">역할</span><p className="text-gray-900">{detail.role}</p></div>
              <div><span className="text-gray-400">가입일</span><p className="text-gray-900">{new Date(detail.created_at).toLocaleString("ko")}</p></div>
              <div><span className="text-gray-400">최근 로그인</span><p className="text-gray-900">{detail.last_login_at ? new Date(detail.last_login_at).toLocaleString("ko") : "-"}</p></div>
              <div><span className="text-gray-400">최근 IP</span><p className="text-gray-900">{detail.last_ip || "-"}</p></div>
            </div>

            {duplicates.length > 0 && (
              <div className="bg-red-50 border border-red-100 rounded-xl p-3">
                <p className="text-xs font-semibold text-red-700 mb-2">동일 번호 계정 ({duplicates.length}개)</p>
                {duplicates.map((d) => (
                  <div key={d.id} className="flex justify-between py-1 border-b border-red-100 last:border-0">
                    <span className="text-red-800">{d.nickname} ({d.email})</span>
                    <span className="text-red-400">{d.status}</span>
                  </div>
                ))}
              </div>
            )}

            <div>
              <p className="text-gray-400 mb-1">관리자 메모</p>
              <Textarea
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                className="min-h-[60px]"
                placeholder="관리자 메모 입력..."
              />
              <Button size="sm" variant="ghost" className="mt-1" onClick={handleSaveNote}>메모 저장</Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Ban Modal */}
      <Modal
        open={!!banTarget}
        onClose={() => { setBanTarget(null); setBanReason(""); }}
        title={ko.admin.ban_user}
        actions={
          <>
            <Button variant="secondary" size="md" className="flex-1" onClick={() => { setBanTarget(null); setBanReason(""); }}>
              {ko.common.cancel}
            </Button>
            <Button variant="danger" size="md" className="flex-1" onClick={() => banTarget && handleSuspend(banTarget.id, true)}>
              {ko.admin.ban_user}
            </Button>
          </>
        }
      >
        <p className="mb-3">{ko.admin.confirm_ban}</p>
        <Input
          placeholder={ko.admin.ban_reason_placeholder}
          value={banReason}
          onChange={(e) => setBanReason(e.target.value)}
        />
      </Modal>
    </div>
  );
}
