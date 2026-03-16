/**
 * RSS 수집기 - 뉴스 소스에서 기사를 수집하여 raw_news에 저장
 */
import 'dotenv/config';
import Parser from 'rss-parser';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

const parser = new Parser({
  timeout: 15000,
  headers: {
    'User-Agent': 'TajWorldNewsBot/1.0'
  }
});

const MAX_PER_SOURCE = parseInt(process.env.MAX_ARTICLES_PER_SOURCE || '10');

async function getActiveSources() {
  const { data, error } = await supabase
    .from('news_sources')
    .select('*')
    .eq('is_active', true)
    .order('priority', { ascending: true });

  if (error) throw new Error(`소스 조회 실패: ${error.message}`);
  return data || [];
}

async function collectFromSource(source) {
  console.log(`[수집] ${source.name} (${source.rss_url})`);

  let feed;
  try {
    feed = await parser.parseURL(source.rss_url);
  } catch (err) {
    console.error(`[실패] ${source.name}: ${err.message}`);
    return { collected: 0, skipped: 0, failed: true };
  }

  const items = (feed.items || []).slice(0, MAX_PER_SOURCE);
  let collected = 0;
  let skipped = 0;

  for (const item of items) {
    const link = item.link || item.guid;
    if (!link) continue;

    // 이미 수집된 기사 skip
    const { data: existing } = await supabase
      .from('raw_news')
      .select('id')
      .eq('link', link)
      .maybeSingle();

    if (existing) {
      skipped++;
      continue;
    }

    const row = {
      source_id: source.id,
      title: (item.title || '').trim(),
      link: link,
      published_at: item.pubDate ? new Date(item.pubDate).toISOString() : null,
      author: item.creator || item.author || null,
      raw_content: item.contentSnippet || item.content || item.summary || '',
      meta: {
        categories: item.categories || [],
        feedTitle: feed.title || source.name
      }
    };

    const { error } = await supabase.from('raw_news').insert(row);

    if (error) {
      console.error(`[저장실패] ${row.title}: ${error.message}`);
    } else {
      collected++;
    }
  }

  console.log(`[완료] ${source.name}: 수집 ${collected}, 스킵 ${skipped}`);
  return { collected, skipped, failed: false };
}

async function main() {
  console.log('=== 뉴스 수집 시작 ===');
  console.log(`시각: ${new Date().toISOString()}`);

  const sources = await getActiveSources();
  console.log(`활성 소스: ${sources.length}개`);

  let totalCollected = 0;
  let totalSkipped = 0;

  for (const source of sources) {
    const result = await collectFromSource(source);
    totalCollected += result.collected;
    totalSkipped += result.skipped;
  }

  console.log(`\n=== 수집 완료 ===`);
  console.log(`총 수집: ${totalCollected}, 스킵: ${totalSkipped}`);
  return { totalCollected, totalSkipped };
}

main().catch(err => {
  console.error('수집 실패:', err);
  process.exit(1);
});
