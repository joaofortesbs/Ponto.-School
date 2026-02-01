import React, { useState, useEffect } from "react";
import { profileService } from "@/services/profileService";
import { CardDeUso } from "../components/CardDeUso";
import { ExtratoAtividadesCard, ActivityRecord } from "../components/ExtratoAtividadesCard";

interface PowersData {
  totalPowers: number;
  usedPowers: number;
  maxPowers: number;
  dailyRenewable: number;
  planType: string;
}

export const SeuUsoSection: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [powersData, setPowersData] = useState<PowersData | undefined>(undefined);
  const [activityRecords, setActivityRecords] = useState<ActivityRecord[]>([]);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const profile = await profileService.getCurrentUserProfile();
        
        if (profile) {
          const profileData = profile as any;
          
          const usedPowers = profileData.powers_used ?? 0;
          const maxPowers = profileData.powers_max ?? 300;
          
          setPowersData({
            totalPowers: profileData.powers_total ?? 0,
            usedPowers: usedPowers,
            maxPowers: maxPowers,
            dailyRenewable: profileData.daily_renewable ?? 0,
            planType: profile.plan_type === 'premium' ? 'Premium' : 'Grátis',
          });

          if (profileData.activity_records && Array.isArray(profileData.activity_records)) {
            setActivityRecords(profileData.activity_records);
          }
        }
      } catch (error) {
        console.error("Erro ao carregar dados de Powers:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const handleRecordClick = (record: ActivityRecord) => {
    console.log("Atividade clicada:", record);
  };

  return (
    <div className="h-full flex flex-col p-2 gap-4 overflow-y-auto">
      <CardDeUso 
        powersData={powersData}
        isLoading={isLoading}
      />
      
      <ExtratoAtividadesCard 
        records={activityRecords}
        onRecordClick={handleRecordClick}
        isLoading={isLoading}
      />
    </div>
  );
};

export default SeuUsoSection;
