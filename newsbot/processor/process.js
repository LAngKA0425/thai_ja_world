/**
 * 전처리 레이어 - 중복 제거, 카테고리 분류, processed_news 저장
 */
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// 카테고리 키워드 매핑
const CATEGORY_KEYWORDS = {
  visa: ['visa', 'immigration', 'work permit', 'extension', 'overstay', '비자', '체류'],
  traffic: ['traffic', 'road', 'accident', 'bts', 'mrt', 'expressway', '교통', '도로'],
  crime: ['arrest', 'police', 'crime', 'murder', 'scam', 'fraud', '사건', '사고', '체포'],
  living: ['cost of living', 'rent', 'housing', 'expat', 'food', '생활', '물가', '임대'],
  politics: ['election', 'parliament', 'government', 'minister', 'party', '정치', '정부'],
  economy: ['economy', 'baht', 'stock', 'gdp', 'inflation', 'trade', '경제', '환율'],
  tourism: ['tourism', 'tourist', 'travel', 'hotel', 'beach', '관광', '여행'],
  weather: ['weather', 'flood', 'storm', 'rain', 'temperature', '날씨', '홍수']
};

function classifyCategory(title, body) {
  const text = `${title} ${body}`.toLowerCase();

  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    for (const kw of keywords) {
      if (text.includes(kw)) return category;
    }
  }
  return 'news'; // 기본
}

function detectLanguage(text) {
  const thaiPattern = /[\u0E00-\u0E7F]/;
  const koreanPattern = /[\uAC00-\uD7AF]/;

  if (koreanPattern.test(text)) return 'ko';
  if (thaiPattern.test(text)) return 'th';
  return 'en';
}

// 제목 유사도 비교 (간단한 단어 겹침 기준)
function titleSimilarity(a, b) {
  const wordsA = new Set(a.toLowerCase().split(/\s+/).filter(w => w.length > 3));
  const wordsB = new Set(b.toLowerCase().split(/\s+/).filter(w => w.length > 3));

  if (wordsA.size === 0 || wordsB.size === 0) return 0;

  let overlap = 0;
  for (const w of wordsA) {
    if (wordsB.has(w)) overlap++;
  }

  return overlap / Math.max(wordsA.size, wordsB.size);
}

async function getUnprocessedNews() {
  const { data: allRaw, error: rawError } = await supabase
    .from('raw_news')
    .select('*')
    .order('collected_at', { ascending: true })
    .limit(100);

  if (rawError) {
    console.error('raw_news 조회 실패:', rawError.message);
    return [];
  }

  const { data: allProcessed, error: procError } = await supabase
    .from('processed_news')
    .select('raw_news_id');

  if (procError) {
    console.error('processed_news 조회 실패:', procError.message);
    return [];
  }

  const processedIds = new Set((allProcessed || []).map(p => p.raw_news_id));
  const unprocessed = (allRaw || []).filter(r => !processedIds.has(r.id));

  console.log(`raw_news 전체: ${(allRaw || []).length}, 이미 처리됨: ${processedIds.size}`);
  return unprocessed.slice(0, 50);
}

async function getRecentProcessedTitles() {
  const { data } = await supabase
    .from('processed_news')
    .select('id, title')
    .eq('is_duplicate', false)
    .order('processed_at', { ascending: false })
    .limit(200);

  return data || [];
}

async function processArticle(article, recentTitles) {
  const title = article.title;
  const body = article.raw_content || '';
  const language = detectLanguage(`${title} ${body}`);
  const category = classifyCategory(title, body);

  // 중복 체크
  let isDuplicate = false;
  let duplicateOf = null;

  for (const recent of recentTitles) {
    if (titleSimilarity(title, recent.title) > 0.6) {
      isDuplicate = true;
      duplicateOf = recent.id;
      break;
    }
  }

  const row = {
    raw_news_id: article.id,
    title: title,
    body_text: body,
    language: language,
    category: category,
    is_duplicate: isDuplicate,
    duplicate_of: duplicateOf
  };

  const { data, error } = await supabase
    .from('processed_news')
    .insert(row)
    .select()
    .single();

  if (error) {
    console.error(`[전처리 실패] ${title}: ${error.message}`);
    return null;
  }

  const status = isDuplicate ? '중복' : category;
  console.log(`[${status}] ${title.substring(0, 60)}`);
  return data;
}

async function main() {
  console.log('=== 전처리 시작 ===');

  const unprocessed = await getUnprocessedNews();
  console.log(`미처리 기사: ${unprocessed.length}건`);

  if (unprocessed.length === 0) {
    console.log('처리할 기사 없음');
    return;
  }

  const recentTitles = await getRecentProcessedTitles();
  let processed = 0;
  let duplicates = 0;

  for (const article of unprocessed) {
    const result = await processArticle(article, recentTitles);
    if (result) {
      processed++;
      if (result.is_duplicate) duplicates++;
      // 새로 처리된 것도 중복 체크 목록에 추가
      if (!result.is_duplicate) {
        recentTitles.push({ id: result.id, title: result.title });
      }
    }
  }

  console.log(`\n=== 전처리 완료 ===`);
  console.log(`처리: ${processed}, 중복: ${duplicates}, 유효: ${processed - duplicates}`);
}

main().catch(err => {
  console.error('전처리 실패:', err);
  process.exit(1);
});
