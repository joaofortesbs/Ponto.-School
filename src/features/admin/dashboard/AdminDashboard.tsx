
import React from 'react';
import { User } from '@supabase/supabase-js';
import AdminHeader from './AdminHeader';
import AdminSidebar from './AdminSidebar';
import TemplatesManager from '../templates/TemplatesManager';

interface AdminDashboardProps {
  user: User;
  onLogout: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ user, onLogout }) => {
  return (
    <div className="min-h-screen bg-[#0A1628]">
      <AdminHeader user={user} onLogout={onLogout} />
      
      <div className="flex">
        <AdminSidebar />
        
        <main className="flex-1 p-6 ml-64">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-white mb-2">
                Templates do School Power
              </h1>
              <p className="text-white/60">
                Gerencie e configure os templates de atividades disponíveis na plataforma
              </p>
            </div>
            
            <TemplatesManager />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
