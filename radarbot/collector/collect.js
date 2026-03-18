/**
 * 레이더봇 수집기 - 공지/주의/위험 항목 수집
 *
 * 상태머신:
 *   detected → classified → pending_review → approved → published
 *   실패: classify_failed / publish_failed
 *
 * 수집 대상 (예시 - 실제 소스로 교체):
 *   - 태국 경찰청 공지 RSS
 *   - 대사관 안전공지 RSS
 *   - 교민 제보 (직접 입력, 별도 UI)
 *
 * DB 테이블: radar_items
 *   id, source_type, source_url, original_title, original_body,
 *   detected_at, language, status, created_at
 */
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
  console.error('[치명적] SUPABASE_URL 또는 SUPABASE_SERVICE_KEY 가 설정되지 않았습니다.');
  process.exit(1);
}

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// 레이더봇 소스 (기본 예시 - 실제 운영 시 DB의 radar_sources 테이블로 관리)
const DEFAULT_SOURCES = [
  // { name: '주태국 한국대사관', rss_url: 'https://...', type: 'embassy' },
  // { name: '태국경찰청', rss_url: 'https://...', type: 'police' },
];

async function getActiveSources() {
  const { data, error } = await supabase
    .from('radar_sources')
    .select('*')
    .eq('is_active', true)
    .order('priority', { ascending: true });

  if (error) {
    console.warn(`[소스 조회 실패] ${error.message} - radar_sources 테이블에 소스를 추가하세요.`);
    return DEFAULT_SOURCES;
  }
  if (!data || data.length === 0) {
    console.warn('[소스 없음] radar_sources 테이블에 활성 소스가 없습니다. is_active=true 인 소스를 추가하세요.');
  }
  return data || DEFAULT_SOURCES;
}

async function main() {
  console.log('=== 레이더봇 수집 시작 ===');

  const sources = await getActiveSources();
  console.log(`소스 수: ${sources.length}`);

  if (sources.length === 0) {
    console.log('활성 소스 없음. radar_sources 테이블에 소스를 추가하세요.');
    return;
  }

  // TODO: 각 소스 RSS 수집 구현 (newsbot/collector/collect.js 패턴 참고)
  console.log('레이더봇 수집기 구현 예정');
}

main().catch(err => {
  console.error('[레이더봇 수집 오류]', err);
  process.exit(1);
});
