import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  AlertCircle,
  ArrowRight,
  Calendar,
  Clock,
  FileEdit,
  Filter,
  Users,
} from "lucide-react";
import FlowSummaryCard from "./flow-summary-card";

interface UpcomingEvent {
  id: number;
  type: string;
  title: string;
  day: string;
  discipline: string;
  location?: string;
  isOnline: boolean;
}

interface UpcomingEventsProps {
  events: UpcomingEvent[];
}

export default function UpcomingEvents({ events = [], onEventClick, getEventIcon }) {
  // Verifica se events é um array válido
  if (!Array.isArray(events)) {
    return <div className="p-3 text-sm text-gray-500">Nenhum evento encontrado</div>;
  }

  // Organiza eventos por dia para agrupamento
  const eventsByDay = events.reduce((acc, event) => {
    if (!acc[event.day]) {
      acc[event.day] = [];
    }
    acc[event.day].push(event);
    return acc;
  }, {});

  return (
    <div className="space-y-4">
      {Object.keys(eventsByDay).length > 0 ? (
        Object.keys(eventsByDay).map((day) => (
          <div key={day} className="space-y-2">
            <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400">
              {day}
            </h4>
            {eventsByDay[day].map((event) => (
              <div
                key={event.id}
                className="flex items-start p-2 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-100 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700/50 cursor-pointer transition-colors duration-150"
                onClick={() => onEventClick(event)}
              >
              </div>
            ))}
          </div>
        ))
      ) : (
        <div className="p-3 text-sm text-gray-500">Nenhum evento encontrado</div>
      )}
    </div>
  );
}