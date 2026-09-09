"use client";

import { motion, useTransform } from "motion/react";
import { memo, type CSSProperties } from "react";
import { DEFAULT_CHART_ENTER_TRANSITION } from "./animation";
import {
  applyHoverGrow,
  geomCentroidAngle,
  geomCentroidRadius,
  transitionGeometry,
} from "./sunburst";
import { sunburstCssVars, useSunburstStable } from "./sunburst-context";
import { useEnterComplete } from "./use-enter-complete";
import { useMountProgress } from "./use-mount-progress";

export interface SunburstLabelsProps {
  fontSize?: number;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  className?: string;
}

/** Average glyph advance relative to font-size (sans-serif ≈ 0.55–0.62). */
const CHAR_WIDTH_RATIO = 0.58;
/** Smallest label size that stays legible on the chart. */
const MIN_LABEL_FONT_SIZE = 8;
/** Fraction of the ring's radial depth available for text (keeps a margin). */
const LABEL_RADIAL_HEADROOM = 0.92;
/** Fraction of the wedge's arc length available for stacked lines. */
const LABEL_TANGENTIAL_HEADROOM = 0.85;
/** Line spacing used when a label wraps onto multiple radial lines. */
const LABEL_LINE_HEIGHT = 1.3;
/** Wrap at most this many lines before falling back to truncation. */
const MAX_WRAP_LINES = 3;

interface FittedLabel {
  lines: string[];
  fontSize: number;
}

/**
 * Labels read radially — they rotate to point outward from the center — so a
 * line's length is bounded by the ring's radial depth while the number of
 * stacked lines is bounded by the wedge's tangential (chord) width. Shrink the
 * font to fit, wrap onto 2–3 lines at word/hyphen boundaries so identity words
 * stay whole, and only then truncate with an ellipsis. Long names never bleed
 * into the neighboring ring.
 */
function fitRadialLabel(
  text: string,
  radialRoom: number,
  tangentialRoom: number,
  baseFontSize: number
): FittedLabel {
  const radial = radialRoom * LABEL_RADIAL_HEADROOM;
  const tangential = tangentialRoom * LABEL_TANGENTIAL_HEADROOM;

  // 1. Single line at (possibly reduced) font size.
  const singleFit = radial / Math.max(text.length * CHAR_WIDTH_RATIO, 1);
  if (
    singleFit >= MIN_LABEL_FONT_SIZE &&
    baseFontSize * LABEL_LINE_HEIGHT <= tangential
  ) {
    return {
      lines: [text],
      fontSize: Math.min(baseFontSize, singleFit),
    };
  }

  // 2. Word-aware wrap into 2-3 lines. Pieces keep their trailing space or
  //    hyphen, so breaks land on natural boundaries ("Precision-Preserving"
  //    splits after the hyphen).
  const maxCharsPerLine = Math.max(
    1,
    Math.floor(radial / (MIN_LABEL_FONT_SIZE * CHAR_WIDTH_RATIO))
  );
  const maxLines = Math.min(
    MAX_WRAP_LINES,
    Math.max(2, Math.floor(tangential / (MIN_LABEL_FONT_SIZE * LABEL_LINE_HEIGHT)))
  );
  const pieces = tokenizePieces(text);
  for (let lineCount = 2; lineCount <= maxLines; lineCount++) {
    const lines = packPieces(pieces, lineCount, maxCharsPerLine);
    if (!lines) continue;
    const widest = Math.max(...lines.map((line) => line.length));
    const fontSize = Math.min(baseFontSize, radial / (widest * CHAR_WIDTH_RATIO));
    if (fontSize >= MIN_LABEL_FONT_SIZE) {
      return {
        lines: lines.map((line) => line.trimEnd()),
        fontSize,
      };
    }
  }

  // 3. Last resort — truncate with an ellipsis at the minimum legible size.
  const maxChars = Math.max(
    1,
    Math.floor(radial / (MIN_LABEL_FONT_SIZE * CHAR_WIDTH_RATIO))
  );
  const truncated =
    text.length > maxChars
      ? `${text.slice(0, Math.max(1, maxChars - 1)).trimEnd()}…`
      : text;
  return { lines: [truncated], fontSize: MIN_LABEL_FONT_SIZE };
}

/** Split on spaces and hyphens, keeping each separator attached to its piece. */
function tokenizePieces(text: string): string[] {
  const pieces: string[] = [];
  let buffer = "";
  for (const char of text) {
    if (char === " ") {
      if (buffer) {
        pieces.push(`${buffer} `);
        buffer = "";
      }
    } else if (char === "-") {
      buffer += "-";
      pieces.push(buffer);
      buffer = "";
    } else {
      buffer += char;
    }
  }
  if (buffer) pieces.push(buffer);
  return pieces.length > 0 ? pieces : [text];
}

