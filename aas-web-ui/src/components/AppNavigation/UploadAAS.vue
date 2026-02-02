<template>
    <v-dialog v-model="uploadAASDialog" width="600">
        <v-card :loading="loadingUpload">
            <v-card-title>
                <span class="text-subtile-1">Upload AAS to Environment</span>
            </v-card-title>
            <v-divider></v-divider>
            <v-card-text>
                <!-- AAS File Input -->
                <v-file-input
                    v-model="aasFile"
                    variant="outlined"
                    density="compact"
                    :multiple="false"
                    clearable
                    class="my-1 mt-3"
                    label="AAS File Upload"
                    :accept="['.aasx', '.xml', '.json']">
                    <template #append-inner>
                        <v-btn
                            size="small"
                            variant="elevated"
                            color="primary"
                            class="text-buttonText"
                            style="right: -4px"
                            @click.stop="uploadAASFile()"
                            >Upload</v-btn
                        >
                    </template>
                </v-file-input>
                <v-list-subheader>Options</v-list-subheader>
                <v-checkbox v-model="ignoreDuplicates" label="Ignore Duplicates" hide-details></v-checkbox>
                <v-checkbox
                    v-model="registerAAS"
                    label="Register AAS (Don't use when BaSyx is the Backend!)"
                    hide-details></v-checkbox>
            </v-card-text>
        </v-card>
    </v-dialog>
</template>

<script lang="ts" setup>
    // [2026-01-29] 수정: 자바 백엔드로도 AAS 파일 전송 추가
    import { computed, ref, watch, watchEffect } from 'vue';
    import { useSMHandling } from '@/composables/AAS/SMHandling';
    import { useAASRegistryClient } from '@/composables/Client/AASRegistryClient';
    import { useAASRepositoryClient } from '@/composables/Client/AASRepositoryClient';
    import { useSMRegistryClient } from '@/composables/Client/SMRegistryClient';
    import { uploadAasToBackend } from '@/custom/api/aasApi';
    import { useInfrastructureStore } from '@/store/InfrastructureStore';
    import { useNavigationStore } from '@/store/NavigationStore';
    import { Endpoint, ProtocolInformation, SubmodelDescriptor } from '@/types/Descriptors';
    import { base64Encode } from '@/utils/EncodeDecodeUtils';

    // Stores
    const navigationStore = useNavigationStore();
    const infrastructureStore = useInfrastructureStore();

    // Computed Properties
    const aasRepositoryUrl = computed(() => infrastructureStore.getAASRepoURL);
    const smRepositoryUrl = computed(() => infrastructureStore.getSubmodelRepoURL);

    // Composables
    const { fetchAas, uploadAas } = useAASRepositoryClient();
    const { fetchSm } = useSMHandling();
    const { postAasDescriptor, createDescriptorFromAAS } = useAASRegistryClient();
    const { postSubmodelDescriptor, createDescriptorFromSubmodel } = useSMRegistryClient();

    const props = defineProps<{
        modelValue: boolean;
    }>();

    const emit = defineEmits<{
        (event: 'update:modelValue', value: boolean): void;
    }>();

    const uploadAASDialog = ref(false);
    const aasFile = ref(null as File | null);
    const loadingUpload = ref(false);
    const ignoreDuplicates = ref(true);
    const registerAAS = ref(false);

    watch(
        () => props.modelValue,
        (value) => {
            uploadAASDialog.value = value;
        }
    );

    watch(
        () => uploadAASDialog.value,
        (value) => {
            emit('update:modelValue', value);
        }
    );

    async function uploadAASFile(): Promise<void> {
        if (!aasFile.value) return;

        loadingUpload.value = true;

        try {
            // [2026-01-29] 수정: BaSyx와 자바 백엔드 두 곳으로 전송
            // 1. BaSyx 서버로 업로드
            let response = await uploadAas(aasFile.value, ignoreDuplicates.value);

            // 2. 자바 백엔드로 업로드 (병렬 처리)
            const backendResponse = await uploadAasToBackend(aasFile.value);
            if (!backendResponse.success) {
                console.warn('자바 백엔드 업로드 실패:', backendResponse.message);
            }

            if (registerAAS.value) {
                for (const aasId of response.data.aasIds) {
                    await createAndPostDescriptors(aasId);
                }
            }

            navigationStore.dispatchTriggerAASListReload();
        } catch (error) {
            console.error('Error uploading AAS:', error);
        } finally {
            resetUploadState();
        }
    }

    watchEffect(() => {
        if (!uploadAASDialog.value) {
            resetUploadState();
        }
    });

    function resetUploadState(): void {
        aasFile.value = null;
        uploadAASDialog.value = false;
        loadingUpload.value = false;
        registerAAS.value = false;
    }

    function createEndpoints(href: string, type: string): Array<Endpoint> {
        const protocolInformation = new ProtocolInformation(href, null, 'http');
        return [new Endpoint(type, protocolInformation)];
    }

    function extractSubmodelInfos(fetchedShell: any): Array<any> {
        return fetchedShell.submodels.map((submodel: any) => ({
            type: submodel.type,
            keys: submodel.keys.map((key: any) => ({
                type: key.type,
                value: key.value,
            })),
        }));
    }

    async function createAndPostDescriptors(aasId: string): Promise<void> {
        try {
            const href = aasRepositoryUrl.value + '/' + base64Encode(aasId);
            const fetchedShell = await fetchAas(href);

            const endpoints = createEndpoints(href, 'AAS-3.0');

            const aasDescriptor = createDescriptorFromAAS(fetchedShell, endpoints);

            const submodelInfos = extractSubmodelInfos(fetchedShell);

            for (const submodelInfo of submodelInfos) {
                let submodelDescriptor = await createSubmodelDescriptor(submodelInfo.keys[0].value);
                await postSubmodelDescriptor(submodelDescriptor);
            }

            await postAasDescriptor(aasDescriptor);
        } catch (error) {
            console.error('Error creating and posting descriptors:', error);
        }
    }

    async function createSubmodelDescriptor(submodelId: string): Promise<SubmodelDescriptor> {
        try {
            let submodelId64 = base64Encode(submodelId);
            let href = smRepositoryUrl.value + '/' + submodelId64;
            let submodel = await fetchSm(href);

            const endpoints = createEndpoints(href, 'SUBMODEL-3.0');

            return createDescriptorFromSubmodel(submodel, endpoints);
        } catch (error) {
            console.error('Error creating submodel descriptor:', error);
            throw error;
        }
    }
</script>
