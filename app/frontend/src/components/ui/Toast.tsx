"use client";
import { useEffect, useState, createContext, useContext, useCallback } from "react";

type ToastType = "success" | "error" | "info";

interface ToastMessage {
  id: number;
  type: ToastType;
  text: string;
}

interface ToastContextType {
  toast: (type: ToastType, text: string) => void;
}

const ToastContext = createContext<ToastContextType>({ toast: () => {} });

export function useToast() {
  return useContext(ToastContext);
}

let toastId = 0;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [messages, setMessages] = useState<ToastMessage[]>([]);

  const toast = useCallback((type: ToastType, text: string) => {
    const id = ++toastId;
    setMessages((prev) => [...prev, { id, type, text }]);
  }, []);

  const remove = useCallback((id: number) => {
    setMessages((prev) => prev.filter((m) => m.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 w-[calc(100%-2rem)] max-w-sm pointer-events-none">
        {messages.map((m) => (
          <ToastItem key={m.id} message={m} onDismiss={remove} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastItem({ message, onDismiss }: { message: ToastMessage; onDismiss: (id: number) => void }) {
  useEffect(() => {
    const timer = setTimeout(() => onDismiss(message.id), 2500);
    return () => clearTimeout(timer);
  }, [message.id, onDismiss]);

  const bgMap: Record<ToastType, string> = {
    success: "bg-gray-900",
    error: "bg-danger-600",
    info: "bg-gray-900",
  };

  return (
    <div
      className={`
        ${bgMap[message.type]} text-white text-sm px-4 py-2.5
        rounded-xl shadow-toast animate-slide-up pointer-events-auto
      `}
    >
      {message.text}
    </div>
  );
}
