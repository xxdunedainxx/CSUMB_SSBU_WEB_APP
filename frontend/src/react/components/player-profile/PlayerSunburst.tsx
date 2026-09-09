"use client";

import { useMemo } from "react";
import {
  buildArcs,
  SunburstBreadcrumb,
  SunburstChart,
  SunburstHint,
  SunburstLabels,
  SunburstSegment,
} from "../../../components/charts";
import type { PlayerProfile } from "../../../lib/player-profile";
import { ProfileBreadcrumb } from "./ProfileBreadcrumb";
import { ProfileCenter } from "./ProfileCenter";
import { ProfileHint } from "./ProfileHint";

export interface PlayerSunburstProps {
  profile: PlayerProfile;
  size?: number;
  /** Bump to replay the enter animation when the session changes. */
  playKey?: number | string;
}

/**
 * Renders the player-profile sunburst from the engine's `profile.sunburst`
 * tree. Wraps the vendored bklit chart, mapping every arc to a segment and
 * plugging in the profile-aware center / breadcrumb / hint.
 */
export function PlayerSunburst({
  profile,
  size = 480,
  playKey = 0,
}: PlayerSunburstProps) {
  const arcs = useMemo(
    () => buildArcs(profile.sunburst).arcs,
    [profile.sunburst]
  );

  return (
    <SunburstChart
      data={profile.sunburst}
      playKey={playKey}
      size={size}
    >
      <SunburstBreadcrumb>
        <ProfileBreadcrumb profile={profile} />
      </SunburstBreadcrumb>

      {arcs.map((arc) => (
        <SunburstSegment key={arc.id} index={arc.arcIndex} />
      ))}

      {/* Hub sits under labels so the solid center does not clip inner-ring text. */}
      <ProfileCenter />

      <SunburstLabels />

      <SunburstHint>
        <ProfileHint />
      </SunburstHint>
    </SunburstChart>
  );
}
