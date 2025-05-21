
import React, { useState } from "react";
import { Target, Clock, BookOpen, FileText, Video, Brain } from "lucide-react";

type ActivityItem = {
  id: string;
  title: string;
  type: "video" | "book" | "exercise" | "other";
  completed: boolean;
  timeEstimate: string;
  deadline?: string;
  isUrgent?: boolean;
  link: string;
};

const FocoDoDiaCard = () => {
  const [activities, setActivities] = useState<ActivityItem[]>([
    {
      id: "1",
      title: "Assistir Aula 5: Teorema de Pitágoras",
      type: "video",
      completed: false,
      timeEstimate: "30 min",
      link: "/biblioteca"
    },
    {
      id: "2",
      title: "Resolver Lista de Exercícios 2",
      type: "exercise",
      completed: false,
      timeEstimate: "45 min",
      deadline: "Hoje às 18:00",
      isUrgent: true,
      link: "/portal"
    },
    {
      id: "3",
      title: "Revisar conceitos básicos de Trigonometria",
      type: "book",
      completed: false,
      timeEstimate: "20 min",
      link: "/biblioteca"
    }
  ]);

  const getIconForType = (type: string) => {
    switch (type) {
      case "video":
        return <Video className="h-4 w-4 text-blue-500" />;
      case "book":
        return <BookOpen className="h-4 w-4 text-green-500" />;
      case "exercise":
        return <FileText className="h-4 w-4 text-amber-500" />;
      default:
        return <Brain className="h-4 w-4 text-purple-500" />;
    }
  };

  const toggleActivity = (id: string) => {
    setActivities(
      activities.map((activity) =>
        activity.id === id
          ? { ...activity, completed: !activity.completed }
          : activity
      )
    );
  };

  const navigateToActivity = (link: string) => {
    window.location.href = link;
  };

  return (
    <div className="group backdrop-blur-md bg-[#001e3a] rounded-xl p-4 border border-white/20 shadow-lg relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:border-[#FF6B00]/30 h-full">
      <div className="absolute inset-0 bg-gradient-to-tr from-[#FF6B00]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      <div className="absolute -right-4 -top-4 w-24 h-24 bg-[#FF6B00]/5 rounded-full blur-xl group-hover:bg-[#FF6B00]/10 transition-all duration-500"></div>
      
      <div className="flex items-center mb-4">
        <Target className="h-6 w-6 text-[#FF6B00] mr-2" />
        <h3 className="text-lg font-semibold text-white">Seu Foco Hoje: <span className="font-bold">Revisão de Trigonometria</span></h3>
      </div>
      
      <div className="space-y-3">
        {activities.map((activity) => (
          <div 
            key={activity.id} 
            className="flex items-start p-2 rounded-lg hover:bg-white/5 transition-colors duration-200 cursor-pointer"
          >
            <div 
              className={`flex-shrink-0 w-5 h-5 rounded-full border-2 ${
                activity.completed 
                  ? "bg-[#FF6B00] border-[#FF6B00]" 
                  : "border-gray-400"
              } mr-3 mt-0.5 cursor-pointer transition-all duration-200`}
              onClick={() => toggleActivity(activity.id)}
            >
              {activity.completed && (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </div>
            
            <div className="flex-grow" onClick={() => navigateToActivity(activity.link)}>
              <div className="flex items-center mb-1">
                {getIconForType(activity.type)}
                <span className={`ml-2 text-sm font-medium ${
                  activity.completed ? "text-gray-400 line-through" : "text-white"
                }`}>
                  {activity.title}
                </span>
              </div>
              
              <div className="flex items-center text-xs text-gray-400">
                <Clock className="h-3 w-3 mr-1" />
                <span className="mr-3">{activity.timeEstimate}</span>
                
                {activity.deadline && (
                  <span className={activity.isUrgent ? "text-red-400" : ""}>
                    {activity.deadline}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-4 pt-3 border-t border-white/10 flex items-center text-xs text-gray-400 italic">
        <Brain className="h-4 w-4 mr-2 text-[#FF6B00]" />
        <p>Concentre-se nos exercícios práticos hoje para fixar o conteúdo.</p>
      </div>
      
      <button className="mt-4 py-1.5 px-3 bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white text-sm font-medium rounded-lg transition-colors duration-200 flex items-center ml-auto">
        Iniciar Foco do Dia
      </button>
    </div>
  );
};

export default FocoDoDiaCard;
