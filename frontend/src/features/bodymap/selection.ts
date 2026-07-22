import { PARTS_BY_ID } from './parts';

export interface SelectedPart {
  partId: string;
  wraps: boolean;
}

export interface ComboDef {
  id: string;
  /** i18n key under bodymap.combos.* */
  labelKey: string;
  partIds: string[];
}

/** Neighbouring parts that collapse into a named zone when all are selected */
export const COMBOS: ComboDef[] = [
  {
    id: 'full-sleeve-left-front',
    labelKey: 'full_sleeve_left',
    partIds: ['front-left-shoulder', 'front-left-top-arm', 'front-left-bottom-arm'],
  },
  {
    id: 'full-sleeve-right-front',
    labelKey: 'full_sleeve_right',
    partIds: ['front-right-shoulder', 'front-right-top-arm', 'front-right-bottom-arm'],
  },
  {
    id: 'full-sleeve-left-back',
    labelKey: 'full_sleeve_left',
    partIds: ['back-left-arm', 'back-left-elbow', 'back-left-bottom-arm'],
  },
  {
    id: 'full-sleeve-right-back',
    labelKey: 'full_sleeve_right',
    partIds: ['back-right-arm', 'back-right-elbow', 'back-right-bottom-arm'],
  },
  {
    id: 'full-top-body',
    labelKey: 'full_top_body',
    partIds: [
      'front-chest',
      'front-belly',
      'front-left-ribs',
      'front-right-ribs',
      'front-pubis',
    ],
  },
  {
    id: 'full-leg-left',
    labelKey: 'full_leg_left',
    partIds: ['front-left-thigh', 'front-left-knee', 'front-left-shin'],
  },
  {
    id: 'full-leg-right',
    labelKey: 'full_leg_right',
    partIds: ['front-right-thigh', 'front-right-knee', 'front-right-shin'],
  },
];

export interface SelectionChip {
  /** Stable key for React */
  key: string;
  /** i18n key (bodymap.combos.* or bodymap.parts.*) */
  labelKey: string;
  /** namespace for part labels */
  labelNs: 'combos' | 'parts';
  wraps: boolean;
  /** Part ids covered by this chip (for remove) */
  partIds: string[];
}

/** Collapse raw selections into chips, preferring completed combos.
 *  Auto-added wrap counterparts stay off the chip list — the primary
 *  zone already carries a "wrap" suffix. */
export function buildChips(selected: SelectedPart[]): SelectionChip[] {
  const selectedIds = new Set(selected.map((s) => s.partId));
  const wrapsById = new Map(selected.map((s) => [s.partId, s.wraps]));
  const covered = new Set<string>();
  const chips: SelectionChip[] = [];

  // When both faces of a wrap pair are selected, hide the back chip
  for (const sel of selected) {
    if (!sel.wraps) continue;
    const part = PARTS_BY_ID[sel.partId];
    if (!part?.wrapPairId || part.face !== 'back') continue;
    if (wrapsById.get(part.wrapPairId)) covered.add(sel.partId);
  }

  for (const combo of COMBOS) {
    if (combo.partIds.every((id) => selectedIds.has(id))) {
      const wraps = combo.partIds.some((id) => wrapsById.get(id));
      const partIds = [...combo.partIds];
      for (const id of combo.partIds) {
        const pairId = PARTS_BY_ID[id]?.wrapPairId;
        if (pairId && wrapsById.get(id)) partIds.push(pairId);
      }
      chips.push({
        key: combo.id,
        labelKey: combo.labelKey,
        labelNs: 'combos',
        wraps,
        partIds,
      });
      combo.partIds.forEach((id) => covered.add(id));
    }
  }

  for (const sel of selected) {
    if (covered.has(sel.partId)) continue;
    const part = PARTS_BY_ID[sel.partId];
    if (!part) continue;
    const partIds = [sel.partId];
    if (sel.wraps && part.wrapPairId) partIds.push(part.wrapPairId);
    chips.push({
      key: sel.partId,
      labelKey: part.labelKey,
      labelNs: 'parts',
      wraps: sel.wraps,
      partIds,
    });
    if (sel.wraps && part.wrapPairId) covered.add(part.wrapPairId);
  }

  return chips;
}

/** Human-readable placement lines for the contact email */
export function formatPlacementLines(
  selected: SelectedPart[],
  translate: (key: string) => string
): string[] {
  return buildChips(selected).map((chip) => {
    const label = translate(`bodymap.${chip.labelNs}.${chip.labelKey}`);
    return chip.wraps ? `${label} (${translate('bodymap.wrap_suffix')})` : label;
  });
}

export function isPartSelected(selected: SelectedPart[], partId: string): boolean {
  return selected.some((s) => s.partId === partId);
}

export function getSelection(selected: SelectedPart[], partId: string): SelectedPart | undefined {
  return selected.find((s) => s.partId === partId);
}
