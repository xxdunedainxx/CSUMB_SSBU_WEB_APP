import type {
  CognitiveTestResults,
  ControllerStickTest,
  GoNoGoBlock,
  NullableNumber,
  PosnerBlock,
  ProfileWarning,
  SrtBlock,
  TaskSwitchingBlock,
} from "./types";

function num(v: unknown): v is number {
  return typeof v === "number" && Number.isFinite(v);
}

function rtWarnings(
  path: string,
  values: Record<string, NullableNumber>,
  out: ProfileWarning[]
) {
  for (const [key, value] of Object.entries(values)) {
    if (value === null || value === undefined) continue;
    if (!num(value)) {
      out.push({
        code: "NON_FINITE_VALUE",
        message: `${path}.${key} is NaN or Infinity`,
        path: `${path}.${key}`,
      });
      continue;
    }
    if (value < 0) {
      out.push({
        code: "NEGATIVE_RT",
        message: `${path}.${key} is negative (${value})`,
        path: `${path}.${key}`,
      });
    }
  }
}

function blockWarnings(path: string, block: SrtBlock, out: ProfileWarning[]) {
  rtWarnings(path, { Peak: block.Peak, Average: block.Average }, out);
  if (
    num(block.Peak) &&
    num(block.Average) &&
    block.Peak > block.Average
  ) {
    out.push({
      code: "PEAK_GREATER_THAN_AVERAGE",
      message: `${path}: Peak (${block.Peak} ms) exceeds Average (${block.Average} ms); Peak should be the fastest trial`,
      path: path,
    });
  }
}

function gngBlockWarnings(path: string, block: GoNoGoBlock, out: ProfileWarning[]) {
  rtWarnings(path, { Peak: block.Peak, Mean: block.Mean }, out);
  if (block.Peak !== null && block.Peak !== undefined && block.Mean !== null && block.Mean !== undefined) {
    if (num(block.Peak) && num(block.Mean) && block.Peak > block.Mean) {
      out.push({
        code: "PEAK_GREATER_THAN_AVERAGE",
        message: `${path}: Peak (${block.Peak} ms) exceeds Mean (${block.Mean} ms)`,
        path: path,
      });
    }
  }
  if (num(block.Error_Count) && block.Error_Count < 0) {
    out.push({
      code: "NEGATIVE_ERROR_COUNT",
      message: `${path}.Error_Count is negative (${block.Error_Count})`,
      path: `${path}.Error_Count`,
    });
  }
}

function posnerBlockWarnings(path: string, block: PosnerBlock, out: ProfileWarning[]) {
  rtWarnings(path, { Average: block.Average, Peak: block.Peak }, out);
  if (
    num(block.Peak) &&
    num(block.Average) &&
    block.Peak > block.Average
  ) {
    out.push({
      code: "PEAK_GREATER_THAN_AVERAGE",
      message: `${path}: Peak (${block.Peak} ms) exceeds Average (${block.Average} ms)`,
      path: path,
    });
  }
  if (num(block.Incorrect_Percentage) && (block.Incorrect_Percentage < 0 || block.Incorrect_Percentage > 100)) {
    out.push({
      code: "PERCENTAGE_OUT_OF_RANGE",
      message: `${path}.Incorrect_Percentage (${block.Incorrect_Percentage}) is outside 0-100`,
      path: `${path}.Incorrect_Percentage`,
    });
  }
  if (num(block.Incorrect_Count) && block.Incorrect_Count < 0) {
    out.push({
      code: "NEGATIVE_ERROR_COUNT",
      message: `${path}.Incorrect_Count is negative (${block.Incorrect_Count})`,
      path: `${path}.Incorrect_Count`,
    });
  }
}

function tsBlockWarnings(path: string, block: TaskSwitchingBlock, out: ProfileWarning[]) {
  rtWarnings(
    path,
    {
      Single_Task_RT: block.Single_Task_RT,
      Mix_Block_Repeat_RT: block.Mix_Block_Repeat_RT,
      Mix_Block_Switch_RT: block.Mix_Block_Switch_RT,
    },
    out
  );
}

