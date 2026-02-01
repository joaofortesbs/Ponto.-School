import React, { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { MODAL_CONFIG } from "../SidebarModal";

export interface ActivityRecord {
  id: string;
  title: string;
  date: string;
  creditChange: number;
  isTask?: boolean;
  onClick?: () => void;
}

interface ExtratoAtividadesCardProps {
  records?: ActivityRecord[];
  itemsPerPage?: number;
  onRecordClick?: (record: ActivityRecord) => void;
  isLoading?: boolean;
}

const EXTRATO_CONFIG = {
  borderRadius: 24,
  backgroundColor: '#040b2a',
  borderColor: '#0c1a3a',
  headerBg: 'rgba(12, 26, 58, 0.5)',
  hoverBg: 'rgba(12, 26, 58, 0.8)',
  itemsPerPage: 5,
  colors: {
    positive: '#22c55e',
    negative: '#f97316',
    text: {
      primary: '#ffffff',
      secondary: 'rgba(255, 255, 255, 0.6)',
      muted: 'rgba(255, 255, 255, 0.4)',
    },
  },
} as const;

const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateString;
  }
};

const formatCreditChange = (value: number): string => {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value}`;
};

const ExtratoAtividadesCardSkeleton: React.FC = () => {
  return (
    <div 
      className="rounded-3xl overflow-hidden animate-pulse"
      style={{
        backgroundColor: EXTRATO_CONFIG.backgroundColor,
        border: `1px solid ${EXTRATO_CONFIG.borderColor}`,
        borderRadius: `${EXTRATO_CONFIG.borderRadius}px`,
      }}
    >
      <div className="p-5 pb-4">
        <div className="h-6 w-48 bg-gray-700 rounded" />
      </div>
      <div className="px-5">
        <div className="flex items-center py-3 border-b border-gray-700/30">
          <div className="flex-1 h-4 w-20 bg-gray-700 rounded" />
          <div className="w-32 h-4 bg-gray-700 rounded mx-4" />
          <div className="w-24 h-4 bg-gray-700 rounded" />
        </div>
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center py-4 border-b border-gray-700/20">
            <div className="flex-1 h-5 bg-gray-700 rounded" />
            <div className="w-32 h-4 bg-gray-700 rounded mx-4" />
            <div className="w-16 h-5 bg-gray-700 rounded" />
          </div>
        ))}
      </div>
      <div className="p-4 flex justify-center gap-2">
        <div className="h-8 w-8 bg-gray-700 rounded" />
        <div className="h-8 w-8 bg-gray-700 rounded" />
        <div className="h-8 w-8 bg-gray-700 rounded" />
      </div>
    </div>
  );
};

const EmptyState: React.FC = () => {
  return (
    <div className="py-12 text-center">
      <p 
        className="text-base"
        style={{ color: EXTRATO_CONFIG.colors.text.secondary }}
      >
        Nenhuma atividade registrada ainda
      </p>
      <p 
        className="text-sm mt-2"
        style={{ color: EXTRATO_CONFIG.colors.text.muted }}
      >
        Suas atividades aparecerão aqui conforme você usar a plataforma
      </p>
    </div>
  );
};

export const ExtratoAtividadesCard: React.FC<ExtratoAtividadesCardProps> = ({
  records = [],
  itemsPerPage = EXTRATO_CONFIG.itemsPerPage,
  onRecordClick,
  isLoading = false,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);

  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil(records.length / itemsPerPage));
  }, [records.length, itemsPerPage]);

  const paginatedRecords = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return records.slice(startIndex, startIndex + itemsPerPage);
  }, [records, currentPage, itemsPerPage]);

  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(1, prev - 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(totalPages, prev + 1));
  };

  const handlePageClick = (page: number) => {
    setCurrentPage(page);
  };

  const handleRecordClick = (record: ActivityRecord) => {
    if (record.isTask && (record.onClick || onRecordClick)) {
      record.onClick?.();
      onRecordClick?.(record);
    }
  };

  const getPageNumbers = (): number[] => {
    const pages: number[] = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      const startPage = Math.max(1, currentPage - 2);
      const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
      
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
    }
    
    return pages;
  };

  if (isLoading) {
    return <ExtratoAtividadesCardSkeleton />;
  }

  return (
    <div 
      className="rounded-3xl overflow-hidden"
      style={{
        backgroundColor: EXTRATO_CONFIG.backgroundColor,
        border: `1px solid ${EXTRATO_CONFIG.borderColor}`,
        borderRadius: `${EXTRATO_CONFIG.borderRadius}px`,
      }}
    >
      <div className="p-5 pb-4">
        <h2 
          className="text-lg font-semibold"
          style={{ color: EXTRATO_CONFIG.colors.text.primary }}
        >
          Extrato de atividades de uso
        </h2>
      </div>

      <div className="px-5">
        <div 
          className="flex items-center py-3 text-sm font-medium"
          style={{
            borderBottom: `1px solid ${EXTRATO_CONFIG.borderColor}`,
            color: EXTRATO_CONFIG.colors.text.secondary,
          }}
        >
          <div className="flex-1">Detalhes</div>
          <div className="w-36 text-left">Data</div>
          <div className="w-28 text-right">Alteração</div>
        </div>

        {records.length === 0 ? (
          <EmptyState />
        ) : (
          <div>
            {paginatedRecords.map((record) => (
              <div
                key={record.id}
                className="flex items-center py-4 transition-colors duration-150"
                style={{
                  borderBottom: `1px solid rgba(12, 26, 58, 0.3)`,
                  backgroundColor: hoveredRow === record.id ? EXTRATO_CONFIG.hoverBg : 'transparent',
                  cursor: record.isTask ? 'pointer' : 'default',
                }}
                onMouseEnter={() => setHoveredRow(record.id)}
                onMouseLeave={() => setHoveredRow(null)}
                onClick={() => handleRecordClick(record)}
              >
                <div 
                  className="flex-1 pr-4 truncate"
                  style={{ 
                    color: EXTRATO_CONFIG.colors.text.primary,
                    opacity: record.isTask && hoveredRow === record.id ? 0.8 : 1,
                  }}
                >
                  {record.title}
                </div>
                <div 
                  className="w-36 text-sm"
                  style={{ color: EXTRATO_CONFIG.colors.text.secondary }}
                >
                  {formatDate(record.date)}
                </div>
                <div 
                  className="w-28 text-right font-medium"
                  style={{ 
                    color: record.creditChange >= 0 
                      ? EXTRATO_CONFIG.colors.positive 
                      : EXTRATO_CONFIG.colors.negative 
                  }}
                >
                  {formatCreditChange(record.creditChange)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {records.length > 0 && totalPages > 1 && (
        <div 
          className="p-4 flex items-center justify-center gap-1"
          style={{ borderTop: `1px solid ${EXTRATO_CONFIG.borderColor}` }}
        >
          <button
            onClick={handlePrevPage}
            disabled={currentPage === 1}
            className="p-2 rounded-lg transition-colors duration-150 disabled:opacity-30"
            style={{ 
              color: EXTRATO_CONFIG.colors.text.secondary,
            }}
          >
            <ChevronLeft size={18} />
          </button>

          {getPageNumbers().map((page) => (
            <button
              key={page}
              onClick={() => handlePageClick(page)}
              className="w-8 h-8 rounded-lg text-sm font-medium transition-colors duration-150"
              style={{
                backgroundColor: currentPage === page ? 'rgba(255, 107, 0, 0.2)' : 'transparent',
                color: currentPage === page 
                  ? '#FF6B00' 
                  : EXTRATO_CONFIG.colors.text.secondary,
              }}
            >
              {page}
            </button>
          ))}

          <button
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
            className="p-2 rounded-lg transition-colors duration-150 disabled:opacity-30"
            style={{ 
              color: EXTRATO_CONFIG.colors.text.secondary,
            }}
          >
            <ChevronRight size={18} />
          </button>
        </div>
      )}
    </div>
  );
};

export default ExtratoAtividadesCard;
