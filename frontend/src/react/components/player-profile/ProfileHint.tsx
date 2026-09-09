"use client";

import { useSunburstHover, useSunburstStable } from "../../../components/charts";

/**
 * Plain-language hint under the chart. Shows the hovered arc's trail, or
 * context-appropriate guidance when nothing is hovered.
 */
export function ProfileHint() {
  const { focus } = useSunburstStable();
  const { hoveredArc } = useSunburstHover();

  let content: string;
  if (hoveredArc) {
    content = hoveredArc.trail.join("  ›  ");
  } else if (focus.depth === 0) {
    content = "Click a segment to zoom in · hover to inspect";
  } else {
    content = "Click the center to zoom out";
  }

  return <span className="profile-hint__text">{content}</span>;
}
