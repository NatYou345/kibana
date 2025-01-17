/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { EuiFlexGroup, EuiFlexItem } from '@elastic/eui';
import { EuiSuperDatePicker } from '@elastic/eui';
import { UI_SETTINGS } from '@kbn/data-service';
import { TimePickerQuickRange } from '@kbn/observability-shared-plugin/public/hooks/use_quick_time_ranges';
import React, { useMemo } from 'react';
import { useDatasetQualityFilters } from '../../../hooks/use_dataset_quality_filters';
import { useKibanaContextForPlugin } from '../../../utils/use_kibana';
import { FilterBar } from './filter_bar';
import { IntegrationsSelector } from './integrations_selector';

// Allow for lazy loading
// eslint-disable-next-line import/no-default-export
export default function Filters() {
  const {
    timeRange,
    onTimeChange,
    onRefresh,
    onRefreshChange,
    isLoading,
    integrations,
    onIntegrationsChange,
    selectedQuery,
    onQueryChange,
  } = useDatasetQualityFilters();

  const {
    services: { uiSettings },
  } = useKibanaContextForPlugin();

  const timePickerQuickRanges = uiSettings.get<TimePickerQuickRange[]>(
    UI_SETTINGS.TIMEPICKER_QUICK_RANGES
  );

  const commonlyUsedRanges = useMemo(
    () =>
      timePickerQuickRanges.map(({ from, to, display }) => ({
        start: from,
        end: to,
        label: display,
      })),
    [timePickerQuickRanges]
  );

  return (
    <EuiFlexGroup gutterSize="s">
      <EuiFlexItem>
        <FilterBar query={selectedQuery} onQueryChange={onQueryChange} />
      </EuiFlexItem>
      <EuiFlexItem grow={false}>
        <IntegrationsSelector
          isLoading={isLoading}
          integrations={integrations}
          onIntegrationsChange={onIntegrationsChange}
        />
      </EuiFlexItem>
      <EuiFlexItem grow={false}>
        <EuiSuperDatePicker
          start={timeRange.from}
          end={timeRange.to}
          onTimeChange={onTimeChange}
          onRefresh={onRefresh}
          onRefreshChange={onRefreshChange}
          commonlyUsedRanges={commonlyUsedRanges}
          showUpdateButton={true}
          isPaused={timeRange.refresh.isPaused}
          refreshInterval={timeRange.refresh.interval}
        />
      </EuiFlexItem>
    </EuiFlexGroup>
  );
}
