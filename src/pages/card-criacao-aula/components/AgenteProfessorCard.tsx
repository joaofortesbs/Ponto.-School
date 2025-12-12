import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { User, Plus, LucideIcon } from 'lucide-react';
import TemplateDropdown, { Template } from './TemplateDropdown';

interface AgenteProfessorCardProps {
  userAvatar?: string | null;
  cardHeight: number;
  cardMaxWidth: number;
  cardTitle: string;
  animationDelay?: number;
  showUserAvatar?: boolean;
  customIcon?: LucideIcon;
  isTemplateCard?: boolean;
  selectedTemplate?: Template | null;
  onSelectTemplate?: (template: Template) => void;
}

const AgenteProfessorCard: React.FC<AgenteProfessorCardProps> = ({
  userAvatar,
  cardHeight,
  cardMaxWidth,
  cardTitle,
  animationDelay = 0.1,
  showUserAvatar = true,
  customIcon: CustomIcon,
  isTemplateCard = false,
  selectedTemplate,
  onSelectTemplate
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleCardClick = () => {
    if (isTemplateCard) {
      setIsDropdownOpen(!isDropdownOpen);
    }
  };

  const handleSelectTemplate = (template: Template) => {
    if (onSelectTemplate) {
      onSelectTemplate(template);
    }
    setIsDropdownOpen(false);
  };

  const displayTitle = isTemplateCard && selectedTemplate ? selectedTemplate.name : cardTitle;
  const TemplateIcon = selectedTemplate?.icon;

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: animationDelay, duration: 0.3 }}
      className="relative w-fit"
      style={{ maxWidth: `${cardMaxWidth}px` }}
    >
      <div 
        className="flex items-center flex-1 relative cursor-pointer hover:shadow-lg transition-all"
        style={{
          height: `${cardHeight}px`,
          width: '100%',
          minWidth: `${cardHeight * 4.3}px`,
          background: isTemplateCard && selectedTemplate
            ? 'linear-gradient(135deg, rgba(255, 107, 0, 0.25) 0%, rgba(255, 107, 0, 0.1) 100%)'
            : 'linear-gradient(135deg, rgba(255, 107, 0, 0.15) 0%, rgba(255, 107, 0, 0.05) 100%)',
          borderRadius: `${cardHeight}px`,
          border: isTemplateCard && selectedTemplate
            ? '1px solid rgba(255, 107, 0, 0.5)'
            : '1px solid rgba(255, 107, 0, 0.3)',
          paddingLeft: `calc(${cardHeight}px + ${cardHeight * 0.29}px)`,
          paddingRight: `${cardHeight * 0.57}px`,
          overflow: 'visible'
        }}
        onClick={handleCardClick}
      >
        <div 
          className="rounded-full overflow-hidden flex items-center justify-center flex-shrink-0 absolute left-0 top-1/2 -translate-y-1/2"
          style={{ 
            width: `${cardHeight}px`,
            height: `${cardHeight}px`,
            background: showUserAvatar && userAvatar 
              ? 'transparent' 
              : isTemplateCard && selectedTemplate
                ? 'linear-gradient(135deg, #FF6B00 0%, #FF8533 100%)'
                : 'linear-gradient(135deg, #FF6B00 0%, #FF8533 100%)',
            border: `${Math.max(2, cardHeight * 0.054)}px solid #FF6B00`,
            boxShadow: isTemplateCard && selectedTemplate
              ? '0 4px 16px rgba(255, 107, 0, 0.5)'
              : '0 4px 12px rgba(255, 107, 0, 0.4)'
          }}
        >
          {showUserAvatar && userAvatar ? (
            <img 
              src={userAvatar} 
              alt="Avatar do Professor"
              className="w-full h-full object-cover"
            />
          ) : isTemplateCard && selectedTemplate && TemplateIcon ? (
            <TemplateIcon 
              style={{ width: `${cardHeight * 0.4}px`, height: `${cardHeight * 0.4}px` }} 
              className="text-white" 
            />
          ) : CustomIcon ? (
            <CustomIcon 
              style={{ width: `${cardHeight * 0.36}px`, height: `${cardHeight * 0.36}px` }} 
              className="text-white" 
            />
          ) : showUserAvatar ? (
            <User 
              style={{ width: `${cardHeight * 0.29}px`, height: `${cardHeight * 0.29}px` }} 
              className="text-white" 
            />
          ) : (
            <Plus 
              style={{ width: `${cardHeight * 0.36}px`, height: `${cardHeight * 0.36}px` }} 
              className="text-white" 
            />
          )}
        </div>

        <span 
          className="text-white font-semibold whitespace-nowrap" 
          style={{ fontSize: `${Math.max(13, cardHeight * 0.25)}px` }}
        >
          {displayTitle}
        </span>
      </div>

      {isTemplateCard && (
        <TemplateDropdown
          isOpen={isDropdownOpen}
          onClose={() => setIsDropdownOpen(false)}
          onSelectTemplate={handleSelectTemplate}
          selectedTemplate={selectedTemplate || null}
          anchorRef={cardRef}
        />
      )}
    </motion.div>
  );
};

export default AgenteProfessorCard;
