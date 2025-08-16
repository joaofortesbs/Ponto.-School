
import { useState } from "react";

export const useChatSettings = () => {
  const [aiIntelligenceLevel, setAIIntelligenceLevel] = useState<'basic' | 'normal' | 'advanced'>('normal');
  const [aiLanguageStyle, setAILanguageStyle] = useState<'casual' | 'formal' | 'technical'>('casual');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [enableNotificationSounds, setEnableNotificationSounds] = useState(true);
  const [isShowingAISettings, setIsShowingAISettings] = useState(false);

  return {
    aiIntelligenceLevel,
    setAIIntelligenceLevel,
    aiLanguageStyle,
    setAILanguageStyle,
    soundEnabled,
    setSoundEnabled,
    enableNotificationSounds,
    setEnableNotificationSounds,
    isShowingAISettings,
    setIsShowingAISettings
  };
};
