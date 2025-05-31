
import { cn } from "@/lib/utils";
import { SidebarNav } from "@/components/sidebar/SidebarNav";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, ChevronLeft, ChevronRight, Camera } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export default function Sidebar({
  className,
  isCollapsed = false,
  onToggleCollapse,
  ...props
}: SidebarProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(isCollapsed);
  const [customLogo, setCustomLogo] = useState<string | null>(null);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Load user profile image on component mount
    loadUserProfile();
    
    // Obter a imagem padrão da configuração global ou usar o valor padrão
    const defaultLogo =
      window.PONTO_SCHOOL_CONFIG?.defaultLogo ||
      "/images/ponto-school-logo.png";

    setCustomLogo(defaultLogo);

    const loadAndConfigureLogo = (logoUrl = null) => {
      try {
        if (logoUrl) {
          setCustomLogo(logoUrl);
          return;
        }

        const pontoSchoolLogo = localStorage.getItem("pontoSchoolLogo");
        if (
          pontoSchoolLogo &&
          pontoSchoolLogo !== "null" &&
          pontoSchoolLogo !== "undefined"
        ) {
          setCustomLogo(pontoSchoolLogo);
          if (window.PONTO_SCHOOL_CONFIG) {
            window.PONTO_SCHOOL_CONFIG.logoLoaded = true;
            window.PONTO_SCHOOL_CONFIG.defaultLogo = pontoSchoolLogo;
          }
          return;
        }

        const savedLogo = localStorage.getItem("sidebarCustomLogo");
        if (savedLogo && savedLogo !== "null" && savedLogo !== "undefined") {
          setCustomLogo(savedLogo);
          if (window.PONTO_SCHOOL_CONFIG) {
            window.PONTO_SCHOOL_CONFIG.logoLoaded = true;
          }
        } else {
          setCustomLogo(defaultLogo);
          localStorage.setItem("sidebarCustomLogo", defaultLogo);
          localStorage.setItem("pontoSchoolLogo", defaultLogo);
          localStorage.setItem("logoPreloaded", "true");
        }
      } catch (e) {
        console.warn("Erro ao acessar localStorage no Sidebar", e);
        setCustomLogo(defaultLogo);
      }
    };

    const preloadImg = new Image();
    preloadImg.src = defaultLogo;
    preloadImg.fetchPriority = "high";
    preloadImg.crossOrigin = "anonymous";

    preloadImg.onload = () => {
      console.log("Logo carregada com sucesso no Sidebar");
      loadAndConfigureLogo();
      document.dispatchEvent(
        new CustomEvent("logoLoaded", { detail: defaultLogo }),
      );
    };

    preloadImg.onerror = () => {
      console.error("Erro ao carregar logo no Sidebar, tentando novamente...");

      setTimeout(() => {
        const retryImg = new Image();
        retryImg.src = defaultLogo + "?retry=" + Date.now();
        retryImg.fetchPriority = "high";

        retryImg.onload = () => {
          console.log("Logo carregada com sucesso após retry no Sidebar");
          setCustomLogo(retryImg.src);
          localStorage.setItem("sidebarCustomLogo", retryImg.src);
          localStorage.setItem("pontoSchoolLogo", retryImg.src);
          localStorage.setItem("logoPreloaded", "true");
          document.dispatchEvent(
            new CustomEvent("logoLoaded", { detail: retryImg.src }),
          );
        };

        retryImg.onerror = () => {
          console.error("Falha definitiva ao carregar logo no Sidebar");
          setCustomLogo(null);
          document.dispatchEvent(new CustomEvent("logoLoadFailed"));
        };
      }, 1000);
    };

    if (window.PONTO_SCHOOL_CONFIG?.logoLoaded) {
      loadAndConfigureLogo(window.PONTO_SCHOOL_CONFIG.defaultLogo);
    }

    const handleLogoLoaded = (event) => {
      console.log("Logo loaded event received in Sidebar", event.detail);
      loadAndConfigureLogo(event.detail);
    };

    const handleLogoLoadFailed = () => {
      console.log("Logo load failed event received in Sidebar");
      setCustomLogo(null);
    };

    document.addEventListener("logoLoaded", handleLogoLoaded);
    document.addEventListener("logoLoadFailed", handleLogoLoadFailed);

    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setSidebarCollapsed(true);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      document.removeEventListener("logoLoaded", handleLogoLoaded);
      document.removeEventListener("logoLoadFailed", handleLogoLoadFailed);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const loadUserProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.log("No user found");
        return;
      }

      const { data: profile, error } = await supabase
        .from("profiles")
        .select("avatar_url")
        .eq("id", user.id)
        .single();

      if (error) {
        console.error("Error loading user profile:", error);
        return;
      }

      if (profile?.avatar_url) {
        setProfileImage(profile.avatar_url);
        console.log("Profile image loaded:", profile.avatar_url);
      }
    } catch (error) {
      console.error("Error in loadUserProfile:", error);
    }
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      alert('Por favor, selecione uma imagem válida (JPEG, PNG, GIF ou WebP).');
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      alert('A imagem deve ter no máximo 5MB.');
      return;
    }

    setUploading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        alert('Você precisa estar logado para fazer upload da imagem.');
        return;
      }

      // Create unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Math.random()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      // Upload file to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('profile-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        alert('Erro ao fazer upload da imagem. Tente novamente.');
        return;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('profile-images')
        .getPublicUrl(filePath);

      // Update user profile with new avatar URL
      const { error: updateError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          avatar_url: publicUrl,
          email: user.email,
          updated_at: new Date().toISOString()
        });

      if (updateError) {
        console.error('Database update error:', updateError);
        alert('Erro ao salvar a imagem no perfil. Tente novamente.');
        return;
      }

      // Update local state
      setProfileImage(publicUrl);
      console.log('Profile image uploaded and saved successfully:', publicUrl);
      
      // Clear file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

    } catch (error) {
      console.error('Error uploading profile image:', error);
      alert('Erro inesperado ao fazer upload da imagem.');
    } finally {
      setUploading(false);
    }
  };

  const handleToggleCollapse = () => {
    setSidebarCollapsed(!sidebarCollapsed);
    if (onToggleCollapse) {
      onToggleCollapse();
    }
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-40 md:hidden"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
      >
        {isMobileOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <Menu className="h-6 w-6" />
        )}
      </Button>

      {/* Mobile Sidebar */}
      <div
        className={cn(
          "fixed inset-0 z-30 bg-background/80 backdrop-blur-sm md:hidden",
          isMobileOpen ? "block" : "hidden",
        )}
        onClick={() => setIsMobileOpen(false)}
      />

      <aside
        className={cn(
          "fixed top-0 left-0 z-30 h-full bg-white dark:bg-[#001427]/90 border-r border-gray-200 dark:border-gray-800 transition-all duration-300 ease-in-out md:relative",
          sidebarCollapsed ? "w-[70px]" : "w-[240px]",
          isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
          className,
        )}
        key="sidebar-container"
        {...props}
      >
        {/* Header Section with Logo */}
        <div className="flex h-[72px] items-center justify-between px-4 border-b border-gray-200 dark:border-gray-800 relative">
          <div
            className={cn(
              "flex items-center gap-2 transition-all duration-300",
              sidebarCollapsed ? "opacity-0 w-0" : "opacity-100",
            )}
          >
            {customLogo ? (
              <div className="h-16 flex items-center justify-center w-full">
                <img
                  src={customLogo + "?v=" + Date.now()}
                  alt="Logo Ponto School"
                  className="h-12 w-auto object-contain"
                  loading="eager"
                  fetchpriority="high"
                  onError={(e) => {
                    console.error("Erro ao renderizar logo no Sidebar");
                    e.currentTarget.src = "/images/ponto-school-logo.png?retry=" + Date.now();
                    
                    e.currentTarget.onerror = () => {
                      if (e.currentTarget && e.currentTarget.style) {
                        e.currentTarget.style.display = "none";
                      }
                      setCustomLogo(null);
                      document.dispatchEvent(new CustomEvent("logoLoadFailed"));
                    };
                  }}
                />
              </div>
            ) : (
              <>
                <span className="font-bold text-lg text-[#001427] dark:text-white logo-fallback">
                  Ponto<span className="orange">.</span>
                  <span className="blue">School</span>
                </span>
              </>
            )}
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={handleToggleCollapse}
            className={cn(
              "h-8 w-8 rounded-full bg-[#FF6B00]/10 text-[#FF6B00] hover:bg-[#FF6B00]/20 border-[#FF6B00]/30 transition-all duration-300 absolute shadow-sm hover:shadow-md",
              sidebarCollapsed ? "right-2" : "right-2",
            )}
          >
            {sidebarCollapsed ? (
              <ChevronRight className="h-5 w-5" />
            ) : (
              <ChevronLeft className="h-5 w-5" />
            )}
          </Button>
        </div>

        {/* Profile Image Section */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-800">
          <div className="flex flex-col items-center">
            <div className="relative">
              <div 
                className="w-16 h-16 rounded-full overflow-hidden bg-gradient-to-r from-[#FF6B00] to-[#FF8736] p-0.5 cursor-pointer"
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
                        setProfileImage(null);
                      }}
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center">
                      <div className="w-8 h-8 bg-yellow-300 rounded-full flex items-center justify-center">
                        <div className="w-6 h-6 bg-orange-400 rounded-full"></div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Camera Icon Overlay */}
              <div 
                className="absolute -bottom-1 -right-1 w-6 h-6 bg-[#FF6B00] rounded-full flex items-center justify-center cursor-pointer shadow-lg"
                onClick={() => fileInputRef.current?.click()}
              >
                <Camera className="w-3 h-3 text-white" />
              </div>
            </div>
            
            {uploading && (
              <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                Enviando...
              </div>
            )}
          </div>
          
          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>

        <SidebarNav
          isCollapsed={sidebarCollapsed}
          onToggleCollapse={handleToggleCollapse}
          className="p-2"
        />
      </aside>
    </>
  );
}
