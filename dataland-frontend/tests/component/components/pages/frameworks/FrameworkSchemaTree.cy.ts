import FrameworkSchemaTree from '@/components/pages/frameworks/FrameworkSchemaTree.vue';
import { minimalKeycloakMock } from '@ct/testUtils/Keycloak';

const validSchema = JSON.stringify({
  environmentalObjectives: {
    climateChangeMitigation: {
      id: 'dp-climate',
      ref: '/specifications/data-point-types/dp-climate',
    },
    climateChangeAdaptation: {
      id: 'dp-adapt',
      ref: '/specifications/data-point-types/dp-adapt',
      aliasExport: 'Climate Adaptation',
    },
  },
  socialObjectives: {
    id: 'dp-social',
    ref: '/specifications/data-point-types/dp-social',
  },
});

describe('FrameworkSchemaTree', () => {
  it('renders a tree from valid schema JSON', () => {
    // @ts-ignore
    cy.mountWithPlugins(FrameworkSchemaTree, {
      keycloak: minimalKeycloakMock({}),
      props: { schema: validSchema },
    });

    cy.get('[data-test="schema-tree"]').should('exist');
    // Folder node for top-level group
    cy.get('[data-test="schema-tree"]').should('contain.text', 'environmentalObjectives');
    cy.get('[data-test="schema-tree"]').should('contain.text', 'socialObjectives');
  });

  it('uses aliasExport as label for leaf nodes when provided', () => {
    // @ts-ignore
    cy.mountWithPlugins(FrameworkSchemaTree, {
      keycloak: minimalKeycloakMock({}),
      props: { schema: validSchema },
    });

    // Expand the environmentalObjectives folder to reveal child nodes
    cy.contains('.p-tree-node-content', 'environmentalObjectives').find('button').click();

    // climateChangeAdaptation has aliasExport, so that name is displayed
    cy.get('[data-test="schema-tree"]').should('contain.text', 'Climate Adaptation');
    // climateChangeMitigation has no aliasExport, so the key is displayed
    cy.get('[data-test="schema-tree"]').should('contain.text', 'climateChangeMitigation');
  });

  it('emits selectDataPoint with the dataPointTypeId when a leaf node is clicked', () => {
    const onSelectDataPoint = cy.spy().as('selectDataPointSpy');

    // @ts-ignore
    cy.mountWithPlugins(FrameworkSchemaTree, {
      keycloak: minimalKeycloakMock({}),
      props: {
        schema: validSchema,
        onSelectDataPoint,
      },
    });

    // Expand environmentalObjectives folder to reveal leaf nodes
    cy.contains('.p-tree-node-content', 'environmentalObjectives').find('button').click();

    // Click on the leaf node label (not the toggle button) to trigger node-select
    cy.contains('.p-tree-node-content', 'climateChangeMitigation')
      .find('.p-tree-node-label')
      .click();

    cy.get('@selectDataPointSpy').should('have.been.calledOnce');
    cy.get('@selectDataPointSpy').should('have.been.calledWith', 'dp-climate');
  });

  it('shows a parse error message for malformed JSON schema', () => {
    // @ts-ignore
    cy.mountWithPlugins(FrameworkSchemaTree, {
      keycloak: minimalKeycloakMock({}),
      props: { schema: '{ invalid json' },
    });

    cy.get('[data-test="schema-parse-error"]').should('exist');
    cy.get('[data-test="schema-parse-error"]').should('contain.text', 'Failed to parse framework schema.');
    cy.get('[data-test="schema-tree"]').should('not.exist');
  });

  it('shows a fallback message when schema is an empty string', () => {
    // @ts-ignore
    cy.mountWithPlugins(FrameworkSchemaTree, {
      keycloak: minimalKeycloakMock({}),
      props: { schema: '' },
    });

    cy.get('[data-test="schema-tree"]').should('not.exist');
    cy.get('[data-test="schema-parse-error"]').should('not.exist');
    cy.contains('No schema available.').should('exist');
  });
});
