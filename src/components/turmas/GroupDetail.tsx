
import React from "react";
import GroupDetail from "./group-detail";

interface GroupDetailProps {
  group: {
    id: string;
    nome: string;
    descricao: string;
    membros: number;
    tags: string[];
  };
  onBack: () => void;
}

const GroupDetailWrapper: React.FC<GroupDetailProps> = ({ group, onBack }) => {
  return <GroupDetail group={group} onBack={onBack} />;
};

export default GroupDetailWrapper;
