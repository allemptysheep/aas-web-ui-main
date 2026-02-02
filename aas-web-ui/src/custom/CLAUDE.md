# AI 개발 가이드라인 - BaSyx AAS Web UI

## Custom 폴더 구조 규칙

### 1. 새 파일 생성

모든 새 파일은 `src/custom` 폴더 아래에 기존 프로젝트 구조를 미러링하여 생성:

- `src/store/` → `src/custom/store/`
- `src/composables/` → `src/custom/composables/`
- `src/pages/` → `src/custom/pages/`
- `src/components/` → `src/custom/components/`
- `src/types/` → `src/custom/types/`
- `src/api/` → `src/custom/api/` (API 관리)

### 2. 기존 파일 수정

기존 소스 파일 수정 시 다음 형식으로 주석 추가:

- 날짜
- 작업 유형: 추가, 수정, 삭제
- 변경 내용 설명

예시:

```typescript
// [2026-01-29] 추가: 로그인 인증 가드 - 로그인 필수 요구사항
// [2026-01-29] 수정: 사용자 정보 표시 방식 변경
// [2026-01-29] 삭제: 더 이상 사용하지 않는 함수 제거
```

### 3. Import 경로

custom 파일에서 import 시:

```typescript
import { useAuthStore } from '@/custom/store/AuthStore';
import { loginApi } from '@/custom/api/authApi';
```

## 현재 Custom 구현 목록

### API 관리 (2026-01-29)

- `src/custom/api/endpoints.ts` - API 엔드포인트 경로 관리
- `src/custom/api/authApi.ts` - 인증 API 호출 함수
- `src/custom/api/aasApi.ts` - AAS 업로드 API (자바 백엔드)
- `src/custom/api/aasVersionApi.ts` - AAS 버전 목록/활성화/생성 API (자바 백엔드)

### 인증 시스템 (2026-01-29)

- `src/custom/store/AuthStore.ts` - 인증 상태 관리 스토어
- `src/custom/composables/Auth/useLoginAuth.ts` - 로그인 컴포저블
- `src/custom/pages/Login.vue` - 로그인 페이지 컴포넌트

### 기존 파일 수정 목록

- `src/router.ts` - 로그인 라우트 및 인증 가드 추가
- `.env.development` - API 기본 URL 추가
- `entrypoint.sh` - API_BASE_URL 환경 변수 처리 추가
- `src/components/AppNavigation/UploadAAS.vue` - 자바 백엔드로 AAS 파일 전송 추가

## API 관리 구조

### 환경 변수 (.env)

```
VITE_API_BASE_URL="http://localhost:6443"
```

### 엔드포인트 정의 (endpoints.ts)

```typescript
export const AUTH_ENDPOINTS = {
    LOGIN: '/accounts/aas/login',
    LOGOUT: '/accounts/aas/logout',
    REFRESH: '/accounts/aas/refresh',
};

export const AAS_ENDPOINTS = {
    UPLOAD: '/aas/upload',
};
```

// AAS 버전 관련 엔드포인트는 REST 경로를 직접 사용 (예: /aas/{aasId}/versions)

### API 호출 함수 (authApi.ts)

```typescript
import { AUTH_ENDPOINTS, getFullUrl } from './endpoints';

export async function loginApi(credentials: LoginRequest): Promise<LoginResponse> {
    const url = getFullUrl(AUTH_ENDPOINTS.LOGIN);
    // ...
}
```

### 새 API 추가 방법

1. `endpoints.ts`에 엔드포인트 경로 추가
2. 해당 API 파일 생성 (예: `userApi.ts`)
3. 필요시 composable 생성하여 사용
