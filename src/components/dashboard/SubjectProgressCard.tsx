import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { BookOpen } from "lucide-react";

interface Subject {
  name: string;
  progress: number;
  color: string;
}

interface SubjectProgressCardProps {
  subjects?: Subject[];
}

const defaultSubjects: Subject[] = [
  { name: "Matemática Avançada", progress: 75, color: "bg-orange-500" },
  { name: "Física Quântica", progress: 60, color: "bg-orange-600" },
  { name: "Química Orgânica", progress: 45, color: "bg-orange-400" },
  { name: "Biologia Molecular", progress: 90, color: "bg-orange-300" },
  { name: "História da Ciência", progress: 30, color: "bg-orange-700" },
];

const SubjectProgressCard = ({
  subjects = defaultSubjects,
}: SubjectProgressCardProps) => {
  return (
    <Card className="w-full h-full bg-white dark:bg-[#0A2540] border border-orange-500/20 dark:border-orange-500/30 shadow-md overflow-hidden">
      <CardHeader className="pb-2 border-b border-gray-100 dark:border-white/10">
        <div className="flex items-center gap-2 justify-start w-full">
          <div className="p-2.5 rounded-full bg-orange-500/10 dark:bg-orange-500/30 shadow-inner shadow-orange-500/10">
            <BookOpen
              className="h-6 w-6 text-orange-500 dark:text-orange-400"
              strokeWidth={1.5}
            />
          </div>
          <CardTitle className="text-xl font-bold text-[#001427] dark:text-white">
            Progresso por matéria
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-6">
          {subjects.map((subject, index) => (
            <div key={index} className="space-y-2 relative group">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-2 h-2 rounded-full ${subject.color}`}
                  ></div>
                  <span className="text-sm font-medium text-gray-700 dark:text-white/90 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                    {subject.name}
                  </span>
                </div>
                <span className="text-sm font-bold text-gray-800 dark:text-white/90 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                  {subject.progress}%
                </span>
              </div>
              <div className="relative">
                <Progress
                  value={subject.progress}
                  className="h-2 bg-gray-100 dark:bg-white/10 rounded-full overflow-hidden"
                  indicatorClassName={`${subject.color} transition-all duration-500 ease-in-out group-hover:shadow-[0_0_8px_rgba(255,255,255,0.5)]`}
                />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-200/30 dark:via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default SubjectProgressCard;
