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

// DB-ONLY v3.1: Cache removido - banco de dados é a única fonte de verdade

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
    
    // DB-ONLY v3.1: Só atualizar se saldo veio do banco
    if (!powersService.isBalanceReady()) {
      console.log('[SeuUsoSection] ⏳ Ignorando update - aguardando DB');
      return;
    }
    
    console.log('[SeuUsoSection] 📡 Recebendo atualização do powersService (DB confirmado):', {
      available: balance.available,
      used: balance.used,
      transactions: balance.transactions.length,
    });
    
    const newPowersData = convertBalanceToPowersData(balance, planType);
    const newRecords = convertTransactionsToRecords(balance);
    
    setPowersData(newPowersData);
    setActivityRecords(newRecords);
    
    console.log('[SeuUsoSection] ✅ UI atualizada com dados do banco');
  }, [planType]);

  useEffect(() => {
    isMountedRef.current = true;

    const loadData = async () => {
      if (hasLoadedRef.current) {
        return;
      }

      try {
        console.log('[SeuUsoSection] 🔄 Carregando dados do banco de dados...');
        
        const [profile] = await Promise.all([
          profileService.getCurrentUserProfile(),
          powersService.initialize(),
        ]);
        
        if (!isMountedRef.current) return;

        // DB-ONLY v3.1: Forçar refresh do banco se temos email
        if (profile?.email) {
          await powersService.forceRefreshFromDatabase(profile.email);
        } else {
          await powersService.syncWithDatabase();
        }
        
        const updatedBalance = powersService.getBalance();
        const userPlanType = profile?.plan_type === 'premium' ? 'Premium' : 'Grátis';
        setPlanType(userPlanType);

        // DB-ONLY v3.1: Só mostrar dados se vieram do banco
        if (powersService.isBalanceReady()) {
          const newPowersData = convertBalanceToPowersData(updatedBalance, userPlanType);
          const newRecords = convertTransactionsToRecords(updatedBalance);

          setPowersData(newPowersData);
          setActivityRecords(newRecords);

          console.log('[SeuUsoSection] ✅ Dados carregados do banco (confirmado):', {
            available: updatedBalance.available,
            used: updatedBalance.used,
            transactions: updatedBalance.transactions.length,
          });
        } else {
          console.log('[SeuUsoSection] ⏳ Aguardando resposta do banco...');
          // Não setar powersData - deixar undefined para mostrar loading
        }

      } catch (error) {
        console.error("[SeuUsoSection] ❌ Erro ao carregar dados de Powers:", error);
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
