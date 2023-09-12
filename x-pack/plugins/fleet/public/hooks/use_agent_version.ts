/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */
import { useEffect, useState } from 'react';
import semverRcompare from 'semver/functions/rcompare';

import { useKibanaVersion } from './use_kibana_version';
import { sendGetAgentsAvailableVersions } from './use_request';

/**
 * @returns The most recent agent version available to install or upgrade to.
 */
export const useAgentVersion = (): string | undefined => {
  const kibanaVersion = useKibanaVersion();
  const [agentVersion, setAgentVersion] = useState<string | undefined>(undefined);

  useEffect(() => {
    const getVersions = async () => {
      try {
        const res = await sendGetAgentsAvailableVersions();
        const availableVersions = res?.data?.items;

        if (
          availableVersions &&
          availableVersions.length > 0 &&
          availableVersions.indexOf(kibanaVersion) === -1
        ) {
          availableVersions.sort(semverRcompare);
          setAgentVersion(availableVersions[0]);
        } else {
          setAgentVersion(kibanaVersion);
        }
      } catch (err) {
        setAgentVersion(kibanaVersion);
      }
    };

    getVersions();
  }, [kibanaVersion]);

  return agentVersion;
};
