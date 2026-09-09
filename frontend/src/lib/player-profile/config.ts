import type { ProfileConfig } from "./types";

export const PROFILE_ENGINE_VERSION = "1.0.0";

/**
 * Provisional v1 thresholds.
 *
 * These are product heuristics derived from the design brief, not population
 * norms. They are centralized and versioned so they can later be replaced with
 * validated sample-specific percentile thresholds without touching rules.
 */
export const profileConfigV1: ProfileConfig = {
  version: "provisional-v1",

  srt: {
    // Warm-up gain = (Practice.Average - Real.Average) / Practice.Average
    warmUp: {
      fastAt: 0.12, // >= +12% -> Fast Warm-Up
      settleMin: 0.04,
      settleMax: 0.12, // +4..+12% -> Settles In
      earlyMin: -0.12, // -12..-4% -> Early Peak; below -> Practice Peak
    },
    // Peak gap = (Real.Average - Real.Peak) / Real.Average
    peakGap: {
      evenAt: 0.08, // < 8% -> Even-Paced
      burstAt: 0.18, // 8-18% -> Burst-Capable
      flashAt: 0.3, // 18-30% -> High Burst; > 30% -> Flash Response
    },
    fullWarmUpAt: 0.1,
    burstUnlockAt: 0.15,
    burstUnlockLead: 0.1,
  },

  taskSwitching: {
    // Relative switch cost = (Switch_RT - Repeat_RT) / Repeat_RT
    switchCost: {
      fluidMax: 0.1,
      responsiveMax: 0.25,
      awareMax: 0.4,
    },
    // Relative mixing cost = (Repeat_RT - Single_RT) / Single_RT
    mixCost: {
      nativeMax: 0.1,
      steadyMax: 0.25,
      sensitiveMax: 0.4,
    },
    load: {
      clearlyLow: 0.15,
      clearlyHigh: 0.25,
    },
    adaptation: {
      rapidAt: 0.3, // >= 30% reduction
      adaptiveMin: 0.1,
      adaptiveMax: 0.3,
      stableTolerance: 0.1,
    },
  },

  goNoGo: {
    // RT gain = (Practice.Mean - Real.Mean) / Practice.Mean
    rtGain: {
      quickAt: 0.08,
      slowAt: -0.08,
    },
    errorChange: {
      increaseAt: 2,
      decreaseAt: -2,
    },
    peakGap: {
      highAt: 0.2,
    },
    useErrorCountsAsRates: false,
  },

  posner: {
    // Relative cue cost = (Invalid.Average - Valid.Average) / Valid.Average
    cueCost: {
      neutralMax: 0.05,
      responsiveMax: 0.15,
      drivenMax: 0.3,
    },
    // Error cost (percentage points) = Invalid.Incorrect_Percentage - Valid.Incorrect_Percentage
    errorCost: {
      holdingMax: 2,
      responsiveMax: 7,
      sensitiveMax: 15,
    },
    reorient: {
      rtLow: 0.1,
      rtHigh: 0.15,
      errorLow: 3,
      errorHigh: 7,
    },
    adaptation: {
      quickAt: 10, // pp improvement
      adapterMin: 3,
      adapterMax: 10,
      stableTolerance: 3,
    },
  },

  controller: {
    targetRadiusDegrees: 30,
    singleTrials: 16,
    dualTrials: 28,
    dualRightTrialsPerDirection: 7,
    precision: {
      centerMax: 0.2, // <= 6 deg
      bullseyeMax: 0.4, // 6-12 deg
      secureMax: 0.65, // 12-19.5 deg; above -> Wide Placement
    },
    hit: {
      reliableAt: 0.875, // >= 28 / 32
    },
    stickBalance: {
      rtDiffMax: 0.1,
      hitDiffMaxPp: 12.5,
      precisionDiffMax: 0.15,
    },
    spread: {
      rtLow: 0.1,
      rtHigh: 0.25,
      precisionLow: 0.15,
      precisionHigh: 0.35,
    },
    dualInterference: {
      rtLow: 0.1,
      rtHigh: 0.2,
      hitLowPp: 5,
      hitHighPp: 10,
      precisionLow: 0.1,
      precisionHigh: 0.2,
    },
    dualBalance: {
      meaningfulDiff: 0.15,
      rtShare: 0.4,
      hitShare: 0.3,
      precisionShare: 0.3,
    },
    sequence: {
      steadyMax: 2,
      slipsMax: 5,
    },
    burst: {
      evenAt: 0.08,
      burstAt: 0.18,
      highAt: 0.3,
    },
    lean: {
      rtShare: 0.4,
      precisionShare: 0.4,
      hitShare: 0.2,
      separationFactor: 1.5,
    },
  },

  tagFilters: {
    supportingMinimumStrength: 0.55,
    secondaryMinimumStrength: 0.7,
    maxAdditiveTags: 3,
    maxTags: 9,
  },

  visual: {
    strengthBaseline: 0.65,
    strengthMultiplier: 0.7,
    // A facet emits at most 2 tag children: 1 normally, 2 only when its top
    // tag is clearly prominent. Fewer, taller branches read better.
    childCount: {
      maxChildren: 2,
      twoAt: 0.7,
      threeAt: 1.01, // unreachable while maxChildren is 2
    },
    depth: {
      // Non-emphasized domains need a strong signature (>= 0.6) to expand;
      // archetype-emphasized domains expand at depthAt * archetypeBoost (0.3),
      // giving each archetype a recognizable silhouette. Only genuinely strong
      // branches expand, so shapes stay extreme and distinct.
      depthAt: 0.6,
      archetypeBoost: 0.5,
    },
    // Hard limits for the signature-chain sunburst. The composer groups
    // selected tags into 2-4 signature branches and emits at most maxArcs
    // visible arcs total (branches + tags), per the "roughly nine total, not
    // nine per ring" constraint.
    maxArcs: 9,
    maxBranches: 4,
    maxSiblings: 3,
    maxDepth: 5,
    signatureFamilies: [
      {
        id: "adaptive-core",
        label: "Adaptive Core",
        description:
          "Improvement across practice-to-real adaptation in speed, switching, and cue handling.",
        facets: [
          { domain: "reaction", facet: "Adaptation" },
          { domain: "flexibility", facet: "Adaptation" },
          { domain: "inhibition", facet: "Adaptation" },
          { domain: "attention", facet: "Adaptation" },
        ],
      },
      {
        id: "tempo-control",
        label: "Tempo Control",
        description:
          "Steady or burst-paced response patterns and how speed trades against control.",
        facets: [
          { domain: "reaction", facet: "Response Pattern" },
          { domain: "inhibition", facet: "Response Pattern" },
          { domain: "inhibition", facet: "Control Shift" },
          { domain: "controller", facet: "Response Pattern" },
        ],
      },
      {
        id: "flexible-load",
        label: "Flexible Load",
        description:
          "How switching and mixed-block load are handled — fluid or taxed.",
        facets: [
          { domain: "flexibility", facet: "Switching" },
          { domain: "flexibility", facet: "Mixed Load" },
        ],
      },
      {
        id: "cue-control",
        label: "Cue Control",
        description:
          "How strongly cues steer attention and whether reorientation holds speed and accuracy.",
        facets: [
          { domain: "attention", facet: "Cue Influence" },
          { domain: "attention", facet: "Error Control" },
          { domain: "attention", facet: "Reorientation Style" },
        ],
      },
      {
        id: "motor-precision",
        label: "Motor Precision",
        description:
          "Stick placement, directional control, and balance across the controller task.",
        facets: [
          { domain: "controller", facet: "Targeting" },
          { domain: "controller", facet: "Stick Balance" },
          { domain: "controller", facet: "Directionality" },
          { domain: "controller", facet: "Dual Balance" },
          { domain: "controller", facet: "Sequence" },
        ],
      },
      {
        id: "dual-coordination",
        label: "Dual Coordination",
        description:
          "Cost of running both sticks at once — speed, accuracy, and interference under load.",
        facets: [{ domain: "controller", facet: "Dual Coordination" }],
      },
    ],
  },

  domainBudget: 100,

  facetBaseWeights: {
    reaction: {
      Adaptation: 0.5,
      "Response Pattern": 0.5,
    },
    flexibility: {
      Switching: 0.4,
      "Mixed Load": 0.3,
      Adaptation: 0.3,
    },
    inhibition: {
      Adaptation: 0.4,
      "Control Shift": 0.6,
    },
    attention: {
      "Cue Influence": 0.4,
      "Error Control": 0.2,
      "Reorientation Style": 0.2,
      Adaptation: 0.2,
    },
    controller: {
      Targeting: 0.15,
      Directionality: 0.15,
      "Stick Balance": 0.12,
      "Dual Coordination": 0.18,
      "Dual Balance": 0.12,
      Sequence: 0.08,
      "Response Pattern": 0.08,
    },
  },
};
