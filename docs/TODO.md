- [x] `.cursor/` 디렉토리
  - [x] `rules/` 커서룰
  - [ ] `mcp.json` MCP 서버 설정 (예시 파일은 .gitignore에 포함)
  - [x] `dir.md` 프로젝트 디렉토리 구조
- [x] `.github/` 디렉토리
  - [x] `workflows/ci.yml` CI/CD 워크플로우
- [x] `.husky/` 디렉토리
  - [x] `pre-commit` Git hook
  - [x] `pre-push` Git hook
- [x] `app/` 디렉토리
  - [x] `favicon.ico` 파일
  - [x] `not-found.tsx` 파일
  - [x] `robots.ts` 파일
  - [x] `sitemap.ts` 파일
  - [x] `manifest.ts` 파일
- [x] `supabase/` 디렉토리
- [x] `public/` 디렉토리
  - [x] `icons/` 디렉토리
  - [x] `logo.png` 파일
  - [x] `og-image.png` 파일
- [x] `tsconfig.json` 파일
- [x] `.cursorignore` 파일
- [x] `.gitignore` 파일
- [x] `.prettierignore` 파일
- [x] `.prettierrc` 파일
- [x] `eslint.config.mjs` 파일
- [x] `AGENTS.md` 파일

# 📝 [LastChance] 개발 TODO 리스트

## 🛠 Phase 1: 프로젝트 세팅 및 보안 (Foundation & Security)

> **목표:** 빈 껍데기를 만들고, **'사장님만 들어갈 수 있는 문'**을 튼튼하게 잠그는 단계입니다.

### 1-1. 개발 환경 구축

- [x] **Next.js 프로젝트 생성:**
  - 명령어: `pnpm create next-app@latest last-chance --typescript --tailwind --eslint`
  - 옵션 선택: App Router (Yes), Src directory (No), Turbopack (No), Import alias (Yes, `@/*`).
- [x] **필수 라이브러리 설치:**
  - 명령어: `pnpm add @clerk/nextjs @supabase/supabase-js lucide-react clsx tailwind-merge`
- [x] **모바일 뷰포트(Mobile-First) CSS 설정:**
  - `app/globals.css` 수정: `body` 태그에 `max-width: 430px`, `margin: auto`, 배경색(회색) 적용.

---

**추가 개발 사항**

- [x] **필수 메타데이터 파일 생성:**
  - `app/not-found.tsx`: 404 페이지 커스터마이징 (Mobile-First 디자인)
  - `app/robots.ts`: SEO를 위한 robots.txt 동적 생성
  - `app/sitemap.ts`: 동적 사이트맵 생성
  - `app/manifest.ts`: PWA 매니페스트 설정 (모바일 앱처럼 보이도록)
- [x] **개발 도구 설정 파일:**
  - `.prettierignore`: Prettier가 무시할 파일 지정
  - `.cursorignore`: Cursor AI가 무시할 파일 지정
- [x] **프로젝트 문서화:**
  - `.cursor/dir.md`: 프로젝트 디렉토리 구조 문서화
- [x] **Git 워크플로우 설정:**
  - `.github/workflows/ci.yml`: 기본 CI/CD 워크플로우 (린트 및 빌드 체크)
  - `.husky/pre-commit`: Prettier 및 ESLint 체크
  - `.husky/pre-push`: 빌드 체크

### 1-2. 인증(Auth) 및 데이터베이스 연결

- [x] **Clerk & Supabase 연동:**
  - Clerk 대시보드에서 애플리케이션 생성.
  - Supabase 프로젝트 생성 및 `SQL Editor`에서 테이블(`profiles`, `stores` 등) 생성.
  - `.env.local` 파일에 API Key 등 환경변수 저장.
- [x] **ClerkProvider 설정:** `app/layout.tsx` 전체 감싸기.

---

**추가 개발 사항**

- [x] **데이터베이스 스키마 마이그레이션:**
  - `supabase/migrations/20260106141956_create_lastchance_schema.sql` 생성
  - ENUM 타입 정의 (user_role, product_status, order_status)
  - 테이블 생성 (profiles, stores, products, orders)
  - 외래 키 제약 조건 및 인덱스 생성
  - `reserve_product` 함수 구현 (트랜잭션 처리)
  - RLS 정책 설정 (개발용 - 모든 접근 허용)
- [x] **사용자 동기화 로직 업데이트:**
  - `app/api/sync-user/route.ts`: `users` 테이블 → `profiles` 테이블로 변경
  - Clerk `publicMetadata.role` 지원 추가
  - 필드 매핑 업데이트 (name → nickname, role 기본값 'BUYER')
