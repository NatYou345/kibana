/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import type Boom from '@hapi/boom';
import { isBoom } from '@hapi/boom';

import type {
  IKibanaResponse,
  KibanaResponseFactory,
  RequestHandlerContext,
} from '@kbn/core/server';
import type { KibanaRequest } from '@kbn/core/server';

import { appContextService } from '../services';

import {
  AgentNotFoundError,
  AgentActionNotFoundError,
  AgentPolicyNameExistsError,
  ConcurrentInstallOperationError,
  FleetError,
  PackageNotFoundError,
  PackageUnsupportedMediaTypeError,
  RegistryConnectionError,
  RegistryError,
  RegistryResponseError,
  PackageFailedVerificationError,
  PackagePolicyNotFoundError,
  FleetUnauthorizedError,
  PackagePolicyNameExistsError,
} from '.';

type IngestErrorHandler = (
  params: IngestErrorHandlerParams
) => IKibanaResponse | Promise<IKibanaResponse>;
interface IngestErrorHandlerParams {
  error: FleetError | Boom.Boom | Error;
  response: KibanaResponseFactory;
  request?: KibanaRequest;
  context?: RequestHandlerContext;
}
// unsure if this is correct. would prefer to use something "official"
// this type is based on BadRequest values observed while debugging https://github.com/elastic/kibana/issues/75862

const getHTTPResponseCode = (error: FleetError): number => {
  if (error instanceof RegistryResponseError) {
    // 4xx/5xx's from EPR
    return 500;
  }
  if (error instanceof RegistryConnectionError || error instanceof RegistryError) {
    // Connection errors (ie. RegistryConnectionError) / fallback  (RegistryError) from EPR
    return 502; // Bad Gateway
  }
  if (error instanceof PackageNotFoundError || error instanceof PackagePolicyNotFoundError) {
    return 404; // Not Found
  }
  if (error instanceof AgentPolicyNameExistsError) {
    return 409; // Conflict
  }
  if (error instanceof PackageUnsupportedMediaTypeError) {
    return 415; // Unsupported Media Type
  }
  if (error instanceof PackageFailedVerificationError) {
    return 400; // Bad Request
  }
  if (error instanceof ConcurrentInstallOperationError) {
    return 409; // Conflict
  }
  if (error instanceof AgentNotFoundError) {
    return 404;
  }
  if (error instanceof AgentActionNotFoundError) {
    return 404;
  }
  if (error instanceof FleetUnauthorizedError) {
    return 403; // Unauthorized
  }
  if (error instanceof PackagePolicyNameExistsError) {
    return 409; // Conflict
  }
  return 400; // Bad Request
};

export function fleetErrorToResponseOptions(error: IngestErrorHandlerParams['error']) {
  const logger = appContextService.getLogger();
  // our "expected" errors
  if (error instanceof FleetError) {
    // only log the message
    logger.error(error.message);
    return {
      statusCode: getHTTPResponseCode(error),
      body: {
        message: error.message,
        ...(error.attributes && { attributes: error.attributes }),
      },
    };
  }

  // handle any older Boom-based errors or the few places our app uses them
  if (isBoom(error)) {
    // only log the message
    logger.error(error.output.payload.message);
    return {
      statusCode: error.output.statusCode,
      body: { message: error.output.payload.message },
    };
  }

  // not sure what type of error this is. log as much as possible
  logger.error(error);
  return {
    statusCode: 500,
    body: { message: error.message },
  };
}

export const defaultFleetErrorHandler: IngestErrorHandler = async ({
  error,
  response,
}: IngestErrorHandlerParams): Promise<IKibanaResponse> => {
  const options = fleetErrorToResponseOptions(error);
  return response.customError(options);
};
