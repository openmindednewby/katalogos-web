/**
 * Component Library Showcase route.
 * Accessible at /showcase/components
 * Gated behind the enableThemeEditor feature flag.
 */
import React from 'react';

import FeatureGate from '../../../src/components/Shared/FeatureGate';
import ShowcaseLayout from '../../../src/features/showcase/components/ShowcaseLayout';
import ComponentShowcasePage from '../../../src/features/showcase/pages/ComponentShowcasePage';

const ComponentShowcaseRoute = (): React.ReactElement => (
  <FeatureGate flag="enableThemeEditor">
    <ShowcaseLayout>
      <ComponentShowcasePage />
    </ShowcaseLayout>
  </FeatureGate>
);

export default ComponentShowcaseRoute;
