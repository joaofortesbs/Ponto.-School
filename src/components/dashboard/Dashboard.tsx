import React from "react";
import MetricsGrid from "./MetricsGrid";
import TopMetrics from "./TopMetrics";
import PromotionalBanner from "./PromotionalBanner";

export default function Dashboard() {
  return (
    <div className="w-full h-full bg-[#f7f9fa] dark:bg-[#001427] p-6 space-y-6 transition-colors duration-300">
      <PromotionalBanner />
      <TopMetrics />
      <MetricsGrid />
    </div>
  );
}
