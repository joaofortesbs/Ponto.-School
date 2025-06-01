
import React from "react";

export default function PortalPage() {
  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#001427]">
      <div className="container mx-auto py-6 px-4 max-w-7xl">
        <div className="flex items-center">
          <div className="bg-gradient-to-r from-[#001427] to-[#294D61] p-3 rounded-lg mr-4">
            <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-[#001427] dark:text-white">
              Portal
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
              Seu universo de conhecimento
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
