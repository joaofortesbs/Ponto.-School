import React from "react";
import CabecalhoFlutuante from "@/components/layout/cabeçalho-flutuante-ficial-plataforma";
import Sidebar from "@/components/layout/Sidebar";
import WalletCard from "@/components/wallet/WalletCard";

const WalletPage = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = React.useState(false);

  return (
    <div className="flex h-screen bg-[#f7f9fa] dark:bg-[#001427] transition-colors duration-300">
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <CabecalhoFlutuante />
        <main className="flex-1 overflow-y-auto bg-[#f7f9fa] dark:bg-[#001427] transition-colors duration-300 p-6">
          <div className="max-w-[1192px] mx-auto">
            <WalletCard />
          </div>
        </main>
      </div>
    </div>
  );
};

export default WalletPage;
