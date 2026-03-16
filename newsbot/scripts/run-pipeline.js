/**
 * 전체 파이프라인 실행: 수집 → 전처리 → 요약
 * node scripts/run-pipeline.js
 */
import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

function run(label, script) {
  console.log(`\n${'='.repeat(50)}`);
  console.log(`▶ ${label}`);
  console.log('='.repeat(50));

  try {
    execSync(`node ${script}`, {
      cwd: root,
      stdio: 'inherit',
      env: { ...process.env }
    });
    console.log(`✓ ${label} 완료`);
    return true;
  } catch (err) {
    console.error(`✗ ${label} 실패`);
    return false;
  }
}

async function main() {
  console.log('=== 뉴스봇 파이프라인 시작 ===');
  console.log(`시각: ${new Date().toISOString()}`);

  const step1 = run('1단계: RSS 수집', 'collector/collect.js');
  if (!step1) {
    console.error('수집 실패 - 파이프라인 중단');
    process.exit(1);
  }

  const step2 = run('2단계: 전처리', 'processor/process.js');
  if (!step2) {
    console.error('전처리 실패 - 요약 단계 건너뜀');
    process.exit(1);
  }

  const step3 = run('3단계: AI 요약', 'summarizer/summarize.js');
  if (!step3) {
    console.warn('요약 단계 실패 (Ollama 연결 확인 필요)');
  }

  console.log('\n=== 파이프라인 완료 ===');
  console.log('관리 페이지에서 승인 대기 목록을 확인하세요: npm run admin');
}

main();
