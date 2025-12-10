import React, { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { GraduationCap, Briefcase } from "lucide-react";

interface CardPerfilMenuLateralProps {
  isCollapsed: boolean;
  userProfile: any;
  profileImage: string | null;
  firstName: string | null;
  userName: string;
  userAccountType: 'Professor' | 'Aluno' | 'Coordenador' | null;
  isCardFlipped: boolean;
  isUploading: boolean;
  fileInputRef: React.RefObject<HTMLInputElement>;
  onImageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  setIsCardHovered: (value: boolean) => void;
}

export const CardPerfilMenuLateral: React.FC<CardPerfilMenuLateralProps> = ({
  isCollapsed,
  userProfile,
  profileImage,
  firstName,
  userName,
  userAccountType,
  isCardFlipped,
  isUploading,
  fileInputRef,
  onImageChange,
  setIsCardHovered,
}) => {
  return (
    <div
      className={cn(
        "bg-white dark:bg-[#001427] p-4 mb-0 flex flex-col items-center relative group",
        isCollapsed ? "mt-3 px-2" : "mt-4",
      )}
    >
      {/* Card wrapper com bordas arredondadas e flip effect */}
      <div
        className={cn(
          "relative w-full h-auto",
          isCollapsed ? "w-14" : "w-full",
        )}
        style={{ perspective: "1000px" }}
        onMouseEnter={() => setIsCardHovered(true)}
        onMouseLeave={() => setIsCardHovered(false)}
      >
        <div
          className={cn(
            "relative w-full h-auto transition-transform duration-700 transform-style-preserve-3d",
            isCardFlipped ? "rotate-y-180" : "",
          )}
        >
          {/* Front Side */}
          <div
            className={cn(
              "bg-white dark:bg-[#29335C]/20 border border-gray-200 dark:border-[#29335C]/30 backdrop-blur-sm relative backface-hidden",
              isCollapsed ? "w-14 p-2 rounded-xl" : "w-full p-4 rounded-2xl",
            )}
          >
            {/* Ícone de graduação no canto superior esquerdo quando expandido */}
            {!isCollapsed && (
              <div className="absolute top-3 left-3 z-10">
                <div className="w-7 h-7">
                  <div className="w-full h-full rounded-full border-2 border-blue-600 bg-blue-600 bg-opacity-20 flex items-center justify-center">
                    <GraduationCap size={14} className="text-blue-600" />
                  </div>
                </div>
              </div>
            )}

            {/* Profile Image Component - Responsive avatar */}
            <div
              className={cn(
                "relative flex justify-center flex-col items-center",
                isCollapsed ? "mb-1" : "mb-4",
              )}
            >
              <div
                className={cn(
                  "rounded-full overflow-hidden bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 p-0.5 cursor-pointer transition-all duration-300",
                  isCollapsed ? "w-10 h-10" : "w-20 h-20",
                )}
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="w-full h-full rounded-full overflow-hidden bg-white dark:bg-[#001427] flex items-center justify-center">
                  {profileImage ? (
                    <img
                      src={profileImage}
                      alt="Profile"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        console.error("Error loading profile image");
                      }}
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center">
                      <div
                        className={cn(
                          "bg-yellow-300 rounded-full flex items-center justify-center",
                          isCollapsed ? "w-5 h-5" : "w-10 h-10",
                        )}
                      >
                        <span
                          className={cn(
                            "text-black font-bold",
                            isCollapsed ? "text-xs" : "text-lg",
                          )}
                        >
                          {(() => {
                            const neonUser = localStorage.getItem("neon_user");
                            if (neonUser) {
                              try {
                                const userData = JSON.parse(neonUser);
                                const fullName = userData.nome_completo || userData.nome_usuario || userData.email;
                                if (fullName) {
                                  const firstChar = fullName.charAt(0).toUpperCase();
                                  return firstChar;
                                }
                              } catch (error) {
                                console.error("Erro ao buscar iniciais do Neon:", error);
                              }
                            }
                            return firstName ? firstName.charAt(0).toUpperCase() : "U";
                          })()}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Barra de progresso quando colapsado */}
              {isCollapsed && (
                <div className="flex justify-center mt-2">
                  <div
                    className="h-1 bg-[#2563eb] rounded-full opacity-30"
                    style={{ width: "40px" }}
                  >
                    <div
                      className="h-full bg-[#2563eb] rounded-full transition-all duration-300"
                      style={{ width: "65%" }}
                    />
                  </div>
                </div>
              )}

              {/* File input component */}
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={onImageChange}
                className="hidden"
              />
            </div>

            {isUploading && (
              <div className="mb-3 text-xs text-gray-500 dark:text-gray-400">
                Enviando...
              </div>
            )}

            {!isCollapsed && (
              <div className="text-[#001427] dark:text-white text-center w-full">
                <h3 className="font-semibold text-base mb-2 flex items-center justify-center">
                  <span className="mr-1">👋</span> Olá, {userName}
                </h3>
                <div className="flex flex-col items-center mt-1">
                  <p className="text-xs text-[#001427]/70 dark:text-white/70 mb-0.5">
                    Nível {userProfile?.level || 1}
                  </p>
                  <div className="flex justify-center">
                    <div
                      className="h-1.5 bg-[#2563eb] rounded-full opacity-30"
                      style={{ width: "80px" }}
                    >
                      <div
                        className="h-full bg-[#2563eb] rounded-full transition-all duration-300"
                        style={{ width: "65%" }}
                      />
                    </div>
                  </div>
                  <div className="flex justify-center mt-2">
                    <div
                      className={`px-5 py-0.5 border rounded-md flex items-center justify-center ${
                        userAccountType === 'Professor' 
                          ? 'border-[#FF6B00] bg-[#FF6B00] bg-opacity-20' 
                          : userAccountType === 'Coordenador'
                          ? 'border-[#9333EA] bg-[#9333EA] bg-opacity-20'
                          : 'border-[#2563eb] bg-[#2563eb] bg-opacity-20'
                      }`}
                    >
                      <span className={`text-xs font-medium ${
                        userAccountType === 'Professor' 
                          ? 'text-[#FF6B00]' 
                          : userAccountType === 'Coordenador'
                          ? 'text-[#9333EA]'
                          : 'text-[#2563eb]'
                      }`}>
                        {userAccountType || 'ALUNO'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Back Side - Idêntico ao front */}
          <div
            className={cn(
              "bg-white dark:bg-[#29335C]/20 border border-gray-200 dark:border-[#29335C]/30 backdrop-blur-sm relative backface-hidden absolute inset-0 rotate-y-180",
              isCollapsed ? "w-14 p-2 rounded-xl" : "w-full p-4 rounded-2xl",
            )}
          >
            {/* Ícone de Briefcase no canto superior esquerdo quando expandido */}
            {!isCollapsed && (
              <div className="absolute top-3 left-3 z-10">
                <div className="w-7 h-7">
                  <div className="w-full h-full rounded-full border-2 border-orange-500 bg-orange-600 bg-opacity-20 flex items-center justify-center">
                    <Briefcase
                      size={12}
                      className="text-orange-500"
                      strokeWidth={2.5}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Profile Image Component - Responsive avatar */}
            <div
              className={cn(
                "relative flex justify-center flex-col items-center",
                isCollapsed ? "mb-1" : "mb-4",
              )}
            >
              <div
                className={cn(
                  "rounded-full overflow-hidden bg-gradient-to-r from-[#FF6B00] via-[#FF8736] to-[#FFB366] p-0.5 cursor-pointer transition-all duration-300",
                  isCollapsed ? "w-10 h-10" : "w-20 h-20",
                )}
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="w-full h-full rounded-full overflow-hidden bg-white dark:bg-[#001427] flex items-center justify-center">
                  {profileImage ? (
                    <img
                      src={profileImage}
                      alt="Profile"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        console.error("Error loading profile image");
                      }}
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center">
                      <div
                        className={cn(
                          "bg-yellow-300 rounded-full flex items-center justify-center",
                          isCollapsed ? "w-5 h-5" : "w-10 h-10",
                        )}
                      >
                        <span
                          className={cn(
                            "text-black font-bold",
                            isCollapsed ? "text-xs" : "text-lg",
                          )}
                        >
                          {(() => {
                            const neonUser = localStorage.getItem("neon_user");
                            if (neonUser) {
                              try {
                                const userData = JSON.parse(neonUser);
                                const fullName = userData.nome_completo || userData.nome_usuario || userData.email;
                                if (fullName) {
                                  const firstChar = fullName.charAt(0).toUpperCase();
                                  return firstChar;
                                }
                              } catch (error) {
                                console.error("Erro ao buscar iniciais do Neon:", error);
                              }
                            }
                            return firstName ? firstName.charAt(0).toUpperCase() : "U";
                          })()}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Barra de progresso quando colapsado */}
              {isCollapsed && (
                <div className="flex justify-center mt-2">
                  <div
                    className="h-1 bg-[#FF6B00] rounded-full opacity-30"
                    style={{ width: "40px" }}
                  >
                    <div
                      className="h-full bg-[#FF6B00] rounded-full transition-all duration-300"
                      style={{ width: "65%" }}
                    />
                  </div>
                </div>
              )}
            </div>

            {isUploading && (
              <div className="mb-3 text-xs text-gray-500 dark:text-gray-400">
                Enviando...
              </div>
            )}

            {!isCollapsed && (
              <div className="text-[#001427] dark:text-white text-center w-full">
                <h3 className="font-semibold text-base mb-2 flex items-center justify-center">
                  <span className="mr-1">👋</span> Olá, {userName}
                </h3>
                <div className="flex flex-col items-center mt-1">
                  <p className="text-xs text-[#001427]/70 dark:text-white/70 mb-0.5">
                    Nível {userProfile?.level || 1}
                  </p>
                  <div className="flex justify-center">
                    <div
                      className="h-1.5 bg-[#FF6B00] rounded-full opacity-30"
                      style={{ width: "80px" }}
                    >
                      <div
                        className="h-full bg-[#FF6B00] rounded-full transition-all duration-300"
                        style={{ width: "65%" }}
                      />
                    </div>
                  </div>
                  <div className="flex justify-center mt-2">
                    <div
                      className="px-5 py-0.5 border border-[#FF6B00] bg-[#FF6B00] bg-opacity-20 rounded-md flex items-center justify-center"
                    >
                      <span className="text-xs font-medium text-[#FF6B00]">
                        PROFESSOR
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};