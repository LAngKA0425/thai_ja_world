/**
 * Ollama AI 요약 레이어 - 전처리된 뉴스를 3줄 요약 + 태자월드용 제목 생성
 */
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

const OLLAMA_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'llama3.1:8b';

async function callOllama(prompt) {
  const res = await fetch(`${OLLAMA_URL}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: OLLAMA_MODEL,
      prompt: prompt,
      stream: false,
      options: {
        temperature: 0.3,
        num_predict: 500
      }
    })
  });

  if (!res.ok) {
    throw new Error(`Ollama 응답 실패: ${res.status} ${res.statusText}`);
  }

  const json = await res.json();
  return json.response || '';
}

function buildSummaryPrompt(title, body) {
  return `당신은 태국 관련 한국어 뉴스 요약 전문가입니다.
아래 영문 뉴스를 한국어로 요약해주세요.

규칙:
1. 제목: 태국 관련 커뮤니티에 올릴 한국어 제목 (30자 이내)
2. 요약: 정확히 3줄로 핵심 내용 요약 (각 줄 50자 이내)
3. 카톡문구: 카카오톡 공유용 짧은 문구 (20자 이내)

출력 형식 (이 형식을 정확히 지켜주세요):
TITLE: (한국어 제목)
LINE1: (첫 번째 요약)
LINE2: (두 번째 요약)
LINE3: (세 번째 요약)
KAKAO: (카톡 문구)

뉴스 제목: ${title}
뉴스 본문: ${body.substring(0, 1500)}`;
}

function parseSummaryResponse(text) {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);

  let title = '';
  let summaryLines = [];
  let kakao = '';

  for (const line of lines) {
    if (line.startsWith('TITLE:')) title = line.replace('TITLE:', '').trim();
    else if (line.startsWith('LINE1:')) summaryLines.push(line.replace('LINE1:', '').trim());
    else if (line.startsWith('LINE2:')) summaryLines.push(line.replace('LINE2:', '').trim());
    else if (line.startsWith('LINE3:')) summaryLines.push(line.replace('LINE3:', '').trim());
    else if (line.startsWith('KAKAO:')) kakao = line.replace('KAKAO:', '').trim();
  }

  // 파싱 실패 시 fallback
  if (!title && lines.length > 0) title = lines[0];
  if (summaryLines.length === 0 && lines.length > 1) {
    summaryLines = lines.slice(1, 4);
  }

  return {
    title: title || '(요약 실패)',
    body: summaryLines.join('\n') || '(본문 요약 실패)',
    kakao: kakao || title.substring(0, 20)
  };
}

async function getUnsummarized() {
  // processed_news 중 summaries에 없고 중복이 아닌 것
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

async function summarizeArticle(article) {
  console.log(`[요약] ${article.title.substring(0, 50)}...`);

  const prompt = buildSummaryPrompt(article.title, article.body_text || '');

  let response;
  try {
    response = await callOllama(prompt);
  } catch (err) {
    console.error(`[Ollama 실패] ${err.message}`);
    return null;
  }

  const parsed = parseSummaryResponse(response);

  const row = {
    processed_news_id: article.id,
    summary_title: parsed.title,
    summary_body: parsed.body,
    kakao_short: parsed.kakao,
    model_used: OLLAMA_MODEL
  };

  const { data, error } = await supabase
    .from('summaries')
    .insert(row)
    .select()
    .single();

  if (error) {
    console.error(`[저장 실패] ${error.message}`);
    return null;
  }

  // publish_logs에 대기 상태로 등록
  await supabase.from('publish_logs').insert({
    summary_id: data.id,
    status: 'draft',
    review_status: 'pending',
    publish_category: article.category || 'news'
  });

  console.log(`[완료] → ${parsed.title}`);
  return data;
}

async function main() {
  console.log('=== AI 요약 시작 ===');
  console.log(`모델: ${OLLAMA_MODEL}`);
  console.log(`Ollama URL: ${OLLAMA_URL}`);

  // Ollama 연결 확인
  try {
    const health = await fetch(`${OLLAMA_URL}/api/tags`);
    if (!health.ok) throw new Error('연결 실패');
    const tags = await health.json();
    const models = (tags.models || []).map(m => m.name);
    console.log(`사용 가능 모델: ${models.join(', ')}`);

    if (!models.some(m => m.startsWith(OLLAMA_MODEL.split(':')[0]))) {
      console.warn(`⚠ ${OLLAMA_MODEL} 모델이 없습니다. 먼저 ollama pull ${OLLAMA_MODEL} 실행하세요.`);
    }
  } catch (err) {
    console.error(`Ollama 연결 실패: ${err.message}`);
    console.error('Ollama가 실행 중인지 확인하세요: ollama serve');
    process.exit(1);
  }

  const articles = await getUnsummarized();
  console.log(`요약 대상: ${articles.length}건`);

  if (articles.length === 0) {
    console.log('요약할 기사 없음');
    return;
  }

  let success = 0;
  for (const article of articles) {
    const result = await summarizeArticle(article);
    if (result) success++;
    // Ollama 부하 방지 딜레이
    await new Promise(r => setTimeout(r, 1000));
  }

  console.log(`\n=== 요약 완료 ===`);
  console.log(`성공: ${success}/${articles.length}`);
}

main().catch(err => {
  console.error('요약 실패:', err);
  process.exit(1);
});
