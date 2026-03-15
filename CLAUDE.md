이 폴더는 thai_ja_world 프로젝트의 출시 전 안정화 및 배포 준비 작업용입니다.

목표:
- 진단만 하지 말고, 실제로 적용 가능한 수정안까지 완성한다.
- 누락 없이 원인 분석 → 수정 → 검증 → 출시 준비 순서로 진행한다.
- 최종적으로 도메인 연결 직전에 필요한 상태까지 만드는 것을 목표로 한다.

작업 원칙:
1. 추정으로 끝내지 말고, 실제 수정 가능한 최종 패치를 제시할 것
2. 문제를 찾으면 반드시 다음 순서로 처리할 것:
   원인 진단 → 영향 범위 파악 → 최소 수정안 제시 → 검증 절차 제시 → 출시 위험도 평가
3. 수정안은 “왜 필요한지”와 “적용 후 무엇이 달라지는지”를 함께 설명할 것
4. 임시 우회보다 재현 가능하고 설명 가능한 수정 우선
5. 불필요한 리팩토링 금지
6. 서버용 env와 클라이언트용 env를 혼용하지 말 것
7. local / dev / docker / production 환경 차이를 항상 분리해서 설명할 것
8. 문서, env example, scripts, package.json이 실제 동작과 모순되지 않게 유지할 것
9. 도메인 연결 전 확인해야 할 환경변수, CORS, SITE_URL, callback URL, email link URL을 빠뜨리지 말 것
10. 답변은 보고서보다 “즉시 적용 가능한 결과물” 중심으로 작성할 것

중요 확인 항목:
- web / socket-server / api 실행 상태
- DB 연결 상태 및 실제 데이터 생성 여부
- 이메일 인증 링크 생성 및 발송 흐름
- 환경변수 로딩 위치와 변수명 일치 여부
- pnpm build 통과 여부
- docker compose 설정 유효성
- signup / verify-email / login 흐름
- production에서 사용할 SITE_URL / NEXT_PUBLIC_SITE_URL / API URL / SOCKET URL / CORS 허용 도메인
- 도메인 연결 직전 필요한 설정값 누락 여부

환경변수 원칙:
- 서버 코드에서는 가능하면 서버 전용 env를 사용하고, public env를 직접 의존하지 말 것
- NEXT_PUBLIC_* 는 클라이언트 노출용으로만 사용 여부를 검토할 것
- SITE_URL, API_BASE_URL, SOCKET_URL, SMTP 설정, TURNSTILE 설정, JWT 설정, DB 설정을 명확히 구분할 것
- 어떤 env 파일을 어느 런타임이 읽는지 항상 설명할 것

수정 범위 원칙:
- 허용된 파일 안에서만 수정
- node_modules, dist, build 산출물 수정 금지
- 대규모 기능 추가 금지
- UI 전체 갈아엎기 금지
- 출시를 막는 버그, 환경설정, 문서 불일치, 빌드/런타임 오류를 우선 해결

항상 포함해야 하는 출력 형식:
[1] 근본 원인 요약
[2] 실제 문제 경로
[3] 변경 파일 목록
[4] 최종 패치 또는 완성 코드
[5] 실행 명령 (Windows PowerShell 기준)
[6] 검증 방법과 성공 판정 기준
[7] 출시 전 체크포인트
[8] 도메인 연결 전 반드시 확인할 설정

검증 원칙:
- “확인 필요”로 끝내지 말고 가능한 검증 명령까지 제시할 것
- signup 후 DB row 생성 여부, verification token 생성 여부, login 가능 여부까지 확인 절차를 포함할 것
- build 실패 시 정확한 실패 지점과 최소 수정안을 제시할 것
- 도메인 연결 전에 callback URL, SITE_URL, email verification URL, CORS origin이 새 도메인 기준으로 바뀌어야 하는 부분을 반드시 적을 것

출시 기준:
- signup, verify-email, login 흐름이 정상
- DB 저장 정상
- 이메일 링크 URL 정상
- build 가능
- env 예시와 실제 코드 동작 일치
- 도메인 연결 시 바꿔야 할 값이 명확히 정리됨

작업할 때 절대 빠뜨리지 말 것:
- 원인만 설명하고 끝내지 말 것
- 수정안만 주고 검증 절차를 빼먹지 말 것
- local에서는 되는데 production에서 깨지는 URL / env / CORS 문제를 놓치지 말 것
- “NEXT_PUBLIC_SITE_URL 없음” 같은 런타임 로그가 다시 나오지 않게 env 정책을 정리할 것