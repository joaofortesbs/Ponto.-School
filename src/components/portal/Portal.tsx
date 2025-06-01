import React from "react";
import WalletCard from "@/components/wallet/WalletCard";

const Portal = () => {
  return (
    <div className="flex-1 overflow-y-auto bg-[#f7f9fa] dark:bg-[#001427] transition-colors duration-300 p-6">
      <div className="max-w-[1192px] mx-auto">
        <WalletCard />
      </div>
    </div>
  );
};

export default Portal;