-- 태자월드 뉴스봇 게시글 삽입 (2026-03-16)
INSERT INTO "CommunityPost" ("id", "authorId", "category", "title", "content", "isAnonymous", "moderationStatus", "viewCount", "commentCount", "createdAt", "updatedAt")
VALUES
  (
    'news-weather-20260316',
    'newsbot-system',
    'briefing',
    '🌡️ 3월 16일 방콕 날씨: 최고 34°C, 건조하고 무더위 지속',
    E'오늘 방콕 날씨는 최고 34°C, 최저 26°C로 무더운 하루가 예상됩니다.\n\n3월~5월은 태국의 한여름으로, 건기이면서 최고 기온을 기록하는 시기입니다. 태국 기상청에 따르면 올해는 평년보다 높은 36~37°C가 전국 평균이며, 4~5월 매홍손·람빵 등 일부 지역에서는 42°C 이상 폭염도 예상됩니다.\n\n외출 시 자외선 차단과 충분한 수분 섭취를 권장합니다.',
    false,
    'SAFE',
    328,
    12,
    NOW(),
    NOW()
  ),
  (
    'news-exchange-20260316',
    'newsbot-system',
    'briefing',
    '💱 오늘의 환율: 1바트 = 46.35원 (3월 16일 기준)',
    E'2026년 3월 16일 기준 태국 바트/원화 환율 정보입니다.\n\n• 매매기준율: 46.35원\n• 송금 보내실 때: 47.03원\n• 송금 받으실 때: 46.11원\n• 현찰 사실 때: 47.50원\n• 현찰 파실 때: 45.64원\n\n최근 바트화는 안정세를 유지하고 있으며, 환전 시 은행별 우대율을 비교하시는 것을 추천합니다.',
    false,
    'SAFE',
    512,
    23,
    NOW() - INTERVAL '1 hour',
    NOW() - INTERVAL '1 hour'
  ),
  (
    'news-election-20260316',
    'newsbot-system',
    'briefing',
    '🗳️ 2026 태국 총선 결과: 품짜이타이당 193석 제1당',
    E'2026년 태국 조기총선 결과가 확정되었습니다.\n\n• 품짜이타이당(Bhumjaithai): 193석 — 제1당\n• 국민당(People''s Party): 118석\n• 프아타이당(Pheu Thai): 74석\n• 끌탐당(Klatham): 58석\n\n패통탄 친나왓 전 총리가 헌법재판소 판결로 총리직을 상실한 이후 실시된 선거로, 품짜이타이당 아누틴 대표를 중심으로 한 새 내각 구성이 진행 중입니다.\n\n한인 사회에서는 새 정부의 비자 정책 및 외국인 투자 규제 변화에 주목하고 있습니다.',
    false,
    'SAFE',
    1842,
    67,
    NOW() - INTERVAL '2 hours',
    NOW() - INTERVAL '2 hours'
  ),
  (
    'news-economy-20260316',
    'newsbot-system',
    'local_tip',
    '📊 태국 2026 GDP 성장률 2.0% 전망, 관광업 회복세',
    E'태국 재무부가 2026년 실질 GDP 성장률을 2.0%로 전망했습니다.\n\n관광업 회복세와 민간 투자가 성장을 견인할 것으로 분석되며, 정부는 3% 이상 달성을 목표로 EV·데이터센터·반도체 등 첨단 산업 육성에 집중하고 있습니다.\n\n소비자신뢰지수는 1월 52.8로 전월(51.9) 대비 상승했으며, 2~3월 추가 개선 가능성도 있습니다.\n\nARAYA 산업단지 프로젝트(200억 바트 규모)도 태국 최초 복합형 산업·물류 허브로 주목받고 있습니다.',
    false,
    'SAFE',
    723,
    31,
    NOW() - INTERVAL '3 hours',
    NOW() - INTERVAL '3 hours'
  ),
  (
    'news-health-20260316',
    'newsbot-system',
    'local_tip',
    '🥤 태국 주요 음료 체인, 새 당도 표준 도입 합의',
    E'태국 보건부와 9개 주요 음료 체인이 설탕 소비를 줄이기 위한 새로운 당도 표준 도입에 합의했습니다.\n\n비만 및 비감염성 질환 위험을 낮추기 위한 조치로, 카페·음료 매장에서 판매되는 음료의 기본 당도가 단계적으로 낮아질 예정입니다.\n\n태국에서 음료를 주문할 때 당도 선택에 변화가 있을 수 있으니 참고하세요.',
    false,
    'SAFE',
    445,
    18,
    NOW() - INTERVAL '4 hours',
    NOW() - INTERVAL '4 hours'
  )
ON CONFLICT ("id") DO UPDATE SET
  "title" = EXCLUDED."title",
  "content" = EXCLUDED."content",
  "viewCount" = EXCLUDED."viewCount",
  "commentCount" = EXCLUDED."commentCount",
  "updatedAt" = NOW();
