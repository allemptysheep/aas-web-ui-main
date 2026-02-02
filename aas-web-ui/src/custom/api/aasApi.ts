/**
 * AAS API
 * [2026-01-29] 추가: AAS 업로드 API (자바 백엔드)
 */

import { useAuthStore } from '@/custom/store/AuthStore';
import { AAS_ENDPOINTS, getFullUrl } from './endpoints';

export interface UploadResponse {
    success: boolean;
    message?: string;
    data?: any;
}

/**
 * AAS 파일 업로드 (자바 백엔드로 전송)
 * @param file AASX/JSON/XML 파일
 * @returns 업로드 결과
 */
export async function uploadAasToBackend(file: File): Promise<UploadResponse> {
    const url = getFullUrl(AAS_ENDPOINTS.UPLOAD);
    const authStore = useAuthStore();

    const formData = new FormData();
    formData.append('file', file);

    const headers: HeadersInit = {};

    // 인증 토큰이 있으면 헤더에 추가
    if (authStore.getIsAuthenticated) {
        headers['Authorization'] = `${authStore.getTokenType} ${authStore.getAccessToken}`;
    }

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers,
            body: formData,
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            return {
                success: false,
                message: errorData.message || `업로드 실패: ${response.status}`,
            };
        }

        const data = await response.json().catch(() => ({}));
        return {
            success: true,
            data,
        };
    } catch (error) {
        console.error('AAS 업로드 오류:', error);
        return {
            success: false,
            message: error instanceof Error ? error.message : '업로드 실패',
        };
    }
}
