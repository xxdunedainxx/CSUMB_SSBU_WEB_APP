/**
 * Player-profile engine — public API.
 *
 * Framework-independent: pure TypeScript with no UI dependencies. Consumes
 * aggregate test-result JSON and produces a deterministic, inspectable
 * PlayerProfile plus a SunburstNode tree for the dashboard chart.
 */
export { buildPlayerProfile } from "./buildPlayerProfile";
export { PROFILE_ENGINE_VERSION, profileConfigV1 } from "./config";
export { validateResults } from "./validation";
export {
  extractMeasurements,
  deriveFeatures,
  fmtCount,
  fmtDegrees,
  fmtMs,
  fmtPercent,
  fmtPp,
  fmtRatio,
} from "./features";
export {
  ALL_RULES,
  runRules,
  resolveTags,
} from "./rules";
export {
  ARCHETYPE_DEFINITIONS,
  deriveArchetype,
} from "./rules/archetypes";
export { buildDomains, DOMAIN_LABELS, visualExpression } from "./buildDomains";
export type { DomainsResult } from "./buildDomains";
export {
  composeProfileTree,
  familyOfTag,
} from "./composeProfileTree";
export { applyTagBudget } from "./tagBudget";
export { buildTestMetricCharts } from "./buildTestMetricCharts";
export type {
  MetricBar,
  MetricBarGroup,
  TestMetricChart,
} from "./buildTestMetricCharts";

export type {
  CognitiveTestResults,
  ControllerDualTest,
  ControllerStickTest,
  DirectionKey,
  DirectionMap,
  DerivedFeature,
  DomainId,
  DomainProfile,
  EvidenceItem,
  EvidenceQuality,
  FacetProfile,
  GlobalArchetype,
  GoNoGoBlock,
  Measurements,
  NullableNumber,
  PlayerProfile,
  PosnerBlock,
  ProfileConfig,
  ProfileRule,
  ProfileTag,
  ProfileWarning,
  RuleContext,
  RuleMode,
  SrtBlock,
  SunburstNode,
  TagPriority,
  TaskSwitchingBlock,
  Unit,
} from "./types";
