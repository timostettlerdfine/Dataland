import { ref, type Ref } from 'vue';
import { ApiClientProvider } from '@/services/ApiClients';
import type { SimpleFrameworkSpecification } from '@clients/specificationservice';
import type Keycloak from 'keycloak-js';

const frameworks = ref<SimpleFrameworkSpecification[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);
let fetched = false;

interface UseSpecificationServiceReturn {
  frameworks: Ref<SimpleFrameworkSpecification[]>;
  loading: Ref<boolean>;
  error: Ref<string | null>;
  fetchFrameworks: () => Promise<void>;
}

/**
 * Composable that provides cached access to the specification service framework list.
 */
export function useSpecificationService(getKeycloakPromise: () => Promise<Keycloak>): UseSpecificationServiceReturn {
  const apiClientProvider = new ApiClientProvider(getKeycloakPromise());

  /**
   * Fetches the list of frameworks from the specification service. Caches the result.
   */
  async function fetchFrameworks(): Promise<void> {
    if (fetched) return;
    loading.value = true;
    error.value = null;
    try {
      const response = await apiClientProvider.apiClients.specificationController.listFrameworkSpecifications();
      frameworks.value = response.data;
      fetched = true;
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to load frameworks';
    } finally {
      loading.value = false;
    }
  }

  return { frameworks, loading, error, fetchFrameworks };
}
