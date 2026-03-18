/**
 * 레이더봇 파이프라인: 수집 → 분류
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
    execSync(`node ${script}`, { cwd: root, stdio: 'inherit', env: { ...process.env } });
    console.log(`✓ ${label} 완료`);
    return true;
  } catch (err) {
    console.error(`✗ ${label} 실패:`, err);
    return false;
  }
}

async function main() {
  console.log('=== 레이더봇 파이프라인 시작 ===');

  const step1 = run('1단계: 수집', 'collector/collect.js');
  if (!step1) { console.error('수집 실패'); process.exit(1); }

  run('2단계: 분류', 'classifier/classify.js');

  console.log('=== 레이더봇 파이프라인 완료 ===');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
