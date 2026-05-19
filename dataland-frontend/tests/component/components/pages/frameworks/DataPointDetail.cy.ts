import DataPointDetail from '@/components/pages/frameworks/DataPointDetail.vue';
import { minimalKeycloakMock } from '@ct/testUtils/Keycloak';
import type Keycloak from 'keycloak-js';

const mockDataPointSpec = {
  dataPointType: { id: 'dp-climate', ref: '/specifications/data-point-types/dp-climate' },
  name: 'Climate Change Mitigation',
  businessDefinition: 'Activities contributing substantially to climate change mitigation.',
  dataPointBaseType: { id: 'boolean', ref: '/specifications/data-point-base-types/boolean' },
  usedBy: [
    { id: 'euTaxonomy', ref: '/specifications/frameworks/euTaxonomy' },
    { id: 'sfdr', ref: '/specifications/frameworks/sfdr' },
  ],
  constraints: ['Must be true or false', 'Cannot be null'],
};

const mockBaseTypeSpec = {
  dataPointBaseType: { id: 'boolean', ref: '/specifications/data-point-base-types/boolean' },
  name: 'Boolean',
  businessDefinition: 'A true/false value.',
  usedBy: [],
};

const keycloak = minimalKeycloakMock({});
const getKeycloakPromise = (): Promise<Keycloak> => Promise.resolve(keycloak);

