
import React from "react";
import GroupDetailHeader from "./GroupDetailHeader";
import GroupTabs from "./GroupTabs";
import ChatSection from "./ChatSection";
import PlaceholderSection from "./PlaceholderSection";

interface GroupDetailProps {
  group: {
    id: string;
    nome: string;
    descricao?: string;
    membros?: number;
    tags?: string[];
  };
  onBack: () => void;
}

export default function GroupDetail({ group, onBack }: GroupDetailProps) {
  const [activeTab, setActiveTab] = React.useState("discussions");

  const renderTabContent = () => {
    switch (activeTab) {
      case "discussions":
        return <ChatSection groupId={group.id} />;
      case "events":
      case "members":
      case "files":
      case "about":
        return <PlaceholderSection tabName={activeTab} />;
      default:
        return <ChatSection groupId={group.id} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#001427] p-4">
      <div className="container mx-auto max-w-7xl">
        <GroupDetailHeader group={group} onBack={onBack} />
        <GroupTabs activeTab={activeTab} onTabChange={setActiveTab} />
        <div className="bg-[#0A2540] rounded-xl border border-white/10 p-6 mt-4">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
}
