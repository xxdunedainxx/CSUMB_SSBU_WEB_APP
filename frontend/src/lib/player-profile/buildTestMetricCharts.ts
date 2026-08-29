import type { CognitiveTestResults, Unit } from "./types";
import { profileConfigV1 } from "./config";
import { extractMeasurements } from "./features";

export interface MetricBar {
  id: string;
  label: string;
  value: number;
  unit: Unit;
}

export interface MetricBarGroup {
  title?: string;
  bars: MetricBar[];
}

export interface TestMetricChart {
  id: string;
  title: string;
  subtitle?: string;
  groups: MetricBarGroup[];
}

function bar(
  id: string,
  label: string,
  value: number | null | undefined,
  unit: Unit
): MetricBar | null {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return null;
  }
  return { id, label, value, unit };
}

function group(title: string | undefined, bars: (MetricBar | null)[]): MetricBarGroup | null {
  const kept = bars.filter((b): b is MetricBar => b !== null);
  if (kept.length === 0) return null;
  return { title, bars: kept };
}

function srtChart(
  measurements: NonNullable<
    ReturnType<typeof extractMeasurements>["srt"]
  >
): TestMetricChart {
  const g = group(undefined, [
    bar("p-peak", "Prac Peak", measurements.practice.peak, "milliseconds"),
    bar("p-avg", "Prac Mean", measurements.practice.average, "milliseconds"),
    bar("r-peak", "Real Peak", measurements.real.peak, "milliseconds"),
    bar("r-avg", "Real Mean", measurements.real.average, "milliseconds"),
  ]);
  return {
    id: "srt",
    title: "Simple Reaction",
    groups: g ? [g] : [],
  };
}

function tsChart(
  measurements: NonNullable<ReturnType<typeof extractMeasurements>["ts"]>
): TestMetricChart {
  const p = measurements.mean.practice;
  const a = measurements.mean.actual;
  const g = group(undefined, [
    bar("p-single", "Prac Single", p.single, "milliseconds"),
    bar("p-repeat", "Prac Repeat", p.repeat, "milliseconds"),
    bar("p-switch", "Prac Switch", p.switch, "milliseconds"),
    bar("a-single", "Real Single", a.single, "milliseconds"),
    bar("a-repeat", "Real Repeat", a.repeat, "milliseconds"),
    bar("a-switch", "Real Switch", a.switch, "milliseconds"),
  ]);
  return {
    id: "ts",
    title: "Task Switching",
    subtitle: "Mean trial RT — peak scores in inspector",
    groups: g ? [g] : [],
  };
}

function gngChart(
  measurements: NonNullable<ReturnType<typeof extractMeasurements>["gng"]>
): TestMetricChart {
  const { practice, real } = measurements;
  const rtGroup = group("Response time", [
    bar("p-peak", "Prac Peak", practice.peak, "milliseconds"),
    bar("p-mean", "Prac Mean", practice.mean, "milliseconds"),
    bar("r-peak", "Real Peak", real.peak, "milliseconds"),
    bar("r-mean", "Real Mean", real.mean, "milliseconds"),
  ]);
  const errGroup = group("Errors", [
    bar("p-err", "Prac Errors", practice.errors, "count"),
    bar("r-err", "Real Errors", real.errors, "count"),
  ]);
  return {
    id: "gng",
    title: "Go/No-Go",
    groups: [rtGroup, errGroup].filter((g): g is MetricBarGroup => g !== null),
  };
}

function posnerChart(
  measurements: NonNullable<ReturnType<typeof extractMeasurements>["posner"]>
): TestMetricChart {
  return {
    id: "posner",
    title: "Posner Cue",
    groups: [
      group(undefined, [
        bar(
          "p-valid",
          "Prac Valid",
          measurements.practice.valid.average,
          "milliseconds"
        ),
        bar(
          "p-invalid",
          "Prac Invalid",
          measurements.practice.invalid.average,
          "milliseconds"
        ),
        bar("r-valid", "Real Valid", measurements.real.valid.average, "milliseconds"),
        bar(
          "r-invalid",
          "Real Invalid",
          measurements.real.invalid.average,
          "milliseconds"
        ),
      ]),
    ].filter((g): g is MetricBarGroup => g !== null),
  };
}

function controllerChart(
  measurements: NonNullable<
    ReturnType<typeof extractMeasurements>["controller"]
  >
): TestMetricChart {
  const { left, right, dual } = measurements;
  return {
    id: "controller",
    title: "Controller",
    groups: [
      group(undefined, [
        bar("l-avg", "Left Mean", left.totalAverageReaction, "milliseconds"),
        bar("l-peak", "Left Peak", left.peakReaction, "milliseconds"),
        bar("r-avg", "Right Mean", right.totalAverageReaction, "milliseconds"),
        bar("r-peak", "Right Peak", right.peakReaction, "milliseconds"),
        bar("d-avg", "Dual Mean", dual.totalAverageReaction, "milliseconds"),
        bar("d-peak", "Dual Peak", dual.peakReaction, "milliseconds"),
      ]),
    ].filter((g): g is MetricBarGroup => g !== null),
  };
}

function compactChart(chart: TestMetricChart): TestMetricChart | null {
  const groups = chart.groups.filter((g) => g.bars.length > 0);
  if (groups.length === 0) return null;
  return { ...chart, groups };
}

function pushChart(
  charts: TestMetricChart[],
  chart: TestMetricChart | null
): void {
  const compact = chart ? compactChart(chart) : null;
  if (compact) charts.push(compact);
}
export function buildTestMetricCharts(
  results: CognitiveTestResults,
  config = profileConfigV1
): TestMetricChart[] {
  const m = extractMeasurements(results, config);
  const charts: TestMetricChart[] = [];

  if (m.srt) pushChart(charts, srtChart(m.srt));
  if (m.ts) pushChart(charts, tsChart(m.ts));
  if (m.gng) pushChart(charts, gngChart(m.gng));
  if (m.posner) pushChart(charts, posnerChart(m.posner));
  if (m.controller) pushChart(charts, controllerChart(m.controller));

  return charts;
}
