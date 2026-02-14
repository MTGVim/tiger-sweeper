# 🐯 Tiger-Sweeper
<img width="613" height="787" alt="스크린샷 2026-02-14 오전 11 23 58" src="https://github.com/user-attachments/assets/6022b6e3-d247-4c88-87ca-ad3390e52b68" />

React + TypeScript + Vite로 만든 마인스위퍼 웹앱입니다.  
모바일 대응, PWA, 로컬 리더보드, 어시스트/확률 기능을 포함합니다.

## 주요 기능

- 고전 마인스위퍼 플레이 (`쉬움/보통/어려움`)
- 숫자 셀 클릭 시 주변 자동 열기(조건 충족 시)
- `🤖 어시스트` 기능 및 배속 선택 (`x1/x2/x4/x8/x16`)
- 옵션에서 테마/사운드 on/off/사운드 프리셋 변경
- `확률 표시 (기록X)` 모드
  - 각 닫힌 셀에 추론 확률 표시
  - 사용한 판은 리더보드 기록 제외
- 로컬 리더보드 (난이도별, 페이지네이션)
- 연승/연패 스트릭 표시
- 마지막 선택 난이도/어시스트/배속/확률표시 상태 로컬 저장
- PWA 지원 및 GitHub Pages 배포

## 기술 스택

- React 18
- TypeScript
- Vite
- Tailwind CSS
- vite-plugin-pwa (Workbox)
- Vitest

## 로컬 실행

```bash
yarn install
yarn dev
```

개발 서버 실행 후 브라우저에서 표시되는 주소로 접속하세요.

## 빌드 / 미리보기 / 테스트

```bash
yarn build      # 타입체크 + 프로덕션 빌드
yarn preview    # 빌드 결과 로컬 확인
yarn test       # 테스트 실행
```

## GitHub Pages 배포

`main` 브랜치 푸시 시 `.github/workflows/deploy.yml`이 자동 실행되어 Pages에 배포됩니다.

- 서비스 URL: `https://mtgvim.github.io/tiger-sweeper/`

- 빌드 시 `BASE_PATH=/${repo-name}/`가 적용되도록 워크플로우에 설정되어 있습니다.
- Pages 설정은 저장소에서 `GitHub Actions` 기반으로 활성화되어 있어야 합니다.

## 프로젝트 구조(요약)

- `src/core`: 게임 규칙/AI/확률 계산
- `src/context`: 전역 상태(`useReducer`)
- `src/components`: UI 컴포넌트
- `src/hooks`: PWA, 사운드 등 훅
- `src/i18n`: 한국어 메시지
- `public`: 아이콘/파비콘 정적 자산

## 라이선스

`LICENSE` 파일을 참고하세요.
