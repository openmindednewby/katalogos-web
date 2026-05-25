/**
 * Lightweight SVG icon component.
 *
 * Renders icons from the `iconPaths` registry using react-native-svg.
 * Zero font loading, zero network requests -- each icon is a few hundred
 * bytes of inline SVG path data.
 */
import React from 'react';

import Svg, { Path } from 'react-native-svg';

import { ICON_PATHS } from './iconPaths';

import type { IconName } from './iconPaths';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const DEFAULT_SIZE = 24;
const DEFAULT_COLOR = '#000000';
const VIEWBOX = '0 0 24 24';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface Props {
  name: IconName;
  size?: number;
  color?: string;
  testID?: string;
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const SvgIcon = ({
  name,
  size = DEFAULT_SIZE,
  color = DEFAULT_COLOR,
  testID,
  accessibilityLabel,
  accessibilityHint,
}: Props): React.ReactElement => {
  const iconDef = ICON_PATHS[name];

  return (
    <Svg
      accessibilityHint={accessibilityHint}
      accessibilityLabel={accessibilityLabel}
      fill={color}
      height={size}
      testID={testID}
      viewBox={VIEWBOX}
      width={size}
    >
      {iconDef.paths.map((p) => (
        <Path
          key={p.d}
          d={p.d}
          fill={color}
          fillRule={p.fillRule}
        />
      ))}
    </Svg>
  );
};

export default SvgIcon;
