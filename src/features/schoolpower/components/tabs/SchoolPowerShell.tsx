import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import { Plus, X } from 'lucide-react';
import type { TabBarTab, TabIcon } from './types';

// ─── Tab shape configuration ─────────────────────────────────────────────────
//  Edit these numbers to change the visual appearance of the tabs.
//  Rule: TAB_H  must be greater than  VALLEY_R + TAB_TOP_R
//
const SHAPE = {
  TAB_H:            44,  // height of the tab above the card border (px)
  TAB_TOP_R:        16,  // corner radius at the TOP of each tab (px)
  CARD_R:           17,  // corner radius of the card body itself (px)
  VALLEY_R:         16,  // radius of the concave "barriguinha" arcs at each tab base (px)
  TAB_MIN_W:       112,  // minimum tab width (px)
  TAB_MAX_W:       180,  // maximum tab width (px)
  TAB_GAP:           8,  // flat valley floor between two adjacent tabs (px)
  PLUS_W:           28,  // width of the "+" add-tab button (px)
  PLUS_GAP:         -8,  // gap between last tab and the "+" button (px)
  FIRST_TAB_OFFSET:  10,  // extra spacing between the card's top-left corner and the first tab (px)
                          // full left indent = CARD_R + VALLEY_R + FIRST_TAB_OFFSET
};

// ─── Tab label configuration ──────────────────────────────────────────────────
//  Edit these values to adjust the visual style of the text/icon inside each tab.
//
const LABEL = {
  FONT_PX:          13,                      // text size inside each tab (px)
  FONT_WEIGHT:     800,                      // font weight  (700=bold · 800=extrabold · 900=black)
  ICON_PX:          16,                      // icon size inside each tab (px)
  ICON_STROKE:       2.5,                    // icon stroke-width — higher = bolder/heavier (default Lucide = 2)
  GAP_PX:            7,                      // gap between icon and text (px)
  ACTIVE_COLOR:    '#fe6a03',                // color of icon + text on the ACTIVE tab
  INACTIVE_COLOR:  'rgba(255,255,255,0.32)', // color of icon + text on INACTIVE tabs
};

// ─── Tab hover configuration ──────────────────────────────────────────────────
//  Controls the highlight gradient shown when the cursor is over a tab.
//  The gradient is top-heavy: full intensity at the top, fading to transparent.
//
//  TAB_HOVER_COLOR:     base color as [R, G, B]  (0–255 each)
//  TAB_HOVER_INTENSITY: max opacity of the gradient at the very top  (0.0 – 1.0)
//  TAB_HOVER_STOP:      % distance from top where gradient becomes fully transparent (0–100)
//
const HOVER = {
  TAB_HOVER_COLOR:      [255, 255, 255] as [number, number, number],
  TAB_HOVER_INTENSITY:   0.10,
  TAB_HOVER_STOP:        65,
};

// ─── Tab drag configuration ───────────────────────────────────────────────────
//  Controls how a tab looks while it is being dragged (lifted state).
//
//  TAB_BG_DARK:   background fill of the floating tab in dark theme
//  TAB_BG_LIGHT:  background fill of the floating tab in light theme
//  TAB_SHADOW:    CSS box-shadow giving the "elevated" feel
//
const DRAG = {
  TAB_BG_DARK:  'rgba(17, 26, 48, 0.97)',
  TAB_BG_LIGHT: 'rgba(248, 250, 252, 0.97)',
  // Softer shadow — visible but not overpowering; spreads freely (no clip)
  TAB_SHADOW:   '0 4px 16px rgba(0,0,0,0.35), 0 1px 4px rgba(0,0,0,0.18)',
  // Gap between the floating card's bottom edge and the top of the main card border
  TAB_FLOAT_GAP: 3,
};

// ─── Destructure for use below ───────────────────────────────────────────────
const { TAB_H, TAB_TOP_R, CARD_R, VALLEY_R, TAB_MIN_W, TAB_MAX_W, TAB_GAP, PLUS_W, PLUS_GAP, FIRST_TAB_OFFSET } = SHAPE;
const { TAB_FLOAT_GAP } = DRAG;

// horizontal space consumed between tab[i].endX and tab[i+1].startX:
//   right valley arc (VALLEY_R) + flat gap (TAB_GAP) + left valley arc of next tab (VALLEY_R)
const SLOT_STEP = 2 * VALLEY_R + TAB_GAP;   // 40 px

