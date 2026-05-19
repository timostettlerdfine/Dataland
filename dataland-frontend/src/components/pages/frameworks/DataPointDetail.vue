<template>
  <div class="data-point-detail" data-test="data-point-detail">
    <ProgressSpinner v-if="loading" data-test="data-point-loading" />
    <Message v-else-if="error" severity="error" data-test="data-point-error">
      {{ error }}
    </Message>
    <div v-else-if="dataPointSpec">
      <h3>{{ dataPointSpec.name }}</h3>
      <p class="business-definition">{{ dataPointSpec.businessDefinition }}</p>

      <div v-if="dataPointSpec.constraints && dataPointSpec.constraints.length > 0" class="constraints-section">
        <h4>Constraints</h4>
        <ul>
          <li v-for="constraint in dataPointSpec.constraints" :key="constraint">{{ constraint }}</li>
        </ul>
      </div>

      <div class="base-type-section">
        <h4>Base Type</h4>
        <p>{{ dataPointSpec.dataPointBaseType.id }}</p>
      </div>

      <div v-if="dataPointSpec.usedBy.length > 0" class="used-by-section">
        <h4>Used By Frameworks</h4>
        <ul>
          <li v-for="fw in dataPointSpec.usedBy" :key="fw.id">
            <router-link :to="{ path: `/frameworks/${fw.id}` }">{{ fw.id }}</router-link>
          </li>
        </ul>
      </div>
    </div>
    <p v-else class="text-muted">Select a data point to view its details.</p>
  </div>
</template>

<script setup lang="ts">
import ProgressSpinner from 'primevue/progressspinner';
import Message from 'primevue/message';
import { ref, watch } from 'vue';
import { ApiClientProvider } from '@/services/ApiClients';
import type { DataPointTypeSpecification } from '@clients/specificationservice';
import type Keycloak from 'keycloak-js';

const props = defineProps<{
  dataPointTypeId: string | null;
  getKeycloakPromise: () => Promise<Keycloak>;
}>();

const loading = ref(false);
const error = ref<string | null>(null);
const dataPointSpec = ref<DataPointTypeSpecification | null>(null);

watch(
  () => props.dataPointTypeId,
  async (newId) => {
    if (!newId) {
      dataPointSpec.value = null;
      return;
    }
    loading.value = true;
    error.value = null;
    try {
      const apiClientProvider = new ApiClientProvider(props.getKeycloakPromise());
      const response = await apiClientProvider.apiClients.specificationController.getDataPointTypeSpecification(newId);
      dataPointSpec.value = response.data;
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to load data point specification';
      dataPointSpec.value = null;
    } finally {
      loading.value = false;
    }
  },
  { immediate: true }
);
</script>

<style scoped>
.data-point-detail {
  padding: 1rem;
}

.business-definition {
  margin: 0.5rem 0 1rem;
}

.constraints-section,
.base-type-section,
.used-by-section {
  margin-top: 1rem;
}
</style>
