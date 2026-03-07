import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import { Home, MessageCircle, Zap, Plus, X } from 'lucide-react';
import type { TabBarTab, TabIcon } from './types';

// ─── Geometry constants ──────────────────────────────────────────────────────
const TAB_H      = 42;   // tabs project this many px ABOVE the card body top
const TAB_TOP_R  = 10;   // rounded corner radius at the TOP of each tab
const CARD_R     = 16;   // rounded corner radius of the card body
const VALLEY_R   = 12;   // radius of the concave arcs at each tab/valley junction
const TAB_MIN_W  = 108;  // minimum tab slot width
const TAB_MAX_W  = 180;  // maximum tab slot width
const TAB_GAP    = 8;    // flat valley gap between tab endX and the next arc start
const PLUS_W     = 28;   // size of the + button circle
const PLUS_GAP   = 10;   // gap from the last tab's valley end to the + button

// Between two adjacent tabs: endX → (endX+VALLEY_R) valley end → TAB_GAP flat → (nextStartX-VALLEY_R) arc start → nextStartX
// Total spacing between tab endX and next tab startX = VALLEY_R + TAB_GAP + VALLEY_R = 2*VALLEY_R + TAB_GAP
const SLOT_STEP = 2 * VALLEY_R + TAB_GAP; // 32px

// ─── Types ───────────────────────────────────────────────────────────────────
interface TabSlot {
  startX: number;
  endX: number;
  tab: TabBarTab;
}

interface Dims { W: number; H: number }

// ─── Icon ────────────────────────────────────────────────────────────────────
const IconByType: React.FC<{ icon: TabIcon; isActive: boolean }> = ({ icon, isActive }) => {
  const cls = `w-[14px] h-[14px] flex-shrink-0 transition-colors duration-150 ${
    isActive ? 'text-[#F97316]' : 'text-white/28'
  }`;
  switch (icon) {
    case 'chat':     return <MessageCircle className={cls} />;
    case 'activity': return <Zap className={cls} />;
    default:         return <Home className={cls} />;
  }
};

// ─── Tab width estimation ─────────────────────────────────────────────────────
function measureTabWidth(tab: TabBarTab): number {
  const iconPx  = 14 + 6;   // 14px icon + 6px gap
  const textPx  = Math.ceil(tab.title.length * 7.4);
  const closePx = 16 + 6;   // 16px close btn + 6px gap
  const dotPx   = tab.hasActivity ? 9 : 0;
  const padPx   = 12 + 12;  // 12px each side
  return Math.max(TAB_MIN_W, Math.min(TAB_MAX_W, iconPx + textPx + closePx + dotPx + padPx));
}

