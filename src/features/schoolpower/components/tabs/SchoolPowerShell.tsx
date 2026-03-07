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

// ─── Destructure for use below ───────────────────────────────────────────────
const { TAB_H, TAB_TOP_R, CARD_R, VALLEY_R, TAB_MIN_W, TAB_MAX_W, TAB_GAP, PLUS_W, PLUS_GAP, FIRST_TAB_OFFSET } = SHAPE;

// horizontal space consumed between tab[i].endX and tab[i+1].startX:
//   right valley arc (VALLEY_R) + flat gap (TAB_GAP) + left valley arc of next tab (VALLEY_R)
const SLOT_STEP = 2 * VALLEY_R + TAB_GAP;   // 48 px

// ─── Types ───────────────────────────────────────────────────────────────────
interface TabSlot { startX: number; endX: number; tab: TabBarTab }
interface Dims    { W: number; H: number }

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
function buildBorderPath(W: number, H: number, slots: TabSlot[]): string {
  if (W < 10 || H < 10) return '';

  const n = (v: number) => +v.toFixed(2);
  // arc helper:  A rx,ry  0  large-arc  sweep  x,y
  const A = (r: number, sf: 0 | 1, x: number, y: number) =>
    `A ${n(r)},${n(r)} 0 0 ${sf} ${n(x)},${n(y)} `;

  let d  = `M ${n(CARD_R)},${n(TAB_H)} `;
  let cx = CARD_R;   // current x position along the top edge

  for (const { startX, endX } of slots) {

    // ① flat valley floor up to the arc entry point
    const arcEntry = startX - VALLEY_R;
    if (arcEntry > cx) d += `L ${n(arcEntry)},${n(TAB_H)} `;

    // ② left "barriguinha" — concave, CCW quarter circle (sweep=0)
    //    Center (startX-VALLEY_R, TAB_H-VALLEY_R), from 90° → 0° ccw
    //    Arc bows toward lower-right (interior) = concave from outside ✓
    d += A(VALLEY_R, 0, startX, TAB_H - VALLEY_R);

    // ③ left wall straight up
    d += `L ${n(startX)},${n(TAB_TOP_R)} `;

    // ④ top-left tab corner, clockwise
    //    Center (startX + TAB_TOP_R, TAB_TOP_R), from 180° → 270° cw
    d += A(TAB_TOP_R, 1, startX + TAB_TOP_R, 0);

    // ⑤ flat top of tab
    d += `L ${n(endX - TAB_TOP_R)},0 `;

    // ⑥ top-right tab corner, clockwise
    //    Center (endX - TAB_TOP_R, TAB_TOP_R), from 270° → 0° cw
    d += A(TAB_TOP_R, 1, endX, TAB_TOP_R);

    // ⑦ right wall straight down
    d += `L ${n(endX)},${n(TAB_H - VALLEY_R)} `;

    // ⑧ right "barriguinha" — concave, CCW quarter circle (sweep=0)
    //    Center (endX+VALLEY_R, TAB_H-VALLEY_R), from 180° → 90° ccw
    //    Arc bows toward lower-left (interior) = concave from outside ✓
    d += A(VALLEY_R, 0, endX + VALLEY_R, TAB_H);

    cx = endX + VALLEY_R;
  }

  // flat to top-right card corner
  d += `L ${n(W - CARD_R)},${n(TAB_H)} `;

  // card body corners + sides (all clockwise, sweep=1)
  d += A(CARD_R, 1, W,          TAB_H + CARD_R);   // TR
  d += `L ${n(W)},${n(H - CARD_R)} `;
  d += A(CARD_R, 1, W - CARD_R, H);                // BR
  d += `L ${n(CARD_R)},${n(H)} `;
  d += A(CARD_R, 1, 0,          H - CARD_R);       // BL
  d += `L 0,${n(TAB_H + CARD_R)} `;
  d += A(CARD_R, 1, CARD_R,     TAB_H);            // TL — back to start

  d += 'Z';
  return d;
}

// ─── Shell component ──────────────────────────────────────────────────────────
interface SchoolPowerShellProps {
  tabs:        TabBarTab[];
  activeTabId: string;
  onTabClick:  (tabId: string) => void;
  onNewTab:    () => void;
  onCloseTab:  (tabId: string) => void;
  isDarkTheme?: boolean;
  children:    React.ReactNode;
}

export const SchoolPowerShell: React.FC<SchoolPowerShellProps> = ({
  tabs,
  activeTabId,
  onTabClick,
  onNewTab,
  onCloseTab,
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

  const slots  = useMemo(() => computeTabSlots(tabs, W), [tabs, W]);
  const pathD  = useMemo(() => buildBorderPath(W, H, slots), [W, H, slots]);
  const canClose = tabs.length > 1;

  const stroke        = isDarkTheme ? '#111a30' : '#e5e7eb';
  const inactiveColor = isDarkTheme ? '#111a30' : '#e5e7eb';

  // + button left edge: right after the last tab's valley end, or at firstX if no tabs
  const plusX   = slots.length > 0
    ? slots[slots.length - 1].endX + VALLEY_R + PLUS_GAP
    : CARD_R + VALLEY_R + 4;
  const plusTop = Math.round((TAB_H - PLUS_W) / 2);

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
      <div
        className="absolute top-0 left-0 right-0"
        style={{ height: TAB_H, zIndex: 22, pointerEvents: 'none' }}
      >
        <style>{`
          .sp-tab { pointer-events: auto; }
          .sp-tab .sp-x { opacity: 0; transition: opacity 0.18s ease; }
          .sp-tab:hover .sp-x { opacity: 1; }
          .sp-tab:hover .sp-label {
            -webkit-mask-image: linear-gradient(to right, black 50%, transparent 88%);
            mask-image: linear-gradient(to right, black 50%, transparent 88%);
          }
          .sp-x:hover { background: rgba(255,255,255,0.12) !important; }
        `}</style>

        {slots.map(({ startX, endX, tab }) => {
          const isActive = tab.tabId === activeTabId;
          const slotW    = endX - startX;

          const labelColor = isActive ? LABEL.ACTIVE_COLOR : inactiveColor;

          return (
            <button
              key={tab.tabId}
              onClick={() => onTabClick(tab.tabId)}
              className={`sp-tab absolute flex items-center justify-center cursor-pointer${isActive ? ' active' : ''}`}
              style={{
                left:       startX,
                width:      slotW,
                top:        0,
                height:     TAB_H,
                padding:    '0 12px',
                background: 'transparent',
                border:     'none',
                outline:    'none',
              }}
            >
              {/* Icon + text group — centered together */}
              <span
                className="flex items-center min-w-0 overflow-hidden"
                style={{ gap: LABEL.GAP_PX }}
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
                <span className="w-[7px] h-[7px] rounded-full bg-[#fe6a03] flex-shrink-0 ml-1" />
              )}

              {canClose && (
                <span
                  role="button"
                  tabIndex={-1}
                  onClick={e => { e.stopPropagation(); onCloseTab(tab.tabId); }}
                  className="sp-x absolute right-2 w-[16px] h-[16px] flex items-center justify-center rounded-full cursor-pointer"
                  style={{ top: '50%', transform: 'translateY(-50%)' }}
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
        style={{ top: TAB_H }}
      >
        {children}
      </div>
    </div>
  );
};

export default SchoolPowerShell;
