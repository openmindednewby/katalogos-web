/**
 * Public route for the Privacy Policy.
 *
 * Renders as a full marketing-layout page (navbar + scrollable legal content + footer
 * + PoweredByFooter). Translation source: `legal.privacyPolicy.*` keys in en.json.
 *
 * The placeholder copy in the keys is the lawyer-review starting point; the locked
 * brand `legal/privacy-policy.md` draft is the source-of-truth and will replace these
 * keys section-by-section in a follow-up sub-task.
 */
import React from 'react';

import LegalPage from '../../src/components/Legal/LegalPage';
import { TestIds } from '../../src/shared/testIds';

const PLACEHOLDER_DATE = '2026-03-12';

const PRIVACY_SECTIONS = [
  'introduction',
  'dataWeCollect',
  'howWeUse',
  'legalBasis',
  'dataSharing',
  'internationalTransfers',
  'dataRetention',
  'yourRights',
  'cookies',
  'childrenPrivacy',
  'dataSecurity',
  'policyChanges',
  'contact',
] as const;

const PrivacyPolicyRoute = (): React.ReactElement => (
  <LegalPage
    lastUpdatedDate={PLACEHOLDER_DATE}
    lastUpdatedKey="legal.privacyPolicy.lastUpdated"
    sectionIds={PRIVACY_SECTIONS}
    sectionsKeyPrefix="legal.privacyPolicy"
    testID={TestIds.LANDING_PRIVACY_PAGE}
    titleKey="legal.privacyPolicy.title"
  />
);

export default PrivacyPolicyRoute;
