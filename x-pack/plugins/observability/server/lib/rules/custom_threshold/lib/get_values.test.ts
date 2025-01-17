/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { alertResultsMultipleConditions } from '../mocks/custom_threshold_alert_result';
import { criteriaMultipleConditions } from '../mocks/custom_threshold_metric_params';
import { getEvaluationValues, getThreshold } from './get_values';

describe('getValue helpers', () => {
  describe('getThreshold', () => {
    test('should return threshold for one condition', () => {
      expect(getThreshold([criteriaMultipleConditions[1]])).toEqual([4, 5]);
    });

    test('should return threshold for multiple conditions', () => {
      expect(getThreshold(criteriaMultipleConditions)).toEqual([1, 2, 4, 5]);
    });
  });

  describe('getEvaluationValues', () => {
    test('should return evaluation values ', () => {
      expect(getEvaluationValues(alertResultsMultipleConditions, '*')).toEqual([1.0, 3.0]);
    });
  });
});
