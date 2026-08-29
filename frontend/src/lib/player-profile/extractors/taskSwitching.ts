import type { CognitiveTestResults, TaskSwitchingBlock } from "../types";
import { isFiniteNum } from "../math";

export interface TsBlockMeasurements {
  single: number | null;
  repeat: number | null;
  switch: number | null;
  storedCost: number | null;
}

export interface TsMeasurements {
  peak: { practice: TsBlockMeasurements; actual: TsBlockMeasurements };
  mean: { practice: TsBlockMeasurements; actual: TsBlockMeasurements };
}

function extractTsBlock(block?: TaskSwitchingBlock): TsBlockMeasurements {
  if (!block) {
    return { single: null, repeat: null, switch: null, storedCost: null };
  }
  return {
    single: isFiniteNum(block.Single_Task_RT) ? (block.Single_Task_RT as number) : null,
    repeat: isFiniteNum(block.Mix_Block_Repeat_RT) ? (block.Mix_Block_Repeat_RT as number) : null,
    switch: isFiniteNum(block.Mix_Block_Switch_RT) ? (block.Mix_Block_Switch_RT as number) : null,
    storedCost: isFiniteNum(block.Task_Switch_Cost) ? (block.Task_Switch_Cost as number) : null,
  };
}

export function extractTaskSwitching(
  results: CognitiveTestResults
): TsMeasurements | null {
  const ts = results.TaskSwitching;
  if (!ts) return null;
  return {
    peak: {
      practice: extractTsBlock(ts.Peak_Trial_Scores?.Practice),
      actual: extractTsBlock(ts.Peak_Trial_Scores?.Actual_Trial_Scores),
    },
    mean: {
      practice: extractTsBlock(ts.Mean_Trial_Scores?.Practice),
      actual: extractTsBlock(ts.Mean_Trial_Scores?.Actual_Trial_Scores),
    },
  };
}
