import React from "react";
import { Outlet } from "react-router-dom";
import CabecalhoFlutuante from "@/components/layout/cabeçalho-flutuante-ficial-plataforma";
import Sidebar from "@/components/layout/Sidebar";

const Home: React.FC = () => {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#f7f9fa] dark:bg-[#001427]">
      <Sidebar />
      <div className="flex h-full w-full flex-col">
        <CabecalhoFlutuante />
        <main className="flex-1 overflow-y-auto px-4 py-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Home;