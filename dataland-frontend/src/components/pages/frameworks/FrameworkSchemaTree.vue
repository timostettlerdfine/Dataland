<template>
  <div class="framework-schema-tree">
    <Tree
      v-if="treeNodes.length > 0"
      :value="treeNodes"
      selectionMode="single"
      v-model:selectionKeys="selectedKeys"
      @node-select="onNodeSelect"
      data-test="schema-tree"
    />
    <Message v-else-if="parseError" severity="error" data-test="schema-parse-error">
      {{ parseError }}
    </Message>
    <p v-else class="text-muted">No schema available.</p>
  </div>
</template>

<script setup lang="ts">
import Tree from 'primevue/tree';
import Message from 'primevue/message';
import { computed, ref, watch } from 'vue';
import type { TreeNode } from 'primevue/treenode';

interface SchemaLeaf {
  id: string;
  ref: string;
  aliasExport?: string;
}

const props = defineProps<{
  schema: string;
}>();

const emit = defineEmits<{
  selectDataPoint: [dataPointTypeId: string];
}>();

const selectedKeys = ref<Record<string, boolean>>({});
const parseError = ref<string | null>(null);

/** Checks if a value is a schema leaf node (has id and ref). */
function isLeafNode(value: unknown): value is SchemaLeaf {
  return typeof value === 'object' && value !== null && 'id' in value && 'ref' in value;
}

/** Recursively builds PrimeVue TreeNode array from the parsed schema object. */
function buildTreeNodes(obj: Record<string, unknown>, parentKey: string = ''): TreeNode[] {
  const nodes: TreeNode[] = [];
  for (const [key, value] of Object.entries(obj)) {
    const nodeKey = parentKey ? `${parentKey}.${key}` : key;
    if (isLeafNode(value)) {
      nodes.push({
        key: nodeKey,
        label: value.aliasExport ?? key,
        data: { dataPointTypeId: value.id, isLeaf: true },
        icon: 'pi pi-file',
      });
    } else if (typeof value === 'object' && value !== null) {
      nodes.push({
        key: nodeKey,
        label: key,
        data: { isLeaf: false },
        icon: 'pi pi-folder',
        children: buildTreeNodes(value as Record<string, unknown>, nodeKey),
      });
    }
  }
  return nodes;
}

const treeNodes = computed<TreeNode[]>(() => {
  if (!props.schema) return [];
  try {
    const parsed = JSON.parse(props.schema);
    return buildTreeNodes(parsed);
  } catch {
    return [];
  }
});

watch(
  () => props.schema,
  (schema) => {
    if (!schema) {
      parseError.value = null;
      return;
    }
    try {
      JSON.parse(schema);
      parseError.value = null;
    } catch {
      parseError.value = 'Failed to parse framework schema.';
    }
  },
  { immediate: true }
);

/** Handles tree node selection, emitting selectDataPoint for leaf nodes. */
function onNodeSelect(node: TreeNode): void {
  if (node.data?.isLeaf && node.data?.dataPointTypeId) {
    emit('selectDataPoint', node.data.dataPointTypeId);
  }
}
</script>

<style scoped>
.framework-schema-tree {
  flex: 1;
  overflow-y: auto;
}
</style>
