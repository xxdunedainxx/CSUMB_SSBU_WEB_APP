import type {
  CognitiveTestResults,
  DirectionKey,
  DirectionMap,
  NullableNumber,
} from "../../types";

/**
 * Deterministic aggregate fixtures in the backend's exact JSON shape.
 *
 * These double as the placeholder demo sessions on the dashboard. The formal
 * vitest suite is deferred by request; fixtures stay as a manual-check
 * harness: `buildPlayerProfile(fixture)` must be stable and inspectable.
 */

const directions = (fill: Partial<Record<DirectionKey, number>>): DirectionMap<NullableNumber> => {
  const keys: DirectionKey[] = ["Left", "Up_Left", "Up", "Up_Right", "Right", "Down_Right", "Down", "Down_Left"];
  const out: DirectionMap<NullableNumber> = {};
  for (const key of keys) {
    out[key] = fill[key] ?? null;
  }
  return out;
};

const srt = (practiceAvg: number, practicePeak: number, realAvg: number, realPeak: number) => ({
  SimpleReaction: {
    Practice: { Peak: practicePeak, Average: practiceAvg },
    Real: { Peak: realPeak, Average: realAvg },
  },
});

const tsBlock = (single: number, repeat: number, switchRt: number, storedCost: number) => ({
  Single_Task_RT: single,
  Mix_Block_Repeat_RT: repeat,
  Mix_Block_Switch_RT: switchRt,
  Task_Switch_Cost: storedCost,
});

const taskSwitching = (
  p: { single: number; repeat: number; switchRt: number; storedCost: number },
  a: { single: number; repeat: number; switchRt: number; storedCost: number }
) => ({
  TaskSwitching: {
    Peak_Trial_Scores: {
      Practice: tsBlock(p.single, p.repeat, p.switchRt, p.storedCost),
      Actual_Trial_Scores: tsBlock(a.single, a.repeat, a.switchRt, a.storedCost),
    },
    Mean_Trial_Scores: {
      Practice: tsBlock(p.single, p.repeat, p.switchRt, p.storedCost),
      Actual_Trial_Scores: tsBlock(a.single, a.repeat, a.switchRt, a.storedCost),
    },
  },
});

const gng = (p: { peak: number; mean: number; errors: number }, r: { peak: number; mean: number; errors: number }) => ({
  GoNoGo: {
    Practice: { Peak: p.peak, Mean: p.mean, Error_Count: p.errors },
    Real: { Peak: r.peak, Mean: r.mean, Error_Count: r.errors },
  },
});

const posnerBlock = (avg: number, peak: number, errorPct: number, errorCount: number) => ({
  Average: avg,
  Peak: peak,
  Type: 0,
  Incorrect_Percentage: errorPct,
  Incorrect_Count: errorCount,
});

const posner = (
  p: { validAvg: number; validPct: number; invalidAvg: number; invalidPct: number },
  r: { validAvg: number; validPct: number; invalidAvg: number; invalidPct: number }
) => ({
  PosnerCue: {
    Practice: {
      Valid: posnerBlock(p.validAvg, p.validAvg - 40, p.validPct, Math.round(p.validPct / 8)),
      Non_Valid: posnerBlock(p.invalidAvg, p.invalidAvg - 40, p.invalidPct, Math.round(p.invalidPct / 8)),
    },
    Real: {
      Valid: posnerBlock(r.validAvg, r.validAvg - 40, r.validPct, Math.round(r.validPct / 8)),
      Non_Valid: posnerBlock(r.invalidAvg, r.invalidAvg - 40, r.invalidPct, Math.round(r.invalidPct / 8)),
    },
  },
});

const stick = (
  rt: number,
  peak: number,
  missed: number,
  accuracy: number,
  rtSpread = 8,
  hitPct = 93
) => {
  const spread: Partial<Record<DirectionKey, number>> = {
    Left: rt,
    Up_Left: rt + rtSpread,
    Up: rt + rtSpread,
    Up_Right: rt + rtSpread,
    Right: rt,
    Down_Right: rt + rtSpread,
    Down: rt + rtSpread,
    Down_Left: rt + rtSpread * 2,
  };
  const acc = directions({});
  const rtMap = directions(spread);
  const hit = directions({});
  for (const key of Object.keys(rtMap) as DirectionKey[]) {
    acc[key] = accuracy + (rtMap[key]! - rt) / 20;
    hit[key] = hitPct - (rtMap[key]! - rt) / 8;
  }
  return {
    Target_Hit_Average_Percentages: hit,
    Accuracy_Averages: acc,
    Reaction_Averages: rtMap,
    Total_Average_Reaction: rt,
    Peak_Reaction: peak,
    Targets_Missed: missed,
  };
};

