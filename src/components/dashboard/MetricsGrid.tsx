import React from "react";
import StudyTimeCard from "./StudyTimeCard";
import SubjectProgressCard from "./SubjectProgressCard";
import UpcomingClassesCard from "./UpcomingClassesCard";
import AIMentorCard from "./AIMentorCard";
import NewsFeedCard from "./NewsFeedCard";

interface MetricsGridProps {
  studyTimeData?: {
    totalHours: number;
    weeklyGoal: number;
    subjects: Array<{
      name: string;
      hours: number;
    }>;
  };
  subjectProgressData?: Array<{
    name: string;
    progress: number;
    color: string;
  }>;
  upcomingClasses?: Array<{
    id: string;
    subject: string;
    teacher: string;
    time: string;
    duration: string;
    isOnline: boolean;
  }>;
}

const MetricsGrid = ({
  studyTimeData: initialStudyTimeData = {
    totalHours: 24,
    weeklyGoal: 30,
    subjects: [
      { name: "Matemática", hours: 8 },
      { name: "Física", hours: 6 },
      { name: "Química", hours: 5 },
      { name: "Biologia", hours: 5 },
    ],
  },
  subjectProgressData,
  upcomingClasses,
}: MetricsGridProps) => {
  const [studyTimeData, setStudyTimeData] =
    React.useState(initialStudyTimeData);

  const handleWeeklyGoalChange = (newGoal: number) => {
    setStudyTimeData((prev) => ({
      ...prev,
      weeklyGoal: newGoal,
    }));
  };
  return (
    <div className="grid grid-cols-12 gap-6 max-w-[1192px] mx-auto">
      {/* First Row */}
      <div className="col-span-12 lg:col-span-6">
        <StudyTimeCard
          totalHours={studyTimeData.totalHours}
          weeklyGoal={studyTimeData.weeklyGoal}
          subjects={studyTimeData.subjects}
          onWeeklyGoalChange={handleWeeklyGoalChange}
        />
      </div>
      <div className="col-span-12 lg:col-span-6">
        <UpcomingClassesCard classes={upcomingClasses} />
      </div>

      {/* Second Row */}
      <div className="col-span-12 lg:col-span-6">
        <SubjectProgressCard subjects={subjectProgressData} />
      </div>
      <div className="col-span-12 lg:col-span-6">
        <AIMentorCard />
      </div>

      {/* Third Row */}
      <div className="col-span-12">
        <NewsFeedCard />
      </div>
    </div>
  );
};

export default MetricsGrid;