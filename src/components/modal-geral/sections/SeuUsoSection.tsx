import React, { useState, useEffect } from "react";
import { profileService } from "@/services/profileService";
import { CardDeUso } from "../components/CardDeUso";

interface PowersData {
  totalPowers: number;
  usedPowers: number;
  maxPowers: number;
  dailyRenewable: number;
  planType: string;
}

export const SeuUsoSection: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [powersData, setPowersData] = useState<PowersData>({
    totalPowers: 100,
    usedPowers: 100,
    maxPowers: 300,
    dailyRenewable: 0,
    planType: 'Grátis',
  });

  useEffect(() => {
    const loadPowersData = async () => {
      setIsLoading(true);
      try {
        const profile = await profileService.getCurrentUserProfile();
        
        if (profile) {
          const profileData = profile as any;
          
          setPowersData({
            totalPowers: profileData.powers_total || 100,
            usedPowers: profileData.powers_used || 100,
            maxPowers: profileData.powers_max || 300,
            dailyRenewable: profileData.daily_renewable || 0,
            planType: profile.plan_type === 'premium' ? 'Premium' : 'Grátis',
          });
        }
      } catch (error) {
        console.error("Erro ao carregar dados de Powers:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadPowersData();
  }, []);

  return (
    <div className="h-full flex flex-col p-2">
      <CardDeUso 
        powersData={powersData}
        isLoading={isLoading}
      />
    </div>
  );
};

export default SeuUsoSection;
