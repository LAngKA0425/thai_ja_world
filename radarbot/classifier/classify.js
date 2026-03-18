/**
 * 레이더봇 분류기 - 수집된 항목을 위험도/카테고리로 분류
 *
 * 위험도: critical / high / medium / low
 * 카테고리: safety / scam / weather / visa / traffic / general
 *
 * 분류 후 상태: detected → classified → pending_review
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

// 키워드 기반 위험도 분류 (Ollama 없이도 동작)
const SEVERITY_KEYWORDS = {
  critical: ['사망', 'death', 'killed', 'emergency', '긴급', '폭발', 'explosion', '테러', 'terror'],
  high: ['체포', 'arrest', '사기', 'scam', 'fraud', '홍수', 'flood', '경보', 'warning', '주의보'],
  medium: ['주의', 'caution', '혼잡', 'congestion', '지연', 'delay', '확인', 'check'],
};

const CATEGORY_KEYWORDS = {
  safety: ['safety', 'security', 'danger', '안전', '위험', '경계'],
  scam: ['scam', 'fraud', '사기', '피해', 'victim'],
  weather: ['weather', 'flood', 'storm', 'rain', '날씨', '홍수', '태풍'],
  visa: ['visa', 'immigration', 'overstay', '비자', '체류'],
  traffic: ['traffic', 'road', 'accident', 'bts', 'mrt', '교통', '사고'],
};

function classify(title, body) {
  const text = `${title} ${body}`.toLowerCase();

  let severity = 'low';
  for (const [level, keywords] of Object.entries(SEVERITY_KEYWORDS)) {
    if (keywords.some(k => text.includes(k))) {
      severity = level;
      break;
    }
  }

  let category = 'general';
  for (const [cat, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some(k => text.includes(k))) {
      category = cat;
      break;
    }
  }

  return { severity, category };
}

async function main() {
  console.log('=== 레이더봇 분류 시작 ===');

  // radar_items 중 status = 'detected' 인 것 조회
  const { data: items, error } = await supabase
    .from('radar_items')
    .select('*')
    .eq('pipeline_status', 'detected')
    .order('detected_at', { ascending: true })
    .limit(50);

  if (error) {
    console.error(`[조회 실패] ${error.message}`);
    process.exit(1);
  }

  console.log(`분류 대상: ${(items || []).length}건`);

  for (const item of items || []) {
    const { severity, category } = classify(item.original_title || '', item.original_body || '');

    const { error: updateErr } = await supabase
      .from('radar_items')
      .update({
        pipeline_status: 'classified',
        review_status: 'pending_review',
        severity,
        category,
        classified_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', item.id);

    if (updateErr) {
      console.error(`[분류 저장 실패] ${item.id}: ${updateErr.message}`);
      await supabase.from('bot_job_logs').insert({
        bot_type: 'radarbot',
        ref_id: item.id,
        stage: 'classify_failed',
        status: 'failed',
        error_message: updateErr.message.substring(0, 500),
        created_at: new Date().toISOString(),
      });
    } else {
      console.log(`  [분류 완료] ${item.original_title?.substring(0, 50)} → ${severity}/${category}`);
    }
  }

  console.log('=== 레이더봇 분류 완료 ===');
}

main().catch(err => {
  console.error('[레이더봇 분류 오류]', err);
  process.exit(1);
});
