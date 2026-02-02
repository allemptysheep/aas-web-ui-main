/**
 * useLoginAuth - 로그인 인증 컴포저블
 * [2026-01-29] 추가: 로그인/로그아웃 API 호출 처리
 * [2026-01-29] 수정: authApi 사용하도록 변경
 */

import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { loginApi, type LoginRequest } from '@/custom/api/authApi';
import { useAuthStore } from '@/custom/store/AuthStore';

export function useLoginAuth() {
    const authStore = useAuthStore();
    const router = useRouter();

    const isLoading = ref(false);
    const error = ref<string | null>(null);

    async function login(credentials: LoginRequest): Promise<boolean> {
        isLoading.value = true;
        error.value = null;

        try {
            const data = await loginApi(credentials);

            // Store authentication data
            authStore.setAuth({
                username: data.username,
                accessToken: data.accessToken,
                refreshToken: data.refreshToken,
                tokenType: data.tokenType,
            });

            // Redirect to home page
            await router.push('/');

            return true;
        } catch (err) {
            error.value = err instanceof Error ? err.message : '로그인 실패';
            console.error('Login error:', err);
            return false;
        } finally {
            isLoading.value = false;
        }
    }

    function logout(): void {
        authStore.clearAuth();
        router.push('/login');
    }

    return {
        isLoading,
        error,
        login,
        logout,
    };
}
