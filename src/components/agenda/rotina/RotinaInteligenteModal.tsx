
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Clock, CalendarDays, Sparkles, Settings, ChevronRight } from "lucide-react";
import RotinaContent from "./RotinaContent";

interface RotinaInteligenteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const RotinaInteligenteModal: React.FC<RotinaInteligenteModalProps> = ({ 
  open, 
  onOpenChange 
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl p-0 border-0 overflow-hidden bg-gradient-to-b from-[#001427] to-[#15253F] rounded-xl shadow-2xl">
        <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none"></div>
        
        <DialogHeader className="bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] py-6 px-8 border-b border-[#FF6B00]/20">
          <div className="flex items-center justify-center relative">
            <div className="absolute left-0">
              <Button 
                variant="ghost" 
                size="icon" 
                className="rounded-full w-9 h-9 bg-white/10 text-white hover:bg-white/20 hover:text-white"
              >
                <Settings className="h-5 w-5" />
              </Button>
            </div>
            
            <DialogTitle className="text-center text-white text-2xl font-bold tracking-tight flex items-center gap-2 bg-clip-text">
              <Clock className="h-6 w-6 text-white/90" />
              <span className="bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
                Rotina Inteligente
              </span>
              <Sparkles className="h-5 w-5 text-yellow-300" />
            </DialogTitle>
            
            <div className="absolute right-0">
              <Button 
                variant="ghost" 
                size="icon" 
                className="rounded-full w-9 h-9 bg-white/10 text-white hover:bg-white/20 hover:text-white"
                onClick={() => onOpenChange(false)}
              >
                <span className="sr-only">Fechar</span>
                <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M11.7816 4.03157C12.0062 3.80702 12.0062 3.44295 11.7816 3.2184C11.5571 2.99385 11.193 2.99385 10.9685 3.2184L7.50005 6.68682L4.03164 3.2184C3.80708 2.99385 3.44301 2.99385 3.21846 3.2184C2.99391 3.44295 2.99391 3.80702 3.21846 4.03157L6.68688 7.49999L3.21846 10.9684C2.99391 11.193 2.99391 11.557 3.21846 11.7816C3.44301 12.0061 3.80708 12.0061 4.03164 11.7816L7.50005 8.31316L10.9685 11.7816C11.193 12.0061 11.5571 12.0061 11.7816 11.7816C12.0062 11.557 12.0062 11.193 11.7816 10.9684L8.31322 7.49999L11.7816 4.03157Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
                </svg>
              </Button>
            </div>
          </div>
        </DialogHeader>
        
        <RotinaContent />
      </DialogContent>
    </Dialog>
  );
};

export default RotinaInteligenteModal;
