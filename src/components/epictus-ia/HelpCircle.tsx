import React from "react";

interface HelpCircleProps {
  className?: string;
  children?: React.ReactNode;
}

export default function HelpCircle({ className, children }: HelpCircleProps) {
  return <div className={className}>{children}</div>;
}
