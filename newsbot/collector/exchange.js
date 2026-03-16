/**
 * 환율 수집기 - THB/KRW 오늘의 환율
 * 무료 API: exchangerate.host (API 키 불필요)
 */
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

const NEWSBOT_AUTHOR_ID = 'newsbot-system';

const SOCIAL_LINKS = {
  telegram: process.env.TELEGRAM_URL || '',
  line: process.env.LINE_URL || '',
  kakao: process.env.KAKAO_OPEN_URL || '',
  whatsapp: process.env.WHATSAPP_URL || ''
};

async function fetchExchangeRate() {
  // 방법1: frankfurter.app (무료, 키 불필요)
  const res = await fetch('https://api.frankfurter.app/latest?from=THB&to=KRW,USD,JPY');

  if (!res.ok) throw new Error(`환율 API 실패: ${res.status}`);

  const data = await res.json();
  return {
    base: 'THB',
    date: data.date,
    rates: data.rates
  };
}

async function fetchUsdThb() {
  // USD → THB 환율
  const res = await fetch('https://api.frankfurter.app/latest?from=USD&to=THB,KRW');
  if (!res.ok) return null;
  return await res.json();
}

function buildExchangePost(thbData, usdData) {
  const today = new Date().toLocaleDateString('ko-KR', {
    year: 'numeric', month: 'long', day: 'numeric', weekday: 'long',
    timeZone: 'Asia/Bangkok'
  });

  const krwRate = thbData.rates.KRW;
  const usdRate = thbData.rates.USD;
  const jpyRate = thbData.rates.JPY;

  const dateShort = new Date().toLocaleDateString('ko-KR', {
    month: 'numeric', day: 'numeric', timeZone: 'Asia/Bangkok'
  });

  let title = `오늘 환율: 1 THB = ${krwRate.toFixed(1)}원 (${dateShort})`;

  let content = `📅 ${today}\n\n`;
  content += `💱 태국 바트(THB) 환율\n\n`;
  content += `🇰🇷 1 THB = ${krwRate.toFixed(2)} KRW (한국 원)\n`;
  content += `🇺🇸 1 THB = ${usdRate.toFixed(4)} USD (미국 달러)\n`;
  content += `🇯🇵 1 THB = ${jpyRate.toFixed(2)} JPY (일본 엔)\n\n`;

  if (usdData) {
    content += `📊 참고 환율\n`;
    content += `🇺🇸 1 USD = ${usdData.rates.THB.toFixed(2)} THB\n`;
    content += `🇺🇸 1 USD = ${usdData.rates.KRW.toFixed(0)} KRW\n\n`;
  }

  content += `💡 실시간 환율은 은행/환전소마다 다를 수 있습니다.\n`;
  content += `카시콘뱅크, 방콕뱅크 등 현지 은행 앱에서 정확한 환율을 확인하세요.\n`;
  content += '\n---\n';
  content += '💬 제보 & 문의\n';
  if (SOCIAL_LINKS.kakao) content += `카카오톡: ${SOCIAL_LINKS.kakao}\n`;
  if (SOCIAL_LINKS.telegram) content += `텔레그램: ${SOCIAL_LINKS.telegram}\n`;
  if (SOCIAL_LINKS.line) content += `라인: ${SOCIAL_LINKS.line}\n`;
  if (SOCIAL_LINKS.whatsapp) content += `왓츠앱: ${SOCIAL_LINKS.whatsapp}\n`;

  return { title, content };
}

async function publishExchange() {
  console.log('=== 환율 수집 시작 ===');

  let thbData, usdData;

  try {
    thbData = await fetchExchangeRate();
    console.log(`[THB→KRW] ${thbData.rates.KRW.toFixed(2)}원`);
    console.log(`[THB→USD] ${thbData.rates.USD.toFixed(4)}`);
  } catch (err) {
    console.error(`환율 수집 실패: ${err.message}`);
    return;
  }

  try {
    usdData = await fetchUsdThb();
    if (usdData) console.log(`[USD→THB] ${usdData.rates.THB.toFixed(2)}`);
  } catch (err) {
    console.warn('USD 환율 보조 데이터 수집 실패 (무시)');
  }

  const { title, content } = buildExchangePost(thbData, usdData);
  const postId = `exchange-${Date.now()}`;

  const { error } = await supabase
    .from('CommunityPost')
    .insert({
      id: postId,
      authorId: NEWSBOT_AUTHOR_ID,
      category: 'briefing',
      title: title,
      content: content,
      isAnonymous: false,
      moderationStatus: 'SAFE',
      viewCount: 0,
      commentCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

  if (error) {
    console.error(`발행 실패: ${error.message}`);
    return;
  }

  console.log(`[발행 완료] ${title}`);
}

publishExchange().catch(err => {
  console.error('환율 봇 실패:', err);
  process.exit(1);
});
