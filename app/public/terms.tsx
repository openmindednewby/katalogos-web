/**
 * Public route for the Terms of Service.
 *
 * Renders as a full marketing-layout page (navbar + scrollable legal content + footer
 * + PoweredByFooter). Translation source: `legal.termsOfService.*` keys in en.json.
 *
 * The placeholder copy in the keys is the lawyer-review starting point; the locked
 * brand `legal/terms-of-service.md` draft is the source-of-truth and will replace
 * these keys section-by-section in a follow-up sub-task.
 */
import React from 'react';

import LegalPage from '../../src/components/Legal/LegalPage';
import { TestIds } from '../../src/shared/testIds';

const PLACEHOLDER_DATE = '2026-03-12';

const TERMS_SECTIONS = [
  'acceptance',
  'services',
  'userAccounts',
  'acceptableUse',
  'intellectualProperty',
  'dataPrivacy',
  'paymentTerms',
  'limitationOfLiability',
  'indemnification',
  'termination',
  'disputeResolution',
  'generalProvisions',
  'contact',
] as const;

const TermsOfServiceRoute = (): React.ReactElement => (
  <LegalPage
    lastUpdatedDate={PLACEHOLDER_DATE}
    lastUpdatedKey="legal.termsOfService.lastUpdated"
    sectionIds={TERMS_SECTIONS}
    sectionsKeyPrefix="legal.termsOfService"
    testID={TestIds.LANDING_TERMS_PAGE}
    titleKey="legal.termsOfService.title"
  />
);

export default TermsOfServiceRoute;
