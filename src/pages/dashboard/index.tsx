import React from "react";
import Dashboard from "@/components/dashboard/Dashboard";
// A visualização de métricas foi removida completamente da interface
import DashboardFooter from "@/components/dashboard/DashboardFooter";

export default function DashboardPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-grow">
        <Dashboard />
      </div>
      <DashboardFooter />
    </div>
  );
}
