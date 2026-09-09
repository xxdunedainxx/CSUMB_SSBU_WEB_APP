/**
 * Core types for the player-profile engine.
 *
 * The engine is framework-independent: it consumes raw aggregate test-result
 * JSON and produces a deterministic, inspectable profile plus a SunburstNode
 * tree. It must never import from the UI layer.
 */

import type {
  ControllerMeasurements,
  GngMeasurements,
  PosnerMeasurements,
  SrtMeasurements,
  TsMeasurements,
} from "./extractors";

/* ------------------------------------------------------------------ */
/* Raw aggregate test-result shape (as returned by the backend later)  */
/* ------------------------------------------------------------------ */

export type NullableNumber = number | null;

export interface SrtBlock {
  Peak: NullableNumber;
  Average: NullableNumber;
}

export interface TaskSwitchingBlock {
  Single_Task_RT: NullableNumber;
  Mix_Block_Repeat_RT: NullableNumber;
  Mix_Block_Switch_RT: NullableNumber;
  Task_Switch_Cost: NullableNumber;
}

export interface GoNoGoBlock {
  Peak: NullableNumber;
  Mean: NullableNumber;
  Error_Count: NullableNumber;
}

export interface PosnerBlock {
  Average: NullableNumber;
  Peak: NullableNumber;
  Type: NullableNumber;
  Incorrect_Percentage: NullableNumber;
  Incorrect_Count: NullableNumber;
}

export type DirectionKey =
  | "Left"
  | "Up_Left"
  | "Up"
  | "Up_Right"
  | "Right"
  | "Down_Right"
  | "Down"
  | "Down_Left";

export type DirectionMap<T> = Partial<Record<DirectionKey, T>>;

export interface ControllerStickTest {
  Target_Hit_Average_Percentages: DirectionMap<NullableNumber>;
  Accuracy_Averages: DirectionMap<NullableNumber>;
  Reaction_Averages: DirectionMap<NullableNumber>;
  Total_Average_Reaction: NullableNumber;
  Peak_Reaction: NullableNumber;
  Targets_Missed: NullableNumber;
}

export interface ControllerDualTest {
  Left_Stick: ControllerStickTest;
  Right_Stick: ControllerStickTest;
  Total_Average_Reaction: NullableNumber;
  Peak_Reaction: NullableNumber;
  Targets_Missed: NullableNumber;
  Out_Of_Order_Count: NullableNumber;
}

export interface CognitiveTestResults {
  SimpleReaction?: {
    Practice?: SrtBlock;
    Real?: SrtBlock;
  };
  TaskSwitching?: {
    Peak_Trial_Scores?: {
      Practice?: TaskSwitchingBlock;
      Actual_Trial_Scores?: TaskSwitchingBlock;
    };
    Mean_Trial_Scores?: {
      Practice?: TaskSwitchingBlock;
      Actual_Trial_Scores?: TaskSwitchingBlock;
    };
  };
  GoNoGo?: {
    Practice?: GoNoGoBlock;
    Real?: GoNoGoBlock;
  };
  PosnerCue?: {
    Practice?: {
      Valid?: PosnerBlock;
      Non_Valid?: PosnerBlock;
    };
    Real?: {
      Valid?: PosnerBlock;
      Non_Valid?: PosnerBlock;
    };
  };
  Controller_Test?: {
    Left_Test?: ControllerStickTest;
    Right_Test?: ControllerStickTest;
    Dual_Test?: ControllerDualTest;
  };
}

/* ------------------------------------------------------------------ */
/* Engine types                                                        */
/* ------------------------------------------------------------------ */

export type DomainId =
  | "reaction"
  | "flexibility"
  | "inhibition"
  | "attention"
  | "controller";

export type Unit =
  | "ratio"
  | "percent"
  | "percentage-points"
  | "milliseconds"
  | "degrees"
  | "count";

export type EvidenceQuality = "high" | "medium" | "low";
export type TagPriority = "core" | "supporting" | "secondary";
export type RuleMode = "exclusive" | "additive";

