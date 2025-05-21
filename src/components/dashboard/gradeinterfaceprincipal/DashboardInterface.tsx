
import React from "react";
import DashboardMetricsGrid from "./DashboardMetricsGrid";
import PlanCard from "../PlanCard";

export default function DashboardInterface() {
  return (
    <div className="w-full space-y-6">
      {/* The greeting header is handled by the Dashboard component */}
      
      {/* Metrics Grid */}
      <DashboardMetricsGrid />
      
      {/* Plan Card Component */}
      <div className="mt-10 flex justify-center">
        <PlanCard />
      </div>
    </div>
  );
}
