
import React, { useState, useRef, useEffect } from "react";
import { useTheme } from "@/components/ThemeProvider";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Settings, X, ChevronLeft, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetClose } from "@/components/ui/sheet";

// Dados das mini-seções
const miniSections = [
  {
    id: "resolver-questoes",
    title: "Resolver Questões",
    description: "Resolva exercícios de qualquer disciplina com explicações detalhadas",
    icon: "🧩",
    color: "from-blue-600 to-purple-600",
    hoverColor: "group-hover:from-blue-500 group-hover:to-purple-500"
  },
  {
    id: "criar-resumos",
    title: "Criar Resumos",
    description: "Gere resumos inteligentes de qualquer conteúdo ou matéria",
    icon: "📝",
    color: "from-emerald-600 to-teal-600",
    hoverColor: "group-hover:from-emerald-500 group-hover:to-teal-500"
  },
  {
    id: "explicar-conteudo",
    title: "Explicar Conteúdo",
    description: "Obtenha explicações claras e didáticas sobre qualquer assunto",
    icon: "🔍",
    color: "from-orange-600 to-red-600",
    hoverColor: "group-hover:from-orange-500 group-hover:to-red-500"
  },
  {
    id: "planejar-estudos",
    title: "Planejar Estudos",
    description: "Crie planos de estudos personalizados para seus objetivos",
    icon: "📅",
    color: "from-violet-600 to-indigo-600",
    hoverColor: "group-hover:from-violet-500 group-hover:to-indigo-500"
  },
  {
    id: "revisar-textos",
    title: "Revisar Textos",
    description: "Analise e corrija textos, melhorando gramática e coesão",
    icon: "✏️",
    color: "from-pink-600 to-rose-600",
    hoverColor: "group-hover:from-pink-500 group-hover:to-rose-500"
  },
  {
    id: "brainstorming",
    title: "Brainstorming",
    description: "Explore ideias e conceitos para projetos e trabalhos",
    icon: "💡",
    color: "from-yellow-600 to-amber-600",
    hoverColor: "group-hover:from-yellow-500 group-hover:to-amber-500"
  }
];