function controllerStickWarnings(path: string, stick: ControllerStickTest, out: ProfileWarning[]) {
  rtWarnings(
    path,
    { Total_Average_Reaction: stick.Total_Average_Reaction, Peak_Reaction: stick.Peak_Reaction },
    out
  );
  if (
    num(stick.Total_Average_Reaction) &&
    num(stick.Peak_Reaction) &&
    stick.Peak_Reaction > stick.Total_Average_Reaction
  ) {
    out.push({
      code: "PEAK_GREATER_THAN_AVERAGE",
      message: `${path}: Peak (${stick.Peak_Reaction} ms) exceeds average (${stick.Total_Average_Reaction} ms)`,
      path: path,
    });
  }
  if (num(stick.Targets_Missed) && stick.Targets_Missed < 0) {
    out.push({
      code: "NEGATIVE_ERROR_COUNT",
      message: `${path}.Targets_Missed is negative (${stick.Targets_Missed})`,
      path: `${path}.Targets_Missed`,
    });
  }
  // Angular error beyond 30 deg can occur on misses — do not reject.
  for (const [dir, acc] of Object.entries(stick.Accuracy_Averages ?? {})) {
    if (acc !== null && acc !== undefined && !num(acc)) {
      out.push({
        code: "NON_FINITE_VALUE",
        message: `${path}.Accuracy_Averages.${dir} is NaN or Infinity`,
        path: `${path}.Accuracy_Averages.${dir}`,
      });
    }
  }
}

/**
 * Walks the aggregate results and reports suspicious input. Never throws:
 * invalid input degrades to warnings, and the offending rules are skipped.
 */
export function validateResults(
  results: CognitiveTestResults
): ProfileWarning[] {
  const warnings: ProfileWarning[] = [];

  const srt = results.SimpleReaction;
  if (srt?.Practice) blockWarnings("SimpleReaction.Practice", srt.Practice, warnings);
  if (srt?.Real) blockWarnings("SimpleReaction.Real", srt.Real, warnings);

  const ts = results.TaskSwitching;
  if (ts?.Peak_Trial_Scores?.Practice) {
    tsBlockWarnings("TaskSwitching.Peak_Trial_Scores.Practice", ts.Peak_Trial_Scores.Practice, warnings);
  }
  if (ts?.Peak_Trial_Scores?.Actual_Trial_Scores) {
    tsBlockWarnings("TaskSwitching.Peak_Trial_Scores.Actual_Trial_Scores", ts.Peak_Trial_Scores.Actual_Trial_Scores, warnings);
  }
  if (ts?.Mean_Trial_Scores?.Practice) {
    tsBlockWarnings("TaskSwitching.Mean_Trial_Scores.Practice", ts.Mean_Trial_Scores.Practice, warnings);
  }
  if (ts?.Mean_Trial_Scores?.Actual_Trial_Scores) {
    tsBlockWarnings("TaskSwitching.Mean_Trial_Scores.Actual_Trial_Scores", ts.Mean_Trial_Scores.Actual_Trial_Scores, warnings);
  }

  const gng = results.GoNoGo;
  if (gng?.Practice) gngBlockWarnings("GoNoGo.Practice", gng.Practice, warnings);
  if (gng?.Real) gngBlockWarnings("GoNoGo.Real", gng.Real, warnings);

  const posner = results.PosnerCue;
  if (posner?.Practice?.Valid) posnerBlockWarnings("PosnerCue.Practice.Valid", posner.Practice.Valid, warnings);
  if (posner?.Practice?.Non_Valid) posnerBlockWarnings("PosnerCue.Practice.Non_Valid", posner.Practice.Non_Valid, warnings);
  if (posner?.Real?.Valid) posnerBlockWarnings("PosnerCue.Real.Valid", posner.Real.Valid, warnings);
  if (posner?.Real?.Non_Valid) posnerBlockWarnings("PosnerCue.Real.Non_Valid", posner.Real.Non_Valid, warnings);

  const ctl = results.Controller_Test;
  if (ctl?.Left_Test) controllerStickWarnings("Controller_Test.Left_Test", ctl.Left_Test, warnings);
  if (ctl?.Right_Test) controllerStickWarnings("Controller_Test.Right_Test", ctl.Right_Test, warnings);
  if (ctl?.Dual_Test) {
    if (ctl.Dual_Test.Left_Stick) controllerStickWarnings("Controller_Test.Dual_Test.Left_Stick", ctl.Dual_Test.Left_Stick, warnings);
    if (ctl.Dual_Test.Right_Stick) controllerStickWarnings("Controller_Test.Dual_Test.Right_Stick", ctl.Dual_Test.Right_Stick, warnings);
    rtWarnings("Controller_Test.Dual_Test", {
      Total_Average_Reaction: ctl.Dual_Test.Total_Average_Reaction,
      Peak_Reaction: ctl.Dual_Test.Peak_Reaction,
    }, warnings);
    if (num(ctl.Dual_Test.Out_Of_Order_Count) && ctl.Dual_Test.Out_Of_Order_Count < 0) {
      warnings.push({
        code: "NEGATIVE_ERROR_COUNT",
        message: `Controller_Test.Dual_Test.Out_Of_Order_Count is negative (${ctl.Dual_Test.Out_Of_Order_Count})`,
        path: "Controller_Test.Dual_Test.Out_Of_Order_Count",
      });
    }
  }

  return warnings;
}
