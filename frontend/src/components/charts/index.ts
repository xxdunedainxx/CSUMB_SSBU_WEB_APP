"use client";

/**
 * Vendor-local entry point for the bklit sunburst chart.
 *
 * Source vendored from the `@bklit/sunburst-chart` shadcn registry (MIT), with
 * Tailwind utility classes swapped for project CSS classes styled in
 * `src/styles/charts.css`. `motion` is the only runtime dependency.
 */

export {
  SunburstBreadcrumb,
  useSunburstBreadcrumbItems,
  type SunburstBreadcrumbItem,
  type SunburstBreadcrumbProps,
} from "./sunburst-breadcrumb";
export { SunburstCenter, type SunburstCenterProps } from "./sunburst-center";
export {
  SunburstChart,
  type SunburstChartProps,
  type ArcDatum,
  type Focus,
} from "./sunburst-chart";
export { SunburstHint, type SunburstHintContext, type SunburstHintProps } from "./sunburst-hint";
export { SunburstLabels, type SunburstLabelsProps } from "./sunburst-labels";
export { SunburstSegment, type SunburstSegmentProps } from "./sunburst-segment";
export {
  useSunburstStable,
  useSunburstHover,
  type SunburstContextValue,
  type SunburstStableContextValue,
} from "./sunburst-context";
export {
  buildArcs,
  arcPath,
  transitionGeometry,
  type ArcGeometry,
} from "./sunburst";
export type { SunburstNode } from "./sunburst-data";
export { DEFAULT_CHART_ENTER_TRANSITION } from "./animation";