const EpictusTurboMode: React.FC = () => {
  const { theme } = useTheme();
  const [activeSection, setActiveSection] = useState(0);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const carouselRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  // Filtra as seções pelo termo de busca
  const filteredSections = searchQuery 
    ? miniSections.filter(section => 
        section.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        section.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : miniSections;

  // Efeito para ajustar o scroll quando a seção ativa muda
  useEffect(() => {
    if (carouselRef.current) {
      const sectionWidth = carouselRef.current.scrollWidth / miniSections.length;
      carouselRef.current.scrollTo({
        left: activeSection * sectionWidth - (carouselRef.current.offsetWidth / 2) + (sectionWidth / 2),
        behavior: "smooth"
      });
    }
  }, [activeSection]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (carouselRef.current) {
      setIsDragging(true);
      setStartX(e.pageX - carouselRef.current.offsetLeft);
      setScrollLeft(carouselRef.current.scrollLeft);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    if (carouselRef.current) {
      const x = e.pageX - carouselRef.current.offsetLeft;
      const walk = (x - startX) * 2;
      carouselRef.current.scrollLeft = scrollLeft - walk;
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    
    // Determinar qual seção está mais próxima do centro após o arrasto
    if (carouselRef.current) {
      const sectionWidth = carouselRef.current.scrollWidth / miniSections.length;
      const centerPosition = carouselRef.current.scrollLeft + (carouselRef.current.offsetWidth / 2);
      const newActiveSection = Math.round(centerPosition / sectionWidth);
      
      setActiveSection(Math.max(0, Math.min(miniSections.length - 1, newActiveSection)));
    }
  };

  const handleNextSection = () => {
    setActiveSection(prev => Math.min(prev + 1, miniSections.length - 1));
  };

  const handlePrevSection = () => {
    setActiveSection(prev => Math.max(prev - 1, 0));
  };

  const handleSelectSection = (index: number) => {
    setActiveSection(index);
  };

  // Componente do conteúdo da mini-seção ativa
  const ActiveSectionContent = () => {
    const section = miniSections[activeSection];
    
    return (
      <div className="w-full mt-8 rounded-2xl p-6 bg-opacity-10 backdrop-blur-sm border border-gray-800 bg-gray-900/40">
        <div className="flex flex-col items-center space-y-6">
          <div className={`text-6xl p-4 rounded-full bg-gradient-to-r ${section.color} shadow-lg`}>
            {section.icon}
          </div>
          
          <h3 className="text-2xl font-bold text-center mb-2">{section.title}</h3>
          <p className="text-center text-gray-300 mb-6">{section.description}</p>
          
          <div className="w-full">
            <div className="relative w-full">
              <textarea 
                className={`w-full p-4 h-36 rounded-xl border ${theme === "dark" ? "bg-gray-800 border-gray-700 text-white" : "bg-gray-100 border-gray-300 text-gray-800"} focus:ring-2 focus:ring-blue-500 focus:outline-none`}
                placeholder={`Digite aqui para utilizar a função "${section.title}"...`}
              />
              
              <div className="absolute bottom-4 right-4 flex space-x-2">
                <Button 
                  variant="default" 
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
                >
                  Enviar
                </Button>
              </div>
            </div>
            
            <div className="mt-8">
              <h4 className="text-lg font-semibold mb-3">Exemplos de uso:</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2, 3, 4].map((item) => (
                  <div 
                    key={item}
                    className={`p-3 rounded-lg cursor-pointer transition-all duration-200 ${theme === "dark" ? "bg-gray-800 hover:bg-gray-700" : "bg-gray-200 hover:bg-gray-300"}`}
                  >
                    <p className="text-sm">
                      {section.id === "resolver-questoes" && `Exemplo ${item}: Resolva esta questão de física sobre movimento uniforme...`}
                      {section.id === "criar-resumos" && `Exemplo ${item}: Crie um resumo sobre a Segunda Guerra Mundial...`}
                      {section.id === "explicar-conteudo" && `Exemplo ${item}: Explique de forma simples o que é fotossíntese...`}
                      {section.id === "planejar-estudos" && `Exemplo ${item}: Monte um plano de estudos para o ENEM focando em exatas...`}
                      {section.id === "revisar-textos" && `Exemplo ${item}: Revise este texto argumentativo sobre meio ambiente...`}
                      {section.id === "brainstorming" && `Exemplo ${item}: Gere ideias para um trabalho sobre tecnologias sustentáveis...`}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`w-full flex flex-col min-h-[80vh] ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
      {/* Cabeçalho da seção Epictus Turbo */}
      <div className="flex justify-between items-center px-4 py-2 relative">
        <h2 
          className="text-4xl font-bold text-center mt-4 mb-6 bg-clip-text text-transparent"
          style={{
            backgroundImage: "linear-gradient(to right, #1E3A8A, #F97316)",
            fontFamily: "'Montserrat', 'Poppins', sans-serif",
            textShadow: "0 0 10px rgba(249, 115, 22, 0.5)",
          }}
        >
          Epictus Turbo
        </h2>
        
        <div className="flex items-center space-x-3">
          {/* Botão de busca */}
          <Button 
            variant="outline" 
            size="icon" 
            className={`rounded-full ${theme === "dark" ? "border-gray-700 hover:bg-gray-800" : "border-gray-200 hover:bg-gray-100"}`}
            onClick={() => setShowSearch(!showSearch)}
          >
            {showSearch ? <X size={18} /> : <Search size={18} />}
          </Button>
          
          {/* Botão de configurações */}
          <Button 
            variant="outline" 
            size="icon" 
            className={`rounded-full ${theme === "dark" ? "border-gray-700 hover:bg-gray-800" : "border-gray-200 hover:bg-gray-100"}`}
            onClick={() => setShowSettings(true)}
          >
            <Settings size={18} />
          </Button>
        </div>
      </div>
      
      {/* Barra de pesquisa */}
      <AnimatePresence>
        {showSearch && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="px-4 py-2"
          >
            <Input
              placeholder="Buscar mini-seção..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full ${theme === "dark" ? "bg-gray-800 border-gray-700 text-white" : "bg-white border-gray-200"}`}
              autoFocus
            />
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Carrossel de mini-seções */}
      <div className="relative w-full mt-4 px-4 pb-6">
        {/* Botões de navegação */}
        <Button
          variant="ghost"
          size="icon" 
          className={`absolute left-0 top-1/2 -translate-y-1/2 z-10 rounded-full ${theme === "dark" ? "bg-gray-800/70 hover:bg-gray-700/70" : "bg-white/70 hover:bg-gray-100/70"} backdrop-blur-sm`}
          onClick={handlePrevSection}
          disabled={activeSection === 0}
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        
        <Button
          variant="ghost"
          size="icon" 
          className={`absolute right-0 top-1/2 -translate-y-1/2 z-10 rounded-full ${theme === "dark" ? "bg-gray-800/70 hover:bg-gray-700/70" : "bg-white/70 hover:bg-gray-100/70"} backdrop-blur-sm`}
          onClick={handleNextSection}
          disabled={activeSection === miniSections.length - 1}
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
        
        {/* Carrossel de cards */}
        <div 
          ref={carouselRef}
          className="overflow-hidden w-full py-4"
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onMouseMove={handleMouseMove}
          style={{ cursor: isDragging ? "grabbing" : "grab" }}
        >
          <div className="flex items-center justify-center space-x-6 px-10">
            {filteredSections.map((section, index) => {
              // Calcular distância do card ativo para aplicar efeitos
              const distance = Math.abs(index - activeSection);
              const isActive = index === activeSection;
              
              return (
                <motion.div
                  key={section.id}
                  className={`group relative ${isActive ? "z-10" : "z-0"}`}
                  onClick={() => handleSelectSection(index)}
                  initial={{ scale: 1 }}
                  animate={{ 
                    scale: isActive ? 1 : Math.max(0.8, 1 - distance * 0.1),
                    opacity: distance > 2 ? 0.3 : 1,
                    filter: `blur(${distance > 0 ? distance * 2 : 0}px)`,
                    y: isActive ? -20 : 0
                  }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                >
                  <div 
                    className={`cursor-pointer w-64 h-52 rounded-2xl p-6 flex flex-col justify-between transition-all duration-300 ${
                      isActive 
                        ? `shadow-lg shadow-${section.color.split('-')[1]}-500/20 border-${section.color.split('-')[1]}-500/50` 
                        : "shadow-md border-transparent"
                    } border-2 backdrop-filter backdrop-blur-lg bg-opacity-10 overflow-hidden ${
                      theme === "dark" ? "bg-gray-800/80" : "bg-white/80"
                    }`}
                  >
                    <div className="relative z-10">
                      <div className={`text-3xl mb-3 bg-gradient-to-r ${section.color} ${section.hoverColor} bg-clip-text text-transparent`}>
                        {section.icon}
                      </div>
                      <h3 className="font-bold text-lg mb-1">{section.title}</h3>
                      <p className={`text-xs ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>
                        {section.description}
                      </p>
                    </div>
                    
                    {/* Gradiente de fundo */}
                    <div className="absolute bottom-0 right-0 w-full h-full opacity-10 rounded-2xl overflow-hidden">
                      <div className={`absolute inset-0 bg-gradient-to-br ${section.color} ${section.hoverColor} transform rotate-12 scale-150 translate-x-1/4 translate-y-1/4`}></div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
        
        {/* Indicadores */}
        <div className="flex justify-center mt-4 space-x-2">
          {filteredSections.map((_, index) => (
            <button
              key={index}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === activeSection 
                  ? "w-8 bg-gradient-to-r from-blue-500 to-orange-500" 
                  : `${theme === "dark" ? "bg-gray-600" : "bg-gray-300"}`
              }`}
              onClick={() => handleSelectSection(index)}
            />
          ))}
        </div>
      </div>
      
      {/* Conteúdo da mini-seção ativa */}
      <div className="flex-1 w-full px-4 pb-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <ActiveSectionContent />
          </motion.div>
        </AnimatePresence>
      </div>
      
      {/* Painel de configurações */}
      <Sheet open={showSettings} onOpenChange={setShowSettings}>
        <SheetContent side="right" className={theme === "dark" ? "bg-gray-900 text-white border-gray-800" : "bg-white"}>
          <SheetHeader>
            <SheetTitle className="text-2xl">Configurações Epictus Turbo</SheetTitle>
          </SheetHeader>
          
          <div className="mt-6 space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-3">Aparência</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span>Modo Escuro</span>
                  <div className={`w-12 h-6 rounded-full relative ${theme === "dark" ? "bg-blue-600" : "bg-gray-300"}`}>
                    <div className={`absolute w-5 h-5 rounded-full bg-white top-0.5 transition-all ${theme === "dark" ? "right-0.5" : "left-0.5"}`}></div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <span>Tamanho da Fonte</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm">A</span>
                    <input type="range" min="1" max="5" defaultValue="3" className="w-full" />
                    <span className="text-lg">A</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-3">IA</h3>
              <div className="space-y-3">
                <div className="space-y-2">
                  <span>Modelo de IA</span>
                  <select className={`w-full p-2 rounded-md ${theme === "dark" ? "bg-gray-800 border-gray-700" : "bg-white border-gray-300"}`}>
                    <option>Epictus Turbo (Recomendado)</option>
                    <option>Epictus Standard</option>
                    <option>Epictus Premium</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <span>Estilo de Comunicação</span>
                  <select className={`w-full p-2 rounded-md ${theme === "dark" ? "bg-gray-800 border-gray-700" : "bg-white border-gray-300"}`}>
                    <option>Didático (Recomendado)</option>
                    <option>Técnico</option>
                    <option>Casual</option>
                    <option>Descontraído</option>
                  </select>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-3">Acessibilidade</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span>Alto Contraste</span>
                  <div className="w-12 h-6 rounded-full bg-gray-300 relative">
                    <div className="absolute w-5 h-5 rounded-full bg-white left-0.5 top-0.5"></div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span>Reduzir Animações</span>
                  <div className="w-12 h-6 rounded-full bg-gray-300 relative">
                    <div className="absolute w-5 h-5 rounded-full bg-white left-0.5 top-0.5"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="absolute bottom-6 right-6">
            <SheetClose asChild>
              <Button
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
              >
                Salvar Configurações
              </Button>
            </SheetClose>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default EpictusTurboMode;
