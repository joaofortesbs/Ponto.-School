import React from "react";
import { Outlet } from "react-router-dom";
import CabecalhoFlutuante from "@/components/layout/cabeçalho-flutuante-ficial-plataforma";
import Sidebar from "@/components/layout/Sidebar";

const Home: React.FC = () => {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#f7f9fa] dark:bg-[#000822]">
      <Sidebar />
      <div className="flex h-full w-full flex-col">
        {/* Header container with padding and max-width - matching Dashboard layout */}
        <div className="w-full bg-[#f7f9fa] dark:bg-[#000822] p-3 sm:p-4 md:p-6" style={{ paddingTop: '16px' }}>
          <div className="w-full max-w-[98%] sm:max-w-[1600px] mx-auto">
            <CabecalhoFlutuante />
          </div>
        </div>
        <main className="flex-1 overflow-y-auto px-4 py-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Home;