- [x] **환경 변수 문서화:**
  - `.env.example` 파일 생성 (Clerk 및 Supabase 환경 변수 예시)
  - `docs/environment-setup.md` 가이드 문서 작성
- [x] **Clerk-Supabase 통합 상태 확인:**
  - `docs/clerk-supabase-integration-status.md` 문서 작성
  - 통합 아키텍처 다이어그램 및 체크리스트 제공
  - 테스트 방법 및 문제 해결 가이드 포함

### 1-3. [핵심] 역할 기반 보안 (RBAC Middleware)

- [x] **역할 선택 페이지 구현 (`/onboarding`):**
  - 회원가입 직후 리다이렉트 될 페이지.
  - "사장님(Seller)" vs "학생(Buyer)" 선택 버튼.
  - 선택 시 Clerk `publicMetadata` 업데이트 및 Supabase `profiles` 테이블에 Insert.
- [x] **미들웨어(`middleware.ts`) 작성:**
  - Clerk 미들웨어를 사용하여 경로 보호.
  - **로직:** `/seller`로 시작하는 주소에 접근 시, 유저의 metadata가 `seller`가 아니면 메인 화면으로 강제 이동(Redirect).

---

**추가 개발 사항**

- [x] **역할 업데이트 Server Action 구현:**
  - `app/onboarding/actions.ts`: 역할 업데이트 Server Action
  - Clerk `publicMetadata.role` 업데이트
  - Supabase `profiles.role` 업데이트
  - 트랜잭션 처리 및 에러 처리
  - 역할에 따른 자동 리다이렉트 (SELLER → `/seller`, BUYER → `/`)
- [x] **역할 선택 페이지 UI 구현:**
  - `app/onboarding/page.tsx`: Mobile-First 디자인
  - 큰 선택 버튼 2개 (사장님 / 학생)
  - 아이콘 및 설명 텍스트 포함
  - Server Action 호출 및 리다이렉트 처리
- [x] **Middleware RBAC 로직 구현:**
  - `middleware.ts`: `/seller/*` 경로 보호
  - `createRouteMatcher`를 사용한 경로 매칭
  - `sessionClaims.publicMetadata.role` 확인
  - SELLER가 아니면 `/`로 리다이렉트
  - `/onboarding`, `/api/*` 경로는 보호하지 않음
- [x] **회원가입 후 자동 리다이렉트:**
  - `components/providers/role-redirect-provider.tsx`: 역할 리다이렉트 프로바이더
  - 역할이 설정되지 않은 사용자를 `/onboarding`으로 자동 리다이렉트
  - `app/layout.tsx`에 프로바이더 추가
- [x] **역할 확인 유틸리티 함수:**
  - `lib/auth/role.ts`: 역할 확인 유틸리티 함수
  - `getUserRole()`: 현재 사용자의 역할 반환
  - `isSeller()`, `isBuyer()`, `hasRole()`: 역할 확인 함수

---

## 🛠 Phase 2: 사장님 기능 개발 (Supply Side)

> **목표:** 사장님이 로그인해서 상품을 올리고, DB에 잘 저장되는지 확인합니다.

### 2-1. 사장님 전용 레이아웃

- [x] **폴더 구조 생성:** `app/(seller)/layout.tsx`
- [x] **사장님용 네비게이션 바:** 하단에 [내 상품 관리], [등록하기], [설정] 메뉴 배치.

---

**추가 개발 사항**

- [x] **Route Group 디렉토리 구조 생성:**
  - `app/(seller)/` 디렉토리 생성
  - Next.js Route Groups 기능 사용 (URL에 포함되지 않음)
- [x] **사장님용 하단 네비게이션 바 구현:**
  - `components/navigation/seller-bottom-nav.tsx`: 하단 고정 네비게이션 바
  - Mobile-First 디자인 (max-width: 430px)
  - 현재 활성화된 메뉴 강조 표시
  - 아이콘 + 텍스트 레이블 (Package, Plus, Settings)
  - `usePathname` 훅으로 현재 경로 확인
- [x] **사장님 전용 레이아웃 구현:**
  - `app/(seller)/layout.tsx`: 사장님 전용 레이아웃
  - `isSeller()` 함수로 추가 보안 레이어 (이중 보안)
  - 하단 네비게이션 바 통합
  - 하단 네비게이션 바를 위한 padding-bottom 적용
