// ... other imports ...
import { Search, BrainCircuit, ImageIcon, GraduationCap } from './icons'; // Assuming these icons are defined elsewhere.  Adjust path as needed.
import Button from './Button'; // Assuming this is your custom button component. Adjust path as needed.

// ... other code ...

function TurboAdvancedMode() {
  // ... other code ...

  return (
    // ... other JSX ...
    <div className="flex items-center gap-2 mb-4">
      <div className="flex-1 flex gap-2">
        <Button variant="outline" size="sm" className="text-xs flex items-center gap-1">
          <Search className="h-3.5 w-3.5" /> Buscar
        </Button>
        <Button variant="outline" size="sm" className="text-xs flex items-center gap-1">
          <BrainCircuit className="h-3.5 w-3.5" /> Pensar
        </Button>
        <Button variant="outline" size="sm" className="text-xs flex items-center gap-1">
          <ImageIcon className="h-3.5 w-3.5" /> Gerar Imagem
        </Button>
        <Button variant="outline" size="sm" className="text-xs flex items-center gap-1">
          <GraduationCap className="h-3.5 w-3.5" /> Espaços de Aprendizado
        </Button>
      </div>
    </div>
    // ... other JSX ...
  );
}

// ... rest of the component and other code ...

export default TurboAdvancedMode;