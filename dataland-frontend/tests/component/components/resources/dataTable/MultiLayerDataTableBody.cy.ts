import MultiLayerDataTableBody from '@/components/resources/dataTable/MultiLayerDataTableBody.vue';
import { minimalKeycloakMock } from '@ct/testUtils/Keycloak';
import {
  MLDTDisplayComponentName,
  MLDTDisplayObjectForEmptyString,
} from '@/components/resources/dataTable/MultiLayerDataTableCellDisplayer';
import type { MLDTConfig } from '@/components/resources/dataTable/MultiLayerDataTableConfiguration';
import type { DataMetaInformation, DataTypeEnum } from '@clients/backend';
import type { DataAndMetaInformation } from '@/api-models/DataAndMetaInformation';

type SimpleData = Record<string, never>;

const cellConfig: MLDTConfig<SimpleData> = [
  {
    type: 'cell',
    label: 'Test Field',
    shouldDisplay: () => true,
    valueGetter: () => MLDTDisplayObjectForEmptyString,
    explanation: 'This is some tooltip explanation',
  },
  {
    type: 'cell',
    label: 'Linked Field',
    shouldDisplay: () => true,
    valueGetter: () => ({
      displayComponentName: MLDTDisplayComponentName.StringDisplayComponent,
      displayValue: 'value',
    }),
    explanation: 'Tooltip with link',
    dataPointTypeId: 'dp-climate',
  },
];

const dataAndMetaInfo: Array<DataAndMetaInformation<SimpleData>> = [
  {
    data: {} as SimpleData,
    metaInfo: {
      dataId: 'test-data-id',
      companyId: 'test-company',
      dataType: 'Lksg' as DataTypeEnum,
      uploadTime: 0,
      reportingPeriod: '2023',
      qaStatus: 'Accepted',
      currentlyActive: true,
      ref: 'https://example.com',
    } as DataMetaInformation,
  },
];

describe('MultiLayerDataTableBody', () => {
  it('renders pi-info-circle icon for explanation tooltip (no link)', () => {
    // @ts-ignore
    cy.mountWithPlugins(MultiLayerDataTableBody, {
      keycloak: minimalKeycloakMock({}),
      props: {
        config: cellConfig,
        dataAndMetaInfo,
        isTopLevel: true,
        isVisible: true,
        inReviewMode: false,
      },
      global: {
        provide: {
          editModeIsOn: false,
        },
      },
    });

    cy.get('.pi-info-circle.info-icon').should('exist');
  });

  it('does not use the legacy material-icons class for info icons', () => {
    // @ts-ignore
    cy.mountWithPlugins(MultiLayerDataTableBody, {
      keycloak: minimalKeycloakMock({}),
      props: {
        config: cellConfig,
        dataAndMetaInfo,
        isTopLevel: true,
        isVisible: true,
        inReviewMode: false,
      },
      global: {
        provide: {
          editModeIsOn: false,
        },
      },
    });

    cy.get('.material-icons').should('not.exist');
  });
});
