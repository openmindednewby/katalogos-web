/**
 * Native Forms Showcase route.
 * Accessible at /showcase/native-forms
 * Gated behind the enableThemeEditor feature flag.
 */
import React from 'react';

import FeatureGate from '../../../src/components/Shared/FeatureGate';
import ShowcaseLayout from '../../../src/features/showcase/components/ShowcaseLayout';
import NativeFormsPage from '../../../src/features/showcase/pages/NativeFormsPage';

const NativeFormsRoute = (): React.ReactElement => (
  <FeatureGate flag="enableThemeEditor">
    <ShowcaseLayout>
      <NativeFormsPage />
    </ShowcaseLayout>
  </FeatureGate>
);

export default NativeFormsRoute;
