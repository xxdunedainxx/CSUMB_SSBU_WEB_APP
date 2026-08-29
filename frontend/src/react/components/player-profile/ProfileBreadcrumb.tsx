"use client";

import { useSunburstBreadcrumbItems, useSunburstStable } from "../../../components/charts";
import type { PlayerProfile } from "../../../lib/player-profile";

export interface ProfileBreadcrumbProps {
  profile: PlayerProfile;
}

const BALANCED_COPY =
  "No single archetype clearly leads — your profile is balanced across patterns.";

/**
 * Drill-down breadcrumb trail rendered inside the vendored
 * `SunburstBreadcrumb` nav. Each non-current crumb is a zoom-to button.
 * The root crumb shows the derived archetype (or "Balanced Profile").
 */
export function ProfileBreadcrumb({ profile }: ProfileBreadcrumbProps) {
  const { items, zoomTo } = useSunburstBreadcrumbItems();
  const { rootId } = useSunburstStable();
  const rootLabel = profile.archetype?.label ?? "Balanced Profile";
  const rootDescription = profile.archetype?.description ?? BALANCED_COPY;

  const labelFor = (item: { id: string; label: string }) =>
    item.id === rootId ? rootLabel : item.label;

  return (
    <ol className="profile-breadcrumb">
      {items.map((item, index) => {
        const isFirst = index === 0;
        const label = labelFor(item);
        const showRootDescription = item.isCurrent && item.id === rootId;
        return (
          <li key={item.id} className="profile-breadcrumb__item">
            {!isFirst && (
              <span aria-hidden="true" className="profile-breadcrumb__sep">
                /
              </span>
            )}
            {item.isCurrent ? (
              showRootDescription ? (
                <div className="profile-breadcrumb__current-block">
                  <span aria-current="page" className="profile-breadcrumb__current">
                    {label}
                  </span>
                  <p className="profile-archetype-desc">{rootDescription}</p>
                </div>
              ) : (
                <span aria-current="page" className="profile-breadcrumb__current">
                  {label}
                </span>
              )
            ) : (
              <button
                className="profile-breadcrumb__button"
                onClick={() => zoomTo(item.id)}
                type="button"
              >
                {label}
              </button>
            )}
          </li>
        );
      })}
    </ol>
  );
}