/** Stick with a strong directional bias (used by controller-directional). */
const directionalStick = (rt: number, peak: number, missed: number, accuracy: number) => {
  const rtMap = directions({
    Left: rt,
    Up_Left: rt - 55,
    Up: rt - 25,
    Up_Right: rt - 15,
    Right: rt + 5,
    Down_Right: rt + 25,
    Down: rt + 35,
    Down_Left: rt + 55,
  });
  const acc = directions({});
  const hit = directions({});
  for (const key of Object.keys(rtMap) as DirectionKey[]) {
    const delta = rtMap[key]! - rt;
    acc[key] = accuracy - delta / 12; // faster directions are more accurate
    hit[key] = 93 - delta / 8;
  }
  return {
    Target_Hit_Average_Percentages: hit,
    Accuracy_Averages: acc,
    Reaction_Averages: rtMap,
    Total_Average_Reaction: rt,
    Peak_Reaction: peak,
    Targets_Missed: missed,
  };
};

const dualStick = (rt: number, missed: number, accuracy: number, hitPct: number) => ({
  ...stick(rt, rt - 70, missed, accuracy, 10, hitPct),
});

const controller = (args: {
  left: ReturnType<typeof stick>;
  right: ReturnType<typeof stick>;
  dualLeft: { rt: number; missed: number; accuracy: number; hitPct: number };
  dualRight: { rt: number; missed: number; accuracy: number; hitPct: number };
  outOfOrder: number;
}) => ({
  Controller_Test: {
    Left_Test: args.left,
    Right_Test: args.right,
    Dual_Test: {
      Left_Stick: dualStick(args.dualLeft.rt, args.dualLeft.missed, args.dualLeft.accuracy, args.dualLeft.hitPct),
      Right_Stick: dualStick(args.dualRight.rt, args.dualRight.missed, args.dualRight.accuracy, args.dualRight.hitPct),
      Total_Average_Reaction: args.dualLeft.rt,
      Peak_Reaction: args.dualLeft.rt - 70,
      Targets_Missed: args.dualLeft.missed + args.dualRight.missed,
      Out_Of_Order_Count: args.outOfOrder,
    },
  },
});

export interface NamedFixture {
  id: string;
  label: string;
  description: string;
  results: CognitiveTestResults;
}

/* ------------------------------------------------------------------ */
/* Fixtures                                                            */
/* ------------------------------------------------------------------ */

export const RAPID_ADAPTER: NamedFixture = {
  id: "rapid-adapter",
  label: "Rapid Adapter",
  description: "Warms up fast and adapts quickly across switching, mixing, and cue handling.",
  results: {
    ...srt(400, 300, 320, 240),
    ...taskSwitching(
      { single: 450, repeat: 560, switchRt: 620, storedCost: 60 },
      { single: 480, repeat: 540, switchRt: 600, storedCost: 60 }
    ),
    ...gng(
      { peak: 300, mean: 420, errors: 3 },
      { peak: 280, mean: 380, errors: 2 }
    ),
    ...posner(
      { validAvg: 500, validPct: 2, invalidAvg: 590, invalidPct: 10 },
      { validAvg: 514, validPct: 2, invalidAvg: 540, invalidPct: 4 }
    ),
  },
};

export const READY_STARTER: NamedFixture = {
  id: "ready-starter",
  label: "Ready Starter",
  description: "Starts at a settled pace with no warm-up drift and stable rhythm.",
  results: {
    ...srt(380, 290, 375, 285),
    ...taskSwitching(
      { single: 490, repeat: 510, switchRt: 560, storedCost: 50 },
      { single: 485, repeat: 505, switchRt: 552, storedCost: 47 }
    ),
    ...gng(
      { peak: 310, mean: 400, errors: 4 },
      { peak: 305, mean: 398, errors: 4 }
    ),
    ...posner(
      { validAvg: 500, validPct: 3, invalidAvg: 560, invalidPct: 7 },
      { validAvg: 505, validPct: 3, invalidAvg: 562, invalidPct: 6 }
    ),
  },
};

export const SWITCH_HEAVY: NamedFixture = {
  id: "switch-heavy",
  label: "Switch-Heavy",
  description: "Task switching is costly while mixed-block load stays moderate.",
  results: {
    ...srt(390, 300, 400, 305),
    ...taskSwitching(
      { single: 460, repeat: 540, switchRt: 760, storedCost: 220 },
      { single: 460, repeat: 540, switchRt: 780, storedCost: 240 }
    ),
    ...gng(
      { peak: 320, mean: 430, errors: 5 },
      { peak: 315, mean: 435, errors: 5 }
    ),
    ...posner(
      { validAvg: 490, validPct: 2, invalidAvg: 540, invalidPct: 6 },
      { validAvg: 495, validPct: 3, invalidAvg: 545, invalidPct: 6 }
    ),
  },
};

