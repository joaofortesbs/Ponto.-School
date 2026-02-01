import React, { useState, useEffect, useRef } from "react";
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

const CACHE_KEYS = {
  powersData: 'modalGeral_powersData',
  activityRecords: 'modalGeral_activityRecords',
  lastFetch: 'modalGeral_seuUso_lastFetch',
} as const;

const CACHE_DURATION = 5 * 60 * 1000;

const getCachedData = <T,>(key: string): T | null => {
  try {
    const cached = localStorage.getItem(key);
    if (cached) {
      return JSON.parse(cached) as T;
    }
  } catch (error) {
    console.warn(`[SeuUsoSection] Erro ao ler cache ${key}:`, error);
  }
  return null;
};

const setCachedData = <T,>(key: string, data: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.warn(`[SeuUsoSection] Erro ao salvar cache ${key}:`, error);
  }
};

const isCacheValid = (): boolean => {
  try {
    const lastFetch = localStorage.getItem(CACHE_KEYS.lastFetch);
    if (!lastFetch) return false;
    const lastFetchTime = parseInt(lastFetch, 10);
    return Date.now() - lastFetchTime < CACHE_DURATION;
  } catch {
    return false;
  }
};

export const SeuUsoSection: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [powersData, setPowersData] = useState<PowersData | undefined>(undefined);
  const [activityRecords, setActivityRecords] = useState<ActivityRecord[]>([]);
  const hasLoadedRef = useRef(false);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;

    const loadData = async () => {
      if (hasLoadedRef.current) {
        return;
      }

      const cachedPowers = getCachedData<PowersData>(CACHE_KEYS.powersData);
      const cachedRecords = getCachedData<ActivityRecord[]>(CACHE_KEYS.activityRecords);
      const cacheIsValid = isCacheValid();

      if (cachedPowers && cacheIsValid) {
        setPowersData(cachedPowers);
        setActivityRecords(cachedRecords || []);
        setIsLoading(false);
        hasLoadedRef.current = true;
        console.log('[SeuUsoSection] Dados carregados do cache');
        return;
      }

      if (cachedPowers) {
        setPowersData(cachedPowers);
        setActivityRecords(cachedRecords || []);
        setIsLoading(false);
      }

      try {
        const profile = await profileService.getCurrentUserProfile();
        
        if (!isMountedRef.current) return;

        if (profile) {
          const profileData = profile as any;
          
          const usedPowers = profileData.powers_used ?? 0;
          const maxPowers = profileData.powers_max ?? 300;
          
          const newPowersData: PowersData = {
            totalPowers: profileData.powers_total ?? 0,
            usedPowers: usedPowers,
            maxPowers: maxPowers,
            dailyRenewable: profileData.daily_renewable ?? 0,
            planType: profile.plan_type === 'premium' ? 'Premium' : 'Grátis',
          };

          setPowersData(newPowersData);
          setCachedData(CACHE_KEYS.powersData, newPowersData);

          if (profileData.activity_records && Array.isArray(profileData.activity_records)) {
            setActivityRecords(profileData.activity_records);
            setCachedData(CACHE_KEYS.activityRecords, profileData.activity_records);
          }

          localStorage.setItem(CACHE_KEYS.lastFetch, Date.now().toString());
          console.log('[SeuUsoSection] Dados atualizados do servidor e salvos no cache');
        }
      } catch (error) {
        console.error("Erro ao carregar dados de Powers:", error);
      } finally {
        if (isMountedRef.current) {
          setIsLoading(false);
          hasLoadedRef.current = true;
        }
      }
    };

    loadData();

    return () => {
      isMountedRef.current = false;
    };
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
