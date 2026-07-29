# 컨벤션

srs9의 코딩 컨벤션입니다. 코드베이스 전체에서 일관되게 적용합니다.

## 1. 파일 이름

- 컴포넌트: `PascalCase.tsx` (예: `RootHeader.tsx`)
- 유틸리티 및 설정: `camelCase.ts` (예: `site.ts`)

## 2. 컴포넌트 구조

컴포넌트는 UI 종류에 따라 이름을 정한 하위 폴더에 둡니다. 아래 폴더는
고정된 목록이 아닌 **예시**이며, 새로운 종류가 생기면 폴더를 추가합니다.

```
components/
  header/       RootHeader.tsx
  footer/       RootFooter.tsx
  link/         SubdomainLink.tsx
  placeholder/  ComingSoon.tsx
  ...           (필요한 종류 추가)
```

## 3. export

- 컴포넌트는 **named export**를 사용합니다
  (`export function RootHeader`).
- Next.js 라우트 파일인 `page`와 `layout`은 default export를 사용합니다.
- `proxy`는 named export를 사용합니다
  (Next.js 16에서 `middleware`가 `proxy`로 변경됨).

## 4. import

- 순서: 외부 패키지 → `@/` 내부 모듈 → 상대 경로
- ESLint가 import와 export를 자동으로 정렬합니다.
- 타입 전용 의존성에는 `import type`을 사용합니다.

## 5. 네이밍

- 루트 또는 전역 수준에서 렌더링되는 컴포넌트에는 **`Root`** 접두사를
  붙입니다(예: `RootHeader`, `RootFooter`).
- 이름은 구체적이고 모호하지 않아야 합니다
  (예: `CrossLink` 대신 `SubdomainLink`).

## 6. 언어

- 식별자 및 변수: 영어
- 코드 주석: 한국어
- UI 문구: 한국어
- 테스트 설명(`describe` 및 `test` 제목): 한국어
- 프로젝트 문서(`docs/*.md`): 한국어

## 7. 폴더 구조

- `app/`: 라우트
- `components/<kind>/`: 종류별로 분류한 공용 UI
- `lib/`: 로직 및 설정
- `e2e/`: Playwright E2E 테스트(`*.spec.ts`)

## 8. 스타일링

- **색상과 글꼴은 토큰만 사용**하며, `app/globals.css`의 CSS 변수로
  정의합니다. hex 리터럴과 Tailwind 팔레트 색상(`text-zinc-*`)은
  사용하지 않습니다.
- 간격, 크기, 모서리 반경은 Tailwind 기본 스케일을 사용합니다
  (`px-6`, `gap-4`, `rounded-2xl`).
- 임의 값(`h-[3px]`, `leading-[1.15]`)은 피하고 기본 스케일을 사용합니다.

## 9. 비동기 처리와 로깅

- Promise는 `await`하거나 `void`로 명시적으로 무시하거나 rejection
  callback으로 처리해야 합니다.
- 동기 callback이 필요한 곳에 비동기 함수를 전달하지 않습니다.
  비동기 React 이벤트 핸들러는 허용합니다.
- 프로덕션 코드에서는 `console.log`를 사용하지 않습니다.
  `console.warn`과 `console.error`는 허용합니다.

## 10. 서버와 클라이언트 경계

- 컴포넌트는 기본적으로 Server Component로 작성합니다.
- 상태, 브라우저 API, 이벤트 핸들러가 필요할 때만 `"use client"`를
  선언합니다.
- `"use client"`는 가능한 한 하위 컴포넌트에 배치해 클라이언트 번들
  범위를 작게 유지합니다.
- DB, 인증, Cloudflare binding을 사용하는 모듈에는 `import "server-only"`를
  선언합니다.
- Client Component는 서버 전용 모듈을 직접 import하지 않습니다. 필요한
  데이터와 동작은 props 또는 API를 통해 전달합니다.

## 11. Route Handler

- Route Handler는 요청 해석, 인증, 입력 검증, 응답 생성을 담당하고
  비즈니스 로직은 `lib/`에 둡니다.
- 인증이 필요한 API는 요청 본문을 읽거나 DB에 접근하기 전에 인증을
  확인합니다.
- Route Handler끼리 import하지 않습니다. 공용 validator와 응답 helper는
  `lib/`로 분리합니다.
