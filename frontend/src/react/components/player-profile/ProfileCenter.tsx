"use client";

import { memo } from "react";
import { SunburstCenter, useSunburstStable } from "../../../components/charts";

/**
 * Center overlay for the player sunburst.
 *
 * At root depth there is no navigation hub — only a solid center circle.
 * Once the user drills into a domain, delegate to the vendored
 * `SunburstCenter` zoom-out hub.
 */
export const ProfileCenter = memo(function ProfileCenter() {
  const { focus, maxDepth, radius } = useSunburstStable();

  if (focus.depth !== 0) {
    return <SunburstCenter />;
  }

  // Keep the hub smaller than the inner-ring label centroid so radial text
  // (which extends inward from the wedge midpoint) stays outside the fill.
  const ringWidth = radius / Math.max(1, maxDepth);
  const hubR = Math.min(ringWidth * 0.3, 32);

  return (
    <g className="profile-center">
      <circle
        cx={0}
        cy={0}
        fill="var(--chart-background)"
        pointerEvents="none"
        r={hubR}
        stroke="var(--chart-ring)"
        strokeWidth={1}
      />
    </g>
  );
});

ProfileCenter.displayName = "ProfileCenter";
