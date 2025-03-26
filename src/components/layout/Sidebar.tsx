import { cn } from "@/lib/utils";
import { SidebarNav } from "@/components/sidebar/SidebarNav";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  Upload,
  Image as ImageIcon,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";

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
  const [isLogoDialogOpen, setIsLogoDialogOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Carregar logo personalizado do localStorage, se existir
    const savedLogo = localStorage.getItem("sidebarCustomLogo");
    if (savedLogo) {
      setCustomLogo(savedLogo);
    }
  }, []);

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setCustomLogo(result);
        localStorage.setItem("sidebarCustomLogo", result);
        setIsLogoDialogOpen(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const resetLogo = () => {
    setCustomLogo(null);
    localStorage.removeItem("sidebarCustomLogo");
    setIsLogoDialogOpen(false);
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
        {...props}
      >
        <div className="flex h-[72px] items-center justify-between px-4 border-b border-gray-200 dark:border-gray-800 relative">
          <Dialog open={isLogoDialogOpen} onOpenChange={setIsLogoDialogOpen}>
            <DialogTrigger asChild>
              <div
                className={cn(
                  "flex items-center gap-2 transition-all duration-300 cursor-pointer group relative",
                  sidebarCollapsed ? "opacity-0 w-0" : "opacity-100",
                )}
              >
                {customLogo ? (
                  <div className="h-16 flex items-center justify-center w-full">
                    <img
                      src={customLogo}
                      alt="Logo personalizado"
                      className="h-16 w-auto object-contain"
                    />
                  </div>
                ) : (
                  <>
                    <img src="/vite.svg" alt="Logo" className="h-8 w-8" />
                    <span className="font-bold text-lg text-[#001427] dark:text-white">
                      Ponto.School
                    </span>
                  </>
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 dark:group-hover:bg-white/5 rounded transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <ImageIcon className="w-4 h-4 text-brand-black/70 dark:text-white/70" />
                </div>
              </div>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Alterar Logo</DialogTitle>
                <DialogDescription>
                  Faça upload de uma imagem para substituir a logo atual.
                </DialogDescription>
              </DialogHeader>
              <div className="flex flex-col items-center justify-center gap-4 py-4">
                {customLogo && (
                  <div className="border rounded-md p-2 w-full max-w-[300px] flex justify-center">
                    <img
                      src={customLogo}
                      alt="Logo atual"
                      className="h-16 object-contain"
                    />
                  </div>
                )}
                <div className="grid w-full max-w-sm items-center gap-1.5">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    ref={fileInputRef}
                    onChange={handleLogoUpload}
                  />
                  <Button
                    type="button"
                    onClick={triggerFileInput}
                    className="w-full"
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Escolher Imagem
                  </Button>
                </div>
              </div>
              <DialogFooter className="sm:justify-between">
                {customLogo && (
                  <Button
                    variant="destructive"
                    type="button"
                    onClick={resetLogo}
                  >
                    Restaurar Logo Original
                  </Button>
                )}
                <DialogClose asChild>
                  <Button type="button" variant="secondary">
                    Fechar
                  </Button>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>
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
        <SidebarNav
          isCollapsed={sidebarCollapsed}
          onToggleCollapse={handleToggleCollapse}
          className="p-2"
        />
      </aside>
    </>
  );
}
