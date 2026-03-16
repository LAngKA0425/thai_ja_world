-- =============================================
-- LocalBusiness 테이블 (로컬추천 업소)
-- Supabase SQL Editor에서 실행
-- =============================================

CREATE TABLE IF NOT EXISTS "LocalBusiness" (
  id TEXT PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  category TEXT NOT NULL,
  region TEXT NOT NULL DEFAULT '방콕',
  address TEXT,
  "priceRange" TEXT,
  description TEXT,
  discount TEXT,
  "imageUrl" TEXT,
  "imageUrls" TEXT[] DEFAULT '{}',
  emoji TEXT DEFAULT '🏪',
  phone TEXT,
  "lineId" TEXT,
  "kakaoId" TEXT,
  "mapUrl" TEXT,
  tags TEXT[] DEFAULT '{}',
  "isRecommended" BOOLEAN DEFAULT false,
  "hasDiscount" BOOLEAN DEFAULT false,
  "isActive" BOOLEAN DEFAULT true,
  "viewCount" INTEGER DEFAULT 0,
  "createdAt" TIMESTAMPTZ DEFAULT now(),
  "updatedAt" TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_lb_category ON "LocalBusiness"(category);
CREATE INDEX IF NOT EXISTS idx_lb_region ON "LocalBusiness"(region);
CREATE INDEX IF NOT EXISTS idx_lb_active ON "LocalBusiness"("isActive");

-- RLS 비활성화 (관리자가 직접 관리)
ALTER TABLE "LocalBusiness" DISABLE ROW LEVEL SECURITY;

-- 기존 하드코딩 데이터 마이그레이션
INSERT INTO "LocalBusiness" (id, name, category, region, address, "priceRange", description, discount, emoji, phone, "lineId", "mapUrl", tags, "isRecommended", "hasDiscount")
VALUES
  ('local-001', '아속 힐링 마사지', '마사지', '방콕', '아속역 3분, Sukhumvit Soi 23', '300~500 THB', '태국 전통 마사지와 아로마 오일 마사지 전문점. 한국어 소통 가능한 직원 상주. 깨끗하고 조용한 분위기.', '태자 회원 20% 할인', '💆', '+66-2-123-4567', '@asok-healing', 'https://maps.google.com/?q=Sukhumvit+Soi+23+Bangkok', ARRAY['한국어 가능', '깨끗함', '예약 가능', '주차 가능'], true, true),
  ('local-002', '반쿤매 (Ban Khun Mae)', '맛집', '방콕', '시암역 도보 5분, Siam Square Soi 8', '200~400 THB', '현지인도 줄 서서 먹는 정통 태국 가정식 레스토랑. 쏨땀, 팟타이, 똠양꿍이 특히 인기.', '태자 회원 10% 할인', '🍛', '+66-2-234-5678', '@bankhunmae', 'https://maps.google.com/?q=Siam+Square+Soi+8+Bangkok', ARRAY['현지 인기', '가정식', '태국 전통', '시암역'], true, true),
  ('local-003', '텍사스 무까따 뷔페', '무까따', '방콕', '라차다 나이트마켓 근처, Ratchadaphisek Rd', '199~299 THB', '무한리필 무까따 뷔페. 소고기, 돼지고기, 해산물 포함. 에어컨 좌석 있음.', '태자 회원 무료 음료 1잔', '🥘', '+66-2-345-6789', '@texas-mookata', 'https://maps.google.com/?q=Ratchadaphisek+Road+Bangkok', ARRAY['뷔페', '무한리필', '에어컨', '주차 가능'], false, true),
  ('local-004', '카페 드 방콕', '카페', '방콕', '통로 소이 13, Thonglor Soi 13', '80~200 THB', '인스타 감성 브런치 카페. 수제 케이크와 스페셜티 커피가 유명.', NULL, '☕', '+66-2-456-7890', '@cafe-de-bkk', 'https://maps.google.com/?q=Thonglor+Soi+13+Bangkok', ARRAY['브런치', '작업 가능', '인스타 감성', '통로'], true, false),
  ('local-005', '파타야 릴렉스 스파', '마사지', '파타야', '센트럴 파타야, 2nd Road', '250~600 THB', '파타야 최고 가성비 스파. 풋 마사지부터 풀 패키지까지. 커플 룸 보유.', '태자 회원 15% 할인', '🧖', '+66-38-123-456', '@pattaya-relax', 'https://maps.google.com/?q=Central+Pattaya+2nd+Road', ARRAY['커플 룸', '풀 패키지', '가성비', '센트럴 파타야'], false, true),
  ('local-006', '아리 세탁 & 수선', '서비스', '방콕', '아리역 1번 출구, Phahon Yothin Soi 7', '50~300 THB', '한인 운영 세탁 & 수선 전문점. 양복 수선, 드라이클리닝, 당일 세탁 가능.', '태자 회원 첫 이용 30% 할인', '👔', '+66-2-567-8901', '@ari-laundry', 'https://maps.google.com/?q=Phahon+Yothin+Soi+7+Bangkok', ARRAY['한인 운영', '당일 세탁', '양복 수선', '아리역'], true, true),
  ('local-007', '치앙마이 카오소이 쿤야이', '맛집', '치앙마이', '올드타운 내, Ratchamankha Rd', '60~150 THB', '치앙마이 현지인 맛집 1위. 카오소이가 일품.', NULL, '🍜', '+66-53-123-456', NULL, 'https://maps.google.com/?q=Ratchamankha+Road+Chiang+Mai', ARRAY['카오소이', '현지 1위', '오전 추천', '올드타운'], true, false),
  ('local-008', '푸켓 선셋 카페', '카페', '푸켓', '까론 비치, Karon Beach Rd', '100~250 THB', '까론 비치 오션뷰 카페. 선셋 시간대에 방문하면 최고.', '태자 회원 음료 1+1', '🌅', '+66-76-234-567', '@phuket-sunset', 'https://maps.google.com/?q=Karon+Beach+Phuket', ARRAY['오션뷰', '선셋', '코코넛 스무디', '까론 비치'], false, true)
ON CONFLICT (id) DO NOTHING;
