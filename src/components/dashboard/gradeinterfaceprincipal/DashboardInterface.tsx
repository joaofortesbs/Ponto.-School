// DashboardInterface.tsx
import React from "react";
import DashboardMetricsGrid from "./DashboardMetricsGrid";

export default function DashboardInterface() {
  return (
    <div className="w-full space-y-6">
      {/* The greeting header is handled by the Dashboard component */}

      {/* Metrics Grid */}
      <DashboardMetricsGrid />

      {/* You can add more dashboard sections below */}
    </div>
  );
}