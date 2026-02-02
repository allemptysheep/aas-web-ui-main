// [2026-01-29] 추가: AAS 버전 관리 API (버전 목록/활성화/생성)
/**
 * AAS 버전 관리 API
 * - 버전 목록 조회
 * - 버전 활성화
 * - 새 버전 생성
 */

import { useAuthStore } from '@/custom/store/AuthStore';
import { getFullUrl } from './endpoints';

export interface AasVersionInfo {
    id: string;
    label: string;
    createdAt?: string;
    isCurrent?: boolean;
}

export interface ApiResult<T = unknown> {
    success: boolean;
    message?: string;
    data?: T;
}

function createAuthHeaders(): HeadersInit {
    const authStore = useAuthStore();
    const headers: HeadersInit = {};

    if (authStore.getIsAuthenticated) {
        headers['Authorization'] = `${authStore.getTokenType} ${authStore.getAccessToken}`;
    }

    return headers;
}

/**
 * AAS 버전 목록 조회
 * @param aasId AAS 식별자
 */
export async function fetchAasVersions(aasId: string): Promise<ApiResult<AasVersionInfo[]>> {
    const endpoint = `/aas/${encodeURIComponent(aasId)}/versions`;
    const url = getFullUrl(endpoint);

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                ...createAuthHeaders(),
                Accept: 'application/json',
            },
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            return {
                success: false,
                message: errorData.message || `버전 목록 조회 실패: ${response.status}`,
            };
        }

        const data = (await response.json().catch(() => [])) as AasVersionInfo[];
        return {
            success: true,
            data,
        };
    } catch (error) {
        console.error('AAS 버전 목록 조회 오류:', error);
        return {
            success: false,
            message: error instanceof Error ? error.message : '버전 목록 조회 실패',
        };
    }
}

/**
 * AAS 버전 활성화
 * @param aasId AAS 식별자
 * @param versionId 활성화할 버전 ID
 */
export async function activateAasVersion(aasId: string, versionId: string): Promise<ApiResult> {
    const endpoint = `/aas/${encodeURIComponent(aasId)}/versions/${encodeURIComponent(versionId)}/activate`;
    const url = getFullUrl(endpoint);

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: createAuthHeaders(),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            return {
                success: false,
                message: errorData.message || `버전 활성화 실패: ${response.status}`,
            };
        }

        const data = await response.json().catch(() => ({}));
        return {
            success: true,
            data,
        };
    } catch (error) {
        console.error('AAS 버전 활성화 오류:', error);
        return {
            success: false,
            message: error instanceof Error ? error.message : '버전 활성화 실패',
        };
    }
}

export interface CreateAasVersionPayload {
    versionLabel?: string;
    setAsCurrent?: boolean;
    file: File;
}

/**
 * 새 AAS 버전 생성
 * @param aasId AAS 식별자
 * @param payload 버전 정보 및 AAS 파일
 */
export async function createAasVersion(
    aasId: string,
    payload: CreateAasVersionPayload
): Promise<ApiResult<AasVersionInfo>> {
    const endpoint = `/aas/${encodeURIComponent(aasId)}/versions`;
    const url = getFullUrl(endpoint);

    const formData = new FormData();
    formData.append('file', payload.file);
    if (payload.versionLabel) {
        formData.append('versionLabel', payload.versionLabel);
    }
    if (payload.setAsCurrent !== undefined) {
        formData.append('setAsCurrent', String(payload.setAsCurrent));
    }

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: createAuthHeaders(),
            body: formData,
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            return {
                success: false,
                message: errorData.message || `새 버전 생성 실패: ${response.status}`,
            };
        }

        const data = (await response.json().catch(() => ({}))) as AasVersionInfo;
        return {
            success: true,
            data,
        };
    } catch (error) {
        console.error('새 AAS 버전 생성 오류:', error);
        return {
            success: false,
            message: error instanceof Error ? error.message : '새 버전 생성 실패',
        };
    }
}
