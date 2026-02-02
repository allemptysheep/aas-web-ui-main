/**
 * API 엔드포인트 관리
 * [2026-01-29] 추가: API 경로 중앙 관리
 */

// 기본 URL (env 파일에서 관리)
const isProduction = import.meta.env.MODE === 'production';
export const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL || (isProduction ? '/__API_BASE_URL_PLACEHOLDER__/' : 'http://localhost:6443');

// 인증 관련 엔드포인트
export const AUTH_ENDPOINTS = {
    LOGIN: '/accounts/aas/login',
    LOGOUT: '/accounts/aas/logout',
    REFRESH: '/accounts/aas/refresh',
} as const;

// [2026-01-29] 추가: AAS 관련 엔드포인트
export const AAS_ENDPOINTS = {
    UPLOAD: '/aas/upload',
} as const;

// 전체 URL 생성 헬퍼 함수
export function getFullUrl(endpoint: string): string {
    const baseUrl = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
    const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    return `${baseUrl}${path}`;
}
