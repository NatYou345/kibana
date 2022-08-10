/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { CaseSeverity } from '@kbn/cases-plugin/common/api';
import uuid from 'uuid';
import { FtrProviderContext } from '../../ftr_provider_context';

export function CasesCreateViewServiceProvider({ getService, getPageObject }: FtrProviderContext) {
  const common = getPageObject('common');
  const testSubjects = getService('testSubjects');
  const find = getService('find');
  const comboBox = getService('comboBox');

  return {
    /**
     * Opens the create case page pressing the "create case" button.
     *
     * Doesn't do navigation. Only works if you are already inside a cases app page.
     * Does not work with the cases flyout.
     */
    async openCreateCasePage() {
      await testSubjects.click('createNewCaseBtn');
      await testSubjects.existOrFail('create-case-submit', {
        timeout: 5000,
      });
    },

    /**
     * it creates a new case from the create case page
     * and leaves the navigation in the case view page
     *
     * Doesn't do navigation. Only works if you are already inside a cases app page.
     */
    async createCase({
      title = 'test-' + uuid.v4(),
      description = 'desc' + uuid.v4(),
      tag = 'tagme',
      severity = CaseSeverity.LOW,
      owner,
    }: {
      title?: string;
      description?: string;
      tag?: string;
      severity?: CaseSeverity;
      owner?: string;
    }) {
      // case name
      await testSubjects.setValue('input', title);

      // case tag
      await comboBox.setCustom('comboBoxInput', tag);

      // case description
      const descriptionArea = await find.byCssSelector('textarea.euiMarkdownEditorTextArea');
      await descriptionArea.focus();
      await descriptionArea.type(description);

      if (severity !== CaseSeverity.LOW) {
        await common.clickAndValidate(
          'case-severity-selection',
          `case-severity-selection-${severity}`
        );
      }

      if (owner) {
        await testSubjects.click(`${owner}RadioButton`);
      }

      // save
      await testSubjects.click('create-case-submit');
    },
  };
}
