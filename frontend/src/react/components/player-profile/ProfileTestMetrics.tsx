"use client";

import { useEffect, useMemo, useState } from "react";
import {
  buildTestMetricCharts,
  type CognitiveTestResults,
} from "../../../lib/player-profile";
import { MetricBarChart } from "./MetricBarChart";

export interface ProfileTestMetricsProps {
  results: CognitiveTestResults;
  playKey: string | number;
}

/**
 * Compact bar charts for each test present in the session results.
 * One chart is visible at a time; ^ / v step through tests (no inner scroll).
 */
export function ProfileTestMetrics({ results, playKey }: ProfileTestMetricsProps) {
  const charts = useMemo(
    () => buildTestMetricCharts(results),
    [results]
  );
  const [index, setIndex] = useState(0);

  useEffect(() => {
    setIndex(0);
  }, [playKey]);

  useEffect(() => {
    setIndex((current) =>
      charts.length === 0 ? 0 : Math.min(current, charts.length - 1)
    );
  }, [charts.length]);

  if (charts.length === 0) {
    return (
      <aside className="profile-test-metrics profile-test-metrics--empty">
        <p className="profile-test-metrics__empty">No test metrics available.</p>
      </aside>
    );
  }

  const chart = charts[index];
  const hasMultiple = charts.length > 1;
  const canGoUp = index > 0;
  const canGoDown = index < charts.length - 1;

  return (
    <aside
      aria-label="Test result metrics"
      className="profile-test-metrics"
    >
      {hasMultiple && (
        <button
          aria-label="Previous test metrics"
          className="profile-test-metrics__nav-btn"
          disabled={!canGoUp}
          onClick={() => setIndex((current) => Math.max(0, current - 1))}
          type="button"
        >
          ^
        </button>
      )}

      <div
        aria-live="polite"
        className="profile-test-metrics__viewport"
      >
        <MetricBarChart
          chart={chart}
          index={0}
          key={`${playKey}-${chart.id}`}
          playKey={`${playKey}-${chart.id}`}
        />
      </div>

      {hasMultiple && (
        <>
          <button
            aria-label="Next test metrics"
            className="profile-test-metrics__nav-btn"
            disabled={!canGoDown}
            onClick={() =>
              setIndex((current) => Math.min(charts.length - 1, current + 1))
            }
            type="button"
          >
            v
          </button>
          <p className="profile-test-metrics__counter" aria-live="polite">
            {index + 1} / {charts.length}
          </p>
        </>
      )}
    </aside>
  );
}
