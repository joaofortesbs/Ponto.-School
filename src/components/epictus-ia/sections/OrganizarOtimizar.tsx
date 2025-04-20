import React from "react";
import { useTheme } from "@/components/ThemeProvider";
import {
  SectionHeader,
  PendingTasksCard,
  CronogramaEstudosCard,
  TimerPomodoro,
  GerenciadorTarefasCard,
  RastreadorProgressoCard,
  ConstrutorHabitosCard
} from "./components/organizar-otimizar";

export default function OrganizarOtimizar() {
  const { theme } = useTheme();

  return (
    <div className="h-full flex flex-col">
      <SectionHeader />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <CronogramaEstudosCard />
        <TimerPomodoro />
        <GerenciadorTarefasCard />
        <RastreadorProgressoCard />
        <ConstrutorHabitosCard />
      </div>

      <div className="mt-6 flex-1">
        <PendingTasksCard />
      </div>
    </div>
  );
}