// ─── Slot computation ─────────────────────────────────────────────────────────
function computeTabSlots(tabs: TabBarTab[], W: number): TabSlot[] {
  if (W < 80 || tabs.length === 0) return [];

  // First tab starts after: card corner arc (CARD_R) + one valley arc (VALLEY_R) + small breathing room (6px)
  const firstX   = CARD_R + VALLEY_R + 6;
  // Reserve room on the right for: the final valley arc back to card edge + plus button
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
// The path traces the OUTER boundary of the combined card+tabs shape CLOCKWISE,
// starting at (CARD_R, TAB_H) — the top-left corner of the card body.
//
// Top edge goes LEFT → RIGHT with tab "plateaus" erupting upward.
// Each tab transition uses concave quarter-circle arcs (sweep=1, radius=VALLEY_R).
//
function buildBorderPath(W: number, H: number, slots: TabSlot[]): string {
  if (W < 10 || H < 10) return '';

  // Helper to format numbers without unnecessary decimals
  const n = (v: number) => parseFloat(v.toFixed(2));
  const A = (rx: number, ry: number, sf: 0 | 1, x: number, y: number) =>
    `A ${n(rx)},${n(ry)} 0 0 ${sf} ${n(x)},${n(y)} `;

  let d = `M ${n(CARD_R)},${n(TAB_H)} `;
  let curX = CARD_R;

  // ── TOP EDGE: left to right, with tab shape for each slot ──────────────────
  for (const { startX, endX } of slots) {
    // Flat valley section up to the start of this tab's left-side arc
    const arcStart = startX - VALLEY_R;
    if (arcStart > curX) {
      d += `L ${n(arcStart)},${n(TAB_H)} `;
    }

    // ① Valley floor → tab left wall (arc sweeps through upper-left = convex outward)
    //   Center: (startX, TAB_H)  |  From angle 180° → 270° clockwise (sweep=1)
    d += A(VALLEY_R, VALLEY_R, 1, startX, TAB_H - VALLEY_R);

    // ② Tab left wall: straight up
    d += `L ${n(startX)},${n(TAB_TOP_R)} `;

    // ③ Tab top-left rounded corner
    //   Center: (startX + TAB_TOP_R, TAB_TOP_R)  |  180° → 270° cw (sweep=1)
    d += A(TAB_TOP_R, TAB_TOP_R, 1, startX + TAB_TOP_R, 0);

    // ④ Tab top flat section
    d += `L ${n(endX - TAB_TOP_R)},0 `;

    // ⑤ Tab top-right rounded corner
    //   Center: (endX - TAB_TOP_R, TAB_TOP_R)  |  270° → 0° cw (sweep=1)
    d += A(TAB_TOP_R, TAB_TOP_R, 1, endX, TAB_TOP_R);

    // ⑥ Tab right wall: straight down
    d += `L ${n(endX)},${n(TAB_H - VALLEY_R)} `;

    // ⑦ Tab right wall → valley floor (arc sweeps through upper-right = convex outward)
    //   Center: (endX, TAB_H)  |  270° → 0° cw (sweep=1)
    d += A(VALLEY_R, VALLEY_R, 1, endX + VALLEY_R, TAB_H);

    curX = endX + VALLEY_R;
  }

  // ── Right portion of top edge → corners and sides of card ──────────────────

  // Flat section to top-right card corner
  d += `L ${n(W - CARD_R)},${n(TAB_H)} `;

  // Top-right corner  (270° → 0° cw)
  d += A(CARD_R, CARD_R, 1, W, TAB_H + CARD_R);

  // Right edge
  d += `L ${n(W)},${n(H - CARD_R)} `;

  // Bottom-right corner  (0° → 90° cw)
  d += A(CARD_R, CARD_R, 1, W - CARD_R, H);

  // Bottom edge
  d += `L ${n(CARD_R)},${n(H)} `;

  // Bottom-left corner  (90° → 180° cw)
  d += A(CARD_R, CARD_R, 1, 0, H - CARD_R);

  // Left edge
  d += `L 0,${n(TAB_H + CARD_R)} `;

  // Top-left corner  (180° → 270° cw)  — closes path back to starting point
  d += A(CARD_R, CARD_R, 1, CARD_R, TAB_H);

  d += 'Z';
  return d;
}

// ─── Shell component ──────────────────────────────────────────────────────────
interface SchoolPowerShellProps {
  tabs: TabBarTab[];
  activeTabId: string;
  onTabClick: (tabId: string) => void;
  onNewTab: () => void;
  onCloseTab: (tabId: string) => void;
  isDarkTheme?: boolean;
  children: React.ReactNode;
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

  const slots = useMemo(() => computeTabSlots(tabs, W), [tabs, W]);
  const pathD = useMemo(() => buildBorderPath(W, H, slots), [W, H, slots]);

  const strokeColor = isDarkTheme ? 'rgba(255,255,255,0.13)' : 'rgba(0,0,0,0.14)';
  const canClose    = tabs.length > 1;

  // Position of the + button (left edge)
  const plusX = slots.length > 0
    ? slots[slots.length - 1].endX + VALLEY_R + PLUS_GAP
    : CARD_R + VALLEY_R + 6;

  const plusTop = Math.round((TAB_H - PLUS_W) / 2);

  return (
    <div
      ref={containerRef}
      className="relative w-full"
      style={{ flex: '1 1 0', minHeight: 0 }}
    >
      {/* ── SVG border ─────────────────────────────────────────────────────── */}
      {W > 0 && H > 0 && (
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="absolute inset-0 w-full h-full"
          style={{ pointerEvents: 'none', zIndex: 20, overflow: 'visible' }}
        >
          <path
            d={pathD}
            fill="none"
            stroke={strokeColor}
            strokeWidth={1}
          />
        </svg>
      )}

      {/* ── Tab labels ──────────────────────────────────────────────────────── */}
      <div
        className="absolute top-0 left-0 right-0"
        style={{ height: TAB_H, zIndex: 22 }}
      >
        <style>{`
          .sp-shell-tab .sp-close-btn { opacity: 0; transition: opacity 0.12s; }
          .sp-shell-tab:hover .sp-close-btn { opacity: 0.5; }
          .sp-shell-tab.sp-tab-active .sp-close-btn { opacity: 0.45; }
          .sp-shell-tab.sp-tab-active:hover .sp-close-btn { opacity: 0.75; }
          .sp-close-btn:hover { opacity: 1 !important; background: rgba(255,255,255,0.12); border-radius: 50%; }
        `}</style>

        {slots.map(({ startX, endX, tab }) => {
          const isActive = tab.tabId === activeTabId;
          const slotW    = endX - startX;
          const maxTextW = slotW - 14 - 6 - 16 - 6 - 24 - (tab.hasActivity ? 9 : 0);

          return (
            <button
              key={tab.tabId}
              onClick={() => onTabClick(tab.tabId)}
              className={`sp-shell-tab absolute flex items-center gap-1.5 cursor-pointer transition-colors duration-150 ${
                isActive ? 'sp-tab-active' : ''
              }`}
              style={{
                left: startX,
                width: slotW,
                top: 0,
                height: TAB_H,
                padding: '0 12px',
                background: 'transparent',
                border: 'none',
                outline: 'none',
              }}
              title={tab.title}
            >
              <IconByType icon={tab.icon} isActive={isActive} />

              <span
                className={`text-[11.5px] font-medium leading-none truncate transition-colors duration-150 ${
                  isActive ? 'text-white/82' : 'text-white/30'
                }`}
                style={{ maxWidth: maxTextW > 20 ? maxTextW : undefined, flex: '1 1 0', minWidth: 0 }}
              >
                {tab.title}
              </span>

              {tab.hasActivity && (
                <span className="w-[7px] h-[7px] rounded-full bg-[#F97316] flex-shrink-0" />
              )}

              {canClose && (
                <span
                  role="button"
                  tabIndex={-1}
                  onClick={(e) => { e.stopPropagation(); onCloseTab(tab.tabId); }}
                  className="sp-close-btn flex-shrink-0 w-[16px] h-[16px] flex items-center justify-center rounded-full cursor-pointer"
                  aria-label="Fechar aba"
                >
                  <X style={{ width: 9, height: 9 }} className="text-white/55" />
                </span>
              )}
            </button>
          );
        })}

        {/* + New tab button */}
        <button
          onClick={onNewTab}
          className="absolute flex items-center justify-center rounded-full transition-all duration-150 hover:border-white/25 hover:text-white/55"
          style={{
            left: plusX,
            top: plusTop,
            width: PLUS_W,
            height: PLUS_W,
            background: 'transparent',
            border: `1px solid ${isDarkTheme ? 'rgba(255,255,255,0.11)' : 'rgba(0,0,0,0.14)'}`,
            outline: 'none',
          }}
          aria-label="Nova conversa"
          title="Nova conversa"
        >
          <Plus
            style={{ width: 12, height: 12 }}
            className={isDarkTheme ? 'text-white/28' : 'text-black/35'}
          />
        </button>
      </div>

      {/* ── Card content ────────────────────────────────────────────────────── */}
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
