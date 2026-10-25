# 오늘Do퍼즐 (oneuldopuzzle-fe)

스도쿠를 중심으로 여러 두뇌 퍼즐을 모은 앱의 프런트엔드. 디저트 테마·파스텔 색감, 드래그 없는 터치 조작.
서버는 공용 API(`smartinfolab-api`)를 씁니다.

## 지금 들어 있는 것 (개발 1단계)

- 퍼즐 공통 틀: `src/puzzle/core`(씨앗 난수·되돌리기·칸 번호), `src/components/puzzle/PuzzleBoard.tsx`(누르기만 받는 정사각형 판)
- 클래식 스도쿠: `src/puzzle/sudoku`
  - `generator.ts` 레벨 → 씨앗 → 문제. 같은 레벨이면 언제나 같은 문제
  - `checker.ts` 문제 검사기. 모양·처음 숫자 겹침·답 없음·답 여러 개를 거르고, 통과한 문제만 씁니다
  - `logic.ts` 사람 풀이(단서 찾기)로 풀리는지 보고 난이도를 매깁니다
  - `game.ts` 한 판의 조작(칸 먼저/숫자 먼저, 메모, 지우기, 되돌리기, 완료)
- 화면: 처음 화면, 풀이 화면(큰 숫자 패드, 작은 메모 버튼), 설정(입력 방식, 강조)

## 명령

```bash
npm install
npm run dev            # http://localhost:5180
npm test               # 생성기·검사기·조작 단위 테스트
npm run check:pool -- 1000   # 레벨 1~1000 문제를 만들어 모두 검사
npm run build && npx vite preview --port 4180 & npm run test:e2e   # 휴대폰 화면 E2E
```

## 다음 단계 (설계서 개발 순서)

2 보너스 퍼즐·레벨 구조 → 3 스페셜 스테이지 → 4 포인트·힌트·출석 → 5 보상형 광고·유료 구매·알림 → 6 테스트·출시.
문제 풀은 `check:pool`을 통과한 문제만 공용 API에 올리는 방식으로 옮길 예정입니다.