// ─── Types ───────────────────────────────────────────────────────────────────
interface TabSlot { startX: number; endX: number; tab: TabBarTab }
interface Dims    { W: number; H: number }

interface ActiveDrag {
  draggingTabId: string;
  fromIndex:     number;
  startPointerX: number;
  deltaX:        number;
  previewTabIds: string[];
  dragStarted:   boolean;
}

interface SnapBack {
  tabId:     string;
  fromX:     number;   // visual X where the drag ended
  toX:       number;   // target (merged-slot) X
  slotW:     number;
  animating: boolean;
}

// ─── Icon helper — filled SVG icons (bold by nature) ────────────────────────
const IconByType: React.FC<{ icon: TabIcon; color: string }> = ({ icon, color }) => {
  const s: React.CSSProperties = {
    width: LABEL.ICON_PX, height: LABEL.ICON_PX,
    flexShrink: 0, color, transition: 'color 0.15s', display: 'block',
  };
  if (icon === 'chat') return (
    <svg style={s} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 2C6.477 2 2 6.477 2 12c0 1.82.487 3.53 1.338 5.003L2 22l5.003-1.338A9.954 9.954 0 0 0 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2Z"/>
    </svg>
  );
  if (icon === 'activity') return (
    <svg style={s} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
    </svg>
  );
  return (
    <svg style={s} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 3 2 12h3v9h5v-5h4v5h5v-9h3L12 3Z"/>
    </svg>
  );
};

// ─── Tab width from title ─────────────────────────────────────────────────────
function measureTabWidth(tab: TabBarTab): number {
  const iconPx = LABEL.ICON_PX + LABEL.GAP_PX;
  const textPx = Math.ceil(tab.title.length * (LABEL.FONT_PX * 0.62));
  const dotPx  = tab.hasActivity ? 9 : 0;
  const padPx  = 24;
  return Math.max(TAB_MIN_W, Math.min(TAB_MAX_W, iconPx + textPx + dotPx + padPx));
}

// ─── Slot layout ─────────────────────────────────────────────────────────────
function computeTabSlots(tabs: TabBarTab[], W: number): TabSlot[] {
  if (W < 80 || tabs.length === 0) return [];

  // First tab: starts after card TL corner arc + left valley arc + configurable offset
  const firstX   = CARD_R + VALLEY_R + FIRST_TAB_OFFSET;
  // Right boundary: reserve space for final valley arc + plus button
  const maxRight = W - CARD_R - VALLEY_R - PLUS_GAP - PLUS_W - 4;

  const slots: TabSlot[] = [];
  let x = firstX;

  for (const tab of tabs) {
    const w = measureTabWidth(tab);
    if (x + w > maxRight) break;
    slots.push({ startX: x, endX: x + w, tab });
    x += w + SLOT_STEP;
  }
  return slots;
}

