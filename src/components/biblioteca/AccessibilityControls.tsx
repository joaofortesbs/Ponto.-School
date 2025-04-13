
import React from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Eye, Moon, Sun, Type, Globe, MousePointerClick, ZapOff } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useAccessibility } from "@/components/AccessibilityProvider";

export function AccessibilityControls() {
  const { 
    fontSize, 
    setFontSize, 
    highContrast, 
    setHighContrast,
    focusMode,
    setFocusMode,
    reduceMotion,
    setReduceMotion,
    screenReaderAnnounce
  } = useAccessibility();

  const handleFontSizeChange = (value: number[]) => {
    const newSize = value[0];
    setFontSize(newSize);
    screenReaderAnnounce(`Tamanho da fonte ajustado para ${newSize}%`);
  };

  const handleHighContrastChange = (checked: boolean) => {
    setHighContrast(checked);
    screenReaderAnnounce(`Modo de alto contraste ${checked ? 'ativado' : 'desativado'}`);
  };

  const handleFocusModeChange = (checked: boolean) => {
    setFocusMode(checked);
    screenReaderAnnounce(`Modo de foco ${checked ? 'ativado' : 'desativado'}`);
  };

  const handleReduceMotionChange = (checked: boolean) => {
    setReduceMotion(checked);
    screenReaderAnnounce(`Redução de movimento ${checked ? 'ativada' : 'desativada'}`);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button 
          variant="outline" 
          size="icon" 
          className="h-8 w-8"
          aria-label="Configurações de acessibilidade"
        >
          <Eye className="h-4 w-4" aria-hidden="true" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 popover-content-modern">
        <div className="space-y-4" role="region" aria-label="Configurações de acessibilidade">
          <h4 className="font-medium" id="accessibility-heading">Acessibilidade</h4>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Type className="h-4 w-4" aria-hidden="true" />
                <Label htmlFor="font-size-slider" className="text-sm">Tamanho da fonte</Label>
              </div>
              <span className="text-sm">{fontSize}%</span>
            </div>
            <Slider
              id="font-size-slider"
              min={75}
              max={200}
              step={5}
              value={[fontSize]}
              onValueChange={handleFontSizeChange}
              aria-valuemin={75}
              aria-valuemax={200}
              aria-valuenow={fontSize}
              aria-labelledby="font-size-label"
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch 
              id="high-contrast" 
              checked={highContrast} 
              onCheckedChange={handleHighContrastChange}
              aria-describedby="high-contrast-description"
            />
            <div className="grid gap-1.5 leading-none">
              <Label htmlFor="high-contrast" className="text-sm font-medium">
                Alto contraste
              </Label>
              <p id="high-contrast-description" className="text-[0.8rem] text-muted-foreground">
                Aumenta o contraste para melhorar a legibilidade
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch 
              id="focus-mode" 
              checked={focusMode} 
              onCheckedChange={handleFocusModeChange}
              aria-describedby="focus-mode-description"
            />
            <div className="grid gap-1.5 leading-none">
              <Label htmlFor="focus-mode" className="text-sm font-medium">
                Modo de foco
              </Label>
              <p id="focus-mode-description" className="text-[0.8rem] text-muted-foreground">
                Reduz distrações visuais durante a leitura
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch 
              id="reduce-motion" 
              checked={reduceMotion} 
              onCheckedChange={handleReduceMotionChange}
              aria-describedby="reduce-motion-description"
            />
            <div className="grid gap-1.5 leading-none">
              <Label htmlFor="reduce-motion" className="text-sm font-medium">
                Reduzir movimento
              </Label>
              <p id="reduce-motion-description" className="text-[0.8rem] text-muted-foreground">
                Minimiza animações e transições
              </p>
            </div>
          </div>
          
          <div className="pt-2 border-t">
            <p className="text-xs text-muted-foreground">
              Para mais opções de acessibilidade, acesse as configurações completas.
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-2 w-full"
              onClick={() => screenReaderAnnounce("Abrindo configurações de acessibilidade completas")}
            >
              Ver todas as opções de acessibilidade
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
