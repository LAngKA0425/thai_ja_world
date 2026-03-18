/**
 * Ollama AI 파이프라인 - 2단계 전략
 *
 * Stage 1 (번역 모델): 영문/태국어 원문 → 한국어 번역
 *   권장 모델: OLLAMA_MODEL (기본: llama3.1:8b)
 *   - 번역 품질 우선, temperature 낮게(0.1~0.2)
 *
 * Stage 2 (카피/요약 모델): 번역 결과 → 제목 재작성 + 요약 + 한줄 브리핑
 *   권장 모델: OLLAMA_COPY_MODEL (기본: OLLAMA_MODEL 동일 모델 fallback)
 *   - 창의성 허용, temperature 0.4~0.6
 *   - 단일 모델 운영 시 OLLAMA_COPY_MODEL 을 비워두면 자동으로 동일 모델 사용
 *
 * 상태머신:
 *   processed_news: fetched → processed
 *   summarize 파이프라인: processed → translated → summarized → pending_review
 *   관리자 액션: pending_review → approved / hold
 *   publish: approved → published
 *   실패: * → translate_failed / summarize_failed / publish_failed
 *
 * Fallback 전략:
 *   - 번역 실패: 원문 title/body 그대로 사용, 상태 translate_failed 기록
 *   - 카피 실패: 번역된 제목 그대로 사용, 상태 summarize_failed 기록
 *   - Ollama 무응답: 전체 failed 상태 기록 후 다음 기사로 진행 (파이프라인 중단 없음)
 */
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

// ── Supabase ─────────────────────────────────────────────
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
  console.error('[치명적] SUPABASE_URL 또는 SUPABASE_SERVICE_KEY 가 설정되지 않았습니다. 종료합니다.');
  process.exit(1);
}

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// ── Ollama 설정 ───────────────────────────────────────────
const OLLAMA_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';

// Stage 1: 번역 모델 (정확성 우선 - llama3.1:8b 또는 qwen2.5:7b 권장)
const OLLAMA_TRANSLATE_MODEL = process.env.OLLAMA_TRANSLATE_MODEL || process.env.OLLAMA_MODEL || 'llama3.1:8b';

// Stage 2: 카피/요약 모델 (창의성 허용 - 동일 모델도 가능, gemma2:9b 권장)
const OLLAMA_COPY_MODEL = process.env.OLLAMA_COPY_MODEL || OLLAMA_TRANSLATE_MODEL;

const OLLAMA_TIMEOUT_MS = parseInt(process.env.OLLAMA_TIMEOUT_MS || '60000');

