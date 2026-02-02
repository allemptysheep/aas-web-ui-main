/**
 * 인증 API
 * [2026-01-29] 추가: 로그인/로그아웃 API 호출
 */

import { AUTH_ENDPOINTS, getFullUrl } from './endpoints';

export interface LoginRequest {
    username: string;
    password: string;
}

export interface LoginResponse {
    accessToken: string;
    refreshToken: string;
    tokenType: string;
    username: string;
}

export interface ApiError {
    message: string;
    status?: number;
}

/**
 * 로그인 API 호출
 */
export async function loginApi(credentials: LoginRequest): Promise<LoginResponse> {
    const url = getFullUrl(AUTH_ENDPOINTS.LOGIN);

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `로그인 실패: ${response.status}`);
    }

    return response.json();
}

/**
 * 로그아웃 API 호출 (필요시 구현)
 */
export async function logoutApi(token: string): Promise<void> {
    const url = getFullUrl(AUTH_ENDPOINTS.LOGOUT);

    await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
    });
}

/**
 * 토큰 갱신 API 호출 (필요시 구현)
 */
export async function refreshTokenApi(refreshToken: string): Promise<LoginResponse> {
    const url = getFullUrl(AUTH_ENDPOINTS.REFRESH);

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
        throw new Error('토큰 갱신 실패');
    }

    return response.json();
}
