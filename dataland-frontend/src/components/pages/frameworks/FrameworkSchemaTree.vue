<template>
  <div class="framework-schema-tree">
    <h3>Schema Structure</h3>
    <IconField class="schema-search-field">
      <InputIcon class="pi pi-search" />
      <InputText v-model="filterText" placeholder="Search..." data-test="schema-search-input" />
    </IconField>
    <Tree
      v-if="filteredTreeNodes.length > 0"
      :value="filteredTreeNodes"
      selectionMode="single"
      v-model:selectionKeys="selectedKeys"
      v-model:expandedKeys="expandedKeys"
      @node-select="onNodeSelect"
      :pt="{ nodeLabel: { style: 'display: block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;' } }"
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
import InputText from 'primevue/inputtext';
import IconField from 'primevue/iconfield';
import InputIcon from 'primevue/inputicon';
import { computed, ref, watch } from 'vue';
import type { TreeNode } from 'primevue/treenode';

interface SchemaLeaf {
  id: string;
  ref: string;
  aliasExport?: string;
  name?: string;
}

const props = defineProps<{
  schema: string;
}>();

const emit = defineEmits<{
  selectDataPoint: [dataPointTypeId: string];
}>();

const selectedKeys = ref<Record<string, boolean>>({});
const expandedKeys = ref<Record<string, boolean>>({});
const filterText = ref('');
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
        label: value.name ?? value.aliasExport ?? key,
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

/** Recursively filters tree nodes to only include those matching the filter text,
 *  retaining ancestor nodes when any descendant matches. */
function filterNodes(nodes: TreeNode[], filter: string): TreeNode[] {
  const lowerFilter = filter.toLowerCase();
  const result: TreeNode[] = [];
  for (const node of nodes) {
    if (node.children && node.children.length > 0) {
      const filteredChildren = filterNodes(node.children, filter);
      if (filteredChildren.length > 0) {
        result.push({ ...node, children: filteredChildren });
      }
    } else if ((node.label ?? '').toLowerCase().includes(lowerFilter)) {
      result.push(node);
    }
  }
  return result;
}

/** Collects all non-leaf node keys from a tree for expansion. */
function collectParentKeys(nodes: TreeNode[]): Record<string, boolean> {
  const keys: Record<string, boolean> = {};
  for (const node of nodes) {
    if (node.children && node.children.length > 0) {
      keys[node.key as string] = true;
      Object.assign(keys, collectParentKeys(node.children));
    }
  }
  return keys;
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

const filteredTreeNodes = computed<TreeNode[]>(() => {
  const filter = filterText.value.trim();
  if (!filter) return treeNodes.value;
  return filterNodes(treeNodes.value, filter);
});

watch(filterText, (val) => {
  if (val.trim()) {
    expandedKeys.value = collectParentKeys(filteredTreeNodes.value);
  } else {
    expandedKeys.value = {};
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
  min-width: 0;
  overflow-y: auto;
}

.schema-search-field {
  margin-bottom: 0.5rem;
}
</style>