export interface EvidenceItem {
  label: string;
  value: number | string | null;
  formatted: string;
}

export interface DerivedFeature {
  id: string;
  domain: DomainId;
  facet: string;
  value: number;
  unit: Unit;
  quality: EvidenceQuality;
  evidence: EvidenceItem[];
}

export interface ProfileTag {
  id: string;
  label: string;
  domain: DomainId;
  facet: string;
  /** 0..1 — how strongly the pattern was expressed in this session. */
  strength: number;
  priority: TagPriority;
  evidenceQuality: EvidenceQuality;
  description: string;
  evidence: EvidenceItem[];
  ruleId: string;
}

export interface ProfileWarning {
  code: string;
  message: string;
  path?: string;
}

export interface GlobalArchetype {
  id: string;
  label: string;
  /** 0..1 confidence that this archetype is expressed. */
  score: number;
  description: string;
  evidenceTags: string[];
}

export interface FacetProfile {
  facet: string;
  /** Visual share of the domain budget (all facets in a domain sum to 100). */
  weight: number;
  /** Every tag the engine kept for this facet (used by tag chips / inspector). */
  tags: ProfileTag[];
  /**
   * Prominent top-K subset of `tags`, tiered by the facet's strongest tag.
   * Only these tags are emitted as sunburst leaf children, so facets with weak
   * expression collapse to a single wedge while strong facets fan out. An empty
   * array means the facet renders as a bare wedge in the sunburst.
   */
  visibleTags: ProfileTag[];
}

export interface DomainProfile {
  domain: DomainId;
  label: string;
  /** Always 100 when the domain is active. */
  totalWeight: number;
  /**
   * Whether this domain's strongest tag meets the depth threshold, so its
   * facets render as inner rings in the sunburst. A collapsed domain renders
   * as a single wedge.
   */
  expandsToFacets: boolean;
  facets: FacetProfile[];
}

export interface SunburstNode {
  name: string;
  value?: number;
  color?: string;
  fill?: string;
  children?: SunburstNode[];
}

export interface PlayerProfile {
  engineVersion: string;
  thresholdVersion: string;
  features: DerivedFeature[];
  domains: DomainProfile[];
  archetype: GlobalArchetype | null;
  sunburst: SunburstNode;
  warnings: ProfileWarning[];
}

/* ------------------------------------------------------------------ */
/* Rule engine types                                                   */
/* ------------------------------------------------------------------ */

export interface Measurements {
  srt: SrtMeasurements | null;
  ts: TsMeasurements | null;
  gng: GngMeasurements | null;
  posner: PosnerMeasurements | null;
  controller: ControllerMeasurements | null;
}

export interface RuleContext {
  features: ReadonlyMap<string, DerivedFeature>;
  measurements: Measurements;
  config: ProfileConfig;
}

export interface ProfileRule {
  id: string;
  domain: DomainId;
  facet: string;
  priority: TagPriority;
  mode: RuleMode;
  /** Exclusive groups are scoped by (domain, facet, group ?? facet). */
  group?: string;
  requiredFeatures: string[];
  evaluate: (ctx: RuleContext) => ProfileTag | null;
}

export interface FeatureDefinition {
  id: string;
  domain: DomainId;
  facet: string;
  unit: Unit;
  quality: EvidenceQuality;
  compute: (source: RuleContext) => DerivedFeature | null;
}

/* ------------------------------------------------------------------ */
/* Config                                                              */
/* ------------------------------------------------------------------ */

export interface SignatureFacetRef {
  domain: DomainId;
  facet: string;
}

/**
 * A data-driven signature family. The composer groups selected tags into these
 * families and renders each active family as a top-level sunburst branch, so
 * product language can evolve without touching the rule files.
 */
export interface SignatureFamily {
  id: string;
  label: string;
  description: string;
  facets: SignatureFacetRef[];
}

export interface ProfileConfig {
  version: string;

