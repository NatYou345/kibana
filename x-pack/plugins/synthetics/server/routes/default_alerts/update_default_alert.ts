/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { SyntheticsRestApiRouteFactory } from '../../legacy_uptime/routes';
import { DefaultAlertService } from './default_alert_service';
import { SYNTHETICS_API_URLS } from '../../../common/constants';

export const updateDefaultAlertingRoute: SyntheticsRestApiRouteFactory = () => ({
  method: 'PUT',
  path: SYNTHETICS_API_URLS.ENABLE_DEFAULT_ALERTING,
  validate: {},
  writeAccess: true,
  handler: async ({ context, server, savedObjectsClient }): Promise<any> => {
    const defaultAlertService = new DefaultAlertService(context, server, savedObjectsClient);

    const [statusRule, tlsRule] = await Promise.all([
      defaultAlertService.updateStatusRule(),
      defaultAlertService.updateTlsRule(),
    ]);
    return {
      statusRule,
      tlsRule,
    };
  },
});
