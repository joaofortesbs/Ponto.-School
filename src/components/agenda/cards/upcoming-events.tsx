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

const UpcomingEvents: React.FC<UpcomingEventsProps> = ({ events = [] }) => {
  // Sample last flow session data
  const lastFlowSession = {
    date: "Hoje, 10:30",
    duration: "01:45:00",
    subjects: ["Matemática", "Física"],
    progress: 85,
  };

  return <FlowSummaryCard lastSession={lastFlowSession} />;
};

export default UpcomingEvents;
