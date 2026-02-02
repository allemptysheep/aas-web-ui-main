/**
 * AuthStore - 사용자 인증 상태 관리 스토어
 * [2026-01-29] 추가: 로그인 시스템을 위한 인증 상태 관리
 */

import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

export interface AuthUser {
    username: string;
    accessToken: string;
    refreshToken: string;
    tokenType: string;
}

export const useAuthStore = defineStore('authStore', () => {
    // State
    const user = ref<AuthUser | null>(null);
    const isAuthenticated = ref(false);

    // Getters
    const getUser = computed(() => user.value);
    const getIsAuthenticated = computed(() => isAuthenticated.value);
    const getAccessToken = computed(() => user.value?.accessToken || '');
    const getTokenType = computed(() => user.value?.tokenType || 'Bearer');

    // Actions
    function setAuth(authData: AuthUser): void {
        user.value = authData;
        isAuthenticated.value = true;
        // Save to localStorage for persistence
        localStorage.setItem('auth', JSON.stringify(authData));
    }

    function clearAuth(): void {
        user.value = null;
        isAuthenticated.value = false;
        localStorage.removeItem('auth');
    }

    function loadAuthFromStorage(): void {
        const stored = localStorage.getItem('auth');
        if (stored) {
            try {
                const authData = JSON.parse(stored) as AuthUser;
                user.value = authData;
                isAuthenticated.value = true;
            } catch (error) {
                console.error('Failed to parse stored auth data:', error);
                clearAuth();
            }
        }
    }

    // Initialize from storage on store creation
    loadAuthFromStorage();

    return {
        // Getters
        getUser,
        getIsAuthenticated,
        getAccessToken,
        getTokenType,

        // Actions
        setAuth,
        clearAuth,
        loadAuthFromStorage,
    };
});