- [x] **임시 페이지 구현:**
  - `app/(seller)/page.tsx`: `/seller/dashboard`로 리다이렉트
  - `app/(seller)/dashboard/page.tsx`: 내 상품 관리 임시 페이지
  - `app/(seller)/upload/page.tsx`: 상품 등록 임시 페이지
  - `app/(seller)/settings/page.tsx`: 설정 임시 페이지

### 2-2. 상품 등록 기능

- [ ] **가게 정보 등록:** (최초 1회) 가게 이름, 위치 입력받아 `stores` 테이블 저장.
- [ ] **상품 등록 페이지 (`/seller/upload`):**
  - 파일 업로드 UI (`input type="file"`) 구현.
  - 메뉴명, 정가, 할인가, 픽업 시간 입력 폼.
- [ ] **이미지 업로드 로직:**
  - Supabase Storage에 `products` 버킷 생성 및 정책(Policy) 설정 (누구나 읽기 가능, 인증된 유저만 쓰기 가능).
  - 이미지 업로드 -> URL 획득 -> `products` 테이블에 데이터 저장.

### 2-3. 내 상품 관리 (Dashboard)

- [ ] **상품 리스트 조회:** `store_id`가 내 가게인 상품만 `SELECT`.
- [ ] **상태 변경 기능:** [판매 완료] 버튼 클릭 시 `status`를 `SOLD`로 변경 (`UPDATE`).

---

## 🛠 Phase 3: 사용자(학생) 기능 개발 (Demand Side)

> **목표:** 학생들이 들어와서 상품을 보고 '예약' 버튼을 누르게 합니다.

### 3-1. 사용자 전용 레이아웃

- [ ] **폴더 구조 생성:** `app/(buyer)/layout.tsx`
- [ ] **사용자용 네비게이션 바:** 하단에 [홈], [내 예약], [마이페이지] 메뉴 배치.

### 3-2. 메인 피드 (Feed)

- [ ] **상품 리스트 조회:** `status`가 `AVAILABLE`인 모든 상품 조회.
- [ ] **필터 UI 구현:** 상단 탭 (전체 / 😋바로섭취 / 🍳조리용 / 💸만원이하) 클릭 시 쿼리 조건 변경.
- [ ] **카드 UI 디자인:** 사진, 할인율(빨간색), 가격 표시.

### 3-3. 예약 시스템 (Reservation)

- [ ] **상세 페이지:** 상품 클릭 시 `/product/[id]` 로 이동.
- [ ] **예약 액션 (Server Action):**
  - [예약하기] 버튼 클릭.
  - **트랜잭션:** (1) 재고 확인 -> (2) `orders` 테이블 Insert -> (3) `products` 상태 `RESERVED`로 변경.
  - 성공 시 "예약 성공" 팝업 띄우기.

### 3-4. 내 예약 확인

- [ ] **예약 내역 리스트:** `orders` 테이블에서 내 아이디로 조회.
- [ ] **상태 표시:** 예약중(초록색) / 픽업완료(회색) / 취소됨(빨간색) 뱃지 표시.

---

## 🛠 Phase 4: 배포 및 테스트

- [ ] **최종 테스트:**
  - 크롬 시크릿 모드 2개를 켜서 하나는 '사장님', 하나는 '학생'으로 로그인.
  - 학생이 `/seller/upload` 주소를 쳤을 때 튕겨 나가는지 확인.
  - 사장님이 올린 물건이 학생 화면에 뜨는지 확인.
- [ ] **배포 (Vercel):** GitHub 레포지토리 연결 후 Deploy.

---

## 💡 Cursor AI와 개발할 때 팁 (단계별 프롬프트)

개발이 막힐 때 아래 문구를 **복사해서** 사용하세요.

**[Phase 1: 보안 설정할 때]**

> "지금 `middleware.ts`를 작성하려고 해.
> Clerk를 사용 중이고, `/seller` 경로는 오직 `publicMetadata.role`이 'SELLER'인 사람만 접근할 수 있게 보호해줘.
> 권한이 없으면 `/` (홈)으로 리다이렉트 시키는 코드를 작성해줘."

**[Phase 2: 이미지 업로드 할 때]**

> "Supabase Storage에 이미지를 올리는 함수를 `lib/storage.ts`에 만들어줘.
> 브라우저에서 선택한 파일을 받아서 `products` 버킷에 올리고, 업로드된 이미지의 Public URL을 반환하는 함수여야 해."

**[Phase 3: 예약 버튼 만들 때]**

> "예약 버튼을 누르면 실행될 Server Action을 만들어줘.
> 동시에 여러 사람이 누를 수 있으니까, 반드시 DB에서 현재 상태가 'AVAILABLE'인지 먼저 확인하고 업데이트하는 로직이 필요해."
