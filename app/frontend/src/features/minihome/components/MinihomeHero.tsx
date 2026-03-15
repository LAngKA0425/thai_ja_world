"use client";

interface MinihomeHeroProps {
  title: string;
  introText?: string;
  skinId?: string;
}

export default function MinihomeHero({ title, introText }: MinihomeHeroProps) {
  return (
    <div className="bg-gradient-to-b from-blue-50 to-white rounded-2xl p-6 text-center">
      <h1 className="text-lg font-bold text-gray-800">{title}</h1>
      {introText && (
        <p className="text-sm text-gray-500 mt-1">{introText}</p>
      )}
    </div>
  );
}
