"use client";

/**
 * HeroMotionLayer
 * ───────────────
 * 히어로 배경 위에 얹는 반투명 floating blob/orb 레이어.
 * CSS keyframe 기반 – JS 타이머 없이 GPU 가속만 사용.
 * 모바일에서도 프레임 드랍 없이 부드럽게 동작.
 */
export default function HeroMotionLayer() {
  return (
    <div className="hero-motion-layer absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {/* Orb 1 – 큰 민트빛 blob, 좌상→우하 천천히 떠다님 */}
      <div className="hero-orb hero-orb-1" />
      {/* Orb 2 – 중간 크기 엷은 흰색 orb */}
      <div className="hero-orb hero-orb-2" />
      {/* Orb 3 – 작은 accent 빛 orb, 우상단 */}
      <div className="hero-orb hero-orb-3" />
      {/* Shimmer sweep – 아주 미세한 빛 줄기가 대각선으로 지나감 */}
      <div className="hero-shimmer" />
    </div>
  );
}
