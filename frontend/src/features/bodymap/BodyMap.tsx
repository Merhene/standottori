import { useCallback, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  BODY_BASE,
  PARTS_BY_ID,
  partsForFace,
  type Face,
} from './parts';
import {
  buildChips,
  getSelection,
  isPartSelected,
  type SelectedPart,
} from './selection';
import { usePartHitTest } from './usePartHitTest';
import './BodyMap.css';

interface BodyMapProps {
  selected: SelectedPart[];
  onChange: (next: SelectedPart[]) => void;
}

interface PendingWrap {
  partId: string;
}

export default function BodyMap({ selected, onChange }: BodyMapProps) {
  const { t } = useTranslation();
  const [view, setView] = useState<Face>('front');
  const [hoverId, setHoverId] = useState<string | null>(null);
  const [pending, setPending] = useState<PendingWrap | null>(null);
  const stageRef = useRef<HTMLDivElement>(null);

  const visibleParts = useMemo(() => partsForFace(view), [view]);
  const { hitTest } = usePartHitTest(visibleParts);

  const chips = useMemo(() => buildChips(selected), [selected]);

  const resolveHit = useCallback(
    (clientX: number, clientY: number) => {
      const rect = stageRef.current?.getBoundingClientRect();
      if (!rect) return null;
      return hitTest(clientX, clientY, rect);
    },
    [hitTest]
  );

  const removeParts = (partIds: string[]) => {
    const drop = new Set(partIds);
    // Also drop wrap-linked counterparts that were auto-selected
    for (const id of partIds) {
      const part = PARTS_BY_ID[id];
      const sel = getSelection(selected, id);
      if (sel?.wraps && part?.wrapPairId) drop.add(part.wrapPairId);
    }
    onChange(selected.filter((s) => !drop.has(s.partId)));
    setPending(null);
  };

  const upsertPart = (partId: string, wraps: boolean) => {
    const part = PARTS_BY_ID[partId];
    if (!part) return;

    const without = selected.filter((s) => s.partId !== partId);
    // If wrapping, also ensure the pair is tracked as wrap-linked visually
    // by selecting the pair when it exists and isn't already chosen alone.
    let next: SelectedPart[] = [...without, { partId, wraps }];

    if (wraps && part.wrapPairId) {
      const pairId = part.wrapPairId;
      next = next.filter((s) => s.partId !== pairId);
      next.push({ partId: pairId, wraps: true });
    } else if (!wraps && part.wrapPairId) {
      // Drop a previously auto-added wrap pair if it was only there for wrap
      const pair = getSelection(selected, part.wrapPairId);
      if (pair?.wraps) {
        next = next.filter((s) => s.partId !== part.wrapPairId);
      }
    }

    onChange(next);
  };

  const handleStageClick = (e: React.MouseEvent | React.PointerEvent) => {
    const hit = resolveHit(e.clientX, e.clientY);
    if (!hit) {
      setPending(null);
      return;
    }

    const existing = getSelection(selected, hit);
    if (existing) {
      // Toggle off — also drop the wrap pair if it was linked
      const part = PARTS_BY_ID[hit];
      const toRemove = [hit];
      if (existing.wraps && part?.wrapPairId) toRemove.push(part.wrapPairId);
      removeParts(toRemove);
      return;
    }

    const part = PARTS_BY_ID[hit];
    // Wrap prompt only for limbs / neck / head (parts with a wrapPairId)
    if (!part?.wrapPairId) {
      upsertPart(hit, false);
      setPending(null);
      return;
    }

    // Select this side first, then ask if it wraps around
    upsertPart(hit, false);
    setPending({ partId: hit });
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    const hit = resolveHit(e.clientX, e.clientY);
    setHoverId(hit);
  };

  const answerWrap = (wraps: boolean) => {
    if (!pending) return;
    upsertPart(pending.partId, wraps);
    setPending(null);
  };

  const pendingLabel = pending
    ? t(`bodymap.parts.${PARTS_BY_ID[pending.partId]?.labelKey ?? ''}`)
    : '';

  return (
    <section className="bodymap" aria-label={t('bodymap.title')}>
      <div className="bodymap__header">
        <p className="bodymap__title">{t('bodymap.title')}</p>
        <p className="bodymap__hint">{t('bodymap.hint')}</p>

        <div className="bodymap__faces" role="group" aria-label={t('bodymap.view_label')}>
          {([
            ['front', t('bodymap.view_front')],
            ['back', t('bodymap.view_back')],
          ] as const).map(([mode, label]) => (
            <button
              key={mode}
              type="button"
              className="bodymap__face"
              aria-pressed={view === mode}
              onClick={() => {
                setView(mode);
                setPending(null);
                setHoverId(null);
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="bodymap__stage-wrap">
        <div
          ref={stageRef}
          className="bodymap__stage"
          onClick={handleStageClick}
          onPointerMove={handlePointerMove}
          onPointerLeave={() => setHoverId(null)}
          role="img"
          aria-label={t('bodymap.stage_label', {
            face: t(view === 'front' ? 'bodymap.view_front' : 'bodymap.view_back'),
          })}
        >
          <img
            className="bodymap__base"
            src={BODY_BASE[view]}
            alt=""
            draggable={false}
          />

          {visibleParts.map((part) => {
            const sel = getSelection(selected, part.id);
            const wraps = !!sel?.wraps;

            return (
              <img
                key={part.id}
                className={[
                  'bodymap__part',
                  hoverId === part.id ? 'is-hover' : '',
                  isPartSelected(selected, part.id) ? 'is-selected' : '',
                  wraps ? 'is-wrap' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                src={part.src}
                alt=""
                draggable={false}
              />
            );
          })}

          {pending && (
            <div
              className="bodymap__prompt"
              role="dialog"
              aria-live="polite"
              onClick={(e) => e.stopPropagation()}
            >
              <p className="bodymap__prompt-label">
                {t('bodymap.wrap_prompt', { part: pendingLabel })}
              </p>
              <div className="bodymap__prompt-actions">
                <button
                  type="button"
                  className="bodymap__prompt-btn bodymap__prompt-btn--yes"
                  onClick={(e) => {
                    e.stopPropagation();
                    answerWrap(true);
                  }}
                >
                  {t('bodymap.wrap_yes')}
                </button>
                <button
                  type="button"
                  className="bodymap__prompt-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    answerWrap(false);
                  }}
                >
                  {t('bodymap.wrap_no')}
                </button>
              </div>
            </div>
          )}
        </div>

        <aside className="bodymap__panel">
          <p className="bodymap__panel-title">{t('bodymap.selected_title')}</p>

          {chips.length === 0 ? (
            <p className="bodymap__empty">{t('bodymap.selected_empty')}</p>
          ) : (
            <ul className="bodymap__chips">
              {chips.map((chip) => (
                <li key={chip.key} className="bodymap__chip">
                  <span>
                    {t(`bodymap.${chip.labelNs}.${chip.labelKey}`)}
                    {chip.wraps && (
                      <span className="bodymap__chip-wrap"> · {t('bodymap.wrap_suffix')}</span>
                    )}
                  </span>
                  <button
                    type="button"
                    className="bodymap__chip-remove"
                    aria-label={t('bodymap.remove', {
                      part: t(`bodymap.${chip.labelNs}.${chip.labelKey}`),
                    })}
                    onClick={() => removeParts(chip.partIds)}
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>
          )}

          {selected.length > 0 && (
            <button
              type="button"
              className="bodymap__clear"
              onClick={() => {
                onChange([]);
                setPending(null);
              }}
            >
              {t('bodymap.clear')}
            </button>
          )}
        </aside>
      </div>
    </section>
  );
}

export type { SelectedPart };