export const FLOW_SWITCHER: NamedFixture = {
  id: "flow-switcher",
  label: "Flow Switcher",
  description: "Switching and mixed-block load barely register — flows through task changes.",
  results: {
    ...srt(400, 320, 405, 325),
    ...taskSwitching(
      { single: 470, repeat: 485, switchRt: 505, storedCost: 20 },
      { single: 470, repeat: 482, switchRt: 500, storedCost: 18 }
    ),
    ...gng(
      { peak: 300, mean: 400, errors: 3 },
      { peak: 295, mean: 402, errors: 4 }
    ),
    ...controller({
      left: stick(420, 350, 1, 10.5),
      right: stick(418, 348, 1, 10.4),
      dualLeft: { rt: 452, missed: 2, accuracy: 11, hitPct: 93 },
      dualRight: { rt: 450, missed: 2, accuracy: 11, hitPct: 93 },
      outOfOrder: 0,
    }),
  },
};

export const CUE_DISRUPTED: NamedFixture = {
  id: "cue-disrupted",
  label: "Cue-Disrupted",
  description: "Invalid cues cost both time and accuracy — misdirection lands hard.",
  results: {
    ...srt(400, 310, 405, 315),
    ...taskSwitching(
      { single: 480, repeat: 510, switchRt: 590, storedCost: 80 },
      { single: 485, repeat: 515, switchRt: 595, storedCost: 80 }
    ),
    ...posner(
      { validAvg: 480, validPct: 2, invalidAvg: 660, invalidPct: 16 },
      { validAvg: 480, validPct: 2, invalidAvg: 660, invalidPct: 18 }
    ),
  },
};

export const CUE_RESILIENT: NamedFixture = {
  id: "cue-resilient",
  label: "Cue-Resilient",
  description: "Invalid cues barely affect speed or accuracy — resilient to misdirection.",
  results: {
    ...srt(400, 310, 402, 312),
    ...taskSwitching(
      { single: 480, repeat: 510, switchRt: 590, storedCost: 80 },
      { single: 482, repeat: 512, switchRt: 588, storedCost: 76 }
    ),
    ...posner(
      { validAvg: 500, validPct: 3, invalidAvg: 540, invalidPct: 5 },
      { validAvg: 500, validPct: 3, invalidAvg: 520, invalidPct: 4 }
    ),
  },
};

export const CONTROLLER_BALANCED: NamedFixture = {
  id: "controller-balanced",
  label: "Controller Balanced",
  description: "Balanced sticks, tight placement, smooth dual coordination, perfect sequence.",
  results: {
    ...srt(400, 320, 405, 325),
    ...controller({
      left: stick(420, 350, 1, 10.5),
      right: stick(418, 348, 1, 10.4),
      dualLeft: { rt: 452, missed: 2, accuracy: 11, hitPct: 93 },
      dualRight: { rt: 450, missed: 2, accuracy: 11, hitPct: 93 },
      outOfOrder: 0,
    }),
  },
};

export const CONTROLLER_DIRECTIONAL: NamedFixture = {
  id: "controller-directional",
  label: "Controller Directional",
  description: "Strong directional strengths — especially fast and precise to the upper-left.",
  results: {
    ...srt(400, 320, 405, 325),
    ...controller({
      left: directionalStick(430, 360, 1, 11),
      right: directionalStick(428, 358, 1, 10.8),
      dualLeft: { rt: 462, missed: 2, accuracy: 11.5, hitPct: 93 },
      dualRight: { rt: 460, missed: 2, accuracy: 11.5, hitPct: 93 },
      outOfOrder: 1,
    }),
  },
};

export const CONTROLLER_DUAL_TAXED: NamedFixture = {
  id: "controller-dual-taxed",
  label: "Controller Dual-Taxed",
  description: "Dual-stick mode costs both speed and accuracy.",
  results: {
    ...srt(400, 320, 405, 325),
    ...controller({
      left: stick(420, 350, 1, 10.5),
      right: stick(418, 348, 1, 10.4),
      dualLeft: { rt: 600, missed: 7, accuracy: 13, hitPct: 75 },
      dualRight: { rt: 598, missed: 7, accuracy: 13, hitPct: 75 },
      outOfOrder: 3,
    }),
  },
};

