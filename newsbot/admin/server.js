/**
 * 관리자 승인 페이지 서버
 * Express + Supabase API
 */
import 'dotenv/config';
import express from 'express';
import { createClient } from '@supabase/supabase-js';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
app.use(express.json());

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

const PORT = parseInt(process.env.ADMIN_PORT || '3099');
const ADMIN_PW = process.env.ADMIN_PASSWORD || 'changeme';

// 소셜 링크
const SOCIAL_LINKS = {
  telegram: process.env.TELEGRAM_URL || '',
  line: process.env.LINE_URL || '',
  kakao: process.env.KAKAO_OPEN_URL || '',
  whatsapp: process.env.WHATSAPP_URL || ''
};

// 뉴스봇 시스템 author ID
const NEWSBOT_AUTHOR_ID = 'newsbot-system';

// 게시글 본문에 붙이는 푸터
function buildPostContent(summaryBody, sourceLink, sourceName) {
  let content = summaryBody + '\n\n';
  content += `📰 출처: ${sourceName || '해외 매체'}\n`;
  if (sourceLink) content += `🔗 원문: ${sourceLink}\n`;
  content += '\n---\n';
  content += '💬 제보 & 문의\n';
  if (SOCIAL_LINKS.kakao) content += `카카오톡: ${SOCIAL_LINKS.kakao}\n`;
  if (SOCIAL_LINKS.telegram) content += `텔레그램: ${SOCIAL_LINKS.telegram}\n`;
  if (SOCIAL_LINKS.line) content += `라인: ${SOCIAL_LINKS.line}\n`;
  if (SOCIAL_LINKS.whatsapp) content += `왓츠앱: ${SOCIAL_LINKS.whatsapp}\n`;
  return content;
}

// CommunityPost에 발행
async function publishToCommunity(summaryTitle, summaryBody, sourceLink, sourceName, category) {
  const categoryMap = {
    news: 'briefing',
    politics: 'briefing',
    economy: 'briefing',
    crime: 'incident',
    visa: 'visa_info',
    living: 'local_tip',
    traffic: 'local_tip',
    tourism: 'local_tip',
    weather: 'local_tip'
  };

  const postCategory = categoryMap[category] || 'briefing';
  const content = buildPostContent(summaryBody, sourceLink, sourceName);
  const postId = `newsbot-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;

  const { data, error } = await supabase
    .from('CommunityPost')
    .insert({
      id: postId,
      authorId: NEWSBOT_AUTHOR_ID,
      category: postCategory,
      title: summaryTitle,
      content: content,
      isAnonymous: false,
      moderationStatus: 'SAFE',
      viewCount: 0,
      commentCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

// 간단한 인증 미들웨어
function auth(req, res, next) {
  const token = req.headers['x-admin-token'];
  if (token !== ADMIN_PW) {
    return res.status(401).json({ error: '인증 실패' });
  }
  next();
}

// 관리 페이지 HTML 서빙
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// ===== API 엔드포인트 =====

// 대시보드 통계
app.get('/api/stats', auth, async (req, res) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [rawCount, processedCount, pendingCount, publishedCount] = await Promise.all([
    supabase.from('raw_news').select('id', { count: 'exact', head: true })
      .gte('collected_at', today.toISOString()),
    supabase.from('processed_news').select('id', { count: 'exact', head: true })
      .eq('is_duplicate', false),
    supabase.from('publish_logs').select('id', { count: 'exact', head: true })
      .eq('review_status', 'pending'),
    supabase.from('publish_logs').select('id', { count: 'exact', head: true })
      .eq('review_status', 'approved')
  ]);

  res.json({
    today_collected: rawCount.count || 0,
    total_unique: processedCount.count || 0,
    pending_review: pendingCount.count || 0,
    published: publishedCount.count || 0
  });
});

// 승인 대기 목록
app.get('/api/pending', auth, async (req, res) => {
  const { data, error } = await supabase
    .from('publish_logs')
    .select(`
      id,
      review_status,
      publish_category,
      created_at,
      summaries:summary_id (
        id,
        summary_title,
        summary_body,
        kakao_short,
        processed_news:processed_news_id (
          title,
          category,
          language,
          raw_news:raw_news_id (
            link,
            source_id,
            published_at,
            news_sources:source_id ( name )
          )
        )
      )
    `)
    .eq('review_status', 'pending')
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) return res.status(500).json({ error: error.message });
  res.json(data || []);
});

// 발행 완료 목록
app.get('/api/published', auth, async (req, res) => {
  const { data, error } = await supabase
    .from('publish_logs')
    .select(`
      id,
      review_status,
      publish_category,
      published_at,
      summaries:summary_id (
        summary_title,
        summary_body,
        processed_news:processed_news_id (
          raw_news:raw_news_id ( link )
        )
      )
    `)
    .eq('review_status', 'approved')
    .order('published_at', { ascending: false })
    .limit(50);

  if (error) return res.status(500).json({ error: error.message });
  res.json(data || []);
});

// 승인 처리 → 태자월드 게시판 자동 등록
app.post('/api/review/:id', auth, async (req, res) => {
  const { id } = req.params;
  const { action, category } = req.body; // action: approved | rejected | hold

  const updates = {
    review_status: action,
    updated_at: new Date().toISOString()
  };

  if (action === 'approved') {
    updates.status = 'published';
    updates.published_at = new Date().toISOString();

    // 승인 시 태자월드 게시판에 자동 등록
    try {
      // 해당 기사 정보 가져오기
      const { data: logData } = await supabase
        .from('publish_logs')
        .select(`
          publish_category,
          summaries:summary_id (
            summary_title,
            summary_body,
            processed_news:processed_news_id (
              category,
              raw_news:raw_news_id (
                link,
                news_sources:source_id ( name )
              )
            )
          )
        `)
        .eq('id', id)
        .single();

      if (logData?.summaries) {
        const s = logData.summaries;
        const pn = s.processed_news || {};
        const rn = pn.raw_news || {};
        const src = rn.news_sources || {};

        await publishToCommunity(
          s.summary_title,
          s.summary_body,
          rn.link,
          src.name,
          category || logData.publish_category || pn.category || 'news'
        );
        console.log(`[발행] ${s.summary_title}`);
      }
    } catch (pubErr) {
      console.error(`[발행 실패] ${pubErr.message}`);
      // 발행 실패해도 승인 상태는 업데이트
    }
  }

  if (category) {
    updates.publish_category = category;
  }

  const { error } = await supabase
    .from('publish_logs')
    .update(updates)
    .eq('id', id);

  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true, action });
});

// 소스 목록
app.get('/api/sources', auth, async (req, res) => {
  const { data, error } = await supabase
    .from('news_sources')
    .select('*')
    .order('priority', { ascending: true });

  if (error) return res.status(500).json({ error: error.message });
  res.json(data || []);
});

// 소스 추가
app.post('/api/sources', auth, async (req, res) => {
  const { name, rss_url, priority } = req.body;

  const { data, error } = await supabase
    .from('news_sources')
    .insert({ name, rss_url, priority: priority || 0 })
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// 소스 토글
app.patch('/api/sources/:id', auth, async (req, res) => {
  const { id } = req.params;
  const { is_active } = req.body;

  const { error } = await supabase
    .from('news_sources')
    .update({ is_active, updated_at: new Date().toISOString() })
    .eq('id', id);

  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true });
});

app.listen(PORT, () => {
  console.log(`=== 뉴스봇 관리 페이지 ===`);
  console.log(`http://localhost:${PORT}`);
  console.log(`비밀번호: ${ADMIN_PW}`);
});