describe('DataPointDetail', () => {
  it('shows a placeholder when no dataPointTypeId is provided', () => {
    // @ts-ignore
    cy.mountWithPlugins(DataPointDetail, {
      keycloak,
      props: {
        dataPointTypeId: null,
        getKeycloakPromise,
      },
    });

    cy.get('[data-test="data-point-detail"]').should('exist');
    cy.contains('Select a data point to view its details.').should('exist');
    cy.get('[data-test="data-point-loading"]').should('not.exist');
    cy.get('[data-test="data-point-error"]').should('not.exist');
  });

  it('shows a loading spinner while fetching the data point specification', () => {
    cy.intercept('GET', '**/specifications/data-point-types/dp-climate', (req) => {
      req.reply({ body: mockDataPointSpec, delay: 300 });
    }).as('getDataPoint');

    // @ts-ignore
    cy.mountWithPlugins(DataPointDetail, {
      keycloak,
      props: {
        dataPointTypeId: 'dp-climate',
        getKeycloakPromise,
      },
    });

    cy.get('[data-test="data-point-loading"]').should('exist');
    cy.wait('@getDataPoint');
    cy.get('[data-test="data-point-loading"]').should('not.exist');
  });

  it('displays name, business definition, constraints, base type and used-by links', () => {
    cy.intercept('GET', '**/specifications/data-point-types/dp-climate', { body: mockDataPointSpec }).as('getDataPoint');
    cy.intercept('GET', '**/specifications/data-point-base-types/boolean', { body: mockBaseTypeSpec }).as('getBaseType');

    // @ts-ignore
    cy.mountWithPlugins(DataPointDetail, {
      keycloak,
      props: {
        dataPointTypeId: 'dp-climate',
        getKeycloakPromise,
      },
    });

    cy.wait('@getDataPoint');
    cy.wait('@getBaseType');

    cy.get('[data-test="data-point-detail"]').should('contain.text', 'Climate Change Mitigation');
    cy.get('[data-test="data-point-detail"]').should(
      'contain.text',
      'Activities contributing substantially to climate change mitigation.'
    );

    // Constraints section
    cy.get('[data-test="data-point-detail"]').should('contain.text', 'Must be true or false');
    cy.get('[data-test="data-point-detail"]').should('contain.text', 'Cannot be null');

    // Base type section
    cy.get('[data-test="data-point-detail"]').should('contain.text', 'boolean');

    // Used-by framework links
    cy.get('[data-test="data-point-detail"]').find('a[href*="euTaxonomy"]').should('exist');
    cy.get('[data-test="data-point-detail"]').find('a[href*="sfdr"]').should('exist');
  });

  it('shows labeled ID, NAME and DEFINITION rows with correct values', () => {
    cy.intercept('GET', '**/specifications/data-point-types/dp-climate', { body: mockDataPointSpec }).as('getDataPoint');
    cy.intercept('GET', '**/specifications/data-point-base-types/boolean', { body: mockBaseTypeSpec }).as('getBaseType');

    // @ts-ignore
    cy.mountWithPlugins(DataPointDetail, {
      keycloak,
      props: {
        dataPointTypeId: 'dp-climate',
        getKeycloakPromise,
      },
    });

    cy.wait('@getDataPoint');
    cy.wait('@getBaseType');

    cy.get('[data-test="detail-id"]').should('contain.text', 'dp-climate');
    cy.get('[data-test="detail-name"]').should('contain.text', 'Climate Change Mitigation');
    cy.get('[data-test="detail-definition"]').should(
      'contain.text',
      'Activities contributing substantially to climate change mitigation.'
    );
  });

  it('shows base type details section on successful base type fetch', () => {
    cy.intercept('GET', '**/specifications/data-point-types/dp-climate', { body: mockDataPointSpec }).as('getDataPoint');
    cy.intercept('GET', '**/specifications/data-point-base-types/boolean', { body: mockBaseTypeSpec }).as('getBaseType');

    // @ts-ignore
    cy.mountWithPlugins(DataPointDetail, {
      keycloak,
      props: {
        dataPointTypeId: 'dp-climate',
        getKeycloakPromise,
      },
    });

    cy.wait('@getDataPoint');
    cy.wait('@getBaseType');

    cy.get('[data-test="base-type-details"]').should('exist');
    cy.get('[data-test="base-type-details"]').should('contain.text', 'Boolean');
    cy.get('[data-test="base-type-details"]').should('contain.text', 'A true/false value.');
  });

  it('shows an error when the base type fetch fails', () => {
    cy.intercept('GET', '**/specifications/data-point-types/dp-climate', { body: mockDataPointSpec }).as('getDataPoint');
    cy.intercept('GET', '**/specifications/data-point-base-types/boolean', { statusCode: 500 }).as('getBaseTypeFail');

    // @ts-ignore
    cy.mountWithPlugins(DataPointDetail, {
      keycloak,
      props: {
        dataPointTypeId: 'dp-climate',
        getKeycloakPromise,
      },
    });

    cy.wait('@getDataPoint');
    cy.wait('@getBaseTypeFail');

    cy.get('[data-test="data-point-error"]').should('exist');
    cy.get('[data-test="base-type-details"]').should('not.exist');
  });

  it('shows an error message when the data point API returns an error', () => {
    cy.intercept('GET', '**/specifications/data-point-types/dp-unknown', { statusCode: 500 }).as('getDataPointFail');

    // @ts-ignore
    cy.mountWithPlugins(DataPointDetail, {
      keycloak,
      props: {
        dataPointTypeId: 'dp-unknown',
        getKeycloakPromise,
      },
    });

    cy.wait('@getDataPointFail');
    cy.get('[data-test="data-point-error"]').should('exist');
    cy.get('[data-test="data-point-loading"]').should('not.exist');
  });

  it('updates the displayed data point when dataPointTypeId prop changes', () => {
    const secondDataPointSpec = {
      ...mockDataPointSpec,
      dataPointType: { id: 'dp-social', ref: '/specifications/data-point-types/dp-social' },
      name: 'Social Objectives',
      businessDefinition: 'Social and employee matters.',
      usedBy: [],
      constraints: [],
    };

    cy.intercept('GET', '**/specifications/data-point-types/dp-climate', { body: mockDataPointSpec }).as(
      'getFirstDataPoint'
    );
    cy.intercept('GET', '**/specifications/data-point-types/dp-social', { body: secondDataPointSpec }).as(
      'getSecondDataPoint'
    );
    cy.intercept('GET', '**/specifications/data-point-base-types/boolean', { body: mockBaseTypeSpec }).as('getBaseType');

    // @ts-ignore
    cy.mountWithPlugins(DataPointDetail, {
      keycloak,
      props: {
        dataPointTypeId: 'dp-climate',
        getKeycloakPromise,
      },
    }).then(({ wrapper }) => {
      cy.wait('@getFirstDataPoint');
      cy.get('[data-test="data-point-detail"]').should('contain.text', 'Climate Change Mitigation');

      // Enqueue the prop change so it runs after the preceding assertions settle
      cy.then(() => {
        void wrapper.setProps({ dataPointTypeId: 'dp-social' });
      });

      cy.wait('@getSecondDataPoint');
      cy.get('[data-test="data-point-detail"]').should('contain.text', 'Social Objectives');
    });
  });
});