export const CONTROLLER_PRECISION_PRESERVING: NamedFixture = {
  id: "controller-precision-preserving",
  label: "Controller Precision-Preserving",
  description: "Dual-stick mode costs speed but precision holds.",
  results: {
    ...srt(400, 320, 405, 325),
    ...controller({
      left: stick(420, 350, 1, 10.5),
      right: stick(418, 348, 1, 10.4),
      dualLeft: { rt: 560, missed: 2, accuracy: 10.5, hitPct: 93 },
      dualRight: { rt: 558, missed: 2, accuracy: 10.4, hitPct: 93 },
      outOfOrder: 0,
    }),
  },
};

export const CONTROLLER_TEMPO_PRESERVING: NamedFixture = {
  id: "controller-tempo-preserving",
  label: "Controller Tempo-Preserving",
  description: "Dual-stick mode keeps speed but accuracy drops.",
  results: {
    ...srt(400, 320, 405, 325),
    ...controller({
      left: stick(420, 350, 1, 10.5),
      right: stick(418, 348, 1, 10.4),
      dualLeft: { rt: 442, missed: 7, accuracy: 11, hitPct: 75 },
      dualRight: { rt: 440, missed: 7, accuracy: 11, hitPct: 75 },
      outOfOrder: 0,
    }),
  },
};

/** All-null aggregate — the current real backend shape; produces no tags. */
export const NULL_HEAVY: NamedFixture = {
  id: "null-heavy",
  label: "Null-Heavy (Backend Shape)",
  description: "Aggregate results with no measurements populated — exercises the null-tolerant path.",
  results: {
    SimpleReaction: {
      Practice: { Peak: null, Average: null },
      Real: { Peak: null, Average: null },
    },
    TaskSwitching: {
      Peak_Trial_Scores: {
        Practice: { Single_Task_RT: null, Mix_Block_Repeat_RT: null, Mix_Block_Switch_RT: null, Task_Switch_Cost: null },
        Actual_Trial_Scores: { Single_Task_RT: null, Mix_Block_Repeat_RT: null, Mix_Block_Switch_RT: null, Task_Switch_Cost: null },
      },
      Mean_Trial_Scores: {
        Practice: { Single_Task_RT: null, Mix_Block_Repeat_RT: null, Mix_Block_Switch_RT: null, Task_Switch_Cost: null },
        Actual_Trial_Scores: { Single_Task_RT: null, Mix_Block_Repeat_RT: null, Mix_Block_Switch_RT: null, Task_Switch_Cost: null },
      },
    },
    GoNoGo: {
      Practice: { Peak: null, Mean: null, Error_Count: null },
      Real: { Peak: null, Mean: null, Error_Count: null },
    },
    PosnerCue: {
      Practice: {
        Valid: { Average: null, Peak: null, Type: null, Incorrect_Percentage: null, Incorrect_Count: null },
        Non_Valid: { Average: null, Peak: null, Type: null, Incorrect_Percentage: null, Incorrect_Count: null },
      },
      Real: {
        Valid: { Average: null, Peak: null, Type: null, Incorrect_Percentage: null, Incorrect_Count: null },
        Non_Valid: { Average: null, Peak: null, Type: null, Incorrect_Percentage: null, Incorrect_Count: null },
      },
    },
    Controller_Test: {
      Left_Test: {
        Target_Hit_Average_Percentages: {},
        Accuracy_Averages: {},
        Reaction_Averages: {},
        Total_Average_Reaction: null,
        Peak_Reaction: null,
        Targets_Missed: null,
      },
      Right_Test: {
        Target_Hit_Average_Percentages: {},
        Accuracy_Averages: {},
        Reaction_Averages: {},
        Total_Average_Reaction: null,
        Peak_Reaction: null,
        Targets_Missed: null,
      },
      Dual_Test: {
        Left_Stick: {
          Target_Hit_Average_Percentages: {},
          Accuracy_Averages: {},
          Reaction_Averages: {},
          Total_Average_Reaction: null,
          Peak_Reaction: null,
          Targets_Missed: null,
        },
        Right_Stick: {
          Target_Hit_Average_Percentages: {},
          Accuracy_Averages: {},
          Reaction_Averages: {},
          Total_Average_Reaction: null,
          Peak_Reaction: null,
          Targets_Missed: null,
        },
        Total_Average_Reaction: null,
        Peak_Reaction: null,
        Targets_Missed: null,
        Out_Of_Order_Count: null,
      },
    },
  },
};

export const ALL_FIXTURES: NamedFixture[] = [
  RAPID_ADAPTER,
  READY_STARTER,
  SWITCH_HEAVY,
  FLOW_SWITCHER,
  CUE_DISRUPTED,
  CUE_RESILIENT,
  CONTROLLER_BALANCED,
  CONTROLLER_DIRECTIONAL,
  CONTROLLER_DUAL_TAXED,
  CONTROLLER_PRECISION_PRESERVING,
  CONTROLLER_TEMPO_PRESERVING,
  NULL_HEAVY,
];
