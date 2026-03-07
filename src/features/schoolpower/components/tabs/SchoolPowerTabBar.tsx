import React from 'react';
import { Home, MessageCircle, Zap, Plus, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { TabBarTab, TabIcon } from './types';

interface SchoolPowerTabBarProps {
  tabs: TabBarTab[];
  activeTabId: string;
  onTabClick: (tabId: string) => void;
  onNewTab: () => void;
  onCloseTab: (tabId: string) => void;
}

const IconByType: React.FC<{ icon: TabIcon; isActive: boolean }> = ({ icon, isActive }) => {
  const cls = `w-3.5 h-3.5 flex-shrink-0 transition-colors duration-200 ${
    isActive ? 'text-[#F97316]' : 'text-white/35'
  }`;
  switch (icon) {
    case 'chat':     return <MessageCircle className={cls} />;
    case 'activity': return <Zap className={cls} />;
    default:         return <Home className={cls} />;
  }
};

export const SchoolPowerTabBar: React.FC<SchoolPowerTabBarProps> = ({
  tabs,
  activeTabId,
  onTabClick,
  onNewTab,
  onCloseTab,
}) => {
  const canClose = tabs.length > 1;

  return (
    <div
      className="flex items-end gap-[2px] h-[37px] pl-3 pr-2 overflow-x-auto select-none"
      style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
    >
      <style>{`
        .sp-tabbar::-webkit-scrollbar { display: none; }
        .sp-tab-close { opacity: 0; transition: opacity 0.15s; }
        .sp-tab:hover .sp-tab-close { opacity: 1; }
        .sp-tab-active .sp-tab-close { opacity: 0; }
        .sp-tab-active:hover .sp-tab-close { opacity: 1; }
      `}</style>

      <AnimatePresence initial={false}>
        {tabs.map((tab) => {
          const isActive = tab.tabId === activeTabId;

          return (
            <motion.div
              key={tab.tabId}
              initial={{ opacity: 0, width: 0, scaleX: 0.8 }}
              animate={{ opacity: 1, width: 'auto', scaleX: 1 }}
              exit={{ opacity: 0, width: 0, scaleX: 0.8 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
              style={{ transformOrigin: 'left center', overflow: 'hidden' }}
            >
              <div
                onClick={() => onTabClick(tab.tabId)}
                className={`
                  sp-tab group relative flex items-center gap-1.5 px-3 cursor-pointer
                  transition-all duration-200 border border-b-0 rounded-t-[10px]
                  whitespace-nowrap flex-shrink-0
                  ${isActive
                    ? 'sp-tab-active h-[35px] mb-[-1px] z-10 border-gray-200/70 dark:border-white/[0.13] bg-transparent'
                    : 'h-[30px] mb-[2px] z-0 border-transparent hover:border-gray-200/40 dark:hover:border-white/[0.08] bg-transparent hover:bg-white/[0.02]'
                  }
                `}
              >
                <IconByType icon={tab.icon} isActive={isActive} />

                <span className={`text-[11.5px] font-medium transition-colors duration-200 max-w-[128px] truncate ${
                  isActive
                    ? 'text-gray-800 dark:text-white/85'
                    : 'text-gray-400 dark:text-white/35 group-hover:text-white/55'
                }`}>
                  {tab.title}
                </span>

                {tab.hasActivity && (
                  <span className="w-[6px] h-[6px] rounded-full bg-[#F97316] flex-shrink-0 ml-0.5" />
                )}

                {canClose && (
                  <button
                    onClick={(e) => { e.stopPropagation(); onCloseTab(tab.tabId); }}
                    className="sp-tab-close ml-0.5 flex-shrink-0 w-[16px] h-[16px] rounded-full flex items-center justify-center hover:bg-white/[0.12] dark:hover:bg-white/10 transition-colors duration-150"
                    aria-label="Fechar aba"
                    title="Fechar aba"
                  >
                    <X className="w-[10px] h-[10px] text-gray-400 dark:text-white/40" />
                  </button>
                )}

                {isActive && (
                  <>
                    <span
                      className="absolute -bottom-[1px] -left-[8px] w-[8px] h-[8px] pointer-events-none z-20 overflow-hidden"
                      aria-hidden="true"
                    >
                      <span
                        className="absolute bottom-0 right-0 w-[16px] h-[16px] rounded-full"
                        style={{ boxShadow: '4px 4px 0 0 rgba(255,255,255,0.13)' }}
                      />
                    </span>
                    <span
                      className="absolute -bottom-[1px] -right-[8px] w-[8px] h-[8px] pointer-events-none z-20 overflow-hidden"
                      aria-hidden="true"
                    >
                      <span
                        className="absolute bottom-0 left-0 w-[16px] h-[16px] rounded-full"
                        style={{ boxShadow: '-4px 4px 0 0 rgba(255,255,255,0.13)' }}
                      />
                    </span>
                  </>
                )}
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>

      <button
        onClick={onNewTab}
        className="h-[28px] w-[28px] mb-[3px] ml-1 flex-shrink-0 rounded-full flex items-center justify-center border border-gray-200/30 dark:border-white/[0.07] text-gray-400 dark:text-white/25 hover:text-gray-600 dark:hover:text-white/55 hover:border-gray-300/60 dark:hover:border-white/[0.18] hover:bg-gray-100/50 dark:hover:bg-white/[0.05] transition-all duration-200"
        aria-label="Nova conversa"
        title="Nova conversa"
      >
        <Plus className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};

export default SchoolPowerTabBar;
