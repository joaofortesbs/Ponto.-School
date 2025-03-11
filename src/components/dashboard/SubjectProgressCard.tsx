import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface Subject {
  name: string;
  progress: number;
  color: string;
}

interface SubjectProgressCardProps {
  subjects?: Subject[];
}

const defaultSubjects: Subject[] = [
  { name: "Matemática Avançada", progress: 75, color: "bg-[#FF6B00]" },
  { name: "Física Quântica", progress: 60, color: "bg-[#FF6B00]" },
  { name: "Química Orgânica", progress: 45, color: "bg-[#FF6B00]" },
  { name: "Biologia Molecular", progress: 90, color: "bg-[#FF6B00]" },
  { name: "História da Ciência", progress: 30, color: "bg-[#FF6B00]" },
];

const SubjectProgressCard = ({
  subjects = defaultSubjects,
}: SubjectProgressCardProps) => {
  return (
    <Card className="w-full h-full bg-white dark:bg-[#0A2540] border-brand-border dark:border-white/10">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-brand-black dark:text-white">
          Progresso por matéria
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {subjects.map((subject, index) => (
            <div key={index} className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-brand-muted dark:text-white/60">
                  {subject.name}
                </span>
                <span className="text-sm font-medium text-brand-muted dark:text-white/60">
                  {subject.progress}%
                </span>
              </div>
              <Progress
                value={subject.progress}
                className="h-2 dark:bg-white/10"
                indicatorClassName="bg-[#FF6B00]"
              />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default SubjectProgressCard;
