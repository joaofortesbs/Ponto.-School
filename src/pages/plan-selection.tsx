import React from "react";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { PlanSelection } from "@/components/auth/PlanSelection";

export default function PlanSelectionPage() {
  return (
    <AuthLayout>
      <PlanSelection />
    </AuthLayout>
  );
}