- 동적 route param은 Next.js 16 규칙에 따라 비동기 `params`로 받습니다.
- 성공 상태 코드는 조회·수정 `200`, 생성 `201`, 본문 없는 삭제 `204`를
  사용합니다.
- 실패 상태 코드는 잘못된 입력 `400`, 인증 없음 `401`, 권한 없음 `403`,
  리소스 없음 `404`를 사용합니다.
- JSON 오류 응답은 `{ error: string }` 형태로 통일합니다.
- 사용자에게 노출되는 오류 문구는 한국어로 작성합니다.

## 12. 입력 검증과 타입

- 요청 본문, URL param, 폼 데이터, DB의 JSON 문자열 등 외부 경계에서
  들어온 값은 사용 전에 런타임 검증을 수행합니다.
- 타입 단언(`as`)만으로 외부 입력을 도메인 타입으로 취급하지 않습니다.
- validator를 통과한 값만 도메인 함수에 전달합니다.
- 필수 문자열은 `trim()` 후 빈 값인지 검사합니다.
- enum, 배열, 파일 MIME type과 크기는 허용 목록 또는 명시적인 조건으로
  검사합니다.
- 반복되는 요청 타입과 validator는 `lib/`에 함께 정의합니다.

## 13. 클라이언트 요청

- 모든 `fetch` 응답은 `response.ok`를 확인합니다.
- 네트워크 요청은 `try`/`catch`/`finally`로 처리하고 loading 상태는
  `finally`에서 복원합니다.
- 요청 중에는 관련 버튼과 폼 제출을 비활성화하고 함수 진입부에서도 중복
  실행을 방지합니다.
- 실패한 요청 뒤에는 페이지 이동, 목록 갱신, 성공 메시지 표시를 하지
  않습니다.
- API가 반환한 오류 문구를 우선 표시하고, 문구가 없거나 응답을 읽지
  못하면 공통 실패 문구를 표시합니다.
- 요청 중인 폼이나 영역에는 필요한 경우 `aria-busy`를 적용합니다.
- `alert`, `confirm`, `prompt`는 단순한 관리자 도구에서만 허용하며 공개
  사용자 흐름에서는 화면 내 오류, dialog, form UI를 사용합니다.

## 14. 컴포넌트와 상태

- 컴포넌트는 하나의 명확한 UI 책임을 갖도록 작성합니다.
- 페이지 전용 표현은 route 가까이에 두고 여러 화면에서 재사용되는 UI만
  `components/<kind>/`에 둡니다.
- 서버에서 계산할 수 있는 값은 클라이언트 state나 effect로 다시 계산하지
  않습니다.
- 파생 값은 별도 state로 중복 저장하지 않고 렌더링 중 계산합니다.
- effect는 외부 시스템과 동기화하거나 구독을 관리할 때 사용합니다.
- loading, error, empty 상태를 정상 데이터 상태와 함께 명시적으로
  처리합니다.

## 15. 오류 처리

- 복구 가능한 오류는 사용자에게 다음 행동을 알 수 있는 문구로
  표시합니다.
- 예상 가능한 입력 오류와 인증 오류는 Route Handler에서 처리하고,
  예상하지 못한 서버 오류를 성공 응답으로 숨기지 않습니다.
- 빈 `catch`는 사용하지 않습니다. 오류를 의도적으로 무시해야 한다면
  이유를 주석으로 남기고 안전한 fallback을 반환합니다.
- lint 규칙을 비활성화할 때는 파일 전체가 아닌 필요한 한 줄에만 적용하고
  바로 위에 이유를 한국어로 작성합니다.

## 16. 테스트

- 테스트 제목은 구현 방식이 아니라 사용자에게 보이는 동작을 설명합니다.
- 테스트는 Given, When, Then 흐름이 드러나도록 작성합니다.
- 새 Route Handler에는 정상 요청, 인증 실패, 잘못된 입력을 검증하는
  테스트를 추가합니다.
- 새 mutation UI에는 성공, API 실패, 네트워크 실패, 중복 제출 방지를
  검증하는 테스트를 추가합니다.
- 버그 수정에는 수정 전 실패하고 수정 후 통과하는 회귀 테스트를
  추가합니다.
- 시간, 네트워크, DB 상태에 의존하는 테스트는 실행 순서나 기존 데이터에
  기대지 않도록 격리합니다.
