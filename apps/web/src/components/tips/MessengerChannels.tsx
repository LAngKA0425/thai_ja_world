'use client'

const channels = [
  {
    id: 'kakao',
    name: '카카오톡 제보',
    description: '태국 교민 익명 제보 채널',
    buttonText: '카카오톡으로 제보하기',
    url: 'https://open.kakao.com/o/xxxxxxxx',
    icon: (
      <svg viewBox="0 0 24 24" className="w-7 h-7" fill="#3C1E1E">
        <path d="M12 3C6.48 3 2 6.54 2 10.86c0 2.78 1.86 5.22 4.65 6.6-.15.53-.96 3.41-1 3.56 0 .1.04.2.1.26.08.06.18.08.27.04.36-.06 4.14-2.72 4.65-3.06.43.06.87.1 1.33.1 5.52 0 10-3.54 10-7.86S17.52 3 12 3z" />
      </svg>
    ),
    bgGradient: 'from-[#FEE500]/20 to-[#FEE500]/5',
    borderColor: 'border-[#FEE500]/40',
    buttonBg: 'bg-[#FEE500]',
    buttonText2: 'text-[#3C1E1E]',
  },
  {
    id: 'line',
    name: 'LINE 제보',
    description: '라인으로 간편 제보',
    buttonText: 'LINE 메시지 보내기',
    url: 'https://line.me/R/ti/p/xxxxxxxx',
    icon: (
      <svg viewBox="0 0 24 24" className="w-7 h-7" fill="#06C755">
        <path d="M12 2C6.48 2 2 5.82 2 10.5c0 2.93 1.74 5.53 4.35 7.18-.06.34-.38 2.1-.4 2.27-.03.22.08.43.28.54.1.05.2.08.31.08.12 0 .24-.04.34-.1.48-.33 2.78-1.83 3.95-2.6.38.04.77.06 1.17.06 5.52 0 10-3.82 10-8.5S17.52 2 12 2zm-3.5 10.5h-2a.5.5 0 010-1h1.5V8a.5.5 0 011 0v4a.5.5 0 01-.5.5zm2.5-.5a.5.5 0 01-1 0V8a.5.5 0 011 0v4zm4.5.5h-2a.5.5 0 01-.5-.5V8a.5.5 0 011 0v3.5h1.5a.5.5 0 010 1zm3-2h-1v1a.5.5 0 01-1 0v-1h-1a.5.5 0 010-1h1V9a.5.5 0 011 0v1h1a.5.5 0 010 1z" />
      </svg>
    ),
    bgGradient: 'from-[#06C755]/15 to-[#06C755]/5',
    borderColor: 'border-[#06C755]/30',
    buttonBg: 'bg-[#06C755]',
    buttonText2: 'text-white',
  },
  {
    id: 'whatsapp',
    name: 'WhatsApp 제보',
    description: '해외 사용자용 제보 채널',
    buttonText: 'WhatsApp 열기',
    url: 'https://wa.me/66XXXXXXXXX',
    icon: (
      <svg viewBox="0 0 24 24" className="w-7 h-7" fill="#25D366">
        <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91C21.95 6.45 17.5 2 12.04 2zm5.82 13.96c-.24.68-1.41 1.3-1.95 1.38-.5.08-.96.36-3.24-.68-2.73-1.24-4.48-4.04-4.62-4.23-.13-.18-1.1-1.47-1.1-2.8 0-1.33.7-1.99.95-2.26.24-.27.53-.34.71-.34.18 0 .36 0 .51.01.18.01.41-.07.64.48.24.56.81 1.97.88 2.11.07.15.12.32.02.51-.09.18-.14.3-.28.46-.13.15-.28.34-.4.46-.13.13-.27.27-.12.53.16.27.7 1.15 1.5 1.86 1.03.92 1.9 1.2 2.17 1.34.27.13.43.11.59-.07.16-.18.68-.79.86-1.07.18-.27.36-.23.6-.14.24.1 1.54.72 1.8.86.27.13.44.2.51.31.07.11.07.63-.17 1.31z" />
      </svg>
    ),
    bgGradient: 'from-[#25D366]/15 to-[#25D366]/5',
    borderColor: 'border-[#25D366]/30',
    buttonBg: 'bg-[#25D366]',
    buttonText2: 'text-white',
  },
  {
    id: 'telegram',
    name: 'Telegram 제보',
    description: '익명 제보 및 사진 제보 가능',
    buttonText: 'Telegram 열기',
    url: 'https://t.me/thaija_world',
    icon: (
      <svg viewBox="0 0 24 24" className="w-7 h-7" fill="#229ED9">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8l-1.66 7.83c-.12.58-.44.72-.89.45l-2.46-1.81-1.19 1.14c-.13.13-.24.24-.49.24l.18-2.5 4.56-4.12c.2-.18-.04-.27-.3-.1l-5.64 3.55-2.43-.76c-.53-.17-.54-.53.11-.78l9.5-3.66c.44-.16.82.11.68.78z" />
      </svg>
    ),
    bgGradient: 'from-[#229ED9]/15 to-[#229ED9]/5',
    borderColor: 'border-[#229ED9]/30',
    buttonBg: 'bg-[#229ED9]',
    buttonText2: 'text-white',
  },
]

export function MessengerChannels() {
  return (
    <section className="px-4 py-4 max-w-3xl mx-auto">
      <h3 className="text-[14px] font-bold text-[#1F2937] mb-1">
        메신저로 빠르게 제보하기
      </h3>
      <p className="text-[11px] text-[#9CA3AF] mb-3">
        가장 편한 채널을 선택해 익명으로 제보해주세요
      </p>
      <div className="grid grid-cols-2 gap-2.5">
        {channels.map((ch) => (
          <a
            key={ch.id}
            href={ch.url}
            target="_blank"
            rel="noopener noreferrer"
            className={`bg-gradient-to-br ${ch.bgGradient} rounded-2xl p-3.5 border ${ch.borderColor} hover:shadow-md transition-all flex flex-col items-center text-center gap-2`}
          >
            <div className="w-12 h-12 rounded-full bg-white/80 flex items-center justify-center shadow-sm">
              {ch.icon}
            </div>
            <div>
              <p className="text-[12px] font-bold text-[#1F2937]">{ch.name}</p>
              <p className="text-[10px] text-[#6B7280] mt-0.5">{ch.description}</p>
            </div>
            <span className={`${ch.buttonBg} ${ch.buttonText2} text-[10px] font-bold px-3 py-1.5 rounded-full w-full`}>
              {ch.buttonText}
            </span>
          </a>
        ))}
      </div>
    </section>
  )
}
