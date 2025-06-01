
import React from "react";
import ProfilePage from "@/components/profile/ProfilePage";
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";

const Profile = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = React.useState(false);

  return (
    <div className="flex h-screen bg-[#f7f9fa] dark:bg-[#001427] transition-colors duration-300">
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto bg-[#f7f9fa] dark:bg-[#001427] transition-colors duration-300">
          <ProfilePage isOwnProfile={true} />
        </main>
      </div>
    </div>
  );
};

export default Profile;
