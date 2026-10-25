# 오늘Do퍼즐 작업 지침

- 사용자와는 한국어로 소통한다. 공통 지침은 스마트인포랩 워크스페이스 AI 지침(공통 + 앱 ONEULDOPUZZLE)을 따른다.
- 스택은 형제 앱 표준(Vite + React + TypeScript + MUI, 설치형 앱은 Capacitor). 기준 앱은 달 리듬, 공유 패키지는 `@smartinfolab/app-core`(vendor tgz).
- 설계 원칙(설계서 2026-10-25): 터치만(드래그 없음), 답이 정확히 하나인 문제만 내보냄, 강제 광고 없음, 알림 기본 꺼짐, 메모는 작게 숨기고 숫자 패드는 크게.
- 퍼즐 규칙·생성·검사는 `src/puzzle/<퍼즐>`의 순수 함수로 두고 단위 테스트(`tests/*.test.ts`)로 확인한다. 화면은 `PuzzleBoard`를 함께 쓴다.
- 문제를 바꾸면 `npm test`와 `npm run check:pool -- 1000`을 함께 돌린다. 화면을 바꾸면 `npm run test:e2e`.
- 화면·컴포넌트는 공유 패키지를 직접 import하지 않고 `src/theme` 같은 얇은 파일을 거친다(eslint로 막음).