  srt: {
    warmUp: { fastAt: number; settleMin: number; settleMax: number; earlyMin: number };
    peakGap: { evenAt: number; burstAt: number; flashAt: number };
    fullWarmUpAt: number;
    burstUnlockAt: number;
    burstUnlockLead: number;
  };

  taskSwitching: {
    switchCost: { fluidMax: number; responsiveMax: number; awareMax: number };
    mixCost: { nativeMax: number; steadyMax: number; sensitiveMax: number };
    load: { clearlyLow: number; clearlyHigh: number };
    adaptation: { rapidAt: number; adaptiveMin: number; adaptiveMax: number; stableTolerance: number };
  };

  goNoGo: {
    rtGain: { quickAt: number; slowAt: number };
    errorChange: { increaseAt: number; decreaseAt: number };
    peakGap: { highAt: number };
    useErrorCountsAsRates: boolean;
  };

  posner: {
    cueCost: { neutralMax: number; responsiveMax: number; drivenMax: number };
    errorCost: { holdingMax: number; responsiveMax: number; sensitiveMax: number };
    reorient: { rtLow: number; rtHigh: number; errorLow: number; errorHigh: number };
    adaptation: { quickAt: number; adapterMin: number; adapterMax: number; stableTolerance: number };
  };

  controller: {
    targetRadiusDegrees: number;
    singleTrials: number;
    dualTrials: number;
    dualRightTrialsPerDirection: number;
    precision: { centerMax: number; bullseyeMax: number; secureMax: number };
    hit: { reliableAt: number };
    stickBalance: { rtDiffMax: number; hitDiffMaxPp: number; precisionDiffMax: number };
    spread: { rtLow: number; rtHigh: number; precisionLow: number; precisionHigh: number };
    dualInterference: { rtLow: number; rtHigh: number; hitLowPp: number; hitHighPp: number; precisionLow: number; precisionHigh: number };
    dualBalance: { meaningfulDiff: number; rtShare: number; hitShare: number; precisionShare: number };
    sequence: { steadyMax: number; slipsMax: number };
    burst: { evenAt: number; burstAt: number; highAt: number };
    lean: { rtShare: number; precisionShare: number; hitShare: number; separationFactor: number };
  };

  tagFilters: {
    supportingMinimumStrength: number;
    secondaryMinimumStrength: number;
    maxAdditiveTags: number;
    /**
     * Hard per-profile cap on the total number of tags emitted (across all
     * domains). The full rule library stays intact; only the emitted set is
     * trimmed to this budget.
     */
    maxTags: number;
  };

  visual: {
    /** visualExpression = strengthBaseline + strength * strengthMultiplier */
    strengthBaseline: number;
    strengthMultiplier: number;
    /** Prominence tiers for how many tag children a facet emits in the sunburst. */
    childCount: {
      maxChildren: number;
      /** top-tag strength >= twoAt -> up to 2 children */
      twoAt: number;
      /** top-tag strength >= threeAt -> up to 3 children */
      threeAt: number;
    };
    /** Depth tiers for how deep a branch renders (domains -> facets -> tags). */
    depth: {
      /** branch top-tag strength >= depthAt -> expands to the next level */
      depthAt: number;
      /**
       * Multiplier applied to `depthAt` for domains the player's archetype
       * emphasizes, so archetype-defining branches expand deeper while
       * unrelated domains stay simple wedges (distinct silhouettes per
       * archetype).
       */
      archetypeBoost: number;
    };
    /** Hard cap on total visible sunburst arcs (branches + tags). */
    maxArcs: number;
    /** Max top-level signature branches. */
    maxBranches: number;
    /** Max refinement siblings under a composite head tag. */
    maxSiblings: number;
    /** Max branch depth (root -> branch -> composite -> refinement). */
    maxDepth: number;
    /** Data-driven signature families that group facets into branches. */
    signatureFamilies: SignatureFamily[];
  };

  domainBudget: number;

  facetBaseWeights: Record<DomainId, Record<string, number>>;
}
