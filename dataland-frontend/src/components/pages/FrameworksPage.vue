<template>
  <TheContent>
    <ProgressSpinner v-if="loading" data-test="frameworks-loading" />
    <Message v-else-if="error" severity="error" data-test="frameworks-error">
      {{ error }}
    </Message>
    <p v-else-if="frameworks.length === 0" data-test="frameworks-empty">No frameworks available.</p>

    <div v-else class="frameworks-layout">
      <FrameworkList
        :frameworks="frameworks"
        v-model="selectedFrameworkId"
        :loading="loading"
        @select="onFrameworkSelect"
      />

      <div class="frameworks-content">
        <div v-if="frameworkLoading" class="framework-detail-loading">
          <ProgressSpinner data-test="framework-detail-loading" />
        </div>
        <Message v-else-if="frameworkError" severity="error" data-test="framework-detail-error">
          {{ frameworkError }}
        </Message>
        <template v-else-if="frameworkSpec">
          <div class="framework-header">
            <h2>{{ frameworkSpec.name }}</h2>
            <p>{{ frameworkSpec.businessDefinition }}</p>
          </div>

          <div class="framework-body">
            <FrameworkSchemaTree
              :schema="frameworkSpec.schema"
              @selectDataPoint="onDataPointSelect"
            />
            <DataPointDetail
              :dataPointTypeId="selectedDataPointId"
              :getKeycloakPromise="getKeycloakPromise"
            />
          </div>
        </template>
        <p v-else class="text-muted">Select a framework to explore its structure.</p>
      </div>
    </div>
  </TheContent>
</template>

<script setup lang="ts">
import { inject, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import ProgressSpinner from 'primevue/progressspinner';
import Message from 'primevue/message';
import TheContent from '@/components/generics/TheContent.vue';
import FrameworkList from '@/components/pages/frameworks/FrameworkList.vue';
import FrameworkSchemaTree from '@/components/pages/frameworks/FrameworkSchemaTree.vue';
import DataPointDetail from '@/components/pages/frameworks/DataPointDetail.vue';
import { useSpecificationService } from '@/composables/useSpecificationService';
import { ApiClientProvider } from '@/services/ApiClients';
import type { FrameworkSpecification } from '@clients/specificationservice';
import type Keycloak from 'keycloak-js';

const getKeycloakPromise = inject<() => Promise<Keycloak>>('getKeycloakPromise')!;

const route = useRoute();
const router = useRouter();

const { frameworks, loading, error, fetchFrameworks } = useSpecificationService(getKeycloakPromise);

const selectedFrameworkId = ref<string | null>(null);
const selectedDataPointId = ref<string | null>(null);
const frameworkSpec = ref<FrameworkSpecification | null>(null);
const frameworkLoading = ref(false);
const frameworkError = ref<string | null>(null);

/**
 * Loads the full specification for a given framework.
 */
async function loadFrameworkDetail(frameworkId: string): Promise<void> {
  frameworkLoading.value = true;
  frameworkError.value = null;
  try {
    const apiClientProvider = new ApiClientProvider(getKeycloakPromise());
    const response = await apiClientProvider.apiClients.specificationController.getFrameworkSpecification(frameworkId);
    frameworkSpec.value = response.data;
  } catch (e) {
    frameworkError.value = e instanceof Error ? e.message : 'Failed to load framework specification';
    frameworkSpec.value = null;
  } finally {
    frameworkLoading.value = false;
  }
}

/**
 * Handles framework selection from the list, navigating to the framework's detail route.
 */
function onFrameworkSelect(frameworkId: string): void {
  selectedDataPointId.value = null;
  void router.push({ path: `/frameworks/${frameworkId}` });
}

/**
 * Handles data point selection from the schema tree.
 */
function onDataPointSelect(dataPointTypeId: string): void {
  selectedDataPointId.value = dataPointTypeId;
}

watch(
  () => route.params.frameworkId as string | undefined,
  async (frameworkId) => {
    if (frameworkId) {
      selectedFrameworkId.value = frameworkId;
      await loadFrameworkDetail(frameworkId);
    }
  },
  { immediate: true }
);

onMounted(async () => {
  await fetchFrameworks();

  const queryDataPointId = route.query.dataPointTypeId as string | undefined;
  if (queryDataPointId) {
    selectedDataPointId.value = queryDataPointId;
  }
});
</script>

<style scoped>
.frameworks-layout {
  display: flex;
  gap: 1.5rem;
  min-height: 400px;
  overflow: hidden;
}

.frameworks-content {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.framework-header {
  margin-bottom: 1rem;
}

.framework-body {
  display: flex;
  gap: 1.5rem;
  flex: 1;
  min-width: 0;
}
</style>
