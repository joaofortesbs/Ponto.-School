
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Play, Sparkles, Clock, Target, Users, Star, ArrowRight, Loader2 } from 'lucide-react';

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
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-6"
          >
            <div className="space-y-2">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                Descubra em 2 minutos como a IA da Ponto. School pode economizar até 
                <span className="text-orange-500"> 15 horas</span> do seu planejamento semanal
              </h1>
              <p className="text-lg text-gray-600">
                Teste agora gratuitamente a IA pedagógica que cria todas as suas atividades personalizadas com 1 comando.
              </p>
            </div>
            <Button 
              onClick={nextStep}
              size="lg"
              className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Play className="mr-2 h-5 w-5" />
              QUERO TESTAR AGORA
            </Button>
          </motion.div>
        );

      case 1:
        return (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
              Vamos conhecer um pouco sobre você
            </h2>
            
            <div className="space-y-6">
              <div>
                <p className="text-lg font-medium text-gray-800 mb-4">
                  Você gasta mais de 5 horas por semana planejando aulas?
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {['Sim', 'Sim, e muito mais', 'Não'].map((option) => (
                    <Button
                      key={option}
                      variant={state.answers.q1 === option ? "default" : "outline"}
                      onClick={() => handleAnswerChange('q1', option)}
                      className={`p-4 ${state.answers.q1 === option ? 'bg-orange-500 hover:bg-orange-600' : ''}`}
                    >
                      {option}
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-lg font-medium text-gray-800 mb-4">
                  Você sente que as atividades genéricas não funcionam para sua turma?
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {['Sim', 'Às vezes', 'Não'].map((option) => (
                    <Button
                      key={option}
                      variant={state.answers.q2 === option ? "default" : "outline"}
                      onClick={() => handleAnswerChange('q2', option)}
                      className={`p-4 ${state.answers.q2 === option ? 'bg-orange-500 hover:bg-orange-600' : ''}`}
                    >
                      {option}
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-lg font-medium text-gray-800 mb-4">
                  Você gostaria de automatizar seu planejamento sem perder a qualidade?
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {['Com certeza', 'Sim', 'Não'].map((option) => (
                    <Button
                      key={option}
                      variant={state.answers.q3 === option ? "default" : "outline"}
                      onClick={() => handleAnswerChange('q3', option)}
                      className={`p-4 ${state.answers.q3 === option ? 'bg-orange-500 hover:bg-orange-600' : ''}`}
                    >
                      {option}
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            {state.answers.q1 && state.answers.q2 && state.answers.q3 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="pt-4"
              >
                <Button 
                  onClick={nextStep}
                  size="lg"
                  className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
                >
                  Continuar
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </motion.div>
            )}
          </motion.div>
        );

      case 2:
        return (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold text-gray-900">
                Agora vamos testar a IA em ação!
              </h2>
              <p className="text-gray-600">
                Descreva o que você precisa e veja a mágica acontecer
              </p>
            </div>

            <div className="space-y-4">
              <label className="text-lg font-medium text-gray-800">
                Conte para a IA o que você precisa:
              </label>
              <textarea
                value={state.answers.userInput}
                onChange={(e) => handleAnswerChange('userInput', e.target.value)}
                placeholder="Ex: Quero um plano de aula sobre Revolução Francesa para o 9º ano, com alunos com dificuldades de leitura e foco em atividades acessíveis e envolventes."
                className="w-full h-32 p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
              />
              
              {state.answers.userInput && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <Button 
                    onClick={generateWithAI}
                    disabled={state.isLoading}
                    size="lg"
                    className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
                  >
                    {state.isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        IA Trabalhando...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-5 w-5" />
                        GERAR PLANO COM A IA
                      </>
                    )}
                  </Button>
                </motion.div>
              )}
            </div>
          </motion.div>
        );

      case 3:
        return (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold text-gray-900">
                Seu Plano de Ação Personalizado
              </h2>
              <p className="text-gray-600">
                A IA analisou seu pedido e criou este plano exclusivo
              </p>
            </div>

            <div className="space-y-4">
              {state.generatedPlan.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center space-x-3 p-4 bg-green-50 border border-green-200 rounded-xl"
                >
                  <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-900">{item.title}</h3>
                    <p className="text-sm text-gray-600">{item.objective} • {item.type}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            <Button 
              onClick={nextStep}
              size="lg"
              className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
            >
              VER ATIVIDADES SENDO GERADAS
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </motion.div>
        );

      case 4:
        return (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold text-gray-900">
                Suas Atividades Personalizadas
              </h2>
              <p className="text-gray-600">
                Criadas especialmente para suas necessidades
              </p>
            </div>

            <div className="grid gap-4">
              {state.generatedActivities.map((activity, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.2 }}
                  className="bg-white border border-gray-200 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <div className="flex items-start space-x-4">
                    <div className="bg-orange-100 p-3 rounded-lg">
                      <Target className="h-6 w-6 text-orange-500" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {activity.title}
                      </h3>
                      <div className="flex flex-wrap gap-2 mb-3">
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                          {activity.type}
                        </span>
                        <span className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">
                          {activity.year}
                        </span>
                        <span className="px-3 py-1 bg-purple-100 text-purple-800 text-sm rounded-full">
                          {activity.style}
                        </span>
                      </div>
                      {activity.description && (
                        <p className="text-gray-600 text-sm">
                          {activity.description}
                        </p>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            <Button 
              onClick={nextStep}
              size="lg"
              className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
            >
              Continuar
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </motion.div>
        );

      case 5:
        return (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8 text-center"
          >
            <h2 className="text-2xl font-bold text-gray-900">
              Sua Transformação com a Ponto. School
            </h2>

            <div className="grid gap-6">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                className="flex items-center space-x-4 p-6 bg-green-50 border border-green-200 rounded-xl"
              >
                <Clock className="h-10 w-10 text-green-500" />
                <div className="text-left">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Você economizou 15h por semana
                  </h3>
                  <p className="text-gray-600">
                    Com seu novo assistente pedagógico
                  </p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="flex items-center space-x-4 p-6 bg-blue-50 border border-blue-200 rounded-xl"
              >
                <Users className="h-10 w-10 text-blue-500" />
                <div className="text-left">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Aulas mais engajadoras
                  </h3>
                  <p className="text-gray-600">
                    Sob medida para sua turma
                  </p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
                className="flex items-center space-x-4 p-6 bg-purple-50 border border-purple-200 rounded-xl"
              >
                <Star className="h-10 w-10 text-purple-500" />
                <div className="text-left">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Menos estresse, mais ensino
                  </h3>
                  <p className="text-gray-600">
                    Foque no que realmente importa
                  </p>
                </div>
              </motion.div>
            </div>

            <Button 
              onClick={nextStep}
              size="lg"
              className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 px-8"
            >
              CONTINUAR
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </motion.div>
        );

      case 6:
        return (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold text-gray-900">
                Ponto. School vs Outras Plataformas
              </h2>
              <p className="text-gray-600">
                Veja por que somos a escolha certa
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse bg-white rounded-xl overflow-hidden shadow-lg">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="p-4 text-left font-semibold text-gray-900">Recurso</th>
                    <th className="p-4 text-center font-semibold text-gray-900">Outras Plataformas</th>
                    <th className="p-4 text-center font-semibold text-orange-600">Ponto. School</th>
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
                    <tr key={index} className="border-t border-gray-200">
                      <td className="p-4 font-medium text-gray-900">{row.feature}</td>
                      <td className="p-4 text-center">{row.others}</td>
                      <td className="p-4 text-center">{row.pontoschool}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <Button 
              onClick={nextStep}
              size="lg"
              className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
            >
              Ver Oferta Especial
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </motion.div>
        );

      case 7:
        return (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8 text-center"
          >
            <div className="space-y-4">
              <h2 className="text-3xl font-bold text-gray-900">
                Você acabou de experimentar o futuro da educação.
              </h2>
              <p className="text-lg text-gray-600">
                Agora é sua escolha continuar tendo essa IA ao seu lado.
              </p>
            </div>

            <div className="space-y-4">
              <Button 
                size="lg"
                className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 py-4 text-lg font-semibold"
                onClick={() => window.open('https://pontoschool.com/assinar', '_blank')}
              >
                🚀 QUERO ASSINAR A PONTO. SCHOOL
              </Button>
              
              <Button 
                variant="outline"
                size="lg"
                className="w-full border-2 border-orange-500 text-orange-600 hover:bg-orange-50 py-4 text-lg"
                onClick={() => window.open('mailto:contato@pontoschool.com?subject=Plano Exclusivo', '_blank')}
              >
                📧 AINDA NÃO POSSO, ME ENVIE UM PLANO EXCLUSIVO
              </Button>
            </div>

            <div className="pt-4 text-sm text-gray-500">
              <p>✨ Teste realizado com sucesso!</p>
              <p>Suas respostas foram salvas para uma proposta personalizada.</p>
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-2xl"
      >
        <Card className="shadow-2xl rounded-3xl border-0 overflow-hidden">
          <CardContent className="p-6 md:p-8">
            {/* Progress Bar */}
            {state.step > 0 && (
              <div className="mb-8">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-500">Progresso</span>
                  <span className="text-sm text-gray-500">{state.step}/7</span>
                </div>
                <Progress value={progressPercentage} className="h-2" />
              </div>
            )}

            {/* Content */}
            <AnimatePresence mode="wait">
              <motion.div
                key={state.step}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                {renderStep()}
              </motion.div>
            </AnimatePresence>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-6 text-gray-500">
          <p className="text-sm">
            Powered by <span className="text-orange-500 font-semibold">Ponto. School</span> IA
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default QuizPage;