// ── Ollama 호출 공통 ─────────────────────────────────────
async function callOllama(model, prompt, temperature = 0.3, maxTokens = 600) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), OLLAMA_TIMEOUT_MS);

  try {
    const res = await fetch(`${OLLAMA_URL}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        model,
        prompt,
        stream: false,
        options: {
          temperature,
          num_predict: maxTokens,
          repeat_penalty: 1.1
        }
      })
    });

    if (!res.ok) {
      throw new Error(`Ollama HTTP ${res.status}: ${res.statusText}`);
    }

    const json = await res.json();
    const text = (json.response || '').trim();
    if (!text) throw new Error('Ollama 응답이 비어있습니다');
    return text;
  } finally {
    clearTimeout(timer);
  }
}

// ── 상태머신 헬퍼 ─────────────────────────────────────────
async function markSummaryFailed(processedNewsId, stage, errorMessage) {
  await supabase
    .from('bot_job_logs')
    .insert({
      bot_type: 'newsbot',
      ref_id: processedNewsId,
      stage,
      status: 'failed',
      error_message: errorMessage.substring(0, 500),
      created_at: new Date().toISOString()
    })
    .then(({ error }) => {
      if (error) console.error(`[로그 저장 실패] ${error.message}`);
    });
}

async function logSuccess(processedNewsId, stage, notes = '') {
  await supabase
    .from('bot_job_logs')
    .insert({
      bot_type: 'newsbot',
      ref_id: processedNewsId,
      stage,
      status: 'success',
      notes: notes.substring(0, 300),
      created_at: new Date().toISOString()
    })
    .then(({ error }) => {
      if (error) console.error(`[로그 저장 실패] ${error.message}`);
    });
}

// ── Stage 1: 번역 프롬프트 ────────────────────────────────
function buildTranslatePrompt(title, body, srcLang) {
  const langLabel = srcLang === 'th' ? '태국어' : '영어';
  return `당신은 태국 현지 교민 커뮤니티용 전문 번역가입니다.
아래 ${langLabel} 뉴스를 자연스러운 한국어로 번역하세요.

규칙:
- 직역투 금지. 교민이 읽는 커뮤니티 기사처럼 자연스럽게.
- 고유명사(지명, 인명)는 음차 표기 후 영문을 괄호에 병기.
- 의미를 바꾸거나 없는 내용을 추가하지 말 것.
- 번역문만 출력하고 설명, 주석, 서문을 붙이지 말 것.

[제목]
${title}

[본문]
${(body || '').substring(0, 2000)}

번역:`;
}

function parseTranslateResponse(raw) {
  if (!raw) return null;
  const lines = raw.split('\n').map(l => l.trim()).filter(Boolean);
  // 첫 줄을 제목, 나머지를 본문으로 분리
  const translatedTitle = lines[0] || '';
  const translatedBody = lines.slice(1).join('\n') || lines[0] || '';
  return { translatedTitle, translatedBody };
}

// ── Stage 2: 카피/요약 프롬프트 ──────────────────────────
function buildCopyPrompt(koTitle, koBody) {
  return `당신은 태국 관련 교민 뉴스 에디터입니다.
아래 한국어 번역 기사를 바탕으로 게시용 콘텐츠를 작성하세요.

[번역 제목]
${koTitle}

[번역 본문]
${(koBody || '').substring(0, 1800)}

다음 형식을 정확히 지켜 출력하세요.
HEADLINE: (클릭을 유도하되 과장·허위·선정성 없이, 30자 이내 한국어 제목)
BRIEFING: (홈 카드에 올릴 한 문장 브리핑, 40자 이내. 핵심만. 마침표로 끝낼 것.)
LINE1: (요약 첫째 줄, 60자 이내)
LINE2: (요약 둘째 줄, 60자 이내)
LINE3: (요약 셋째 줄, 60자 이내)
KAKAO: (카카오톡 공유용 짧은 문구, 20자 이내)`;
}

function parseCopyResponse(raw, fallbackTitle) {
  if (!raw) return null;
  const lines = raw.split('\n').map(l => l.trim()).filter(Boolean);

  const pick = (prefix) => {
    const line = lines.find(l => l.startsWith(prefix));
    return line ? line.replace(prefix, '').trim() : '';
  };

  const headline = pick('HEADLINE:') || fallbackTitle;
  const briefing = pick('BRIEFING:') || headline.substring(0, 40);
  const line1 = pick('LINE1:');
  const line2 = pick('LINE2:');
  const line3 = pick('LINE3:');
  const kakao = pick('KAKAO:') || headline.substring(0, 20);

  const summaryLines = [line1, line2, line3].filter(Boolean);

  // 파싱 실패 시 본문 앞부분 fallback
  if (summaryLines.length === 0) {
    const bodyLines = lines.filter(l =>
      !l.startsWith('HEADLINE:') && !l.startsWith('BRIEFING:') &&
      !l.startsWith('LINE') && !l.startsWith('KAKAO:')
    );
    summaryLines.push(...bodyLines.slice(0, 3));
  }

  return {
    headline: headline || '(제목 없음)',
    briefing: briefing || '(브리핑 없음)',
    summaryBody: summaryLines.join('\n') || '(요약 없음)',
    kakao: kakao || headline.substring(0, 20)
  };
}

// ── 처리 대상 조회 ────────────────────────────────────────
async function getUnsummarized() {
  const { data: processed } = await supabase
    .from('processed_news')
    .select('*')
    .eq('is_duplicate', false)
    .order('processed_at', { ascending: true })
    .limit(100);

  const { data: summarized } = await supabase
    .from('summaries')
    .select('processed_news_id');

  const summarizedIds = new Set((summarized || []).map(s => s.processed_news_id));
  return (processed || []).filter(p => !summarizedIds.has(p.id)).slice(0, 20);
}

// ── 기사 1건 처리 ─────────────────────────────────────────
async function processArticle(article) {
  const articleId = article.id;
  const originalTitle = article.title || '';
  const originalBody = article.body_text || '';
  const srcLang = article.language || 'en';

  console.log(`\n[처리] ${originalTitle.substring(0, 60)}...`);

  // ── Stage 1: 번역 ──────────────────────────────────────
  let koTitle = originalTitle;
  let koBody = originalBody;
  let translateFailed = false;

  if (srcLang !== 'ko') {
    try {
      const translatePrompt = buildTranslatePrompt(originalTitle, originalBody, srcLang);
      const rawTranslation = await callOllama(OLLAMA_TRANSLATE_MODEL, translatePrompt, 0.15, 800);
      const parsed = parseTranslateResponse(rawTranslation);
      if (parsed && parsed.translatedTitle) {
        koTitle = parsed.translatedTitle;
        koBody = parsed.translatedBody || rawTranslation;
        console.log(`  [번역 완료] ${koTitle.substring(0, 50)}`);
        await logSuccess(articleId, 'translate', `model=${OLLAMA_TRANSLATE_MODEL}`);
      } else {
        throw new Error('번역 응답 파싱 실패');
      }
    } catch (err) {
      translateFailed = true;
      console.warn(`  [번역 실패 - 원문 fallback] ${err.message}`);
      await markSummaryFailed(articleId, 'translate_failed', err.message);
      // 원문으로 계속 진행 (파이프라인 중단 없음)
    }
  }

  // ── Stage 2: 카피/요약 ────────────────────────────────
  let copyResult = null;
  let copyFailed = false;

  try {
    const copyPrompt = buildCopyPrompt(koTitle, koBody);
    const rawCopy = await callOllama(OLLAMA_COPY_MODEL, copyPrompt, 0.5, 600);
    copyResult = parseCopyResponse(rawCopy, koTitle);
    if (!copyResult || !copyResult.headline) throw new Error('카피 파싱 실패');
    console.log(`  [카피 완료] ${copyResult.headline.substring(0, 50)}`);
    await logSuccess(articleId, 'summarize', `model=${OLLAMA_COPY_MODEL}`);
  } catch (err) {
    copyFailed = true;
    console.warn(`  [카피 실패 - 보수적 fallback] ${err.message}`);
    await markSummaryFailed(articleId, 'summarize_failed', err.message);
    // 보수적 fallback: 번역 제목 그대로 사용
    copyResult = {
      headline: koTitle.substring(0, 30),
      briefing: koTitle.substring(0, 40),
      summaryBody: koBody.substring(0, 200),
      kakao: koTitle.substring(0, 20)
    };
  }

  // ── DB 저장 ───────────────────────────────────────────
  const row = {
    processed_news_id: articleId,
    summary_title: copyResult.headline,
    summary_briefing: copyResult.briefing,
    summary_body: copyResult.summaryBody,
    translated_title: koTitle,
    translated_body: koBody.substring(0, 3000),
    kakao_short: copyResult.kakao,
    translate_model: OLLAMA_TRANSLATE_MODEL,
    copy_model: OLLAMA_COPY_MODEL,
    translate_failed: translateFailed,
    copy_failed: copyFailed
  };

  const { data, error } = await supabase
    .from('summaries')
    .insert(row)
    .select()
    .single();

  if (error) {
    console.error(`  [저장 실패] ${error.message}`);
    await markSummaryFailed(articleId, 'db_save_failed', error.message);
    return null;
  }

  // publish_logs: 상태머신 → pending_review
  // 이미 approved 된 항목 재등록 방지: upsert 대신 insert + 중복 체크
  const { data: existing } = await supabase
    .from('publish_logs')
    .select('id, review_status')
    .eq('summary_id', data.id)
    .single();

  if (!existing) {
    await supabase.from('publish_logs').insert({
      summary_id: data.id,
      status: 'draft',
      review_status: 'pending_review',
      publish_category: article.category || 'news',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
  }

  const statusLabel = translateFailed ? '번역실패/카피완료' : copyFailed ? '번역완료/카피실패' : '완료';
  console.log(`  [${statusLabel}] → ${copyResult.headline}`);
  return data;
}

// ── 메인 ──────────────────────────────────────────────────
async function main() {
  console.log('=== AI 요약 파이프라인 시작 ===');
  console.log(`번역 모델: ${OLLAMA_TRANSLATE_MODEL}`);
  console.log(`카피 모델:  ${OLLAMA_COPY_MODEL}`);
  console.log(`Ollama URL: ${OLLAMA_URL}`);
  console.log(`타임아웃:   ${OLLAMA_TIMEOUT_MS}ms`);

  // Ollama 헬스체크
  try {
    const health = await fetch(`${OLLAMA_URL}/api/tags`, { signal: AbortSignal.timeout(5000) });
    if (!health.ok) throw new Error(`HTTP ${health.status}`);
    const tags = await health.json();
    const models = (tags.models || []).map(m => m.name);
    console.log(`사용 가능 모델: ${models.length > 0 ? models.join(', ') : '(없음)'}`);

    for (const required of new Set([OLLAMA_TRANSLATE_MODEL, OLLAMA_COPY_MODEL])) {
      if (!models.some(m => m.startsWith(required.split(':')[0]))) {
        console.warn(`⚠ 모델 없음: ${required} → ollama pull ${required}`);
      }
    }
  } catch (err) {
    console.error(`[Ollama 연결 실패] ${err.message}`);
    console.error('ollama serve 실행 여부와 OLLAMA_BASE_URL 설정을 확인하세요.');
    process.exit(1);
  }

  const articles = await getUnsummarized();
  console.log(`\n처리 대상: ${articles.length}건`);

  if (articles.length === 0) {
    console.log('요약할 기사 없음');
    return;
  }

  let success = 0;
  let failed = 0;
  for (const article of articles) {
    const result = await processArticle(article);
    if (result) {
      success++;
    } else {
      failed++;
    }
    // Ollama 부하 방지 딜레이 (env로 조정 가능)
    const delay = parseInt(process.env.OLLAMA_STEP_DELAY_MS || '1500');
    await new Promise(r => setTimeout(r, delay));
  }

  console.log(`\n=== AI 요약 완료 ===`);
  console.log(`성공: ${success} / 실패: ${failed} / 전체: ${articles.length}`);
}

main().catch(err => {
  console.error('[요약 파이프라인 치명적 오류]', err);
  process.exit(1);
});
