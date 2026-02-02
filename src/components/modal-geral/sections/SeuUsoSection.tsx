import React, { useState, useEffect, useRef, useCallback } from "react";
import { profileService } from "@/services/profileService";
import { powersService, PowersBalance } from "@/services/powersService";
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

const convertBalanceToPowersData = (balance: PowersBalance, planType: string): PowersData => {
  return {
    totalPowers: balance.available,
    usedPowers: balance.used,
    maxPowers: balance.dailyLimit,
    dailyRenewable: balance.dailyLimit - balance.used,
    planType,
  };
};

const convertTransactionsToRecords = (balance: PowersBalance): ActivityRecord[] => {
  return balance.transactions.map(tx => ({
    id: tx.id,
    title: tx.description,
    date: tx.timestamp,
    creditChange: -tx.totalCost,
  }));
};

export const SeuUsoSection: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [powersData, setPowersData] = useState<PowersData | undefined>(undefined);
  const [activityRecords, setActivityRecords] = useState<ActivityRecord[]>([]);
  const [planType, setPlanType] = useState<string>('Grátis');
  const hasLoadedRef = useRef(false);
  const isMountedRef = useRef(true);

  const updateFromPowersService = useCallback((balance: PowersBalance) => {
    if (!isMountedRef.current) return;
    
    console.log('[SeuUsoSection] 📡 Recebendo atualização do powersService:', {
      available: balance.available,
      used: balance.used,
      transactions: balance.transactions.length,
    });
    
    const newPowersData = convertBalanceToPowersData(balance, planType);
    const newRecords = convertTransactionsToRecords(balance);
    
    setPowersData(newPowersData);
    setActivityRecords(newRecords);
    
    setCachedData(CACHE_KEYS.powersData, newPowersData);
    setCachedData(CACHE_KEYS.activityRecords, newRecords);
    
    console.log('[SeuUsoSection] ✅ UI atualizada com novos dados de Powers');
  }, [planType]);

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
        
        await powersService.initialize();
        return;
      }

      if (cachedPowers) {
        setPowersData(cachedPowers);
        setActivityRecords(cachedRecords || []);
        setIsLoading(false);
      }

      try {
        const [profile, balance] = await Promise.all([
          profileService.getCurrentUserProfile(),
          powersService.initialize(),
        ]);
        
        if (!isMountedRef.current) return;

        const userPlanType = profile?.plan_type === 'premium' ? 'Premium' : 'Grátis';
        setPlanType(userPlanType);

        const newPowersData = convertBalanceToPowersData(balance, userPlanType);
        const newRecords = convertTransactionsToRecords(balance);

        setPowersData(newPowersData);
        setActivityRecords(newRecords);

        setCachedData(CACHE_KEYS.powersData, newPowersData);
        setCachedData(CACHE_KEYS.activityRecords, newRecords);
        localStorage.setItem(CACHE_KEYS.lastFetch, Date.now().toString());

        console.log('[SeuUsoSection] Dados carregados do powersService:', {
          available: balance.available,
          used: balance.used,
          transactions: balance.transactions.length,
        });

      } catch (error) {
        console.error("[SeuUsoSection] Erro ao carregar dados de Powers:", error);
      } finally {
        if (isMountedRef.current) {
          setIsLoading(false);
          hasLoadedRef.current = true;
        }
      }
    };

    loadData();

    const unsubscribe = powersService.onUpdate(updateFromPowersService);

    return () => {
      isMountedRef.current = false;
      unsubscribe();
    };
  }, [updateFromPowersService]);

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
