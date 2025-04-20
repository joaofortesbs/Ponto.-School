
import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/ThemeProvider";
import { 
  Clock, 
  ListTodo, 
  Calendar,
  CheckCircle2
} from "lucide-react";

export default function PendingTasksCard() {
  const { theme } = useTheme();
  
  return (
    <Card className={`p-5 border ${theme === "dark" ? "bg-gray-800/50 border-gray-700" : "bg-gray-50 border-gray-200"}`}>
      <h3 className={`text-lg font-semibold mb-4 ${theme === "dark" ? "text-white" : "text-gray-900"} flex items-center`}>
        <span className="relative">
          Tarefas Pendentes
          <span className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-red-500 to-pink-600"></span>
        </span>
      </h3>
      
      <div className="space-y-3">
        <div className={`p-3 rounded-lg ${theme === "dark" ? "bg-gray-800" : "bg-white"} border ${theme === "dark" ? "border-gray-700" : "border-gray-200"} flex items-center justify-between group hover:border-red-500/50 transition-colors duration-300`}>
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${theme === "dark" ? "bg-gray-700" : "bg-gray-100"} group-hover:bg-red-500/10 transition-colors duration-300`}>
              <Clock className="h-4 w-4 text-red-500" />
            </div>
            <div>
              <p className={`text-sm font-medium ${theme === "dark" ? "text-white" : "text-gray-900"}`}>Entregar trabalho de Biologia</p>
              <p className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>Vence em 2 dias</p>
            </div>
          </div>
          <Button size="sm" variant="ghost" className="h-8 w-8 p-0 rounded-full hover:bg-red-500/10 hover:text-red-500 transition-colors duration-300">
            <CheckCircle2 className={`h-5 w-5 ${theme === "dark" ? "text-gray-400 hover:text-red-400" : "text-gray-500 hover:text-red-500"}`} />
          </Button>
        </div>
        
        <div className={`p-3 rounded-lg ${theme === "dark" ? "bg-gray-800" : "bg-white"} border ${theme === "dark" ? "border-gray-700" : "border-gray-200"} flex items-center justify-between group hover:border-red-500/50 transition-colors duration-300`}>
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${theme === "dark" ? "bg-gray-700" : "bg-gray-100"} group-hover:bg-red-500/10 transition-colors duration-300`}>
              <ListTodo className="h-4 w-4 text-red-500" />
            </div>
            <div>
              <p className={`text-sm font-medium ${theme === "dark" ? "text-white" : "text-gray-900"}`}>Revisar capítulos 5-7 de História</p>
              <p className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>Vence hoje</p>
            </div>
          </div>
          <Button size="sm" variant="ghost" className="h-8 w-8 p-0 rounded-full hover:bg-red-500/10 hover:text-red-500 transition-colors duration-300">
            <CheckCircle2 className={`h-5 w-5 ${theme === "dark" ? "text-gray-400 hover:text-red-400" : "text-gray-500 hover:text-red-500"}`} />
          </Button>
        </div>
        
        <div className={`p-3 rounded-lg ${theme === "dark" ? "bg-gray-800" : "bg-white"} border ${theme === "dark" ? "border-gray-700" : "border-gray-200"} flex items-center justify-between group hover:border-red-500/50 transition-colors duration-300`}>
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${theme === "dark" ? "bg-gray-700" : "bg-gray-100"} group-hover:bg-red-500/10 transition-colors duration-300`}>
              <Calendar className="h-4 w-4 text-red-500" />
            </div>
            <div>
              <p className={`text-sm font-medium ${theme === "dark" ? "text-white" : "text-gray-900"}`}>Preparar para avaliação de Matemática</p>
              <p className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>Vence em 5 dias</p>
            </div>
          </div>
          <Button size="sm" variant="ghost" className="h-8 w-8 p-0 rounded-full hover:bg-red-500/10 hover:text-red-500 transition-colors duration-300">
            <CheckCircle2 className={`h-5 w-5 ${theme === "dark" ? "text-gray-400 hover:text-red-400" : "text-gray-500 hover:text-red-500"}`} />
          </Button>
        </div>
      </div>
      
      <Button variant="outline" className={`mt-4 w-full ${theme === "dark" ? "border-gray-700 hover:bg-gray-700" : "border-gray-200 hover:bg-gray-100"} group`}>
        <span className="relative">
          Ver todas as tarefas
          <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-gradient-to-r from-red-500 to-pink-600 group-hover:w-full transition-all duration-300"></span>
        </span>
      </Button>
    </Card>
  );
}
