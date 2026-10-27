# 오늘Do퍼즐 작업 지침

- 사용자와는 한국어로 소통한다. 공통 지침은 스마트인포랩 워크스페이스 AI 지침(공통 + 앱 ONEULDOPUZZLE)을 따른다.
- 스택은 형제 앱 표준(Vite + React + TypeScript + MUI, 설치형 앱은 Capacitor). 기준 앱은 달 리듬, 공유 패키지는 `@smartinfolab/app-core`(vendor tgz).
- 설계 원칙(설계서 2026-10-25): 터치 중심(끌어다 놓기 없음, 단 블록 탈출·슬라이딩은 2026-10-26 사용자 요청으로 쓸기도 받음 — `useSwipe`), 답이 정확히 하나인 문제만 내보냄, 강제 광고 없음, 알림 기본 꺼짐, 메모는 작게 숨기고 숫자 패드는 크게.
- 퍼즐 규칙·생성·검사는 `src/puzzle/<퍼즐>`의 순수 함수로 두고 단위 테스트(`tests/*.test.ts`)로 확인한다. 화면은 `PuzzleBoard`를 함께 쓴다.
- 문제를 바꾸면 `npm test`와 `npm run check:pool -- 1000`을 함께 돌린다. 화면을 바꾸면 `npm run test:e2e`.
- 화면·컴포넌트는 공유 패키지를 직접 import하지 않고 `src/theme` 같은 얇은 파일을 거친다(eslint로 막음).
- 점수 규칙은 `src/puzzle/core/score.ts` 한 곳(테스트 `tests/score.test.ts`), 효과음·진동은 `src/platform/feedback.ts`의 `cue()`로만 낸다(설정에서 끌 수 있음, 기본 켜짐).
- 내가 넣은 숫자는 민트, 빨강은 겹친 숫자·'틀린 칸 보기'에만 쓴다. 이어 하기 판단은 시간이 아니라 넣은 숫자·메모로 한다(`hasProgress`).
- 색깔 구역 퍼즐(`src/puzzle/zones`)은 레벨 번호로 만들고 답 하나 + 찍지 않고 풀리는 판만 쓴다. 레벨 1~120은 단위 테스트가 검사한다.
- 슬라이딩(`src/puzzle/sliding`)은 3×3 최소 수 표로 레벨마다 최소 수가 1씩 늘게 고르고, 블록 채우기(`src/puzzle/blocks`)는 블록을 돌리지 않으며 채우는 방법이 하나뿐인 판만 쓴다.
- 첫 화면은 여섯 퍼즐을 같은 크기 카드로 고르는 화면이고(2026-10-26 사용자 결정), 스도쿠는 `/sudoku`에서 난이도를 고른다. 스도쿠 레벨은 난이도마다 따로 이어진다(`sudokuCleared`, 저장본 버전 2에서 옮김).
- 계속하게 만드는 중심 재미는 디저트 모으기, 점수(트로피)는 레벨 별 1~3개와 디저트로 바꿀 예정(2026-10-26 사용자 결정).
- 힌트는 퍼즐마다 순수 함수(`findHint`·`findZoneHint`·`findBlockHint`·`slideHint`·`findNonogramHint`·`findEscapeHint`, 테스트 `tests/hint.test.ts`): 틀린 곳이 있으면 그곳부터 고치고, 없으면 다음 한 수. 화면은 `useHint()`. 힌트 수·보상은 `score.ts`(처음 3개, 오늘의 퍼즐 한 판 1개, 세 판 다 풀면 2개 더).
- 오늘의 퍼즐(`src/puzzle/core/daily.ts`, 테스트 `tests/daily.test.ts`)은 날짜로 고른 세 판(스도쿠·색깔 구역·블록 채우기/슬라이딩 번갈아)이고 레벨 진행과 따로다. 화면은 같은 퍼즐 화면에 `?daily`를 붙여 연다. 세 판을 다 푼 날로 연속 출석을 센다.
