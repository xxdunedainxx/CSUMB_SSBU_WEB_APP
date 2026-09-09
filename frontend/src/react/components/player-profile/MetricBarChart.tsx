"use client";

import { motion, useTransform, type MotionValue } from "motion/react";
import { memo } from "react";
import { DEFAULT_CHART_ENTER_TRANSITION } from "../../../components/charts/animation";
import { useMountProgress } from "../../../components/charts/use-mount-progress";
import type {
  MetricBar,
  MetricBarGroup,
  TestMetricChart,
} from "../../../lib/player-profile/buildTestMetricCharts";
import { fmtCount, fmtMs } from "../../../lib/player-profile";

const CHART_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

function formatValue(value: number, unit: string): string {
  if (unit === "milliseconds") return fmtMs(value);
  if (unit === "count") return fmtCount(value);
  return String(Math.round(value));
}

function maxInGroup(group: MetricBarGroup): number {
  return Math.max(...group.bars.map((b) => b.value), 1);
}

export interface MetricBarChartProps {
  chart: TestMetricChart;
  playKey: string | number;
  index?: number;
}

export const MetricBarChart = memo(function MetricBarChart({
  chart,
  playKey,
  index = 0,
}: MetricBarChartProps) {
  const progress = useMountProgress(
    DEFAULT_CHART_ENTER_TRANSITION,
    index * 0.08,
    `${playKey}-${chart.id}`
  );

  return (
    <article className="metric-bar-chart">
      <header className="metric-bar-chart__header">
        <h3 className="metric-bar-chart__title">{chart.title}</h3>
        {chart.subtitle && (
          <p className="metric-bar-chart__subtitle">{chart.subtitle}</p>
        )}
      </header>
      {chart.groups.map((group, groupIndex) => (
        <MetricBarGroupView
          group={group}
          groupIndex={groupIndex}
          key={group.title ?? `group-${groupIndex}`}
          progress={progress}
        />
      ))}
    </article>
  );
});

function MetricBarGroupView({
  group,
  groupIndex,
  progress,
}: {
  group: MetricBarGroup;
  groupIndex: number;
  progress: MotionValue<number>;
}) {
  const max = maxInGroup(group);

  return (
    <div className="metric-bar-chart__group">
      {group.title && (
        <span className="metric-bar-chart__group-title">{group.title}</span>
      )}
      <div
        aria-label={group.title ?? "Metrics"}
        className="metric-bar-chart__bars"
        role="img"
      >
        {group.bars.map((bar, barIndex) => (
          <BarColumn
            bar={bar}
            barIndex={barIndex}
            color={CHART_COLORS[(groupIndex + barIndex) % CHART_COLORS.length]}
            key={bar.id}
            max={max}
            progress={progress}
          />
        ))}
      </div>
    </div>
  );
}

function BarColumn({
  bar,
  barIndex,
  max,
  color,
  progress,
}: {
  bar: MetricBar;
  barIndex: number;
  max: number;
  color: string;
  progress: MotionValue<number>;
}) {
  const ratio = bar.value / max;
  const delay = barIndex * 0.06;
  const scaleY = useTransform(progress, (p) => {
    const local = Math.max(0, Math.min(1, (p - delay) / Math.max(0.01, 1 - delay)));
    return local * ratio;
  });

  return (
    <div className="metric-bar-chart__column">
      <span className="metric-bar-chart__value">
        {formatValue(bar.value, bar.unit)}
      </span>
      <div className="metric-bar-chart__track">
        <motion.div
          className="metric-bar-chart__fill"
          style={{
            background: color,
            scaleY,
            originY: 1,
          }}
        />
      </div>
      <span className="metric-bar-chart__label">{bar.label}</span>
    </div>
  );
}

MetricBarChart.displayName = "MetricBarChart";
