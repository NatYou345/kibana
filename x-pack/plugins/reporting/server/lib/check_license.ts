/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { ILicense } from '@kbn/licensing-plugin/server';
import { ExportType } from '@kbn/reporting-server';
import { ExportTypesRegistry } from './export_types_registry';

export interface LicenseCheckResult {
  showLinks: boolean;
  enableLinks: boolean;
  message?: string;
  jobTypes?: string[];
}

const messages = {
  getUnavailable: () => {
    return 'You cannot use Reporting because license information is not available at this time.';
  },
  getExpired: (license: ILicense) => {
    return `You cannot use Reporting because your ${license.type} license has expired.`;
  },
};

const makeManagementFeature = (exportTypes: ExportType[]) => {
  return {
    id: 'management',
    checkLicense: (license?: ILicense) => {
      if (!license || !license.type) {
        return {
          showLinks: true,
          enableLinks: false,
          message: messages.getUnavailable(),
        };
      }

      if (!license.isActive) {
        return {
          showLinks: true,
          enableLinks: false,
          message: messages.getExpired(license),
        };
      }

      const validJobTypes = exportTypes
        .filter((exportType) => exportType.validLicenses.includes(license.type!))
        .map((exportType) => exportType.jobType);

      return {
        showLinks: validJobTypes.length > 0,
        enableLinks: validJobTypes.length > 0,
        jobTypes: validJobTypes,
      };
    },
  };
};

const makeExportTypeFeature = (exportType: ExportType) => {
  return {
    id: exportType.id,
    checkLicense: (license?: ILicense) => {
      if (!license || !license.type) {
        return {
          showLinks: true,
          enableLinks: false,
          message: messages.getUnavailable(),
        };
      }

      if (!exportType.validLicenses.includes(license.type)) {
        return {
          showLinks: false,
          enableLinks: false,
          message: `Your ${license.type} license does not support ${exportType.name} Reporting. Please upgrade your license.`,
        };
      }

      if (!license.isActive) {
        return {
          showLinks: true,
          enableLinks: false,
          message: messages.getExpired(license),
        };
      }

      return {
        showLinks: true,
        enableLinks: true,
      };
    },
  };
};

export function checkLicense(
  exportTypesRegistry: ExportTypesRegistry,
  license: ILicense | undefined
) {
  const exportTypes = Array.from(exportTypesRegistry.getAll());
  const reportingFeatures = [
    ...exportTypes.map(makeExportTypeFeature),
    makeManagementFeature(exportTypes),
  ];

  return reportingFeatures.reduce((result, feature) => {
    result[feature.id] = feature.checkLicense(license);
    return result;
  }, {} as Record<string, LicenseCheckResult>);
}
