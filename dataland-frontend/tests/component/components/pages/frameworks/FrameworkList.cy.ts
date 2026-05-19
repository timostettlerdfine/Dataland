import FrameworkList from '@/components/pages/frameworks/FrameworkList.vue';
import { minimalKeycloakMock } from '@ct/testUtils/Keycloak';
import type { SimpleFrameworkSpecification } from '@clients/specificationservice';

const mockFrameworks: SimpleFrameworkSpecification[] = [
  { framework: { id: 'euTaxonomy', ref: '/specifications/frameworks/euTaxonomy' }, name: 'EU Taxonomy' },
  { framework: { id: 'sfdr', ref: '/specifications/frameworks/sfdr' }, name: 'SFDR' },
  { framework: { id: 'lksg', ref: '/specifications/frameworks/lksg' }, name: 'LkSG' },
];

describe('FrameworkList', () => {
  it('renders all provided framework names', () => {
    // @ts-ignore
    cy.mountWithPlugins(FrameworkList, {
      keycloak: minimalKeycloakMock({}),
      props: {
        frameworks: mockFrameworks,
        modelValue: null,
      },
    });

    cy.get('[data-test="framework-list"]').should('exist');
    cy.get('[data-test="framework-list"]').should('contain.text', 'EU Taxonomy');
    cy.get('[data-test="framework-list"]').should('contain.text', 'SFDR');
    cy.get('[data-test="framework-list"]').should('contain.text', 'LkSG');
  });

  it('emits select and update:modelValue events when an item is clicked', () => {
    const onSelect = cy.spy().as('selectSpy');
    const onUpdateModelValue = cy.spy().as('updateModelValueSpy');

    // @ts-ignore
    cy.mountWithPlugins(FrameworkList, {
      keycloak: minimalKeycloakMock({}),
      props: {
        frameworks: mockFrameworks,
        modelValue: null,
        onSelect,
        'onUpdate:modelValue': onUpdateModelValue,
      },
    });

    cy.get('[data-test="framework-list"]').contains('SFDR').click();

    cy.get('@selectSpy').should('have.been.calledOnce');
    cy.get('@selectSpy').should('have.been.calledWith', 'sfdr');
    cy.get('@updateModelValueSpy').should('have.been.calledOnce');
    cy.get('@updateModelValueSpy').should('have.been.calledWith', 'sfdr');
  });

  it('renders an empty list without errors when given no frameworks', () => {
    // @ts-ignore
    cy.mountWithPlugins(FrameworkList, {
      keycloak: minimalKeycloakMock({}),
      props: {
        frameworks: [],
        modelValue: null,
      },
    });

    cy.get('[data-test="framework-list"]').should('exist');
    cy.get('.p-listbox-option').should('have.length', 0);
  });

  it('highlights the currently selected framework', () => {
    // @ts-ignore
    cy.mountWithPlugins(FrameworkList, {
      keycloak: minimalKeycloakMock({}),
      props: {
        frameworks: mockFrameworks,
        modelValue: 'sfdr',
      },
    });

    cy.get('.p-listbox-option[data-p-selected="true"]').should('contain.text', 'SFDR');
  });
});
