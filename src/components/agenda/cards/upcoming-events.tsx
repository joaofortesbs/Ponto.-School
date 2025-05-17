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
  events?: UpcomingEvent[];
}

const UpcomingEvents: React.FC<UpcomingEventsProps> = ({ events = [] }) => {
  // Não passamos uma sessão de flow para mostrar o estado para novos usuários
  return <FlowSummaryCard />;
};

export default UpcomingEvents;
