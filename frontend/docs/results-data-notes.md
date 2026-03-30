# Test result file notes

This document summarizes the bundled example result files in `public/test_result_examples`. It describes their schemas, notable values, and parsing considerations for the results analyzer.

## Heneveld Controller (JSON)
- File: [frontend/public/test_result_examples/combined_24_tests_Heneveld_Paradigm.json](frontend/public/test_result_examples/combined_24_tests_Heneveld_Paradigm.json)
- Shape: object with controller metadata plus at least one side key (e.g., `left`). Each side key contains a `trials` array.
- Trial count: 60 trials (from the bundled file, all under `left.trials`).
- Metadata: `generated` (ISO timestamp), `userAgent`, `app_version`, `controller` (id/index/mapping/axes/buttons), `settings` (deadzone/targetRadius/moveThreshold/stick/targetCount), `planned_spot_order`, `presented_spot_order`.
- Trial fields:
  - Timing: `time` (ISO), `reaction_ms`, `hit_ms`, `acquisition_ms`.
  - Outcome flags: `target_hit`, `wrong_direction`, `out_of_bounds`, `missed`, `hit_type`.
  - Positioning: `distance_deg`, `hit_x`, `hit_y`.
  - Input details: `device_id`, `mapping` (axisX/axisY/invertY), `calibration` (bias/scale).
  - Samples: nested joystick snapshots (`t`, `jx`, `jy`, `tx`, `ty`, `dist`, `axisX`, `axisY`).
- Expected categories/metrics: hit vs miss rate, reaction time distributions (`reaction_ms` / `hit_ms`), acquisition latency, spatial error characteristics.

## Go/No-Go (CSV)
- File: [frontend/public/test_result_examples/GoNoGo_3-29-2026,_9_47_22_PM.csv](frontend/public/test_result_examples/GoNoGo_3-29-2026,_9_47_22_PM.csv)
- Rows: 50 trials.
- Columns: `GoNoGoAndTestOrTrial`, `ResponseTimeMs`, `ErrorStatus`.
- Values:
  - `GoNoGoAndTestOrTrial`: starts with `go` or `nogo`, with phase suffix (`Training`/`Testing`).
  - `ResponseTimeMs`: integer ms; `2000` appears on some No-Go rows (likely timeouts).
  - `ErrorStatus`: `0` or `1`; `1` on some No-Go rows.
- Expected categories/metrics: Go RT distribution, No-Go error rate, No-Go timeout rate (RT=2000), phase-separated stats (Training vs Testing).

## Posner Cueing (CSV)
- File: [frontend/public/test_result_examples/PosnerCue_3-29-2026,_9_54_38_PM.csv](frontend/public/test_result_examples/PosnerCue_3-29-2026,_9_54_38_PM.csv)
- Rows: 200 trials.
- Columns: `TestOrTraining`, `CuePosition`, `TargetPosition`, `CueValidity`, `CuedOrUncued`, `CueValidityAsNumber`, `ResponsetimeMS`, `StatusOfAnswer`.
- Values:
  - `CueValidity`: `valid` or `invalid`; `CueValidityAsNumber`: `1`/`0` mirror.
  - `ResponsetimeMS`: integer ms.
  - `StatusOfAnswer`: `1` on most rows; `2` on some invalid trials.
- Expected categories/metrics: Valid vs invalid RT means/medians, cued vs uncued RTs, error/invalid rate from `StatusOfAnswer != 1`, phase split (`TestOrTraining`).

## Simple Reaction (CSV)
- File: [frontend/public/test_result_examples/SimpleReaction_3-29-2026,_8_43_49_PM.csv](frontend/public/test_result_examples/SimpleReaction_3-29-2026,_8_43_49_PM.csv)
- Rows: 30 trials.
- Columns: `TestOrTrial`, `TrainingOrReal`, `NumberOfChoices`, `timeBetweenResponseAndNextTrial`, `XCoordinateTargetStim`, `ResponseTime`, `StatusOfAnswer`.
- Values:
  - `TrainingOrReal`: `1` (training) or `0` (real).
  - `NumberOfChoices`: `1` in sample.
  - `ResponseTime`: integer ms; one outlier at 14 ms.
  - `StatusOfAnswer`: `1` on all rows.
- Expected categories/metrics: RT distribution (filter <50 ms if desired), training vs real splits, ITI (`timeBetweenResponseAndNextTrial`).

## Task Switching (CSV)
- File: [frontend/public/test_result_examples/TaskSwitching_stats_3-30-2026,_8_31_43_AM.csv](frontend/public/test_result_examples/TaskSwitching_stats_3-30-2026,_8_31_43_AM.csv)
- Rows: 99 data rows (aggregated stats, not trials).
- Format: sparse table of means and switch-cost deltas.
- Columns (partial header): `lettersTraining_mean`, `numbersTraining_mean`, `mixedTraining_mean`, `lettersTesting_mean`, `numbersTesting_mean`, `mixedTesting_mean`, `_mean`, `lettersTraining_switchCosts`, `numbersTraining_switchCosts`, `mixedTraining_switchCosts`, `lettersTesting_switchCosts`, `numbersTesting_switchCosts`, `mixedTesting_switchCosts`, `_switchCosts`, followed by many empty columns.
- Values:
  - Mixed numeric and string entries (`INCORRECT`, `NaN`).
  - Switch-cost columns contain negatives (e.g., `-44`, `-513`, `-1709`) and large positives (e.g., `2398`, `2476`).
  - Means: examples include 688, 425.26, 156, 267, 530.04.
- Expected categories/metrics: aggregated means per block (letters/numbers/mixed, training/testing) and switch-cost magnitudes. Data needs cleaning: ignore non-finite values and take absolute values for switch-costs before summary to avoid negative min/max.
