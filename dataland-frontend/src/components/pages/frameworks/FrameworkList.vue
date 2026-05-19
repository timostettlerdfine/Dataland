<template>
  <div class="framework-list">
    <Listbox
      v-model="selectedFramework"
      :options="frameworks"
      optionLabel="name"
      :optionValue="(f) => f.framework.id"
      :loading="loading"
      data-test="framework-list"
    />
  </div>
</template>

<script setup lang="ts">
import Listbox from 'primevue/listbox';
import type { SimpleFrameworkSpecification } from '@clients/specificationservice';
import { computed } from 'vue';

const props = defineProps<{
  frameworks: SimpleFrameworkSpecification[];
  modelValue: string | null;
  loading?: boolean;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: string];
  select: [frameworkId: string];
}>();

const selectedFramework = computed({
  get: () => props.modelValue,
  set: (value: string | null) => {
    if (value) {
      emit('update:modelValue', value);
      emit('select', value);
    }
  },
});
</script>

<style scoped>
.framework-list {
  min-width: 220px;
}
</style>