// ─── SVG path builder ─────────────────────────────────────────────────────────
//
// Traces the OUTER boundary of the card + tabs shape, CLOCKWISE, starting at
// (CARD_R, TAB_H) which is the top-left "entry point" of the card border line.
//
// Top edge runs LEFT → RIGHT.  For each tab slot:
//
//   ① Flat at y=TAB_H until   (startX - VALLEY_R, TAB_H)
//   ② "Barriguinha" LEFT arc  — concave quarter circle that sweeps from the
//      flat border level UP to the tab's left wall.
//      Arc center is at (startX, TAB_H); sweep=1 (clockwise in SVG coords).
//      From (startX-VALLEY_R, TAB_H) → (startX, TAB_H-VALLEY_R)
//   ③ Straight UP along the left wall: y goes TAB_H-VALLEY_R → TAB_TOP_R
//   ④ Top-left rounded corner (sweep=1):
//      From (startX, TAB_TOP_R) → (startX+TAB_TOP_R, 0)
//   ⑤ Flat tab top: x goes startX+TAB_TOP_R → endX-TAB_TOP_R
//   ⑥ Top-right rounded corner (sweep=1):
//      From (endX-TAB_TOP_R, 0) → (endX, TAB_TOP_R)
//   ⑦ Straight DOWN along the right wall: y goes TAB_TOP_R → TAB_H-VALLEY_R
//   ⑧ "Barriguinha" RIGHT arc — concave quarter circle from the right wall DOWN
//      to the flat border level.
//      Arc center at (endX, TAB_H); sweep=1.
//      From (endX, TAB_H-VALLEY_R) → (endX+VALLEY_R, TAB_H)
//
// After all tabs: flat to W-CARD_R, then card corners/sides/bottom.
//
// excludeTabId: when set, that tab's notch is replaced by a flat line (used
//   during drag so the "ghost" gap appears in the tab bar while the floating
//   drag tab travels freely).
//
function buildBorderPath(W: number, H: number, slots: TabSlot[], excludeTabId?: string): string {
  if (W < 10 || H < 10) return '';

  const n = (v: number) => +v.toFixed(2);
  const A = (r: number, sf: 0 | 1, x: number, y: number) =>
    `A ${n(r)},${n(r)} 0 0 ${sf} ${n(x)},${n(y)} `;

  let d  = `M ${n(CARD_R)},${n(TAB_H)} `;
  let cx = CARD_R;

  for (const { startX, endX, tab } of slots) {

    // When this tab is being dragged, leave a flat gap at its logical slot.
    // cx advances past the slot so the next tab's flat-line spans the gap.
    if (tab.tabId === excludeTabId) {
      cx = endX + VALLEY_R;
      continue;
    }

    // ① flat valley floor up to the arc entry point
    const arcEntry = startX - VALLEY_R;
    if (arcEntry > cx) d += `L ${n(arcEntry)},${n(TAB_H)} `;

    // ② left "barriguinha" — concave, CCW quarter circle (sweep=0)
    d += A(VALLEY_R, 0, startX, TAB_H - VALLEY_R);

    // ③ left wall straight up
    d += `L ${n(startX)},${n(TAB_TOP_R)} `;

    // ④ top-left tab corner, clockwise
    d += A(TAB_TOP_R, 1, startX + TAB_TOP_R, 0);

    // ⑤ flat top of tab
    d += `L ${n(endX - TAB_TOP_R)},0 `;

    // ⑥ top-right tab corner, clockwise
    d += A(TAB_TOP_R, 1, endX, TAB_TOP_R);

    // ⑦ right wall straight down
    d += `L ${n(endX)},${n(TAB_H - VALLEY_R)} `;

    // ⑧ right "barriguinha" — concave, CCW quarter circle (sweep=0)
    d += A(VALLEY_R, 0, endX + VALLEY_R, TAB_H);

    cx = endX + VALLEY_R;
  }

  // flat to top-right card corner
  d += `L ${n(W - CARD_R)},${n(TAB_H)} `;

  // card body corners + sides (all clockwise, sweep=1)
  d += A(CARD_R, 1, W,          TAB_H + CARD_R);
  d += `L ${n(W)},${n(H - CARD_R)} `;
  d += A(CARD_R, 1, W - CARD_R, H);
  d += `L ${n(CARD_R)},${n(H)} `;
  d += A(CARD_R, 1, 0,          H - CARD_R);
  d += `L 0,${n(TAB_H + CARD_R)} `;
  d += A(CARD_R, 1, CARD_R,     TAB_H);

  d += 'Z';
  return d;
}

// ─── Single floating tab outline ─────────────────────────────────────────────
//
// Returns the SVG path for ONE tab's outline in a local coordinate system
// where x=0 is the start of its left barriguinha.
// Total bounding box: width = VALLEY_R + slotW + VALLEY_R, height = TAB_H.
// Used to render the floating "ghost" of a dragged tab at the pointer position.
//
function buildSingleTabOutline(slotW: number): string {
  const n = (v: number) => +v.toFixed(2);
  const A = (r: number, sf: 0 | 1, x: number, y: number) =>
    `A ${n(r)},${n(r)} 0 0 ${sf} ${n(x)},${n(y)} `;

  const lx = VALLEY_R;                 // left wall x
  const rx = VALLEY_R + slotW;         // right wall x

  let d = `M 0,${n(TAB_H)} `;
  d += A(VALLEY_R, 0, lx, TAB_H - VALLEY_R);         // left barriguinha
  d += `L ${n(lx)},${n(TAB_TOP_R)} `;                // left wall up
  d += A(TAB_TOP_R, 1, lx + TAB_TOP_R, 0);           // top-left corner
  d += `L ${n(rx - TAB_TOP_R)},0 `;                  // flat top
  d += A(TAB_TOP_R, 1, rx, TAB_TOP_R);               // top-right corner
  d += `L ${n(rx)},${n(TAB_H - VALLEY_R)} `;         // right wall down
  d += A(VALLEY_R, 0, rx + VALLEY_R, TAB_H);         // right barriguinha
  return d;
}