/** Greedy, order-preserving pack of pieces into exactly `lineCount` lines. */
function packPieces(
  pieces: string[],
  lineCount: number,
  maxCharsPerLine: number
): string[] | null {
  const lines: string[] = [];
  let current = "";
  for (const piece of pieces) {
    if (current && current.length + piece.length > maxCharsPerLine) {
      lines.push(current);
      current = piece;
      if (lines.length >= lineCount) return null;
    } else {
      current += piece;
    }
  }
  if (current) lines.push(current);
  if (lines.length !== lineCount) return null;
  if (Math.max(...lines.map((line) => line.length)) > maxCharsPerLine) {
    return null;
  }
  return lines;
}

export const SunburstLabels = memo(function SunburstLabels({
  fontSize = 11,
  fill = sunburstCssVars.label,
  stroke = sunburstCssVars.background,
  strokeWidth = 2.5,
  className,
}: SunburstLabelsProps) {
  const {
    arcs,
    focus,
    prevFocus,
    maxDepth,
    radius,
    zoomT,
    enterTiming,
    enterTransition,
    playKey,
    skipEnterAnimation,
    growAmountForArc,
    isRelated,
    maxExpandedThickness,
  } = useSunburstStable();

  const enterDuration =
    typeof enterTransition?.duration === "number"
      ? enterTransition.duration
      : (DEFAULT_CHART_ENTER_TRANSITION.duration as number);
  const labelsDelay = enterTiming.maxDelay + enterDuration * 0.85;

  const labelsProgress = useMountProgress(
    enterTransition,
    labelsDelay,
    `${playKey}-labels`
  );
  const labelsComplete = useEnterComplete(labelsProgress);
  const labelOpacity = useTransform(labelsProgress, [0, 1], [0, 1]);
  const showLabels = skipEnterAnimation || labelsComplete;

  return (
    <g className={className}>
      {arcs.map((arc) => {
        const base = transitionGeometry(
          arc,
          prevFocus,
          focus,
          maxDepth,
          radius,
          zoomT
        );
        if (!base) {
          return null;
        }
        const g = applyHoverGrow(
          base,
          arc.id,
          growAmountForArc,
          maxExpandedThickness
        );
        const angleSpan = g.a1 - g.a0;
        const centroidR = geomCentroidRadius(g);
        const radialRoom = g.outerR - g.innerR;
        // Innermost ring: wedges start at the center, so push labels outward
        // (~62% of outer radius) so radial text clears the empty hub disk.
        const labelR =
          g.innerR < 1 ? g.outerR * 0.62 : centroidR;
        const tangentialRoom = angleSpan * labelR;
        if (tangentialRoom < 26 || radialRoom < 16) {
          return null;
        }
        if (!isRelated(arc)) {
          return null;
        }

        const fitted = fitRadialLabel(
          arc.name,
          radialRoom,
          tangentialRoom,
          fontSize
        );

        const mid = geomCentroidAngle(g);
        const x = Math.sin(mid) * labelR;
        const y = -Math.cos(mid) * labelR;
        let deg = (mid * 180) / Math.PI - 90;
        if (deg > 90) {
          deg -= 180;
        }
        if (deg < -90) {
          deg += 180;
        }

        const labelStyle: CSSProperties = {
          fill,
          fontFamily: "inherit",
          fontSize: fitted.fontSize,
          fontWeight: 600,
        };
        if (strokeWidth > 0) {
          labelStyle.paintOrder = "stroke";
          labelStyle.stroke = stroke;
          labelStyle.strokeLinejoin = "round";
          labelStyle.strokeWidth = strokeWidth;
        }

        const lineGap = fitted.fontSize * LABEL_LINE_HEIGHT;
        const lines = fitted.lines.map((line, index) => (
          <tspan
            key={index}
            dy={
              index === 0
                ? -((fitted.lines.length - 1) * lineGap) / 2
                : lineGap
            }
            x={x}
          >
            {line}
          </tspan>
        ));

        if (showLabels) {
          return (
            <text
              dominantBaseline="middle"
              key={`label-${arc.id}`}
              pointerEvents="none"
              style={{ ...labelStyle, opacity: 1 }}
              textAnchor="middle"
              transform={`rotate(${deg} ${x} ${y})`}
              x={x}
              y={y}
            >
              {lines}
            </text>
          );
        }

        return (
          <motion.text
            dominantBaseline="middle"
            key={`label-${arc.id}`}
            pointerEvents="none"
            style={{ ...labelStyle, opacity: labelOpacity }}
            textAnchor="middle"
            transform={`rotate(${deg} ${x} ${y})`}
            x={x}
            y={y}
          >
            {lines}
          </motion.text>
        );
      })}
    </g>
  );
});

SunburstLabels.displayName = "SunburstLabels";
