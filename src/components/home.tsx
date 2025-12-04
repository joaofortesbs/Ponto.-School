import React, { Suspense } from "react";
import { Outlet } from "react-router-dom";
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";

const Home: React.FC = () => {
  // Componente simplificado
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#f7f9fa] dark:bg-[#001427]">
      <Sidebar />
      <div className="flex h-full w-full flex-col">
        <Header />
        <main className="flex-1 overflow-y-auto px-4 py-4">
          <Suspense fallback={
            <div className="flex items-center justify-center min-h-screen">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
            </div>
          }>
            <Outlet />
          </Suspense>
        </main>
      </div>
    </div>
  );
};

export default Home;