// ─── Shell component ──────────────────────────────────────────────────────────
interface SchoolPowerShellProps {
  tabs:           TabBarTab[];
  activeTabId:    string;
  onTabClick:     (tabId: string) => void;
  onNewTab:       () => void;
  onCloseTab:     (tabId: string) => void;
  onReorderTab?:  (fromIndex: number, toIndex: number) => void;
  isDarkTheme?:   boolean;
  children:       React.ReactNode;
}

export const SchoolPowerShell: React.FC<SchoolPowerShellProps> = ({
  tabs,
  activeTabId,
  onTabClick,
  onNewTab,
  onCloseTab,
  onReorderTab,
  isDarkTheme = true,
  children,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dims, setDims] = useState<Dims>({ W: 0, H: 0 });

  const updateDims = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setDims({ W: Math.round(r.width), H: Math.round(r.height) });
  }, []);

  useEffect(() => {
    updateDims();
    const ro = new ResizeObserver(updateDims);
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, [updateDims]);

  const { W, H } = dims;

  // ─── Hover state ─────────────────────────────────────────────────────────
  const [hoveredTabId, setHoveredTabId] = useState<string | null>(null);

  // ─── Content transition (fade on active tab change) ───────────────────────
  const [isContentFading, setIsContentFading] = useState(false);
  const prevActiveTabIdRef = useRef(activeTabId);
  useEffect(() => {
    if (prevActiveTabIdRef.current !== activeTabId) {
      prevActiveTabIdRef.current = activeTabId;
      setIsContentFading(true);
      const t = setTimeout(() => setIsContentFading(false), 120);
      return () => clearTimeout(t);
    }
  }, [activeTabId]);

  // ─── Drag state ───────────────────────────────────────────────────────────
  // dragRef holds mutable drag data (no re-renders on every mouse move).
  // dragVersion increments when visual state should update.
  const dragRef = useRef<ActiveDrag | null>(null);
  const [dragVersion, setDragVersion] = useState(0);

  // ─── Snap-back state ──────────────────────────────────────────────────────
  // After the user releases a dragged tab, snapBack drives the CSS transition
  // that animates the floating card from its current visual position back into
  // the merged tab-bar slot.  Two phases:
  //   animating = false → card is still at fromX (no transition yet)
  //   animating = true  → CSS transition carries the card to toX
  const [snapBack, setSnapBack] = useState<SnapBack | null>(null);
  const snapTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ─── Ordered tabs (normal or preview during drag) ─────────────────────────
  const activeDrag = dragRef.current;

  const orderedTabs = useMemo(() => {
    if (!activeDrag?.dragStarted) return tabs;
    const ordered = activeDrag.previewTabIds
      .map(id => tabs.find(t => t.tabId === id))
      .filter(Boolean) as TabBarTab[];
    // Include any tabs not in previewTabIds (safety net)
    return ordered.length === tabs.length ? ordered : tabs;
  }, [tabs, activeDrag?.previewTabIds, activeDrag?.dragStarted, dragVersion]); // eslint-disable-line react-hooks/exhaustive-deps

  const slots  = useMemo(() => computeTabSlots(orderedTabs, W), [orderedTabs, W]);

  // While a tab is floating (dragging or snapping back) it is excluded from
  // the main SVG path — the floating card div fills its visual role instead.
  // This produces the "detached" effect: the tab visually lifts off the border.
  const excludeId: string | undefined =
    activeDrag?.dragStarted   ? activeDrag.draggingTabId
    : snapBack                ? snapBack.tabId
    : undefined;

  const pathD = useMemo(
    () => buildBorderPath(W, H, slots, excludeId),
    [W, H, slots, excludeId, dragVersion] // eslint-disable-line react-hooks/exhaustive-deps
  );

  const canClose = tabs.length > 1;

  const stroke        = isDarkTheme ? '#111a30' : '#e5e7eb';
  const inactiveColor = isDarkTheme ? '#111a30' : '#e5e7eb';

  // + button left edge: right after the last tab's valley end, or at firstX if no tabs
  const plusX   = slots.length > 0
    ? slots[slots.length - 1].endX + VALLEY_R + PLUS_GAP
    : CARD_R + VALLEY_R + 4;
  const plusTop = Math.round((TAB_H - PLUS_W) / 2);

  // ─── Hover gradient values ────────────────────────────────────────────────
  const [hr, hg, hb] = HOVER.TAB_HOVER_COLOR;
  const hoverGradient = `linear-gradient(to bottom, rgba(${hr},${hg},${hb},${HOVER.TAB_HOVER_INTENSITY}) 0%, rgba(${hr},${hg},${hb},0) ${HOVER.TAB_HOVER_STOP}%)`;

  // ─── Drag pointer handlers ────────────────────────────────────────────────

  function handleTabPointerDown(
    e: React.PointerEvent<HTMLButtonElement>,
    tabId: string,
    tabIndex: number
  ) {
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    e.currentTarget.setPointerCapture(e.pointerId);
    setHoveredTabId(null);
    dragRef.current = {
      draggingTabId: tabId,
      fromIndex:     tabIndex,
      startPointerX: e.clientX,
      deltaX:        0,
      previewTabIds: tabs.map(t => t.tabId),
      dragStarted:   false,
    };
  }

  function handleTabPointerMove(e: React.PointerEvent<HTMLButtonElement>) {
    const drag = dragRef.current;
    if (!drag) return;

    const rawDelta = e.clientX - drag.startPointerX;

    // Threshold: 5px before recognizing as drag (prevents accidental drags on clicks)
    if (!drag.dragStarted) {
      if (Math.abs(rawDelta) < 5) return;
      drag.dragStarted = true;
    }

    // Compute preview tab order ─────────────────────────────────────────────
    const currentPreview = [...drag.previewTabIds];
    const currentDragIdx = currentPreview.indexOf(drag.draggingTabId);
    if (currentDragIdx < 0) {
      setDragVersion(v => v + 1);
      return;
    }

    // Get current slot positions for the preview order
    const previewOrderedTabs = currentPreview
      .map(id => tabs.find(t => t.tabId === id))
      .filter(Boolean) as TabBarTab[];
    const currentSlots = computeTabSlots(previewOrderedTabs, W);
    if (currentSlots.length !== currentPreview.length || currentDragIdx >= currentSlots.length) {
      setDragVersion(v => v + 1);
      return;
    }

    const dragSlot  = currentSlots[currentDragIdx];
    const dragSlotW = dragSlot.endX - dragSlot.startX;

    // Left boundary: tab body cannot pass the first slot's left edge.
    // Right boundary: tab body cannot pass the last slot's right edge.
    const MIN_SLOT_X  = CARD_R + VALLEY_R + FIRST_TAB_OFFSET;
    const lastSlot    = currentSlots[currentSlots.length - 1];
    const MAX_SLOT_X  = lastSlot.endX - dragSlotW;
    const minDelta    = MIN_SLOT_X - dragSlot.startX;
    const maxDelta    = MAX_SLOT_X - dragSlot.startX;
    drag.deltaX       = Math.min(maxDelta, Math.max(minDelta, rawDelta));

    // ── 50% overlap threshold (edge-based, same as Chrome/Arc) ──────────────
    // Drag RIGHT: right edge of dragging tab crosses the midpoint of right neighbor.
    // Drag LEFT:  left  edge of dragging tab crosses the midpoint of left  neighbor.
    // This triggers ~40% earlier than center-vs-center and feels much more natural.
    const dragLeftEdge  = dragSlot.startX + drag.deltaX;
    const dragRightEdge = dragSlot.startX + dragSlotW + drag.deltaX;

    let newIdx = currentDragIdx;

    // Check swap left
    if (currentDragIdx > 0) {
      const leftSlot   = currentSlots[currentDragIdx - 1];
      const leftMid    = leftSlot.startX + (leftSlot.endX - leftSlot.startX) * 0.5;
      if (dragLeftEdge < leftMid) newIdx = currentDragIdx - 1;
    }

    // Check swap right
    if (newIdx === currentDragIdx && currentDragIdx < currentPreview.length - 1) {
      const rightSlot  = currentSlots[currentDragIdx + 1];
      const rightMid   = rightSlot.startX + (rightSlot.endX - rightSlot.startX) * 0.5;
      if (dragRightEdge > rightMid) newIdx = currentDragIdx + 1;
    }

    if (newIdx !== currentDragIdx) {
      // Record dragging tab's current logical startX before re-ordering
      const oldStartX  = currentSlots[currentDragIdx].startX;

      const newPreview = [...currentPreview];
      newPreview.splice(currentDragIdx, 1);
      newPreview.splice(newIdx, 0, drag.draggingTabId);
      drag.previewTabIds = newPreview;

      // Compute the dragging tab's NEW logical startX after the swap
      const newPreviewTabs = newPreview
        .map(id => tabs.find(t => t.tabId === id))
        .filter(Boolean) as TabBarTab[];
      const newSlots   = computeTabSlots(newPreviewTabs, W);
      const newStartX  = newSlots[newIdx]?.startX ?? oldStartX;

      // Adjust deltaX so the VISUAL position stays perfectly continuous
      // (no "teleport" jump on swap):  newStartX + newDelta = oldStartX + oldDelta
      drag.deltaX += oldStartX - newStartX;

      // Re-clamp with new boundaries after slot change
      const newDragSlot   = newSlots[newIdx];
      const newDragSlotW  = newDragSlot ? newDragSlot.endX - newDragSlot.startX : dragSlotW;
      const newLastSlot   = newSlots[newSlots.length - 1];
      const newMinDelta   = MIN_SLOT_X - (newDragSlot?.startX ?? dragSlot.startX);
      const newMaxDelta   = (newLastSlot?.endX ?? lastSlot.endX) - newDragSlotW - (newDragSlot?.startX ?? dragSlot.startX);
      drag.deltaX         = Math.min(newMaxDelta, Math.max(newMinDelta, drag.deltaX));
    }

    setDragVersion(v => v + 1);
  }

  function handleTabPointerUp(
    e: React.PointerEvent<HTMLButtonElement>,
    tabId: string
  ) {
    const drag = dragRef.current;
    dragRef.current = null;
    if (!drag) { setDragVersion(v => v + 1); return; }

    if (!drag.dragStarted) {
      // No drag happened — treat as a click
      setDragVersion(v => v + 1);
      onTabClick(tabId);
      return;
    }

    // ── Snap-back animation ─────────────────────────────────────────────────
    // Compute the final destination slot so we can animate the floating card
    // from its current visual position back to the merged slot.
    const newIndex = drag.previewTabIds.indexOf(drag.draggingTabId);
    const newOrderedTabs = drag.previewTabIds
      .map(id => tabs.find(t => t.tabId === id))
      .filter(Boolean) as TabBarTab[];
    const newSlots  = computeTabSlots(newOrderedTabs, W);
    const destSlot  = newSlots[newIndex];

    if (destSlot) {
      const fromX = destSlot.startX + drag.deltaX;
      const toX   = destSlot.startX;

      // Phase 1 — place floating card at current visual position (no transition)
      setSnapBack({ tabId, fromX, toX, slotW: destSlot.endX - destSlot.startX, animating: false });

      // Phase 2 — on next frame, set animating=true to trigger CSS transition
      requestAnimationFrame(() => {
        setSnapBack(s => s ? { ...s, animating: true } : null);
      });

      // Phase 3 — after animation completes, clear snap state → tab merges back
      if (snapTimerRef.current) clearTimeout(snapTimerRef.current);
      snapTimerRef.current = setTimeout(() => {
        setSnapBack(null);
        setDragVersion(v => v + 1);
      }, 230);
    }

    setDragVersion(v => v + 1);

    if (newIndex !== drag.fromIndex && onReorderTab) {
      onReorderTab(drag.fromIndex, newIndex);
    }
  }

  return (
    <div
      ref={containerRef}
      className="relative w-full"
      style={{ flex: '1 1 0', minHeight: 0 }}
    >
      {/* ── SVG border ──────────────────────────────────────────────────────── */}
      {W > 0 && H > 0 && (
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="absolute inset-0 w-full h-full"
          style={{ pointerEvents: 'none', zIndex: 20, overflow: 'visible' }}
          aria-hidden
        >
          <path
            d={pathD}
            fill="none"
            stroke={stroke}
            strokeWidth={1}
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      )}

      {/* ── Tab labels ──────────────────────────────────────────────────────── */}
      {/* When a tab is floating, bump this container's z-index above the card
          content so the shadow is never clipped by inner layers, and set
          overflow:visible so the shadow can extend beyond the TAB_H bounds. */}
      <div
        className="absolute top-0 left-0 right-0"
        style={{
          height:   TAB_H,
          zIndex:   (activeDrag?.dragStarted || snapBack) ? 50 : 22,
          overflow: 'visible',
          pointerEvents: 'none',
        }}
      >
        <style>{`
          .sp-tab { pointer-events: auto; }
          .sp-tab.sp-has-close .sp-x { opacity: 0; transition: opacity 0.18s ease; }
          .sp-tab.sp-has-close:hover .sp-x { opacity: 1; }
          .sp-tab.sp-has-close:hover .sp-label {
            -webkit-mask-image: linear-gradient(to right, black 50%, transparent 88%);
            mask-image: linear-gradient(to right, black 50%, transparent 88%);
          }
          .sp-x:hover { background: rgba(255,255,255,0.12) !important; }
          .sp-dragging { touch-action: none; }
        `}</style>

        {slots.map(({ startX, endX, tab }, slotIndex) => {
          const isActive   = tab.tabId === activeTabId;
          const isDragging = activeDrag?.dragStarted === true && activeDrag.draggingTabId === tab.tabId;
          const isSnapping = snapBack?.tabId === tab.tabId;
          const isFloating = isDragging || isSnapping;
          const slotW      = endX - startX;

          // ── Visual left position ─────────────────────────────────────────
          // Dragging: follow the pointer via deltaX.
          // Snapping:  phase "animating=false" stays at fromX; once
          //            animating=true the CSS transition carries it to toX.
          // Resting:   logical slot startX (other tabs animate via CSS).
          const visualLeft = isDragging
            ? startX + (activeDrag?.deltaX ?? 0)
            : isSnapping
              ? (snapBack!.animating ? snapBack!.toX : snapBack!.fromX)
              : startX;

          // ── CSS left transition ─────────────────────────────────────────
          // No transition while actively dragging (must follow pointer instantly).
          // Smooth ease during snap-back animation.
          // Normal 150ms ease for idle tabs (they slide on order change).
          // Both `left` and `transform` are animated during snap-back so the
          // card slides into position AND descends into the border simultaneously.
          const leftTransition = isDragging
            ? 'none'
            : isSnapping
              ? (snapBack!.animating
                  ? 'left 0.18s cubic-bezier(0.4, 0, 0.2, 1), transform 0.18s cubic-bezier(0.4, 0, 0.2, 1)'
                  : 'none')
              : 'left 0.15s ease';

          // ── Floating card visual style ──────────────────────────────────
          // When floating (dragging or snapping), the button is rendered as
          // a fully-rounded card lifted above the SVG border.  When resting,
          // it is transparent so the SVG path provides all visual shape.
          const floatingCardBg = isDarkTheme ? DRAG.TAB_BG_DARK : DRAG.TAB_BG_LIGHT;
          // During drag: card floats up by TAB_FLOAT_GAP.
          // During snap → animating: card descends back to 0 (CSS transition).
          // At rest: no transform.
          const floatTranslateY =
            isDragging             ? -TAB_FLOAT_GAP
            : (isSnapping && !snapBack!.animating) ? -TAB_FLOAT_GAP
            : 0;

          const floatingStyle: React.CSSProperties = isFloating
            ? {
                background:   floatingCardBg,
                borderRadius: `${TAB_TOP_R}px`,
                boxShadow:    DRAG.TAB_SHADOW,
                border:       `1px solid ${stroke}`,
                transform:    `translateY(${floatTranslateY}px)`,
              }
            : {
                background: 'transparent',
                border:     'none',
              };

          // ── Label color ─────────────────────────────────────────────────
          // Active tab: orange. Floating tabs: use the INACTIVE_COLOR so the
          // label is legible on the elevated card background. Resting inactive
          // tabs blend into the card via inactiveColor (matches card bg).
          const labelColor = isActive
            ? LABEL.ACTIVE_COLOR
            : (isFloating ? LABEL.INACTIVE_COLOR : inactiveColor);

          // ── Hover gradient ──────────────────────────────────────────────
          // Show on normal hover OR while the tab is floating.
          const showHover = isFloating || (hoveredTabId === tab.tabId && !activeDrag?.dragStarted);

          // ── Hover gradient border-radius ────────────────────────────────
          // Floating: all 4 corners rounded. Resting: only top 2.
          const hoverBorderRadius = isFloating
            ? `${TAB_TOP_R}px`
            : `${TAB_TOP_R}px ${TAB_TOP_R}px 0 0`;

          return (
            <button
              key={tab.tabId}
              onPointerDown={e => handleTabPointerDown(e, tab.tabId, slotIndex)}
              onPointerMove={handleTabPointerMove}
              onPointerUp={e => handleTabPointerUp(e, tab.tabId)}
              onPointerCancel={e => handleTabPointerUp(e, tab.tabId)}
              onMouseEnter={() => { if (!dragRef.current) setHoveredTabId(tab.tabId); }}
              onMouseLeave={() => setHoveredTabId(null)}
              className={`sp-tab absolute flex items-center justify-center${isActive ? ' active' : ''}${canClose ? ' sp-has-close' : ''}${isDragging ? ' sp-dragging' : ''}`}
              style={{
                left:       visualLeft,
                width:      slotW,
                top:        0,
                height:     TAB_H,
                padding:    '0 12px',
                outline:    'none',
                transition: leftTransition,
                zIndex:     isFloating ? 36 : 22,
                opacity:    1,
                cursor:     isDragging ? 'grabbing' : 'pointer',
                ...floatingStyle,
              }}
            >
              {/* ── Hover gradient overlay ────────────────────────────────── */}
              <span
                aria-hidden
                style={{
                  position:      'absolute',
                  inset:         0,
                  borderRadius:  hoverBorderRadius,
                  background:    hoverGradient,
                  opacity:       showHover ? 1 : 0,
                  transition:    'opacity 0.22s ease',
                  pointerEvents: 'none',
                }}
              />

              {/* ── Icon + text group — centered together ─────────────────── */}
              <span
                className="flex items-center min-w-0 overflow-hidden"
                style={{ gap: LABEL.GAP_PX, position: 'relative', zIndex: 1 }}
              >
                <IconByType icon={tab.icon} color={labelColor} />
                <span
                  className="sp-label leading-none truncate"
                  style={{
                    fontSize:   LABEL.FONT_PX,
                    fontWeight: LABEL.FONT_WEIGHT,
                    color:      labelColor,
                    transition: 'color 0.15s',
                  }}
                >
                  {tab.title}
                </span>
              </span>

              {tab.hasActivity && (
                <span
                  className="w-[7px] h-[7px] rounded-full bg-[#fe6a03] flex-shrink-0 ml-1"
                  style={{ position: 'relative', zIndex: 1 }}
                />
              )}

              {canClose && (
                <span
                  role="button"
                  tabIndex={-1}
                  onPointerDown={e => e.stopPropagation()}
                  onClick={e => { e.stopPropagation(); onCloseTab(tab.tabId); }}
                  className="sp-x absolute right-2 w-[16px] h-[16px] flex items-center justify-center rounded-full cursor-pointer"
                  style={{ top: '50%', transform: 'translateY(-50%)', zIndex: 2 }}
                  aria-label="Fechar aba"
                >
                  <X style={{ width: 9, height: 9 }} className="text-white/60" />
                </span>
              )}
            </button>
          );
        })}

        {/* + Nova aba */}
        <button
          onClick={onNewTab}
          className="absolute flex items-center justify-center rounded-full transition-all duration-150 hover:border-white/30 hover:text-white/60"
          style={{
            left:       plusX,
            top:        plusTop,
            width:      PLUS_W,
            height:     PLUS_W,
            background: 'transparent',
            border:     `1px solid ${isDarkTheme ? 'rgba(255,255,255,0.13)' : 'rgba(0,0,0,0.16)'}`,
            outline:    'none',
            pointerEvents: 'auto',
          }}
          aria-label="Nova conversa"
          title="Nova conversa"
        >
          <Plus
            style={{ width: 12, height: 12 }}
            className={isDarkTheme ? 'text-white/32' : 'text-black/40'}
          />
        </button>
      </div>

      {/* ── Card content area ────────────────────────────────────────────────── */}
      <div
        className="absolute left-0 right-0 bottom-0 overflow-hidden"
        style={{
          top:        TAB_H,
          opacity:    isContentFading ? 0 : 1,
          transition: 'opacity 0.12s ease',
        }}
      >
        {children}
      </div>
    </div>
  );
};

export default SchoolPowerShell;
