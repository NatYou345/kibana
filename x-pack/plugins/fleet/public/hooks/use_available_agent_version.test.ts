/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { renderHook } from '@testing-library/react-hooks';

import { useAvailableAgentVersion } from './use_available_agent_version';
import { useKibanaVersion } from './use_kibana_version';
import { sendGetAgentsAvailableVersions } from './use_request';

jest.mock('./use_kibana_version');
jest.mock('./use_request');

describe('useAvailableAgentVersion', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return agent version that matches Kibana version if released', async () => {
    const mockKibanaVersion = '8.8.1';
    const mockAvailableVersions = ['8.9.0', '8.8.1', '8.8.0', '8.7.0'];

    (useKibanaVersion as jest.Mock).mockReturnValue(mockKibanaVersion);
    (sendGetAgentsAvailableVersions as jest.Mock).mockResolvedValue({
      data: { items: mockAvailableVersions },
    });

    const { result } = renderHook(() => useAvailableAgentVersion());

    expect(sendGetAgentsAvailableVersions).toHaveBeenCalled();
    expect(result.current).toEqual(mockKibanaVersion);
  });

  it('should return the latest availeble agent version if a version that matches Kibana version is not released', async () => {
    const mockKibanaVersion = '8.11.0';
    const mockAvailableVersions = ['8.8.0', '8.7.0', '8.9.2', '7.16.0'];

    (useKibanaVersion as jest.Mock).mockReturnValue(mockKibanaVersion);
    (sendGetAgentsAvailableVersions as jest.Mock).mockResolvedValue({
      data: { items: mockAvailableVersions },
    });

    const { result, waitForNextUpdate } = renderHook(() => useAvailableAgentVersion());

    expect(sendGetAgentsAvailableVersions).toHaveBeenCalled();

    await waitForNextUpdate();

    expect(result.current).toEqual('8.9.2');
  });

  it('should return the latest availeble agent version if a snapshot version', async () => {
    const mockKibanaVersion = '8.10.0-SNAPSHOT';
    const mockAvailableVersions = ['8.8.0', '8.7.0', '8.9.2', '7.16.0'];

    (useKibanaVersion as jest.Mock).mockReturnValue(mockKibanaVersion);
    (sendGetAgentsAvailableVersions as jest.Mock).mockResolvedValue({
      data: { items: mockAvailableVersions },
    });

    const { result, waitForNextUpdate } = renderHook(() => useAvailableAgentVersion());

    expect(sendGetAgentsAvailableVersions).toHaveBeenCalled();

    await waitForNextUpdate();

    expect(result.current).toEqual('8.9.2');
  });
});
