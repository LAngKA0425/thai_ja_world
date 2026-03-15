"use client";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
}

export default function Card({ children, className = "", hover = false, onClick }: CardProps) {
  return (
    <div
      className={`
        bg-white rounded-2xl border border-gray-100 shadow-card
        ${hover ? "hover:shadow-card-hover hover:border-gray-200 transition-shadow duration-200 cursor-pointer" : ""}
        ${className}
      `}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
