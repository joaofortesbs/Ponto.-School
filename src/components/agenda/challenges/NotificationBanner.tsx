import React, { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Bell, X, ChevronRight } from "lucide-react";

interface NotificationBannerProps {
  message: string;
  type: "info" | "success" | "warning";
  actionText?: string;
  onAction?: () => void;
  onClose: () => void;
}

const NotificationBanner: React.FC<NotificationBannerProps> = ({
  message,
  type,
  actionText,
  onAction,
  onClose,
}) => {
  const getBgColor = () => {
    switch (type) {
      case "success":
        return "bg-gradient-to-r from-green-500 to-green-600";
      case "warning":
        return "bg-gradient-to-r from-amber-500 to-amber-600";
      default:
        return "bg-gradient-to-r from-[#FF6B00] to-[#FF8C40]";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`${getBgColor()} rounded-lg shadow-md p-3 flex items-center justify-between mb-6`}
    >
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
          <Bell className="h-4 w-4 text-white" />
        </div>
        <span className="text-sm text-white font-medium">{message}</span>
      </div>
      <div className="flex items-center gap-2">
        {actionText && onAction && (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 text-white hover:bg-white/20 text-xs"
            onClick={onAction}
          >
            {actionText} <ChevronRight className="h-3 w-3 ml-1" />
          </Button>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 rounded-full text-white/80 hover:text-white hover:bg-white/20"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </motion.div>
  );
};

export default NotificationBanner;
