<!--
  Login.vue - 로그인 페이지
  [2026-01-29] 추가: 사용자 로그인 폼 컴포넌트
-->
<template>
    <v-container fluid class="fill-height" style="background-color: #f5f5f5">
        <v-row align="center" justify="center">
            <v-col cols="12" sm="8" md="4">
                <v-card class="elevation-12">
                    <v-toolbar color="primary" dark flat>
                        <v-toolbar-title>BaSyx AAS Web UI</v-toolbar-title>
                    </v-toolbar>
                    <v-card-text>
                        <v-form ref="form" v-model="valid" @submit.prevent="handleLogin">
                            <v-text-field
                                v-model="username"
                                label="Username"
                                prepend-icon="mdi-account"
                                :rules="usernameRules"
                                required
                                :disabled="isLoading"></v-text-field>
                            <v-text-field
                                v-model="password"
                                label="Password"
                                prepend-icon="mdi-lock"
                                :type="showPassword ? 'text' : 'password'"
                                :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                                :rules="passwordRules"
                                required
                                :disabled="isLoading"
                                @click:append="showPassword = !showPassword"></v-text-field>
                            <v-alert
                                v-if="error"
                                type="error"
                                variant="tonal"
                                class="mt-4"
                                closable
                                @click:close="error = null">
                                {{ error }}
                            </v-alert>
                        </v-form>
                    </v-card-text>
                    <v-card-actions>
                        <v-spacer></v-spacer>
                        <v-btn
                            color="primary"
                            variant="elevated"
                            :loading="isLoading"
                            :disabled="!valid || isLoading"
                            @click="handleLogin">
                            Login
                        </v-btn>
                    </v-card-actions>
                </v-card>
            </v-col>
        </v-row>
    </v-container>
</template>

<script lang="ts" setup>
    import { ref } from 'vue';
    import { useLoginAuth } from '@/custom/composables/Auth/useLoginAuth';

    // Form state
    const valid = ref(false);
    const username = ref('');
    const password = ref('');
    const showPassword = ref(false);

    // Validation rules
    const usernameRules = [(v: string) => !!v || 'Username is required'];
    const passwordRules = [(v: string) => !!v || 'Password is required'];

    // Auth composable
    const { isLoading, error, login } = useLoginAuth();

    async function handleLogin(): Promise<void> {
        if (!valid.value) return;

        await login({
            username: username.value,
            password: password.value,
        });
    }
</script>

<style scoped>
    .fill-height {
        min-height: 100vh;
    }
</style>
