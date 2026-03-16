/**
 * 초기 설정 확인 스크립트
 * node scripts/setup.js
 */
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

console.log('=== 뉴스봇 설정 확인 ===\n');

// 1. env 확인
const required = ['SUPABASE_URL', 'SUPABASE_SERVICE_KEY'];
const optional = ['OLLAMA_BASE_URL', 'OLLAMA_MODEL', 'ADMIN_PORT', 'ADMIN_PASSWORD'];

let envOk = true;
for (const key of required) {
  if (!process.env[key]) {
    console.error(`[필수] ${key} 가 설정되지 않았습니다.`);
    envOk = false;
  } else {
    console.log(`[OK] ${key}`);
  }
}

for (const key of optional) {
  if (!process.env[key]) {
    console.log(`[선택] ${key} 미설정 (기본값 사용)`);
  } else {
    console.log(`[OK] ${key}`);
  }
}

if (!envOk) {
  console.error('\n.env 파일을 먼저 설정하세요. config/.env.example 참고');
  process.exit(1);
}

// 2. Supabase 연결 확인
console.log('\n--- Supabase 연결 ---');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

try {
  const { data, error } = await supabase.from('news_sources').select('count').limit(1);
  if (error) {
    console.error(`[실패] Supabase 테이블 조회 실패: ${error.message}`);
    console.log('\nconfig/schema.sql 을 Supabase SQL Editor에서 실행하세요.');
  } else {
    console.log('[OK] Supabase 연결 성공');
    const { count } = await supabase.from('news_sources').select('id', { count: 'exact', head: true });
    console.log(`[OK] news_sources: ${count}개 소스 등록됨`);
  }
} catch (err) {
  console.error(`[실패] Supabase 연결 실패: ${err.message}`);
}

// 3. Ollama 연결 확인
console.log('\n--- Ollama 연결 ---');
const ollamaUrl = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
try {
  const res = await fetch(`${ollamaUrl}/api/tags`);
  if (res.ok) {
    const data = await res.json();
    const models = (data.models || []).map(m => m.name);
    console.log(`[OK] Ollama 연결 성공`);
    console.log(`[OK] 사용 가능 모델: ${models.length > 0 ? models.join(', ') : '(없음 - ollama pull 필요)'}`);
  } else {
    console.warn(`[경고] Ollama 응답 이상: ${res.status}`);
  }
} catch (err) {
  console.warn(`[경고] Ollama 미연결 (${ollamaUrl})`);
  console.log('  → Ollama 설치: https://ollama.com');
  console.log('  → 실행: ollama serve');
  console.log('  → 모델 받기: ollama pull llama3.1:8b');
}

console.log('\n=== 설정 확인 완료 ===');
