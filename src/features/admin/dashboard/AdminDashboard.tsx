import React from 'react';
import AdminHeader from './AdminHeader';
import AdminSidebar from './AdminSidebar';
import TemplatesManager from '../templates/TemplatesManager';

interface AdminDashboardProps {
  onLogout: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout }) => {
  return (
    <div className="min-h-screen bg-[#001427] flex">
      <AdminSidebar />
      <div className="flex-1 flex flex-col">
        <AdminHeader onLogout={onLogout} />
        <main className="flex-1 p-6">
          <TemplatesManager />
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;