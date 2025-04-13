import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Eye, Moon, Sun, Type, Globe } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export function AccessibilityControls() {
  const [fontSize, setFontSize] = useState(100);
  const [highContrast, setHighContrast] = useState(false);
  const [colorblindMode, setColorblindMode] = useState(false);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="icon" className="h-8 w-8">
          <Eye className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 popover-content-modern">
        <div className="space-y-4">
          <h4 className="font-medium">Acessibilidade</h4>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="font-size">Tamanho da Fonte</Label>
              <span className="text-sm">{fontSize}%</span>
            </div>
            <div className="flex items-center gap-2">
              <Type className="h-4 w-4" />
              <Slider
                id="font-size"
                min={75}
                max={150}
                step={5}
                value={[fontSize]}
                onValueChange={(value) => setFontSize(value[0])}
              />
              <Type className="h-5 w-5" />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Moon className="h-4 w-4" />
              <Label htmlFor="high-contrast">Alto Contraste</Label>
            </div>
            <Switch
              id="high-contrast"
              checked={highContrast}
              onCheckedChange={setHighContrast}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              <Label htmlFor="colorblind">Modo Daltonismo</Label>
            </div>
            <Switch
              id="colorblind"
              checked={colorblindMode}
              onCheckedChange={setColorblindMode}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              <Label>Tradução Automática</Label>
            </div>
            <select className="h-8 rounded-md border border-gray-200 dark:border-gray-700 text-xs px-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
              <option value="pt">Português</option>
              <option value="en">English</option>
              <option value="es">Español</option>
              <option value="fr">Français</option>
            </select>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
