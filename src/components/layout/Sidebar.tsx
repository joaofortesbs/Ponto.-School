import { cn } from "@/lib/utils";
import { SidebarNav } from "@/components/sidebar/SidebarNav";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, ChevronLeft, ChevronRight, Camera, User } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";

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
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Get greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Bom dia";
    if (hour < 18) return "Boa tarde";
    return "Boa noite";
  };

  const getUserDisplayName = () => {
    if (loading) return "Carregando...";
    if (!profile) return "Usuário";
    return profile.display_name || profile.email?.split('@')[0] || "Usuário";
  };

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setProfile(null);
        return;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        return;
      }

      if (data) {
        const userProfile = {
          ...data,
          level: data.level || 1,
          rank: data.rank || "Aprendiz",
        };
        setProfile(userProfile);
      }
    } catch (err: any) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const uploadAvatar = async (file: File) => {
    try {
      setUploading(true);

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        throw new Error('Por favor, selecione apenas arquivos de imagem');
      }

      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('A imagem deve ter menos de 5MB');
      }

      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/avatar.${fileExt}`;

      // Upload to Supabase storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('profile-images')
        .upload(fileName, file, {
          upsert: true // This will replace the existing file
        });

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('profile-images')
        .getPublicUrl(fileName);

      // Update user profile in database
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id);

      if (updateError) {
        throw updateError;
      }

      // Update local state
      setProfile(prev => prev ? { ...prev, avatar_url: publicUrl } : null);

      toast({
        title: "Sucesso!",
        description: "Foto de perfil atualizada com sucesso"
      });

    } catch (error: any) {
      console.error('Erro ao fazer upload da imagem:', error);
      toast({
        title: "Erro",
        description: error.message || 'Erro ao fazer upload da imagem',
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      uploadAvatar(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  useEffect(() => {
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

  const handleToggleCollapse = () => {
    setSidebarCollapsed(!sidebarCollapsed);
    if (onToggleCollapse) {
      onToggleCollapse();
    }
  };

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12', 
    lg: 'w-24 h-24'
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-6 h-6'
  };

  const size = sidebarCollapsed ? "sm" : "md";

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
        {/* Header Section with Logo and Profile */}
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

        {/* Profile Section */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="relative group">
              <div 
                className={`${sizeClasses[size]} rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center overflow-hidden cursor-pointer relative`}
                onClick={triggerFileInput}
              >
                {profile?.avatar_url ? (
                  <img 
                    src={profile.avatar_url} 
                    alt="Avatar" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className={`${iconSizes[size]} text-white`} />
                )}
                
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  {uploading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                  ) : (
                    <Camera className={`${iconSizes[size]} text-white`} />
                  )}
                </div>
              </div>
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
                disabled={uploading}
              />
            </div>
            {!sidebarCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate text-gray-900 dark:text-white">
                  {getGreeting()}!
                </p>
                <p className="text-xs truncate text-gray-600 dark:text-gray-400">
                  {getUserDisplayName()}
                </p>
              </div>
            )}
          </div>
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
