import FrameworksPage from '@/components/pages/FrameworksPage.vue';
import { minimalKeycloakMock } from '@ct/testUtils/Keycloak';
import { createMemoryHistory, createRouter } from 'vue-router';
import { routes } from '@/router';

/*
 * NOTE: The useSpecificationService composable holds module-level state (frameworks, fetched, error).
 * This means state carries over between tests within the same spec file.
 * Tests are ordered deliberately:
 *   1. Error state (500) — fetched stays false so subsequent tests can still fetch
 *   2. Loading + happy path (delayed success) — sets fetched=true, frameworks populated
 *   3. Detail and deep-link tests — run after frameworks are in the module cache
 * The empty-state scenario is covered in FrameworkList.cy.ts via direct props.
 */

const mockFrameworks = [
  { framework: { id: 'euTaxonomy', ref: '/specifications/frameworks/euTaxonomy' }, name: 'EU Taxonomy' },
  { framework: { id: 'sfdr', ref: '/specifications/frameworks/sfdr' }, name: 'SFDR' },
];

const mockFrameworkSpec = {
  framework: { id: 'euTaxonomy', ref: '/specifications/frameworks/euTaxonomy' },
  name: 'EU Taxonomy',
  businessDefinition: 'The EU Taxonomy is a classification system establishing a list of environmentally sustainable activities.',
  schema: JSON.stringify({
    environmentalObjectives: {
      climateChangeMitigation: { id: 'dp-climate', ref: '/specifications/data-point-types/dp-climate' },
    },
  }),
};

describe('FrameworksPage', () => {
  // ─── Test 1: error state (must run before any successful fetch) ───────────────
  it('shows an error message when the framework list API returns an error', () => {
    cy.intercept('GET', '**/specifications/frameworks', { statusCode: 500 }).as('listFrameworksFail');

    // @ts-ignore
    cy.mountWithPlugins(FrameworksPage, { keycloak: minimalKeycloakMock({}) });

    cy.wait('@listFrameworksFail');
    cy.get('[data-test="frameworks-error"]').should('exist');
    cy.get('[data-test="frameworks-loading"]').should('not.exist');
  });

  // ─── Test 2: loading spinner + happy path ─────────────────────────────────────
  // After the previous error test, fetched is still false so a fresh fetch fires.
  it('shows a loading spinner while fetching frameworks then renders the list', () => {
    cy.intercept('GET', '**/specifications/frameworks', (req) => {
      req.reply({ body: mockFrameworks, delay: 300 });
    }).as('listFrameworks');

    // @ts-ignore
    cy.mountWithPlugins(FrameworksPage, { keycloak: minimalKeycloakMock({}) });

    // Spinner must be visible before the delayed response resolves.
    cy.get('[data-test="frameworks-loading"]').should('exist');

    cy.wait('@listFrameworks');

    cy.get('[data-test="frameworks-loading"]').should('not.exist');
    cy.get('[data-test="framework-list"]').should('exist');
    cy.get('[data-test="framework-list"]').should('contain.text', 'EU Taxonomy');
    cy.get('[data-test="framework-list"]').should('contain.text', 'SFDR');
  });

  // ─── Tests 3+: run after fetched=true with [EU Taxonomy, SFDR] ───────────────

  it('shows framework detail loading spinner when a framework is being fetched', () => {
    cy.intercept('GET', '**/specifications/frameworks/euTaxonomy', (req) => {
      req.reply({ body: mockFrameworkSpec, delay: 300 });
    }).as('getFrameworkSpec');

    const router = createRouter({ routes, history: createMemoryHistory() });
    void router.push('/frameworks/euTaxonomy');

    cy.wrap(router.isReady()).then(() => {
      // @ts-ignore
    cy.mountWithPlugins(FrameworksPage, { keycloak: minimalKeycloakMock({}), router });

      cy.get('[data-test="framework-detail-loading"]').should('exist');
      cy.wait('@getFrameworkSpec');
      cy.get('[data-test="framework-detail-loading"]').should('not.exist');
    });
  });

  it('shows an error message when framework detail fetch fails', () => {
    cy.intercept('GET', '**/specifications/frameworks/euTaxonomy', { statusCode: 500 }).as('getFrameworkSpecFail');

    const router = createRouter({ routes, history: createMemoryHistory() });
    void router.push('/frameworks/euTaxonomy');

    cy.wrap(router.isReady()).then(() => {
      // @ts-ignore
    cy.mountWithPlugins(FrameworksPage, { keycloak: minimalKeycloakMock({}), router });

      cy.wait('@getFrameworkSpecFail');
      cy.get('[data-test="framework-detail-error"]').should('exist');
    });
  });

  it('loads framework detail via deep-link route param and renders schema tree', () => {
    cy.intercept('GET', '**/specifications/frameworks/euTaxonomy', { body: mockFrameworkSpec }).as('getFrameworkSpec');

    const router = createRouter({ routes, history: createMemoryHistory() });
    void router.push('/frameworks/euTaxonomy');

    cy.wrap(router.isReady()).then(() => {
      // @ts-ignore
    cy.mountWithPlugins(FrameworksPage, { keycloak: minimalKeycloakMock({}), router });

      cy.wait('@getFrameworkSpec');
      cy.get('[data-test="schema-tree"]').should('exist');
      cy.contains('h2', 'EU Taxonomy').should('exist');
    });
  });

  it('sets the selected data point when dataPointTypeId query param is present', () => {
    cy.intercept('GET', '**/specifications/frameworks/euTaxonomy', { body: mockFrameworkSpec }).as('getFrameworkSpec');
    cy.intercept('GET', '**/specifications/data-point-types/dp-climate', {
      body: {
        dataPointType: { id: 'dp-climate', ref: '/specifications/data-point-types/dp-climate' },
        name: 'Climate Change Mitigation',
        businessDefinition: 'Activities contributing substantially to climate change mitigation.',
        dataPointBaseType: { id: 'boolean', ref: '/specifications/data-point-base-types/boolean' },
        usedBy: [],
        constraints: [],
      },
    }).as('getDataPoint');

    const router = createRouter({ routes, history: createMemoryHistory() });
    void router.push({ path: '/frameworks/euTaxonomy', query: { dataPointTypeId: 'dp-climate' } });

    cy.wrap(router.isReady()).then(() => {
      // @ts-ignore
    cy.mountWithPlugins(FrameworksPage, { keycloak: minimalKeycloakMock({}), router });

      cy.wait('@getFrameworkSpec');
      cy.wait('@getDataPoint');
      cy.get('[data-test="data-point-detail"]').should('contain.text', 'Climate Change Mitigation');
    });
  });
});
