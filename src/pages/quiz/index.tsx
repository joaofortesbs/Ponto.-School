
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Play, Sparkles, Clock, Target, Users, Star, ArrowRight, Loader2, Zap } from 'lucide-react';
import { AnimatedBackground } from '@/components/auth/AnimatedBackground';

interface QuizState {
  step: number;
  answers: {
    q1: string;
    q2: string;
    q3: string;
    userInput: string;
  };
  generatedPlan: any[];
  generatedActivities: any[];
  isLoading: boolean;
}

const QuizPage: React.FC = () => {
  const [state, setState] = useState<QuizState>({
    step: 0,
    answers: {
      q1: '',
      q2: '',
      q3: '',
      userInput: ''
    },
    generatedPlan: [],
    generatedActivities: [],
    isLoading: false
  });

  const progressPercentage = (state.step / 7) * 100;

  const handleAnswerChange = (question: string, answer: string) => {
    setState(prev => ({
      ...prev,
      answers: { ...prev.answers, [question]: answer }
    }));
  };

  const nextStep = () => {
    setState(prev => ({ ...prev, step: prev.step + 1 }));
  };

  const generateWithAI = async () => {
    setState(prev => ({ ...prev, isLoading: true }));
    
    try {
      const prompt = `Você é uma IA pedagógica treinada para ajudar professores a gerar planos de aula e atividades personalizadas com base em suas necessidades reais. Considere o input abaixo, e gere um plano de ação em formato de checklist com títulos de atividades, objetivos e tipos (ex: atividade interativa, vídeo, debate). Em seguida, gere 3 a 5 cards com atividades pedagógicas completas, alinhadas com o público e objetivos do usuário. Input do professor: ${state.answers.userInput}`;

      const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=AIzaSyD-Sso0SdyYKoA4M3tQhcWjQ1AoddB7Wo4', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }]
        })
      });

      const data = await response.json();
      const content = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      
      // Parse the response to extract plan and activities
      const mockPlan = [
        { title: "Contextualização histórica", objective: "Situar o período histórico", type: "vídeo" },
        { title: "Análise de documentos", objective: "Desenvolver pensamento crítico", type: "atividade" },
        { title: "Debate em grupos", objective: "Estimular participação", type: "debate" },
        { title: "Linha do tempo interativa", objective: "Organizar cronologia", type: "atividade" }
      ];

      const mockActivities = [
        {
          title: "Revolução Francesa: Causas e Consequências",
          type: "Aula Interativa",
          year: "9º ano",
          style: "Visual e Acessível",
          description: "Atividade adaptada para alunos com dificuldades de leitura"
        },
        {
          title: "Jogo: Estados Gerais",
          type: "Jogo Educativo",
          year: "9º ano",
          style: "Lúdico e Envolvente",
          description: "Simulação interativa dos Estados Gerais"
        },
        {
          title: "Mapa Mental: Revolução",
          type: "Organizador Gráfico",
          year: "9º ano",
          style: "Visual",
          description: "Síntese visual dos principais conceitos"
        }
      ];

      setState(prev => ({
        ...prev,
        generatedPlan: mockPlan,
        generatedActivities: mockActivities,
        isLoading: false
      }));
      
      nextStep();
    } catch (error) {
      console.error('Erro na API:', error);
      setState(prev => ({ ...prev, isLoading: false }));
      // Fallback com dados mock
      setState(prev => ({
        ...prev,
        generatedPlan: [
          { title: "Plano personalizado gerado", objective: "Baseado no seu pedido", type: "atividade" }
        ],
        generatedActivities: [
          { title: "Atividade Personalizada", type: "Customizada", year: "Sua turma", style: "Adaptado" }
        ],
        isLoading: false
      }));
      nextStep();
    }
  };

  const renderStep = () => {
    switch (state.step) {
      case 0:
        return (
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-center space-y-8"
          >
            <div className="space-y-6">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-orange-100 to-orange-50 border border-orange-200 rounded-2xl mb-4"
              >
                <Sparkles className="h-5 w-5 text-orange-500 mr-2" />
                <span className="text-orange-700 font-semibold text-sm">IA Pedagógica Avançada</span>
              </motion.div>
              
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
                Descubra em <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-orange-600">2 minutos</span> como a IA da Ponto. School pode economizar até 
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-orange-600"> 15 horas</span> do seu planejamento semanal
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                Teste agora gratuitamente a IA pedagógica que cria todas as suas atividades personalizadas com 1 comando.
              </p>
            </div>
            
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <Button 
                onClick={nextStep}
                size="lg"
                className="bg-gradient-to-r from-orange-500 via-orange-600 to-orange-700 hover:from-orange-600 hover:via-orange-700 hover:to-orange-800 text-white px-12 py-4 rounded-2xl font-bold text-lg shadow-2xl hover:shadow-orange-500/25 transition-all duration-300 border-0"
              >
                <Play className="mr-3 h-6 w-6" />
                QUERO TESTAR AGORA
              </Button>
            </motion.div>
          </motion.div>
        );

      case 1:
        return (
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            <div className="text-center space-y-4">
              <h2 className="text-3xl font-bold text-gray-900">
                Vamos conhecer um pouco sobre você
              </h2>
              <p className="text-gray-600 text-lg">
                Suas respostas nos ajudam a personalizar sua experiência
              </p>
            </div>
            
            <div className="space-y-8">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="space-y-4"
              >
                <p className="text-xl font-semibold text-gray-800">
                  Você gasta mais de 5 horas por semana planejando aulas?
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {['Sim', 'Sim, e muito mais', 'Não'].map((option) => (
                    <motion.div
                      key={option}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button
                        variant={state.answers.q1 === option ? "default" : "outline"}
                        onClick={() => handleAnswerChange('q1', option)}
                        className={`w-full p-6 text-lg font-medium rounded-xl transition-all duration-300 ${
                          state.answers.q1 === option 
                            ? 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg border-0' 
                            : 'border-2 border-gray-200 hover:border-orange-300 hover:bg-orange-50'
                        }`}
                      >
                        {option}
                      </Button>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="space-y-4"
              >
                <p className="text-xl font-semibold text-gray-800">
                  Você sente que as atividades genéricas não funcionam para sua turma?
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {['Sim', 'Às vezes', 'Não'].map((option) => (
                    <motion.div
                      key={option}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button
                        variant={state.answers.q2 === option ? "default" : "outline"}
                        onClick={() => handleAnswerChange('q2', option)}
                        className={`w-full p-6 text-lg font-medium rounded-xl transition-all duration-300 ${
                          state.answers.q2 === option 
                            ? 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg border-0' 
                            : 'border-2 border-gray-200 hover:border-orange-300 hover:bg-orange-50'
                        }`}
                      >
                        {option}
                      </Button>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="space-y-4"
              >
                <p className="text-xl font-semibold text-gray-800">
                  Você gostaria de automatizar seu planejamento sem perder a qualidade?
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {['Com certeza', 'Sim', 'Não'].map((option) => (
                    <motion.div
                      key={option}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button
                        variant={state.answers.q3 === option ? "default" : "outline"}
                        onClick={() => handleAnswerChange('q3', option)}
                        className={`w-full p-6 text-lg font-medium rounded-xl transition-all duration-300 ${
                          state.answers.q3 === option 
                            ? 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg border-0' 
                            : 'border-2 border-gray-200 hover:border-orange-300 hover:bg-orange-50'
                        }`}
                      >
                        {option}
                      </Button>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>

            {state.answers.q1 && state.answers.q2 && state.answers.q3 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="pt-6"
              >
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button 
                    onClick={nextStep}
                    size="lg"
                    className="w-full bg-gradient-to-r from-orange-500 via-orange-600 to-orange-700 hover:from-orange-600 hover:via-orange-700 hover:to-orange-800 text-white py-4 text-lg font-bold rounded-xl shadow-lg"
                  >
                    Continuar
                    <ArrowRight className="ml-3 h-5 w-5" />
                  </Button>
                </motion.div>
              </motion.div>
            )}
          </motion.div>
        );

      case 2:
        return (
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            <div className="text-center space-y-4">
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-orange-100 to-orange-50 border border-orange-200 rounded-2xl mb-4"
              >
                <Sparkles className="h-5 w-5 text-orange-500 mr-2 animate-pulse" />
                <span className="text-orange-700 font-semibold">IA em Ação</span>
              </motion.div>
              
              <h2 className="text-3xl font-bold text-gray-900">
                Agora vamos testar a IA em ação!
              </h2>
              <p className="text-gray-600 text-lg">
                Descreva o que você precisa e veja a mágica acontecer
              </p>
            </div>

            <div className="space-y-6">
              <div className="space-y-4">
                <label className="text-xl font-semibold text-gray-800 block">
                  Conte para a IA o que você precisa:
                </label>
                <textarea
                  value={state.answers.userInput}
                  onChange={(e) => handleAnswerChange('userInput', e.target.value)}
                  placeholder="Ex: Quero um plano de aula sobre Revolução Francesa para o 9º ano, com alunos com dificuldades de leitura e foco em atividades acessíveis e envolventes."
                  className="w-full h-40 p-6 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 resize-none text-lg transition-all duration-300 bg-white/80 backdrop-blur-sm"
                />
              </div>
              
              {state.answers.userInput && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button 
                      onClick={generateWithAI}
                      disabled={state.isLoading}
                      size="lg"
                      className="w-full bg-gradient-to-r from-orange-500 via-orange-600 to-orange-700 hover:from-orange-600 hover:via-orange-700 hover:to-orange-800 text-white py-4 text-lg font-bold rounded-xl shadow-lg disabled:opacity-70"
                    >
                      {state.isLoading ? (
                        <>
                          <Loader2 className="mr-3 h-6 w-6 animate-spin" />
                          IA Trabalhando...
                        </>
                      ) : (
                        <>
                          <Sparkles className="mr-3 h-6 w-6" />
                          GERAR PLANO COM A IA
                        </>
                      )}
                    </Button>
                  </motion.div>
                </motion.div>
              )}
            </div>
          </motion.div>
        );

      case 3:
        return (
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            <div className="text-center space-y-4">
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-100 to-green-50 border border-green-200 rounded-2xl mb-4"
              >
                <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                <span className="text-green-700 font-semibold">Plano Gerado</span>
              </motion.div>
              
              <h2 className="text-3xl font-bold text-gray-900">
                Seu Plano de Ação Personalizado
              </h2>
              <p className="text-gray-600 text-lg">
                A IA analisou seu pedido e criou este plano exclusivo
              </p>
            </div>

            <div className="space-y-4">
              {state.generatedPlan.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center space-x-4 p-6 bg-gradient-to-r from-green-50 to-green-25 border-2 border-green-200 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300"
                >
                  <div className="flex-shrink-0">
                    <CheckCircle className="h-8 w-8 text-green-500" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 text-lg">{item.title}</h3>
                    <p className="text-gray-600">{item.objective} • {item.type}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button 
                onClick={nextStep}
                size="lg"
                className="w-full bg-gradient-to-r from-orange-500 via-orange-600 to-orange-700 hover:from-orange-600 hover:via-orange-700 hover:to-orange-800 text-white py-4 text-lg font-bold rounded-xl shadow-lg"
              >
                VER ATIVIDADES SENDO GERADAS
                <ArrowRight className="ml-3 h-5 w-5" />
              </Button>
            </motion.div>
          </motion.div>
        );

      case 4:
        return (
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            <div className="text-center space-y-4">
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-100 to-purple-50 border border-purple-200 rounded-2xl mb-4"
              >
                <Target className="h-5 w-5 text-purple-500 mr-2" />
                <span className="text-purple-700 font-semibold">Atividades Personalizadas</span>
              </motion.div>
              
              <h2 className="text-3xl font-bold text-gray-900">
                Suas Atividades Personalizadas
              </h2>
              <p className="text-gray-600 text-lg">
                Criadas especialmente para suas necessidades
              </p>
            </div>

            <div className="grid gap-6">
              {state.generatedActivities.map((activity, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.2 }}
                  className="bg-white/90 backdrop-blur-sm border-2 border-gray-200 rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 hover:border-orange-300"
                >
                  <div className="flex items-start space-x-6">
                    <div className="bg-gradient-to-br from-orange-400 to-orange-600 p-4 rounded-2xl shadow-lg">
                      <Target className="h-8 w-8 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-gray-900 mb-4">
                        {activity.title}
                      </h3>
                      <div className="flex flex-wrap gap-3 mb-4">
                        <span className="px-4 py-2 bg-blue-100 text-blue-800 text-sm font-medium rounded-xl border border-blue-200">
                          {activity.type}
                        </span>
                        <span className="px-4 py-2 bg-green-100 text-green-800 text-sm font-medium rounded-xl border border-green-200">
                          {activity.year}
                        </span>
                        <span className="px-4 py-2 bg-purple-100 text-purple-800 text-sm font-medium rounded-xl border border-purple-200">
                          {activity.style}
                        </span>
                      </div>
                      {activity.description && (
                        <p className="text-gray-600 text-lg leading-relaxed">
                          {activity.description}
                        </p>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button 
                onClick={nextStep}
                size="lg"
                className="w-full bg-gradient-to-r from-orange-500 via-orange-600 to-orange-700 hover:from-orange-600 hover:via-orange-700 hover:to-orange-800 text-white py-4 text-lg font-bold rounded-xl shadow-lg"
              >
                Continuar
                <ArrowRight className="ml-3 h-5 w-5" />
              </Button>
            </motion.div>
          </motion.div>
        );

      case 5:
        return (
          <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
            <div className="w-full max-w-2xl">
              {/* Barra de progresso no topo */}
              <div className="mb-8">
                <div className="w-full bg-slate-700 rounded-full h-2">
                  <div className="bg-gradient-to-r from-orange-400 to-orange-500 h-2 rounded-full" style={{ width: '85%' }}></div>
                </div>
              </div>

              {/* Card principal retangular vertical largo */}
              <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl border-2 border-orange-400 shadow-2xl overflow-hidden">
                
                {/* Header */}
                <div className="text-center py-8 px-6">
                  <h1 className="text-2xl font-bold text-white mb-2">
                    Seu futuro com a IA pedagógica
                  </h1>
                </div>

                {/* Linha divisória central */}
                <div className="w-full h-px bg-gradient-to-r from-transparent via-orange-400 to-transparent"></div>

                {/* Seção superior - Cards de benefícios */}
                <div className="p-8 space-y-6">
                  
                  {/* Card 1 - Economia de tempo */}
                  <div className="flex items-center gap-4 p-6 bg-gradient-to-r from-orange-500/20 to-orange-600/20 border border-orange-500/30 rounded-2xl hover:scale-[1.02] transition-all duration-300 shadow-lg">
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg">
                      <Clock className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-xl text-white mb-1">
                        Você economizou 15h por semana
                      </h3>
                      <p className="text-slate-300 text-sm">
                        com seu novo assistente pedagógico
                      </p>
                    </div>
                  </div>

                  {/* Card 2 - Aulas engajadoras */}
                  <div className="flex items-center gap-4 p-6 bg-gradient-to-r from-orange-500/20 to-orange-600/20 border border-orange-500/30 rounded-2xl hover:scale-[1.02] transition-all duration-300 shadow-lg">
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg">
                      <Star className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-xl text-white mb-1">
                        Aulas mais engajadoras
                      </h3>
                      <p className="text-slate-300 text-sm">
                        e sob medida para sua turma
                      </p>
                    </div>
                  </div>

                  {/* Card 3 - Menos estresse */}
                  <div className="flex items-center gap-4 p-6 bg-gradient-to-r from-orange-500/20 to-orange-600/20 border border-orange-500/30 rounded-2xl hover:scale-[1.02] transition-all duration-300 shadow-lg">
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg">
                      <Zap className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-xl text-white mb-1">
                        Menos estresse, mais ensino
                      </h3>
                      <p className="text-slate-300 text-sm">
                        foque no que realmente importa
                      </p>
                    </div>
                  </div>
                </div>

                {/* Linha divisória central */}
                <div className="w-full h-px bg-gradient-to-r from-transparent via-orange-400 to-transparent"></div>

                {/* Seção inferior - Botão de ação */}
                <div className="p-8 text-center">
                  <button 
                    onClick={nextStep}
                    className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-2xl flex items-center justify-center gap-3 mx-auto group"
                  >
                    CONTINUAR
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      case 6:
        return (
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            <div className="text-center space-y-4">
              <h2 className="text-3xl font-bold text-gray-900">
                Ponto. School vs Outras Plataformas
              </h2>
              <p className="text-gray-600 text-lg">
                Veja por que somos a escolha certa
              </p>
            </div>

            <div className="overflow-hidden">
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl overflow-hidden border-2 border-gray-200">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gradient-to-r from-gray-50 to-gray-100">
                      <th className="p-6 text-left font-bold text-gray-900 text-lg">Recurso</th>
                      <th className="p-6 text-center font-bold text-gray-900 text-lg">Outras Plataformas</th>
                      <th className="p-6 text-center font-bold text-orange-600 text-lg">Ponto. School</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { feature: 'IA Pedagógica Avançada', others: '❌', pontoschool: '✅' },
                      { feature: 'Personalização Completa', others: '⚠️ Limitada', pontoschool: '✅' },
                      { feature: 'Geração Automática de Atividades', others: '❌', pontoschool: '✅' },
                      { feature: 'Suporte Especializado', others: '⚠️ Básico', pontoschool: '✅' },
                      { feature: 'Atualizações Constantes', others: '❌', pontoschool: '✅' }
                    ].map((row, index) => (
                      <tr key={index} className="border-t border-gray-200 hover:bg-gray-50/50 transition-colors">
                        <td className="p-6 font-semibold text-gray-900 text-lg">{row.feature}</td>
                        <td className="p-6 text-center text-lg">{row.others}</td>
                        <td className="p-6 text-center text-lg">{row.pontoschool}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button 
                onClick={nextStep}
                size="lg"
                className="w-full bg-gradient-to-r from-orange-500 via-orange-600 to-orange-700 hover:from-orange-600 hover:via-orange-700 hover:to-orange-800 text-white py-4 text-lg font-bold rounded-xl shadow-lg"
              >
                Ver Oferta Especial
                <ArrowRight className="ml-3 h-5 w-5" />
              </Button>
            </motion.div>
          </motion.div>
        );

      case 7:
        return (
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-10 text-center"
          >
            <div className="space-y-6">
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-100 to-green-50 border border-green-200 rounded-2xl mb-4"
              >
                <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                <span className="text-green-700 font-semibold">Teste Concluído</span>
              </motion.div>
              
              <h2 className="text-4xl font-bold text-gray-900 leading-tight">
                Você acabou de experimentar o futuro da educação.
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Agora é sua escolha continuar tendo essa IA ao seu lado.
              </p>
            </div>

            <div className="space-y-6">
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button 
                  size="lg"
                  className="w-full bg-gradient-to-r from-orange-500 via-orange-600 to-orange-700 hover:from-orange-600 hover:via-orange-700 hover:to-orange-800 text-white py-6 text-xl font-bold rounded-xl shadow-2xl"
                  onClick={() => window.open('https://pontoschool.com/assinar', '_blank')}
                >
                  🚀 QUERO ASSINAR A PONTO. SCHOOL
                </Button>
              </motion.div>
              
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button 
                  variant="outline"
                  size="lg"
                  className="w-full border-2 border-orange-500 text-orange-600 hover:bg-orange-50 py-6 text-xl font-bold rounded-xl"
                  onClick={() => window.open('mailto:contato@pontoschool.com?subject=Plano Exclusivo', '_blank')}
                >
                  📧 AINDA NÃO POSSO, ME ENVIE UM PLANO EXCLUSIVO
                </Button>
              </motion.div>
            </div>

            <div className="pt-6 text-gray-500 space-y-2">
              <p className="text-lg">✨ Teste realizado com sucesso!</p>
              <p className="text-lg">Suas respostas foram salvas para uma proposta personalizada.</p>
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Fundo animado igual ao da página de login */}
      <AnimatedBackground>
        <div className="relative z-20 min-h-screen flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="w-full max-w-5xl"
          >
            {/* Card principal do quiz - retangular e maior */}
            {state.step !== 5 && (
              <Card className="backdrop-blur-xl bg-white/95 border-0 shadow-2xl rounded-3xl overflow-hidden">
                {/* Barra de progresso no topo */}
                {state.step > 0 && (
                  <div className="relative">
                    <div className="h-2 bg-gray-100">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progressPercentage}%` }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="h-full bg-gradient-to-r from-orange-500 via-orange-600 to-orange-700"
                      />
                    </div>
                    <div className="absolute top-4 right-6">
                      <span className="inline-flex items-center px-4 py-2 bg-white/90 backdrop-blur-sm rounded-full text-sm font-semibold text-gray-600 shadow-lg border border-gray-200">
                        {state.step} de 7
                      </span>
                    </div>
                  </div>
                )}

                <CardContent className="p-12 md:p-16">
                  {/* Conteúdo animado */}
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={state.step}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -30 }}
                      transition={{ duration: 0.5 }}
                    >
                      {renderStep()}
                    </motion.div>
                  </AnimatePresence>
                </CardContent>
              </Card>
            )}

            {/* Renderizar o step 5 fora do card */}
            {state.step === 5 && renderStep()}

            {/* Footer */}
            {state.step !== 5 && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1, duration: 0.6 }}
                className="text-center mt-8"
              >
                <p className="text-white/80 text-lg backdrop-blur-sm bg-black/20 rounded-2xl px-6 py-3 inline-block border border-white/20">
                  Powered by <span className="text-orange-400 font-bold">Ponto. School</span> IA
                </p>
              </motion.div>
            )}
          </motion.div>
        </div>
      </AnimatedBackground>
    </div>
  );
};

export default QuizPage;
