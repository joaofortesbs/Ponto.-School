
import React from 'react';
import GroupDetailInterface from './GroupDetailInterface';

interface GroupDetailProps {
  group: any;
  currentUser: any;
  onBack: () => void;
}

export default function GroupDetail({ group, currentUser, onBack }: GroupDetailProps) {
  return (
    <GroupDetailInterface 
      groupId={group.id}
      groupName={group.nome}
      onBack={onBack}
      currentUser={currentUser}
    />
  );
}
