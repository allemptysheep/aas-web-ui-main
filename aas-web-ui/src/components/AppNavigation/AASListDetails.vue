<template>
    <v-container class="pa-0" fluid>
        <v-sheet>
            <v-divider v-if="!singleAas || !isMobile"></v-divider>
            <v-card-title class="bg-detailsHeader px-1">
                <v-row align="center" style="height: 40px" class="mx-0">
                    <!-- AAS Status -->
                    <div
                        v-if="
                            !isMobile &&
                            singleAas &&
                            assetAdministrationShellData.status &&
                            assetAdministrationShellData.status.trim() !== ''
                        "
                        class="text-caption px-1">
                        <v-tooltip
                            v-if="
                                assetAdministrationShellData.status && assetAdministrationShellData.status === 'offline'
                            "
                            :text="'AAS status ' + assetAdministrationShellData.status">
                            <template #activator="{ props }">
                                <v-icon size="small" v-bind="props" class="text-error"> mdi-cloud-off-outline </v-icon>
                            </template>
                        </v-tooltip>
                    </div>
                    <!-- Last Sync -->
                    <div class="text-caption ml-1">
                        <v-icon class="text-caption" size="small">mdi-autorenew</v-icon>
                        <span
                            class="text-caption ml-1"
                            :class="
                                assetAdministrationShellData?.timestamp === 'no sync'
                                    ? 'text-error'
                                    : 'text-subtitleText'
                            ">
                            {{ assetAdministrationShellData.timestamp }}
                        </span>
                    </div>
                    <v-spacer v-if="isMobile || singleAas"></v-spacer>
                    <!-- Jump to Submodel List on mobile -->
                    <v-btn
                        v-if="isMobile"
                        color="primary"
                        density="compact"
                        variant="tonal"
                        border
                        append-icon="mdi-chevron-right"
                        class="text-none"
                        text="Submodels"
                        @click="gotoSubmodelList()" />
                    <!-- Download AAS on Desktop -->
                    <v-tooltip :open-delay="600" location="end">
                        <template #activator="{ props }">
                            <v-btn
                                v-if="singleAas && !isMobile"
                                v-bind="props"
                                color="primary"
                                density="compact"
                                variant="tonal"
                                border
                                append-icon="mdi-download"
                                class="text-none"
                                text="Download"
                                @click="openDownloadDialog(assetAdministrationShellData)" />
                        </template>
                        <span>Download Asset Administration Shell as .aasx file</span>
                    </v-tooltip>
                </v-row>
            </v-card-title>
            <v-divider></v-divider>
            <v-card-text class="bg-detailsCard pa-0" style="overflow-y: auto" :style="{ height: detailsListHeight }">
                <!-- [2026-01-29] 추가: Backend AAS 버전 선택 및 새 버전 업로드 -->
                <!-- Backend Version Selection -->
                <v-row v-if="selectedAAS && Object.keys(selectedAAS).length > 0" class="px-3 py-2" align="center">
                    <v-col cols="8" class="py-0">
                        <v-select
                            v-if="versionOptions.length > 0"
                            v-model="selectedVersionId"
                            :items="versionOptions"
                            label="Backend AAS Version"
                            density="compact"
                            variant="outlined"
                            hide-details
                            item-title="label"
                            item-value="id"
                            :loading="versionLoading"
                            :disabled="versionLoading"
                            @update:model-value="onChangeVersion"></v-select>
                        <v-chip v-else size="small" color="grey" variant="outlined" class="text-caption">
                            백엔드에 저장된 버전이 없습니다
                        </v-chip>
                    </v-col>
                    <v-col cols="4" class="py-0 d-flex justify-end">
                        <v-btn
                            color="primary"
                            size="small"
                            variant="tonal"
                            class="text-none"
                            @click="openNewVersionDialog">
                            새 버전 추가
                        </v-btn>
                    </v-col>
                </v-row>
                <!-- Asset Information -->
                <!-- 1) AssetInformation is mandatory for an AssetAdministrationShell -->
                <!-- 2) Minimal (empty) AssetInformation (generated with aas4j) will be { assetKind: null } -->
                <AssetInformation
                    v-if="assetInformation?.assetKind && Object.keys(assetInformation).length > 1"
                    :asset-object="assetInformation"></AssetInformation>
                <v-divider
                    v-if="assetInformation?.assetKind && Object.keys(assetInformation).length > 1"
                    thickness="2"></v-divider>
                <!-- AAS Details -->
                <v-list v-if="assetAdministrationShellData" lines="one" nav class="bg-detailsCard">
                    <!-- AAS Identification -->
                    <IdentificationElement
                        :identification-object="assetAdministrationShellData"
                        :v-chip-content="
                            getKeyTypeAbbreviation(assetAdministrationShellData.modelType)
                        "></IdentificationElement>
                    <!-- AAS Administrative Information-->
                    <v-divider v-if="assetAdministrationShellData?.administration"></v-divider>
                    <AdministrativeInformationElement
                        v-if="assetAdministrationShellData.administration"
                        :administrative-information-object="assetAdministrationShellData.administration"
                        :administrative-information-title="'Administrative Information'"
                        :small="false"
                        :background-color="'detailsCard'"></AdministrativeInformationElement>
                    <v-divider
                        v-if="
                            assetAdministrationShellData.displayName &&
                            assetAdministrationShellData.displayName.length > 0
                        "
                        class="mt-2"></v-divider>
                    <!-- AAS DisplayName -->
                    <DisplayNameElement
                        v-if="
                            assetAdministrationShellData.displayName &&
                            assetAdministrationShellData.displayName.length > 0
                        "
                        :display-name-array="assetAdministrationShellData.displayName"
                        :display-name-title="'DisplayName'"
                        :small="false"></DisplayNameElement>
                    <v-divider
                        v-if="
                            assetAdministrationShellData.description &&
                            assetAdministrationShellData.description.length > 0
                        "
                        class="mt-2"></v-divider>
                    <!-- AAS Description -->
                    <DescriptionElement
                        v-if="
                            assetAdministrationShellData.description &&
                            assetAdministrationShellData.description.length > 0
                        "
                        :description-array="assetAdministrationShellData.description"
                        :description-title="'Description'"
                        :small="false"></DescriptionElement>
                </v-list>
            </v-card-text>
        </v-sheet>
    </v-container>
    <!-- Dialog for downloading AAS -->
    <DownloadAAS v-model="downloadAASDialog" :aas="aasToDownload"></DownloadAAS>
    <!-- Dialog for creating new AAS Version -->
    <v-dialog v-model="newVersionDialog" max-width="600">
        <v-card>
            <v-card-title class="text-subtitle-1"> 새 AAS 버전 업로드 </v-card-title>
            <v-divider></v-divider>
            <v-card-text>
                <v-text-field
                    v-model="newVersionLabel"
                    label="버전 이름"
                    hint="예: Demo AAS V4 또는 1.3.0"
                    persistent-hint
                    density="compact"
                    variant="outlined"
                    class="mb-3"></v-text-field>
                <v-file-input
                    v-model="newVersionFile"
                    label="AAS 파일 선택"
                    :accept="['.aasx', '.xml', '.json']"
                    variant="outlined"
                    density="compact"
                    clearable></v-file-input>
                <v-checkbox
                    v-model="setAsCurrent"
                    label="이 버전을 현재 활성 버전으로 설정"
                    hide-details
                    class="mt-3"></v-checkbox>
            </v-card-text>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn variant="text" @click="closeNewVersionDialog">취소</v-btn>
                <v-btn
                    color="primary"
                    variant="elevated"
                    :disabled="!newVersionFile || creatingVersion"
                    :loading="creatingVersion"
                    @click="createNewVersion">
                    업로드
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script lang="ts" setup>
    import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
    import { useRoute, useRouter } from 'vue-router';
    import { useAASHandling } from '@/composables/AAS/AASHandling';
    import { useAASRepositoryClient } from '@/composables/Client/AASRepositoryClient';
    import { useAASStore } from '@/store/AASDataStore';
    import { useEnvStore } from '@/store/EnvironmentStore';
    import { useInfrastructureStore } from '@/store/InfrastructureStore';
    import { useNavigationStore } from '@/store/NavigationStore';
    import { extractEndpointHref } from '@/utils/AAS/DescriptorUtils';
    import { getKeyTypeAbbreviation } from '@/utils/AAS/KeyTypesUtil';
    import {
        activateAasVersion,
        createAasVersion,
        fetchAasVersions,
        type AasVersionInfo,
    } from '@/custom/api/aasVersionApi';

    // Vue Router
    const route = useRoute();
    const router = useRouter();

    // Composables
    const { fetchAssetInformation } = useAASRepositoryClient();
    const { aasIsAvailableById, fetchAas } = useAASHandling();

    // Stores
    const navigationStore = useNavigationStore();
    const aasStore = useAASStore();
    const envStore = useEnvStore();
    const infrastructureStore = useInfrastructureStore();

    // Data
    const assetAdministrationShellData = ref({} as any | null);
    const assetInformation = ref({} as any | null);
    const autoSyncInterval = ref<number | undefined>(undefined);
    const statusCheckInterval = ref<number | undefined>(undefined);
    const downloadAASDialog = ref(false); // Variable to store if the DownloadAAS Dialog should be shown
    const aasToDownload = ref({}); // Variable to store the AAS to be downloaded
    const versionOptions = ref([] as Array<AasVersionInfo>); // Backend AAS version list
    const versionLoading = ref(false);
    const selectedVersionId = ref<string | null>(null);
    const newVersionDialog = ref(false);
    const newVersionLabel = ref('');
    const newVersionFile = ref<File | null>(null);
    const setAsCurrent = ref(true);
    const creatingVersion = ref(false);

    // Computed Properties
    const isMobile = computed(() => navigationStore.getIsMobile);
    const singleAas = computed(() => envStore.getSingleAas);
    const selectedAAS = computed(() => aasStore.getSelectedAAS); // Get the selected AAS from Store
    const aasRegistryURL = computed(() => infrastructureStore.getAASRegistryURL); // Get AAS Registry URL from Store
    const aasRepoURL = computed(() => infrastructureStore.getAASRepoURL); // Get the AAS Repository URL from the Store
    const detailsListHeight = computed(() => {
        if (isMobile.value) {
            if (singleAas.value) {
                return 'calc(100vh - 40px - 64px - 34px)'; // Full height - footer - header - details header (divider)
            } else {
                return 'calc(100vh - 231px - 40px - 64px - 36px - 64px)'; // Full height - 4x AAS items - footer - header - details header (divider) - Searchbar
            }
        } else {
            if (singleAas.value) {
                return 'calc(100vh - 64px - 48px - 40px - 35px)'; // Full height - header - collapse button - footer - details header (divider)
            } else {
                return 'calc(50vh - 40px - 48px - 33px)'; // Half height - footer - collapse button - details header (divider)
            }
        }
    });
    const autoSync = computed(() => navigationStore.getAutoSync);
    const statusCheck = computed(() => navigationStore.getStatusCheck);

    // Watchers
    watch(
        () => aasRegistryURL.value,
        async () => {
            initializeView();
        }
    );

    watch(
        () => aasRepoURL.value,
        async () => {
            initializeView();
        }
    );

    watch(
        () => selectedAAS.value,
        async () => {
            window.clearInterval(autoSyncInterval.value); // clear old interval
            if (autoSync.value.state) {
                if (selectedAAS.value && Object.keys(selectedAAS.value).length > 0) {
                    // create new interval
                    autoSyncInterval.value = window.setInterval(async () => {
                        assetAdministrationShellData.value = await fetchAas(selectedAAS.value.path); // update AAS data
                    }, autoSync.value.interval);
                }
            }

            window.clearInterval(statusCheckInterval.value); // clear old interval
            if (statusCheck.value.state === true) {
                if (selectedAAS.value && Object.keys(selectedAAS.value).length > 0) {
                    await updateStatusOfAas();

                    // create new interval
                    statusCheckInterval.value = window.setInterval(async () => {
                        await updateStatusOfAas();
                    }, statusCheck.value.interval);
                }
            }

            initializeView();
        },
        { deep: true }
    );

    watch(
        () => autoSync.value,
        async (autoSyncValue) => {
            window.clearInterval(autoSyncInterval.value); // clear old interval
            if (autoSyncValue.state === true) {
                if (selectedAAS.value && Object.keys(selectedAAS.value).length > 0) {
                    assetAdministrationShellData.value = await fetchAas(selectedAAS.value.path); // update AAS data

                    // create new interval
                    autoSyncInterval.value = window.setInterval(async () => {
                        assetAdministrationShellData.value = await fetchAas(selectedAAS.value.path); // update AAS data
                    }, autoSyncValue.interval);
                }
            }
        },
        { deep: true }
    );

    watch(
        () => statusCheck.value,
        async (statusCheckValue) => {
            window.clearInterval(statusCheckInterval.value); // clear old interval
            if (statusCheckValue.state === true) {
                assetAdministrationShellData.value.status = 'status loading';

                await updateStatusOfAas();

                // create new interval
                statusCheckInterval.value = window.setInterval(async () => {
                    await updateStatusOfAas();
                }, statusCheck.value.interval);
            } else {
                assetAdministrationShellData.value.status = 'check disabled';

                // Reset status icon after 2 seconds
                setTimeout(() => {
                    assetAdministrationShellData.value.status = '';
                }, 2000);
            }
        },
        { deep: true }
    );

    onMounted(async () => {
        if (autoSync.value.state) {
            // create new interval
            autoSyncInterval.value = window.setInterval(async () => {
                if (selectedAAS.value && Object.keys(selectedAAS.value).length > 0) {
                    assetAdministrationShellData.value = await fetchAas(selectedAAS.value.path); // update AAS data
                }
            }, autoSync.value.interval);
        }

        if (statusCheck.value.state === true) {
            await updateStatusOfAas();

            // create new interval
            statusCheckInterval.value = window.setInterval(async () => {
                await updateStatusOfAas();
            }, statusCheck.value.interval);
        }

        initializeView(true);
    });

    onBeforeUnmount(() => {
        window.clearInterval(autoSyncInterval.value);
        window.clearInterval(statusCheckInterval.value);
    });

    async function initializeView(init: boolean = false): Promise<void> {
        if (!selectedAAS.value || Object.keys(selectedAAS.value).length === 0) {
            assetAdministrationShellData.value = {};
            assetInformation.value = {};
            versionOptions.value = [];
            selectedVersionId.value = null;
            return;
        }

        assetAdministrationShellData.value = { ...selectedAAS.value }; // create local copy
        updateAssetInformation();
        await loadVersions();

        updateStatusOfAas(init);
    }

    async function loadVersions(): Promise<void> {
        if (!selectedAAS.value || !selectedAAS.value.id) {
            versionOptions.value = [];
            selectedVersionId.value = null;
            return;
        }

        versionLoading.value = true;
        try {
            const result = await fetchAasVersions(selectedAAS.value.id);
            if (result.success && Array.isArray(result.data)) {
                versionOptions.value = result.data;
                const current = result.data.find((v) => v.isCurrent);
                selectedVersionId.value = (current || result.data[0])?.id ?? null;
            } else {
                versionOptions.value = [];
                selectedVersionId.value = null;
            }
        } finally {
            versionLoading.value = false;
        }
    }

    async function updateStatusOfAas(init: boolean = false): Promise<void> {
        if (assetAdministrationShellData.value && Object.keys(assetAdministrationShellData.value).length > 0) {
            await new Promise((resolve) => setTimeout(resolve, 600)); // Give the UI the chance to refresh status icons

            const aasIsAvailable = await aasIsAvailableById(assetAdministrationShellData.value.id);

            if (aasIsAvailable) {
                assetAdministrationShellData.value.status =
                    statusCheck.value.state === true ? 'online' : init ? '' : 'check disabled';
            } else {
                assetAdministrationShellData.value.status =
                    statusCheck.value.state === true ? 'offline' : init ? '' : 'check disabled';
            }
        }
    }

    async function updateAssetInformation(): Promise<void> {
        assetInformation.value = await fetchAssetInformation(
            extractEndpointHref(assetAdministrationShellData.value, 'AAS-3.0')
        );
    }

    function gotoSubmodelList(): void {
        const query = structuredClone(route.query);
        if (Object.hasOwn(query, 'path')) delete query.path;

        router.push({
            name: 'SubmodelList',
            query: query,
        });
    }

    function openDownloadDialog(aasDescriptor: any): void {
        downloadAASDialog.value = true;
        aasToDownload.value = aasDescriptor;
    }

    async function onChangeVersion(versionId: string | null): Promise<void> {
        if (!versionId || !selectedAAS.value || !selectedAAS.value.id) return;

        const result = await activateAasVersion(selectedAAS.value.id, versionId);
        if (!result.success) {
            console.warn('버전 활성화 실패:', result.message);
            return;
        }

        // 활성 버전 변경 후 AAS 데이터/버전 정보 새로고침
        await initializeView(true);
    }

    function openNewVersionDialog(): void {
        if (!selectedAAS.value || !selectedAAS.value.id) return;

        // 기본 제안: 백엔드 버전 리스트 개수를 기반으로 간단히 제안
        if (!newVersionLabel.value) {
            const count = versionOptions.value.length;
            newVersionLabel.value = `Demo AAS V${count + 1}`;
        }
        newVersionDialog.value = true;
    }

    function closeNewVersionDialog(): void {
        newVersionDialog.value = false;
        creatingVersion.value = false;
        newVersionFile.value = null;
    }

    async function createNewVersion(): Promise<void> {
        if (!selectedAAS.value || !selectedAAS.value.id || !newVersionFile.value) return;

        creatingVersion.value = true;
        try {
            const result = await createAasVersion(selectedAAS.value.id, {
                file: newVersionFile.value,
                versionLabel: newVersionLabel.value?.trim() || undefined,
                setAsCurrent: setAsCurrent.value,
            });

            if (!result.success) {
                console.warn('새 버전 생성 실패:', result.message);
                return;
            }

            // 새 버전 생성 후 리스트/선택 상태 갱신
            await loadVersions();
            if (setAsCurrent.value) {
                await initializeView(true);
            }

            closeNewVersionDialog();
        } finally {
            creatingVersion.value = false;
        }
    }
</script>
