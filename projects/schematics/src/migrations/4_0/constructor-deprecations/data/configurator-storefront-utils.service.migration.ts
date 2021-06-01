import {
  ANGULAR_CORE,
  CONFIGURATOR_GROUPS_SERVICE,
  CONFIGURATOR_STOREFRONT_UTILS_SERVICE,
  DOCUMENT,
  KEYBOARD_FOCUS_SERVICE,
  PLATFORM_ID_STRING,
  SPARTACUS_PRODUCT_CONFIGURATOR_RULEBASED,
  SPARTACUS_STOREFRONTLIB,
} from '../../../../shared/constants';
import { ConstructorDeprecation } from '../../../../shared/utils/file-utils';

export const CONFIGURATOR_STOREFRONT_UTILS_SERVICE_MIGRATION: ConstructorDeprecation = {
  // feature-libs/product-configurator/rulebased/components/service/configurator-storefront-utils.service.ts
  class: CONFIGURATOR_STOREFRONT_UTILS_SERVICE,
  importPath: SPARTACUS_PRODUCT_CONFIGURATOR_RULEBASED,
  deprecatedParams: [
    {
      className: CONFIGURATOR_GROUPS_SERVICE,
      importPath: SPARTACUS_PRODUCT_CONFIGURATOR_RULEBASED,
    },
    {
      className: PLATFORM_ID_STRING,
      importPath: ANGULAR_CORE,
    },
  ],
  addParams: [
    {
      className: DOCUMENT,
      importPath: SPARTACUS_STOREFRONTLIB,
    },
    {
      className: KEYBOARD_FOCUS_SERVICE,
      importPath: SPARTACUS_STOREFRONTLIB,
    },
  ],
};