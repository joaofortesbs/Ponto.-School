import React from "react";

interface LinkProps {
  className?: string;
  children?: React.ReactNode;
}

export default function Link({ className, children }: LinkProps) {
  return <div className={className}>{children}</div>;
}
