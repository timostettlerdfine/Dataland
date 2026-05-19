<template>
  <div class="data-point-detail" data-test="data-point-detail">
    <ProgressSpinner v-if="loading" data-test="data-point-loading" />
    <Message v-else-if="error" severity="error" data-test="data-point-error">
      {{ error }}
    </Message>
    <div v-else-if="dataPointSpec" class="detail-rows">
      <div class="detail-row">
        <span class="detail-label">Technical ID</span>
        <span class="detail-value" data-test="detail-id">{{ dataPointSpec.dataPointType.id }}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">NAME</span>
        <span class="detail-value" data-test="detail-name">{{ dataPointSpec.name }}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">DEFINITION</span>
        <span class="detail-value" data-test="detail-definition">{{ dataPointSpec.businessDefinition }}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">BASE TYPE</span>
        <span class="detail-value" data-test="detail-base-type">{{ baseTypeSpec?.name ?? dataPointSpec.dataPointBaseType.id }}</span>
      </div>
      <div v-if="dataPointSpec.usedBy.length > 0" class="detail-row">
        <span class="detail-label">USED BY</span>
        <ul class="detail-value used-by-list">
          <li v-for="fw in dataPointSpec.usedBy" :key="fw.id">
            <router-link :to="{ path: `/frameworks/${fw.id}` }">{{ frameworkNameMap.get(fw.id) ?? fw.id }}</router-link>
          </li>
        </ul>
      </div>
      <div v-if="dataPointSpec.constraints && dataPointSpec.constraints.length > 0" class="detail-row">
        <span class="detail-label">CONSTRAINTS</span>
        <ul class="detail-value">
          <li v-for="constraint in dataPointSpec.constraints" :key="constraint">{{ constraint }}</li>
        </ul>
      </div>

      <div v-if="baseTypeSpec" class="base-type-details" data-test="base-type-details">
        <h4>Base Type Details</h4>
        <div class="detail-row">
          <span class="detail-label">NAME</span>
          <span class="detail-value">{{ baseTypeSpec.name }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">DEFINITION</span>
          <span class="detail-value">{{ baseTypeSpec.businessDefinition }}</span>
        </div>
        <div v-if="baseTypeSpec.validatedBy" class="detail-row">
          <span class="detail-label">VALIDATED BY</span>
          <span class="detail-value">{{ shortClassName(baseTypeSpec.validatedBy) }}</span>
        </div>
      </div>
    </div>
    <p v-else class="text-muted">Select a data point to view its details.</p>
  </div>
</template>

<script setup lang="ts">
import ProgressSpinner from 'primevue/progressspinner';
import Message from 'primevue/message';
import { computed, ref, watch } from 'vue';
import { ApiClientProvider } from '@/services/ApiClients';
import type {
  DataPointTypeSpecification,
  DataPointBaseTypeSpecification,
  SimpleFrameworkSpecification,
} from '@clients/specificationservice';
import type Keycloak from 'keycloak-js';

const props = defineProps<{
  dataPointTypeId: string | null;
  getKeycloakPromise: () => Promise<Keycloak>;
  frameworks?: SimpleFrameworkSpecification[];
}>();

const frameworkNameMap = computed<Map<string, string>>(() => {
  const map = new Map<string, string>();
  for (const fw of props.frameworks ?? []) {
    map.set(fw.framework.id, fw.name);
  }
  return map;
});

/** Returns the last segment of a fully-qualified class name. */
function shortClassName(fullName: string): string {
  return fullName.split('.').at(-1) ?? fullName;
}

const loading = ref(false);
const error = ref<string | null>(null);
const dataPointSpec = ref<DataPointTypeSpecification | null>(null);
const baseTypeSpec = ref<DataPointBaseTypeSpecification | null>(null);

watch(
  () => props.dataPointTypeId,
  async (newId) => {
    if (!newId) {
      dataPointSpec.value = null;
      baseTypeSpec.value = null;
      return;
    }
    loading.value = true;
    error.value = null;
    try {
      const apiClientProvider = new ApiClientProvider(props.getKeycloakPromise());
      const response = await apiClientProvider.apiClients.specificationController.getDataPointTypeSpecification(newId);
      dataPointSpec.value = response.data;

      const baseTypeId = response.data.dataPointBaseType.id;
      const baseTypeResponse = await apiClientProvider.apiClients.specificationController.getDataPointBaseType(baseTypeId);
      baseTypeSpec.value = baseTypeResponse.data;
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to load data point specification';
      dataPointSpec.value = null;
      baseTypeSpec.value = null;
    } finally {
      loading.value = false;
    }
  },
  { immediate: true }
);
</script>

<style scoped>
.data-point-detail {
  flex: 1;
  padding: 1rem;
  min-width: 0;
  overflow-x: hidden;
}

.detail-rows {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.detail-row {
  display: flex;
  gap: 1rem;
}

.detail-label {
  font-weight: 600;
  min-width: 8rem;
  color: var(--p-text-muted-color);
  font-size: 0.75rem;
  text-transform: uppercase;
  padding-top: 0.125rem;
}

.detail-value {
  flex: 1;
  text-align: left;
  word-break: break-word;
}

.used-by-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.base-type-details {
  margin-top: 1rem;
  border-top: 1px solid var(--p-content-border-color);
  padding-top: 1rem;
}

.base-type-details h4 {
  margin: 0 0 0.5rem 0;
}
</style>
