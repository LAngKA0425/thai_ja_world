"use client";

import { useEffect, useMemo, useState } from "react";
import BottomNav from "@/components/BottomNav";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { createPlazaSocket, type PlazaChatMessage, type PlazaUser } from "@/lib/socket";
import { apiFetch } from "@/lib/api";
import ko from "@/messages/ko.json";

interface CurrentUser {
  id: string;
  nickname: string;
}

export default function PlazaPage() {
  const [connected, setConnected] = useState(false);
  const [me, setMe] = useState<CurrentUser | null>(null);
  const [users, setUsers] = useState<PlazaUser[]>([]);
  const [messages, setMessages] = useState<PlazaChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [error, setError] = useState("");
  const [socket, setSocket] = useState<ReturnType<typeof createPlazaSocket> | null>(null);

  useEffect(() => {
    apiFetch<CurrentUser>("/auth/me")
      .then(setMe)
      .catch(() => setError(ko.plaza.auth_required));
  }, []);

  useEffect(() => {
    if (!me) return;

    const token = localStorage.getItem("access_token");
    if (!token) {
      setError(ko.plaza.auth_required);
      return;
    }

    const s = createPlazaSocket(token);
    setSocket(s);

    s.on("connect", () => {
      setConnected(true);
      s.emit("plaza:join", {
        avatarId: "default",
        position: { x: 500, y: 400 },
      });
    });

    s.on("disconnect", () => {
      setConnected(false);
    });

    s.on("error", (payload: { message?: string }) => {
      setError(payload?.message || ko.plaza.connect_error);
    });

    s.on("plaza:user_list", (payload: { users: PlazaUser[] }) => {
      setUsers(payload.users || []);
    });

    s.on("plaza:join", (payload: PlazaUser) => {
      setUsers((prev) => {
        const filtered = prev.filter((u) => u.userId !== payload.userId);
        return [...filtered, payload];
      });
    });

    s.on("plaza:leave", (payload: { userId: string }) => {
      setUsers((prev) => prev.filter((u) => u.userId !== payload.userId));
    });

    s.on("plaza:move", (payload: PlazaUser) => {
      setUsers((prev) => prev.map((u) => (u.userId === payload.userId ? { ...u, position: payload.position } : u)));
    });

    s.on("plaza:chat", (payload: PlazaChatMessage) => {
      setMessages((prev) => [...prev.slice(-49), payload]);
    });

    return () => {
      s.emit("plaza:leave");
      s.disconnect();
    };
  }, [me]);

  const myNickname = useMemo(() => me?.nickname || "", [me]);

  const sendChat = () => {
    if (!socket || !chatInput.trim()) return;
    socket.emit("plaza:chat", { message: chatInput.trim() });
    setChatInput("");
  };

  if (error) {
    return (
      <main className="max-w-lg mx-auto px-4 pt-6 pb-20">
        <Card className="p-6">
          <p className="text-sm text-red-500">{error}</p>
        </Card>
        <BottomNav />
      </main>
    );
  }

  return (
    <main className="max-w-lg mx-auto px-4 pt-6 pb-20 space-y-4">
      <Card className="p-4">
        <p className="text-lg font-bold text-gray-900">{ko.plaza.title}</p>
        <p className="text-xs text-gray-500 mt-1">
          {connected ? ko.plaza.connected : ko.plaza.connecting} · {ko.plaza.user_count} {users.length}명
        </p>
      </Card>

      <Card className="p-4">
        <p className="text-sm font-semibold text-gray-800 mb-2">{ko.plaza.user_list}</p>
        <div className="space-y-1 max-h-40 overflow-auto">
          {users.map((u) => (
            <div key={u.userId} className="text-xs text-gray-600">
              {u.nickname} ({u.userId === me?.id ? `${myNickname} · ${ko.plaza.me}` : ko.plaza.visitor})
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-4">
        <p className="text-sm font-semibold text-gray-800 mb-2">{ko.plaza.chat}</p>
        <div className="space-y-2 max-h-56 overflow-auto mb-3">
          {messages.map((m) => (
            <div key={m.id} className="text-xs text-gray-700">
              <span className="font-semibold">{m.nickname}</span>: {m.message}
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm"
            placeholder={ko.plaza.chat_placeholder}
            onKeyDown={(e) => {
              if (e.key === "Enter") sendChat();
            }}
          />
          <Button size="sm" onClick={sendChat}>{ko.plaza.send}</Button>
        </div>
      </Card>

      <BottomNav />
    </main>
  );
}
