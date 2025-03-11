import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Clock, BookOpen, Target, Edit2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useStudyGoal } from "./StudyGoalContext";

interface StudyTimeCardProps {
  totalHours?: number;
  weeklyGoal?: number;
  subjects?: Array<{
    name: string;
    hours: number;
  }>;
  onWeeklyGoalChange?: (newGoal: number) => void;
}

const StudyTimeCard = ({
  totalHours = 24,
  weeklyGoal = 30,
  subjects = [
    { name: "Matemática", hours: 8 },
    { name: "Física", hours: 6 },
    { name: "Química", hours: 5 },
    { name: "Biologia", hours: 5 },
  ],
  onWeeklyGoalChange,
}: StudyTimeCardProps) => {
  const { studyGoal, studyProgress, updateStudyGoal } = useStudyGoal();
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [newGoal, setNewGoal] = useState(studyGoal.toString());
  const progress = (studyProgress / studyGoal) * 100;

  // Update the newGoal state when studyGoal changes
  useEffect(() => {
    setNewGoal(studyGoal.toString());
  }, [studyGoal]);

  const handleSaveGoal = () => {
    if (newGoal && parseInt(newGoal) > 0) {
      updateStudyGoal(parseInt(newGoal));
      if (onWeeklyGoalChange) {
        onWeeklyGoalChange(parseInt(newGoal));
      }
      setIsEditingGoal(false);
    }
  };

  return (
    <Card className="w-full h-full bg-white dark:bg-[#0A2540] border-brand-border dark:border-white/10 transition-all duration-300 hover:shadow-lg hover:shadow-brand-primary/10">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-brand-black dark:text-white">
          <Clock className="w-5 h-5 text-brand-primary" />
          Tempo de estudo
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Weekly Progress */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-brand-muted dark:text-white/60">
                Progresso semanal
              </span>
              <span className="text-sm font-medium text-brand-black dark:text-white">
                {studyProgress}/{studyGoal}h
              </span>
            </div>
            <Progress
              value={progress}
              className="h-2 bg-brand-card dark:bg-white/10"
              indicatorClassName="bg-brand-primary"
            />
          </div>

          {/* Study Stats */}
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setIsEditingGoal(true)}
              className="p-4 bg-brand-card dark:bg-white/5 rounded-lg border border-brand-border dark:border-white/10 w-full text-left hover:bg-brand-card/80 dark:hover:bg-white/10 transition-colors group relative"
            >
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-4 h-4 text-brand-primary" />
                <span className="text-sm text-brand-muted dark:text-white/60">
                  Meta semanal
                </span>
                <Edit2 className="w-3 h-3 text-brand-muted dark:text-white/40 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <p className="text-2xl font-semibold text-brand-black dark:text-white">
                {studyGoal}h
              </p>
            </button>

            <Dialog open={isEditingGoal} onOpenChange={setIsEditingGoal}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Editar Meta Semanal</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Input
                      type="number"
                      value={newGoal}
                      onChange={(e) => setNewGoal(e.target.value)}
                      min={1}
                      placeholder="Digite a nova meta em horas"
                    />
                  </div>
                  <Button
                    className="w-full bg-brand-primary hover:bg-brand-primary/90 text-white"
                    onClick={handleSaveGoal}
                  >
                    Salvar Meta
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
            <div className="p-4 bg-brand-card dark:bg-white/5 rounded-lg border border-brand-border dark:border-white/10">
              <div className="flex items-center gap-2 mb-2">
                <BookOpen className="w-4 h-4 text-brand-primary" />
                <span className="text-sm text-brand-muted dark:text-white/60">
                  Total de horas
                </span>
              </div>
              <p className="text-2xl font-semibold text-brand-black dark:text-white">
                {studyProgress}h
              </p>
            </div>
          </div>

          {/* Subject Breakdown */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-brand-black dark:text-white">
              Estudo por matéria
            </h4>
            <div className="space-y-3">
              {subjects.map((subject, index) => (
                <div key={index} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-brand-muted dark:text-white/60">
                      {subject.name}
                    </span>
                    <span className="font-medium text-brand-black dark:text-white">
                      {subject.hours}h
                    </span>
                  </div>
                  <Progress
                    value={(subject.hours / studyGoal) * 100}
                    className="h-1.5 bg-brand-card dark:bg-white/10"
                    indicatorClassName="bg-[#FF6B00]"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StudyTimeCard;
