import React from "react";
import { useNavigate } from "react-router-dom";
import PlanSelectionRedesigned from "@/components/auth/PlanSelectionRedesigned";

export default function PlanSelectionRedesignedPage() {
  const navigate = useNavigate();

  const handleSelectPlan = (plan: string) => {
    // Store the selected plan in localStorage or context
    localStorage.setItem("selectedPlan", plan);

    // Navigate to registration page
    navigate("/auth/register");
  };

  return (
    <div className="min-h-screen bg-[#001427] flex items-center justify-center p-4">
      <PlanSelectionRedesigned onSelectPlan={handleSelectPlan} />
    </div>
  );
}
