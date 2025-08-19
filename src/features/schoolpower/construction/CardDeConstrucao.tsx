"use client";
import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  CheckCircle2, 
  Clock, 
  Building2, 
  Lightbulb,
  Target,
  BookOpen,
  Users,
  Calendar,
  AlertCircle,
  Loader2,
  FileText,
  Edit3,
  Eye,
  Play
} from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { ConstructionGrid } from './ConstructionGrid';

import { 
  Wrench, CheckSquare, Filter, 
  Trophy, Zap, Brain, Heart, 
  PenTool, Presentation, Search, MapPin, Calculator, Globe,
  Microscope, Palette, Music, Camera, Video, Headphones,
  Gamepad2, Puzzle, Award, Star, Flag, Compass,
  Download, Upload, Share2, MessageSquare, ThumbsUp,
  Pause, SkipForward, Volume2, Wifi, Battery,
  Shield, Lock, Key, Mail, Phone, Home, Car, Plane,
  TreePine, Sun, Moon, Cloud, Umbrella, Snowflake, Triangle
} from "lucide-react";
import { ContextualizationData } from "../contextualization/ContextualizationCard";
import { ActionPlanItem } from "../actionplan/ActionPlanCard";
import { isActivityEligibleForTrilhas, getTrilhasBadgeProps } from "../data/trilhasActivitiesConfig";
import { TrilhasBadge } from "../components/TrilhasBadge";
import schoolPowerActivitiesData from '../data/schoolPowerActivities.json';
import { ConstructionInterface } from './index';
import atividadesTrilhas from '../data/atividadesTrilhas.json';
import { getCustomFieldsForActivity, hasCustomFields } from '../data/activityCustomFields';
import { EditActivityModal } from './EditActivityModal';
import { PlanoAulaProcessor } from '../activities/plano-aula/planoAulaProcessor';
import { processSequenciaDidaticaData, sequenciaDidaticaFieldMapping } from '../activities/sequencia-didatica';
import { processQuadroInterativoData } from '../activities/quadro-interativo/quadroInterativoProcessor';

// Convert to proper format with name field
const schoolPowerActivities = schoolPowerActivitiesData.map(activity => ({
  ...activity,
  name: activity.name || activity.title || activity.description
}));

// Componente do Modal de Acesso Vitalício com código exato fornecido
const AcessoVitalicioModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const [data, setData] = useState([]);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setIsVisible(false);
      setData([]);
      return;
    }

    // Animação de entrada do card
    setTimeout(() => setIsVisible(true), 100);

    // Dados iniciais (removido Julho)
    const initialData = [
      { name: 'Ago', value: 22 },
      { name: 'Set', value: 45 },
      { name: 'Out', value: 48 },
      { name: 'Nov', value: 68 },
      { name: 'Dez', value: 78 }
    ];

    // Animar crescimento dos dados
    let currentIndex = 0;
    const interval = setInterval(() => {
      if (currentIndex < initialData.length) {
        setData(initialData.slice(0, currentIndex + 1));
        currentIndex++;
      } else {
        clearInterval(interval);
      }
    }, 400);

    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 sm:p-8"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 50 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.8, y: 50 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-700 p-4 sm:p-6 lg:p-8 max-w-sm sm:max-w-md lg:max-w-lg xl:max-w-xl w-full mx-auto max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Card Principal do Gráfico */}
        <div 
          className={`bg-white rounded-2xl shadow-2xl p-4 sm:p-6 lg:p-8 w-full h-auto min-h-60 sm:min-h-80 transform transition-all duration-1000 ease-out ${
            isVisible 
              ? 'translate-y-0 opacity-100 scale-100' 
              : 'translate-y-10 opacity-0 scale-95'
          }`}
          style={{
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.8)'
          }}
        >
          <div className="mb-4 sm:mb-6">
            <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800 mb-2 text-center sm:text-left">
              Seja 15x mais produtivo com IA!
            </h3>
            <p className="text-gray-500 text-xs sm:text-sm text-center sm:text-left">
              Transforme sua carreira em minutos!
            </p>
          </div>

          <div className="h-32 sm:h-40 lg:h-48 w-full relative">
            <svg className="w-full h-full" viewBox="0 0 400 200" preserveAspectRatio="none">
              {/* Definições de gradientes e filtros */}
              <defs>
                <linearGradient id="gradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#F97316" />
                  <stop offset="100%" stopColor="#FB923C" />
                </linearGradient>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                  <feMerge> 
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
                <filter id="drop-shadow">
                  <feDropShadow dx="0" dy="3" stdDeviation="4" floodColor="#F97316" floodOpacity="0.4"/>
                </filter>
                <filter id="soft-glow">
                  <feGaussianBlur stdDeviation="1.5" result="coloredBlur"/>
                  <feMerge> 
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>
              
              {/* Grid de fundo sutil com animação */}
              <defs>
                <pattern id="grid" width="40" height="20" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 20" fill="none" stroke="#f0f0f0" strokeWidth="0.5" opacity="0.3"/>
                </pattern>
              </defs>
              <rect 
                width="100%" 
                height="100%" 
                fill="url(#grid)"
                style={{
                  opacity: isVisible ? 0.3 : 0,
                  transition: 'opacity 1s ease-out',
                  transitionDelay: '200ms'
                }}
              />
              
              {/* Área sombreada sob a linha com animação aprimorada */}
              {data.length >= 2 && (
                <path
                  d={`M 20 160 L ${20} ${160 - (data[0]?.value || 0) * 1.5} ${data.map((item, index) => 
                    `L ${20 + index * 95} ${160 - item.value * 1.5}`
                  ).join(' ')} L ${20 + (data.length - 1) * 95} 160 Z`}
                  fill="url(#gradient)"
                  fillOpacity="0.15"
                  filter="url(#soft-glow)"
                  style={{
                    opacity: isVisible ? 1 : 0,
                    transform: isVisible ? 'scaleY(1)' : 'scaleY(0)',
                    transformOrigin: 'bottom',
                    transition: 'all 1.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                    transitionDelay: `${(data.length - 1) * 400 + 1000}ms`
                  }}
                />
              )}
              
              {/* Linhas progressivas conectando os pontos */}
              {data.map((item, index) => {
                if (index === 0) return null;
                const prevItem = data[index - 1];
                const lineLength = Math.sqrt(
                  Math.pow((20 + index * 95) - (20 + (index - 1) * 95), 2) + 
                  Math.pow((160 - item.value * 1.5) - (160 - prevItem.value * 1.5), 2)
                );
                
                return (
                  <line
                    key={`line-${index}`}
                    x1={20 + (index - 1) * 95}
                    y1={160 - prevItem.value * 1.5}
                    x2={20 + index * 95}
                    y2={160 - item.value * 1.5}
                    stroke="url(#gradient)"
                    strokeWidth="4"
                    strokeLinecap="round"
                    filter="url(#drop-shadow)"
                    style={{
                      strokeDasharray: lineLength,
                      strokeDashoffset: isVisible ? 0 : lineLength,
                      transition: 'stroke-dashoffset 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                      transitionDelay: `${index * 400 + 800}ms`
                    }}
                  />
                );
              })}
              
              {/* Pontos no gráfico com animação sequencial */}
              {data.map((item, index) => (
                <g key={index}>
                  {/* Círculo de brilho expandido */}
                  <circle 
                    cx={20 + index * 95} 
                    cy={160 - item.value * 1.5} 
                    r="12" 
                    fill="#F97316"
                    fillOpacity="0.1"
                    style={{
                      opacity: isVisible ? 1 : 0,
                      transform: isVisible ? 'scale(1)' : 'scale(0)',
                      transformOrigin: 'center',
                      transition: 'all 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
                      transitionDelay: `${index * 400 + 600}ms`,
                      animation: isVisible ? 'pulse 3s infinite' : 'none',
                      animationDelay: `${index * 400 + 1200}ms`
                    }}
                  />
                  
                  {/* Círculo de brilho médio */}
                  <circle 
                    cx={20 + index * 95} 
                    cy={160 - item.value * 1.5} 
                    r="8" 
                    fill="#F97316"
                    fillOpacity="0.2"
                    style={{
                      opacity: isVisible ? 1 : 0,
                      transform: isVisible ? 'scale(1)' : 'scale(0)',
                      transformOrigin: 'center',
                      transition: 'all 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
                      transitionDelay: `${index * 400 + 500}ms`,
                      animation: isVisible ? 'pulse 2.5s infinite' : 'none',
                      animationDelay: `${index * 400 + 1100}ms`
                    }}
                  />
                  
                  {/* Ponto principal com crescimento sequencial */}
                  <circle 
                    cx={20 + index * 95} 
                    cy={160 - item.value * 1.5} 
                    r="6" 
                    fill="#F97316"
                    stroke="#ffffff"
                    strokeWidth="3"
                    filter="url(#glow)"
                    style={{
                      opacity: isVisible ? 1 : 0,
                      transform: isVisible ? 'scale(1)' : 'scale(0)',
                      transformOrigin: 'center',
                      transition: 'all 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
                      transitionDelay: `${index * 400 + 400}ms`,
                      cursor: 'pointer'
                    }}
                  />
                  
                  {/* Valor do ponto com animação sequencial */}
                  <text
                    x={20 + index * 95}
                    y={160 - item.value * 1.5 - 18}
                    textAnchor="middle"
                    className="text-xs font-bold fill-orange-600"
                    style={{ 
                      fontSize: 12,
                      opacity: isVisible ? 1 : 0,
                      transform: isVisible ? 'translateY(0) scale(1)' : 'translateY(10px) scale(0.8)',
                      transition: 'all 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                      transitionDelay: `${index * 400 + 700}ms`,
                      filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.1))'
                    }}
                  >
                    {item.value}%
                  </text>
                </g>
              ))}
              
              {/* Labels do eixo X com animação sequencial */}
              {data.map((item, index) => (
                <text 
                  key={index}
                  x={20 + index * 95} 
                  y="185" 
                  textAnchor="middle" 
                  className="text-xs fill-gray-500 font-medium"
                  style={{ 
                    fontSize: 11,
                    opacity: isVisible ? 1 : 0,
                    transform: isVisible ? 'translateY(0)' : 'translateY(8px)',
                    transition: 'all 0.4s ease-out',
                    transitionDelay: `${index * 400 + 300}ms`
                  }}
                >
                  {item.name}
                </text>
              ))}
            </svg>
            
            {/* Labels laterais ajustados */}
            {data.length >= 1 && (
              <div 
                className={`absolute text-xs sm:text-xs font-semibold text-gray-600 bg-white px-2 py-1 rounded-lg shadow-md transform -translate-x-1/2 -translate-y-8 transition-all duration-800 ease-out ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
                }`}
                style={{
                  left: `${8 + (0 / 4) * 84}%`,
                  top: `${100 - (22 / 78) * 60}%`,
                  transitionDelay: '1800ms'
                }}
              >
                <div className="text-center">
                  <div className="text-orange-600 font-bold">Você</div>
                  <div className="text-xs text-gray-400">Atual</div>
                </div>
              </div>
            )}
            
            {data.length >= 5 && (
              <div 
                className={`absolute text-xs sm:text-xs font-semibold text-gray-600 bg-white px-2 py-1 rounded-lg shadow-md transform -translate-x-1/2 -translate-y-8 transition-all duration-800 ease-out ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
                }`}
                style={{
                  left: `${8 + (4 / 4) * 84}%`,
                  top: `${100 - (78 / 78) * 60}%`,
                  transitionDelay: '2200ms'
                }}
              >
                <div className="text-center">
                  <div className="text-orange-600 font-bold">Ponto. School</div>
                  <div className="text-xs text-gray-400">Meta</div>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Checklist - Benefícios vs Problemas */}
        <div 
          className={`bg-white rounded-2xl shadow-xl p-4 sm:p-6 w-full mt-4 sm:mt-6 transform transition-all duration-1000 ease-out delay-500 ${
            isVisible 
              ? 'translate-y-0 opacity-100 scale-100' 
              : 'translate-y-10 opacity-0 scale-95'
          }`}
          style={{
            boxShadow: '0 20px 40px -12px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.8)'
          }}
        >
          <div className="space-y-3 sm:space-y-4">
            {[
              { text: '+15 horas por semana', type: 'positive' },
              { text: 'Alunos engajados', type: 'positive' },
              { text: 'Mais reputação na profissão', type: 'positive' },
              { text: 'Materiais personalizados', type: 'positive' },
              { text: 'Dor de cabeça', type: 'negative' },
              { text: 'Alunos desmotivados', type: 'negative' },
              { text: 'Falta de criatividade', type: 'negative' }
            ].map((item, index) => (
              <div 
                key={index} 
                className={`flex items-center space-x-3 transform transition-all duration-500 ease-out ${
                  isVisible ? 'translate-x-0 opacity-100' : 'translate-x-4 opacity-0'
                }`}
                style={{ transitionDelay: `${800 + index * 200}ms` }}
              >
                <div className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center shadow-sm flex-shrink-0 ${
                  item.type === 'positive' 
                    ? 'bg-gradient-to-r from-orange-500 to-orange-400' 
                    : 'bg-gradient-to-r from-red-500 to-red-400'
                }`}>
                  {item.type === 'positive' ? (
                    <svg 
                      className="w-2 h-2 sm:w-3 sm:h-3 text-white" 
                      fill="currentColor" 
                      viewBox="0 0 20 20"
                    >
                      <path 
                        fillRule="evenodd" 
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" 
                        clipRule="evenodd" 
                      />
                    </svg>
                  ) : (
                    <svg 
                      className="w-2 h-2 sm:w-3 sm:h-3 text-white" 
                      fill="currentColor" 
                      viewBox="0 0 20 20"
                    >
                      <path 
                        fillRule="evenodd" 
                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" 
                        clipRule="evenodd" 
                      />
                    </svg>
                  )}
                </div>
                <span className={`font-medium text-sm sm:text-base ${
                  item.type === 'positive' ? 'text-gray-700' : 'text-gray-600 line-through'
                }`}>{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Botões */}
        <div className="flex gap-4 justify-center mt-6">
          <button
            onClick={onClose}
            className="px-6 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors font-medium"
          >
            Talvez mais tarde
          </button>
          <button
            onClick={() => {
              console.log('🚀 Redirecionando para página de pagamento do acesso vitalício');
              alert('Redirecionando para página de pagamento...');
            }}
            className="px-8 py-3 bg-gradient-to-r from-[#FF6B00] to-[#FF8A39] hover:from-[#E55A00] hover:to-[#FF7A29] text-white font-bold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            Quero ser 15x mais produtivo!
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

// Componente do Cronômetro e Botão de Acesso Vitalício
const TimerCard: React.FC = () => {
  const TOTAL_TIME = 5 * 60; // 5 minutos em segundos
  const [timeLeft, setTimeLeft] = useState(TOTAL_TIME);
  const [isActive, setIsActive] = useState(true);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (!isActive || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        const newTime = prev - 1;
        if (newTime <= 0) {
          setIsActive(false);
          console.log('⏰ Cronômetro finalizado!');
          return 0;
        }
        return newTime;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isActive, timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Calcula a porcentagem de progresso (de 100% para 0%)
  const progressPercentage = (timeLeft / TOTAL_TIME) * 100;

  const handleVitalicioClick = () => {
    console.log('🎯 Usuário clicou em "Quero acesso vitalício"');
    console.log(`⏰ Tempo restante: ${formatTime(timeLeft)}`);
    setShowModal(true);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, x: 50 }}
      animate={{ opacity: 1, scale: 1, x: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="absolute top-4 right-4 z-30 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-4 min-w-[280px]"
    >
      <div className="flex items-center justify-between gap-4">
        {/* Cronômetro */}
        <div className="flex flex-col items-center">
          <div className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
            Tempo Restante
          </div>
          <div className={`text-2xl font-bold transition-colors duration-300 ${
            timeLeft <= 60 ? 'text-red-500' : timeLeft <= 180 ? 'text-orange-500' : 'text-[#FF6B00]'
          }`}>
            {formatTime(timeLeft)}
          </div>
          {timeLeft <= 0 && (
            <div className="text-xs text-red-500 font-medium mt-1">
              Tempo esgotado!
            </div>
          )}
        </div>

        {/* Separador */}
        <div className="w-px h-12 bg-gray-200 dark:bg-gray-700"></div>

        {/* Botão de Acesso Vitalício */}
        <div className="flex-1">
          <button
            onClick={handleVitalicioClick}
            className="w-full px-4 py-3 bg-gradient-to-r from-[#FF6B00] to-[#FF8A39] hover:from-[#E55A00] hover:to-[#FF7A29] text-white font-bold text-sm rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
          >
            <div className="flex flex-col items-center gap-1">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
              <span>Quero acesso</span>
              <span>vitalício</span>
            </div>
          </button>
        </div>
      </div>

      {/* Barra de progresso do tempo - funcional e progressiva */}
      <div className="mt-3 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 overflow-hidden">
        <motion.div 
          className={`h-1.5 rounded-full transition-colors duration-500 ${
            timeLeft <= 60 ? 'bg-red-500' : timeLeft <= 180 ? 'bg-orange-500' : 'bg-[#FF6B00]'
          }`}
          initial={{ width: "100%" }}
          animate={{ width: `${progressPercentage}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>

      

      {/* Texto de urgência */}
      {timeLeft <= 180 && timeLeft > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-2 text-center"
        >
          <div className={`text-xs font-medium ${
            timeLeft <= 60 ? 'text-red-600' : 'text-orange-600'
          }`}>
            ⚡ Oferta por tempo limitado!
          </div>
        </motion.div>
      )}

      {/* Alerta quando o tempo acaba */}
      {timeLeft <= 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mt-2 text-center"
        >
          <div className="text-sm font-bold text-red-600 bg-red-50 dark:bg-red-900/20 rounded-lg p-2">
            🔥 Tempo esgotado! Não perca esta oportunidade!
          </div>
        </motion.div>
      )}

      {/* Modal de Acesso Vitalício */}
      <AcessoVitalicioModal 
        isOpen={showModal} 
        onClose={() => setShowModal(false)} 
      />

      {/* Estilos CSS para animações */}
      <style jsx>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 0.2;
            transform: scale(1);
          }
          50% {
            opacity: 0.4;
            transform: scale(1.1);
          }
        }
        
        svg circle:hover {
          transform: scale(1.2);
          transition: transform 0.2s ease-out;
        }
        
        svg text {
          pointer-events: none;
        }
      `}</style>
    </motion.div>
  );
};

export interface ContextualizationData {
  materias: string;
  publicoAlvo: string;
  restricoes: string;
  datasImportantes?: string;
  observacoes?: string;
}

export interface ActionPlanItem {
  id: string;
  title: string;
  description: string;
  duration?: string;
  difficulty?: string;
  category?: string;
  type?: string;
  approved: boolean;
  isTrilhasEligible?: boolean;
  customFields?: Record<string, string>;
  isManual?: boolean;
  isBuilt?: boolean;
}

interface CardDeConstrucaoProps {
  step: 'contextualization' | 'actionPlan' | 'generating' | 'generatingActivities' | 'construction' | 'activities';
  contextualizationData?: ContextualizationData | null;
  actionPlan?: ActionPlanItem[] | null;
  onSubmitContextualization: (data: ContextualizationData) => void;
  onApproveActionPlan: (approvedItems: ActionPlanItem[]) => void;
  onResetFlow: () => void;
  isLoading?: boolean;
}

export function CardDeConstrucao({ 
  step, 
  contextualizationData, 
  actionPlan, 
  onSubmitContextualization, 
  onApproveActionPlan, 
  onResetFlow,
  isLoading 
}: CardDeConstrucaoProps) {
  const [localContextData, setLocalContextData] = useState<ContextualizationData>({
    materias: '',
    publicoAlvo: '',
    restricoes: '',
    datasImportantes: '',
    observacoes: ''
  });

  const [actionPlanItems, setActionPlanItems] = useState<ActionPlanItem[]>([]);
  const [selectedActivities, setSelectedActivities] = useState<ActionPlanItem[]>([]);
  // Form data for contextualization
  const [formData, setFormData] = useState<ContextualizationData>({
    materias: "",
    publicoAlvo: "",
    restricoes: "",
    datasImportantes: "",
    observacoes: "",
  });

  // Selected activities for action plan
  const [selectedActivities2, setSelectedActivities2] = useState<ActionPlanItem[]>([]);

  // Filter state for action plan
  const [filterState, setFilterState] = useState<'all' | 'selected'>('all');

  // View mode state (list or grid)
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  // Debug state for trilhas system
  const [showTrilhasDebug, setShowTrilhasDebug] = useState<boolean>(false);

  // Estado para mostrar a interface de adicionar atividade manual
  const [showAddActivityInterface, setShowAddActivityInterface] = useState(false);

  // Manual activity addition state
  const [manualActivities, setManualActivities] = useState<ActionPlanItem[]>([]);

  // Manual activity form state
  const [manualActivityForm, setManualActivityForm] = useState({
    title: '',
    typeId: '',
    description: ''
  });

  // State for activity building process
  const [isBuilding, setIsBuilding] = useState(false);

  // State for tracking building progress
  const [progress, setProgress] = useState<{
    total: number;
    completed: number;
    current: string;
    errors: string[];
  } | null>(null);

  // Function to simulate activity building
  const buildActivities = async (activities: ActionPlanItem[], contextData?: any): Promise<boolean> => {
    setIsBuilding(true);
    setProgress({
      total: activities.length,
      completed: 0,
      current: '',
      errors: []
    });

    let allSuccess = true;

    for (let i = 0; i < activities.length; i++) {
      const activity = activities[i];
      setProgress(prev => ({
        ...prev,
        current: `Construindo ${activity.title} (${i + 1}/${activities.length})`
      }));

      try {
        // Simulate building
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Simulate occasional errors
        if (Math.random() < 0.2) {
          throw new Error(`Falha ao construir ${activity.title}`);
        }

        setProgress(prev => ({
          ...prev,
          completed: prev.completed + 1
        }));
      } catch (error: any) {
        console.error(error);
        allSuccess = false;
        setProgress(prev => ({
          ...prev,
          errors: [...prev.errors, error.message]
        }));
      }
    }

    setIsBuilding(false);
    setProgress(prev => ({ ...prev, current: 'Finalizado!' }));
    return allSuccess;
  };

  // Load existing data when component mounts
  useEffect(() => {
    if (contextualizationData) {
      setFormData(contextualizationData);
    }
  }, [contextualizationData]);

  // Handle form input changes
  const handleInputChange = (
    field: keyof ContextualizationData,
    value: string,
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Handle contextualization form submission
  const handleSubmitContextualization = () => {
    if (onSubmitContextualization) {
      onSubmitContextualization(formData);
    }
  };

  // Handle activity selection toggle
  const handleActivityToggle = (activity: ActionPlanItem) => {
    setSelectedActivities2((prev) => {
      const isSelected = prev.some((item) => item.id === activity.id);
      if (isSelected) {
        return prev.filter((item) => item.id !== activity.id);
      } else {
        return [...prev, { ...activity, approved: true }];
      }
    });
  };

  useEffect(() => {
    if (actionPlan) {
      console.log('🎯 ActionPlan recebido no CardDeConstrucao:', actionPlan);
      const approved = actionPlan.filter(item => item.approved);
      setSelectedActivities2(approved);

      // Se estivermos na etapa de atividades, também atualizar selectedActivities
      if (step === 'activities') {
        setSelectedActivities(approved);
      }
    }
  }, [actionPlan, step]);

  const handleApproveActionPlan = () => {
    console.log('✅ Plano de ação aprovado! Transitando para interface de construção...');
    console.log('📋 Atividades selecionadas:', selectedActivities2.map(a => a.title));

    // Atualizar estado local imediatamente
    setSelectedActivities(selectedActivities2);

    // Aprovar plano e passar as atividades selecionadas
    onApproveActionPlan(selectedActivities2);
  };

  // Handle manual activity form submission
  const handleAddManualActivity = () => {
    if (!manualActivityForm.title.trim() || !manualActivityForm.typeId || !manualActivityForm.description.trim()) {
      return;
    }

    // Find the activity type from schoolPowerActivities
    const activityType = schoolPowerActivities.find(activity => activity.id === manualActivityForm.typeId);

    const newManualActivity: ActionPlanItem = {
      id: manualActivityForm.typeId,
      title: manualActivityForm.title,
      description: manualActivityForm.description,
      duration: "Personalizado",
      difficulty: "Personalizado", 
      category: activityType?.tags[0] || "manual",
      type: activityType?.name || "Atividade Manual",
      isManual: true,
      approved: false,
      customFields: {} // Atividades manuais também podem ter customFields
    };

    // Add to manual activities list
    setManualActivities(prev => [...prev, newManualActivity]);

    // Clear form
    setManualActivityForm({
      title: '',
      typeId: '',
      description: ''
    });

    // Return to action plan interface
    setShowAddActivityInterface(false);
  };

  // Handle manual activity form changes
  const handleManualFormChange = (field: string, value: string) => {
    setManualActivityForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Get combined activities (AI suggestions + manual)
  const getCombinedActivities = () => {
    const aiActivities = actionPlan || [];
    const allActivities = [...aiActivities, ...manualActivities];
    return allActivities;
  };

  // Check if contextualization form is valid
  const isContextualizationValid =
    formData.materias.trim() && formData.publicoAlvo.trim();

  // Grid Toggle Component
  const GridToggleComponent = ({ viewMode, onToggle }: {
    viewMode: 'list' | 'grid';
    onToggle: () => void;
  }) => {
    return (
      <button
        onClick={onToggle}
        className="w-9 h-9 flex items-center justify-center rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-750 hover:from-[#FF6B00]/5 hover:to-[#FF9248]/5 dark:hover:from-[#FF6B00]/10 dark:hover:to-[#FF9248]/10 border border-gray-200 dark:border-gray-600 hover:border-[#FF6B00]/30 transition-all duration-300 shadow-sm hover:shadow-md"
        title={viewMode === 'list' ? 'Visualização em Grade' : 'Visualização em Lista'}
      >
        {viewMode === 'list' ? (
          <svg className="w-4 h-4 text-gray-600 dark:text-gray-300 hover:text-[#FF6B00] transition-colors duration-200" fill="currentColor" viewBox="0 0 20 20">
            <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
          </svg>
        ) : (
          <svg className="w-4 h-4 text-gray-600 dark:text-gray-300 hover:text-[#FF6B00] transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
          </svg>
        )}
      </button>
    );
  };

  // Filter Component
  const FilterComponent = ({ activities, selectedActivities2, onFilterApply }: {
    activities: ActionPlanItem[];
    selectedActivities2: ActionPlanItem[];
    onFilterApply: (filterType: string) => void;
  }) => {
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const filterRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
          setIsFilterOpen(false);
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
      <div className="relative" ref={filterRef}>
        <button
          onClick={() => setIsFilterOpen(!isFilterOpen)}
          className="w-9 h-9 flex items-center justify-center rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-750 hover:from-[#FF6B00]/5 hover:to-[#FF9248]/5 dark:hover:from-[#FF6B00]/10 dark:hover:to-[#FF9248]/10 border border-gray-200 dark:border-gray-600 hover:border-[#FF6B00]/30 transition-all duration-300 shadow-sm hover:shadow-md"
          title="Filtros e Ações"
        >
          <Filter className="w-4 h-4 text-gray-600 dark:text-gray-300 hover:text-[#FF6B00] transition-colors duration-200" />
        </button>

        {isFilterOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
            className="absolute top-full right-0 mt-3 w-56 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-600 overflow-hidden z-50 backdrop-blur-sm"
            style={{
              background: `
                linear-gradient(135deg, 
                  rgba(255, 255, 255, 0.95) 0%, 
                  rgba(248, 250, 252, 0.98) 100%
                )
              `,
              ...(typeof window !== "undefined" &&
              window.matchMedia("(prefers-color-scheme: dark)").matches
                ? {
                    background: `
                  linear-gradient(135deg, 
                    rgba(31, 41, 55, 0.95) 0%, 
                    rgba(17, 24, 39, 0.98) 100%
                  )
                `,
                  }
                : {}),
            }}
          >
            <div className="p-2">
              <div className="px-3 py-2 border-b border-gray-200 dark:border-gray-600">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <Filter className="w-4 h-4 text-[#FF6B00]" />
                  Filtros e Ações
                </h3>
              </div>

              <div className="py-1 space-y-1">
                <button
                  onClick={() => {
                    onFilterApply('selectAll');
                    setIsFilterOpen(false);
                  }}
                  className="w-full px-3 py-2.5 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-[#FF6B00]/10 hover:to-[#FF9248]/5 rounded-lg transition-all duration-200 flex items-center gap-3 group"
                >
                  <CheckSquare className="w-4 h-4 text-[#FF6B00] group-hover:scale-110 transition-transform duration-200" />
                  <span className="font-medium">Selecionar todos</span>
                </button>

                <button
                  onClick={() => {
                    onFilterApply('selectRecommended');
                    setIsFilterOpen(false);
                  }}
                  className="w-full px-3 py-2.5 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-[#FF6B00]/10 hover:to-[#FF9248]/5 rounded-lg transition-all duration-200 flex items-center gap-3 group"
                >
                  <svg className="w-4 h-4 text-[#FF6B00] group-hover:scale-110 transition-transform duration-200" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                  </svg>
                  <span className="font-medium">Selecionar recomendações</span>
                </button>

                <div className="border-t border-gray-200 dark:border-gray-600 my-1"></div>

                <button
                  onClick={() => {
                    onFilterApply('viewSelected');
                    setIsFilterOpen(false);
                  }}
                  className="w-full px-3 py-2.5 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-blue-500/10 hover:to-blue-600/5 rounded-lg transition-all duration-200 flex items-center gap-3 group"
                >
                  <svg className="w-4 h-4 text-blue-500 group-hover:scale-110 transition-transform duration-200" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="font-medium">Ver apenas selecionados</span>
                </button>

                <button
                  onClick={() => {
                    onFilterApply('clearSelected');
                    setIsFilterOpen(false);
                  }}
                  className="w-full px-3 py-2.5 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-red-500/10 hover:to-red-600/5 rounded-lg transition-all duration-200 flex items-center gap-3 group"
                >
                  <svg className="w-4 h-4 text-red-500 group-hover:scale-110 transition-transform duration-200" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                  <span className="font-medium">Tirar selecionados</span>
                </button>

                <button
                  onClick={() => {
                    onFilterApply('viewAll');
                    setIsFilterOpen(false);
                  }}
                  className="w-full px-3 py-2.5 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-gray-500/10 hover:to-gray-600/5 rounded-lg transition-all duration-200 flex items-center gap-3 group"
                >
                  <svg className="w-4 h-4 text-gray-500 group-hover:scale-110 transition-transform duration-200" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                  </svg>
                  <span className="font-medium">Ver todas</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    );
  };

  // Handle filter actions
  const handleFilterApply = (filterType: string) => {
    const combinedActivities = getCombinedActivities();
    if (combinedActivities.length === 0) return;

    switch (filterType) {
      case 'selectAll':
        setSelectedActivities2([...combinedActivities]);
        setFilterState('all');
        break;
      case 'selectRecommended':
        // Seleciona as 3 primeiras atividades como "recomendadas"
        const recommended = combinedActivities.slice(0, Math.min(3, combinedActivities.length));
        setSelectedActivities2(recommended);
        setFilterState('all');
        break;
      case 'viewSelected':
        setFilterState('selected');
        break;
      case 'clearSelected':
        setSelectedActivities2([]);
        setFilterState('all');
        break;
      case 'viewAll':
        setFilterState('all');
        break;
      default:
        break;
    }
  };

  const getIconByActivityId = (activityId: string) => {
    // Sistema de mapeamento 100% único - cada ID tem seu próprio ícone específico
    const uniqueIconMapping: { [key: string]: any } = {
      "atividade-adaptada": Heart,
      "atividades-contos-infantis": BookOpen,
      "atividades-ia": Brain,
      "atividades-matematica": Target,
      "atividades-ortografia-alfabeto": PenTool,
      "aulas-eletivas": Star,
      "bncc-descomplicada": BookOpen,
      "caca-palavras": Puzzle,
      "capitulo-livro": BookOpen,
      "charadas": Puzzle,
      "chatbot-bncc": MessageSquare,
      "consulta-video": Video,
      "corretor-gramatical": CheckSquare,
      "corretor-provas-feedback": CheckSquare,
      "corretor-provas-papel": FileText,
      "corretor-questoes": PenTool,
      "corretor-redacao": PenTool,
      "criterios-avaliacao": CheckSquare,
      "desenho-simetrico": Puzzle,
      "desenvolvimento-caligrafia": PenTool,
      "dinamicas-sala-aula": Users,
      "emails-escolares": Mail,
      "erros-comuns": Search,
      "exemplos-contextualizados": BookOpen,
      "experimento-cientifico": Microscope,
      "fichamento-obra-literaria": BookOpen,
      "gerador-tracejados": PenTool,
      "historias-sociais": Heart,
      "ideias-atividades": Lightbulb,
      "ideias-aulas-acessiveis": Heart,
      "ideias-avaliacoes-adaptadas": Heart,
      "ideias-brincadeiras-infantis": Play,
      "ideias-confraternizacoes": Users,
      "ideias-datas-comemorativas": Calendar,
      "imagem-para-colorir": Palette,
      "instrucoes-claras": FileText,
      "jogos-educacionais-interativos": Gamepad2,
      "jogos-educativos": Puzzle,
      "lista-exercicios": FileText,
      "lista-vocabulario": BookOpen,
      "maquete": Wrench,
      "mapa-mental": Brain,
      "mensagens-agradecimento": Heart,
      "musica-engajar": Music,
      "niveador-textos": BookOpen,
      "objetivos-aprendizagem": Target,
      "palavras-cruzadas": Puzzle,
      "pei-pdi": Heart,
      "perguntas-taxonomia-bloom": MessageSquare,
      "pergunte-texto": MessageSquare,
      "plano-aula": BookOpen,
      "plano-ensino": BookOpen,
      "plano-recuperacao": Heart,
      "projeto": Wrench,
      "projeto-vida": Star,
      "proposta-redacao": PenTool,
      "prova": CheckSquare,
      "questoes-pdf": FileText,
      "questoes-site": Globe,
      "questoes-texto": FileText,
      "questoes-video": Video,
      "redacao": PenTool,
      "reescritor-texto": PenTool,
      "reflexao-incidente": MessageSquare,
      "relatorio": FileText,
      "relatorio-desempenho": Trophy,
      "resposta-email": Mail,
      "revisor-gramatical": CheckSquare,
      "revisao-guiada": BookOpen,
      "resumo": FileText,
      "resumo-texto": FileText,
      "resumo-video": Video,
      "sequencia-didatica": BookOpen,
      "simulado": CheckSquare,
      "sugestoes-intervencao": Lightbulb,
      "tabela-apoio": Puzzle,
      "tarefa-adaptada": Heart,
      "texto-apoio": BookOpen,
      "gerar-questoes": PenTool,
      "apresentacao-slides": Target,
      "tornar-relevante": Star
    };

    // Verifica se existe mapeamento direto para o ID
    if (uniqueIconMapping[activityId]) {
      return uniqueIconMapping[activityId];
    }

    // Sistema de fallback com hash consistente para IDs não mapeados
    const fallbackIcons = [
      BookOpen, FileText, PenTool, Search, Brain,
      Users, MessageSquare, Presentation, ThumbsUp, Heart,
      Wrench, Target, Compass, Trophy, Edit3,
      Calendar, Clock, CheckSquare, Star, Award,
      Microscope, Calculator, Eye, Globe, MapPin,
      Music, Palette, Camera, Video, Headphones,
      Lightbulb, Zap, Flag, Key, Shield,
      TreePine, Sun, Cloud, Home, Car
    ];

    // Gera hash consistente baseado no ID
    let hash = 0;
    for (let i = 0; i < activityId.length; i++) {
      const char = activityId.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }

    const iconIndex = Math.abs(hash) % fallbackIcons.length;
    return fallbackIcons[iconIndex];
  };

  const [selectedTrilhasCount, setSelectedTrilhasCount] = useState(0);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<ActionPlanItem | null>(null);

  useEffect(() => {
    const trilhasActivityIds = [
      'projeto-pesquisa',
      'projeto-cientifico',
      'projeto-criativo',
      'projeto-colaborativo',
      'projeto-individual',
      'projeto-inovacao',
      'projeto-sustentabilidade',
      'projeto-social',
      'projeto-tecnologico',
      'projeto-artistico',
      'projeto-empreendedor',
      'projeto-interdisciplinar',
      'projeto-experimental',
      'projeto-aplicado',
      'projeto-extensao',
      'projeto-integrador',
      'projeto-final',
    ];

    const selectedTrilhas = selectedActivities2.filter(activity =>
      trilhasActivityIds.includes(activity.id)
    );

    setSelectedTrilhasCount(selectedTrilhas.length);
  }, [selectedActivities2]);

  // Helper function to store auto-filled data and manage modal state
  const storeAutoData = (
    activity: ActionPlanItem, 
    processedFormData: any, 
    customFields: Record<string, string> | undefined, 
    originalData: ActionPlanItem, 
    actionPlanActivity: ActionPlanItem | undefined
  ) => {
    const autoDataKey = `auto_activity_data_${activity.id}`;
    const autoData = {
      formData: processedFormData,
      customFields: customFields || {},
      originalActivity: originalData,
      actionPlanActivity: actionPlanActivity,
      timestamp: Date.now()
    };

    localStorage.setItem(autoDataKey, JSON.stringify(autoData));
    console.log('💾 Dados automáticos salvos para:', activity.id);
    console.log('📋 Form data preparado:', processedFormData);
    console.log('🔧 Custom fields salvos:', customFields);

    // Update modal state
    if (typeof setSelectedActivity === 'function') {
      setSelectedActivity(activity);
    }
    if (typeof setShowEditModal === 'function') {
      setShowEditModal(true);
    }
  };

  // Adicionar preenchimento automático dos campos do modal com dados da IA
  const handleEditActivity = (activity: any) => {
    console.log('🔧 Editando atividade:', activity.id);
    console.log('🔍 Dados completos da atividade:', activity);

    // Buscar dados da atividade no action plan se disponível
    const actionPlanActivity = selectedActivities2?.find(item => item.id === activity.id) || 
                               actionPlan?.find(item => item.id === activity.id);

    // Também verificar nos dados originais da atividade
    const originalData = activity.originalData || activity;

    console.log('📊 Action plan activity encontrada:', actionPlanActivity);
    console.log('📊 Dados originais da atividade:', originalData);

    // Coletar todos os customFields disponíveis
    const customFields = {
      ...originalData?.customFields,
      ...actionPlanActivity?.customFields
    };

    console.log('🗂️ Custom fields consolidados:', customFields);

    if (customFields && Object.keys(customFields).length > 0) {
      console.log('📋 Preenchendo automaticamente com dados da IA:', customFields);

      // Processamento específico para diferentes tipos de atividades
      let autoFormData;
      if (activity.id === 'sequencia-didatica') {
        autoFormData = processSequenciaDidaticaData({
          id: activity.id,
          title: actionPlanActivity?.title || activity.title || originalData?.title || '',
          description: actionPlanActivity?.description || activity.description || originalData?.description || '',
          customFields: customFields
        });

        console.log('🔧 Dados processados para Sequência Didática:', autoFormData);
      } else if (activity.id === 'quadro-interativo') {
        console.log('🖼️ Processando atividade Quadro Interativo do Action Plan');
        const processedData = processQuadroInterativoData(activity);
        console.log('📊 Dados processados para armazenamento:', processedData);
        storeAutoData(activity, processedData, customFields, originalData, actionPlanActivity);
      } else {
        // Processamento padrão para outras atividades
        autoFormData = {
          title: actionPlanActivity?.title || activity.title || originalData?.title || '',
          description: actionPlanActivity?.description || activity.description || originalData?.description || '',
          subject: customFields['Disciplina'] || customFields['disciplina'] || 'Português',
          theme: customFields['Tema'] || customFields['tema'] || customFields['Tema das Palavras'] || customFields['Tema do Vocabulário'] || '',
          schoolYear: customFields['Ano de Escolaridade'] || customFields['anoEscolaridade'] || customFields['ano'] || '',
          numberOfQuestions: customFields['Quantidade de Questões'] || customFields['quantidadeQuestoes'] || customFields['Quantidade de Palavras'] || '10',
          difficultyLevel: customFields['Nível de Dificuldade'] || customFields['nivelDificuldade'] || customFields['dificuldade'] || 'Médio',
          questionModel: customFields['Modelo de Questões'] || customFields['modeloQuestoes'] || customFields['Tipo de Avaliação'] || '',
          sources: customFields['Fontes'] || customFields['fontes'] || customFields['Referencias'] || '',
          objectives: customFields['Objetivos'] || customFields['objetivos'] || customFields['Competências Trabalhadas'] || '',
          materials: customFields['Materiais'] || customFields['materiais'] || customFields['Recursos Visuais'] || '',
          instructions: customFields['Instruções'] || customFields['instrucoes'] || customFields['Estratégias de Leitura'] || customFields['Atividades Práticas'] || '',
          evaluation: customFields['Critérios de Correção'] || customFields['Critérios de Avaliação'] || customFields['criteriosAvaliacao'] || '',
          // Campos adicionais específicos
          timeLimit: customFields['Tempo de Prova'] || customFields['Tempo Limite'] || customFields['tempoLimite'] || '',
          context: customFields['Contexto de Aplicação'] || customFields['Contexto de Uso'] || customFields['contexto'] || '',
          textType: customFields['Tipo de Texto'] || customFields['tipoTexto'] || '',
          textGenre: customFields['Gênero Textual'] || customFields['generoTextual'] || '',
          textLength: customFields['Extensão do Texto'] || customFields['extensaoTexto'] || '',
          associatedQuestions: customFields['Questões Associadas'] || customFields['questoesAssociadas'] || '',
          competencies: customFields['Competências Trabalhadas'] || customFields['competencias'] || '',
          readingStrategies: customFields['Estratégias de Leitura'] || customFields['estrategiasLeitura'] || '',
          visualResources: customFields['Recursos Visuais'] || customFields['recursosVisuais'] || '',
          practicalActivities: customFields['Atividades Práticas'] || customFields['atividadesPraticas'] || '',
          wordsIncluded: customFields['Palavras Incluídas'] || customFields['palavrasIncluidas'] || '',
          gridFormat: customFields['Formato da Grade'] || customFields['formatoGrade'] || '',
          providedHints: customFields['Dicas Fornecidas'] || customFields['dicasFornecidas'] || '',
          vocabularyContext: customFields['Contexto de Uso'] || customFields['contextoUso'] || '',
          language: customFields['Idioma'] || customFields['idioma'] || '',
          associatedExercises: customFields['Exercícios Associados'] || customFields['exerciciosAssociados'] || '',
          knowledgeArea: customFields['Área de Conhecimento'] || customFields['areaConhecimento'] || '',
          complexityLevel: customFields['Nível de Complexidade'] || customFields['nivelComplexidade'] || ''
        };
      }

      // Salvar dados automáticos no localStorage para o modal usar
      // A lógica de salvar no localStorage e abrir o modal foi movida para a função storeAutoData
      // A chamada para storeAutoData é feita dentro dos blocos if/else acima.
    } else {
      console.warn('⚠️ Nenhum customField encontrado para preenchimento automático');
      // Se não houver custom fields, ainda assim abrir o modal se for o caso
      if (typeof setSelectedActivity === 'function') {
        setSelectedActivity(activity);
      }
      if (typeof setShowEditModal === 'function') {
        setShowEditModal(true);
      }
    }
  };

  const handleUpdateActivity = async (updatedActivity: any) => {
    console.log('💾 Atualizando atividade:', updatedActivity);

    // Atualiza o plano de ação com a atividade modificada
    const newActionPlan = actionPlan?.map(activity => 
      activity.id === updatedActivity.id ? updatedActivity : activity
    ) || []; // Garante que newActionPlan seja sempre um array

    // Atualiza o estado local com o novo plano de ação
    setActionPlanItems(newActionPlan);
    setSelectedActivities2(newActionPlan.filter(item => item.approved)); // Atualiza selectedActivities2 também

    // Sincronizar com localStorage se necessário
    try {
      const flowData = JSON.parse(localStorage.getItem('schoolPowerFlow') || '{}');
      if (flowData.actionPlan) {
        flowData.actionPlan = newActionPlan;
        localStorage.setItem('schoolPowerFlow', JSON.stringify(flowData));
        console.log('✅ Dados do plano de ação sincronizados no localStorage');
      }
    } catch (error) {
      console.error('Erro ao sincronizar plano de ação com localStorage:', error);
    }
  };

  const handleRemoveActivity = (activityId: string) => {
    const newActionPlan = actionPlan?.filter(activity => activity.id !== activityId) || []; // Garante que newActionPlan seja sempre um array
    setActionPlanItems(newActionPlan);
    setSelectedActivities2(newActionPlan.filter(item => item.approved)); // Atualiza selectedActivities2 também

    // Também remover do localStorage
    try {
      const flowData = JSON.parse(localStorage.getItem('schoolPowerFlow') || '{}');
      if (flowData.actionPlan) {
        flowData.actionPlan = newActionPlan;
        localStorage.setItem('schoolPowerFlow', JSON.stringify(flowData));
        console.log('✅ Atividade removida e plano de ação sincronizado no localStorage');
      }
    } catch (error) {
      console.error('Erro ao remover atividade do localStorage:', error);
    }
  };

  // Determina se estamos na página de Quiz verificando a URL
  const isQuizMode = typeof window !== 'undefined' && window.location.pathname.includes('/quiz');

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 50 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8, y: -50 }}
      transition={{
        duration: 0.6,
        ease: [0.25, 0.1, 0.25, 1],
        type: "spring",
        stiffness: 100,
        damping: 15,
      }}
      className="relative rounded-2xl p-6 shadow-2xl border border-[#FF6B00]/30 dark:border-[#FF6B00]/30 bg-white dark:bg-[#021321]"
      style={{
        width: "1353px",
        height: "773px"
      }}
      data-theme="adaptive"
    >
      {/* Cabeçalho Persistente Fixo */}
      <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-r from-[#FF6B00] to-[#FF9248] rounded-t-2xl flex items-center justify-between px-6 z-0">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
            {step === "contextualization" ? (
              <svg
                className="w-7 h-7 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            ) : step === "actionPlan" ? (
              <svg
                className="w-7 h-7 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                />
              </svg>
            ) : (
              <svg
                className="w-7 h-7 text-white animate-spin"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            )}
          </div>
          <div>
            <h1 className="text-white font-bold text-2xl">
              {step === "contextualization"
                ? "Quiz de Contextualização"
                : step === "actionPlan"
                  ? "Plano de Ação"
                  : step === "generating"
                    ? "Gerando Conteúdo..."
                    : step === "activities"
                      ? "Construção de Atividades"
                      : "School Power"}
            </h1>
          </div>
        </div>

        {/* Barra de Progresso */}
        <div className="flex items-center gap-4">
          <div className="relative flex items-center justify-between w-44">
            {/* Background progress line */}
            <div className="absolute top-1/2 transform -translate-y-1/2 h-1.5 bg-white/30 rounded-full z-0" style={{ left: '16px', right: '16px' }}></div>

            {/* Active progress line */}
            <div 
              className="absolute top-1/2 transform -translate-y-1/2 h-1.5 bg-white rounded-full z-0 transition-all duration-500 ease-out"
              style={{ 
                left: '16px',
                width: `${
                  step === "contextualization" ? "0%" :
                  step === "actionPlan" ? "50%" :
                  (step === "generating" || step === "generatingActivities" || step === "activities") ? "100%" : "0%"
                }`
              }}
            ></div>

            {/* Step indicators */}
            <div className={`relative z-10 w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
              step === "contextualization" ? 'bg-white border-white text-[#FF6B00]' : 'bg-[#FF6B00] border-white text-white'
            }`}>
              {step === "contextualization" ? (
                <span className="text-sm font-semibold">1</span>
              ) : (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </div>

            <div className={`relative z-10 w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
              step === "actionPlan" ? 'bg-white border-white text-[#FF6B00]' :
              (step === "generating" || step === "generatingActivities" || step === "activities") ? 'bg-[#FF6B00] border-white text-white' :
              'bg-white/20 border-white/30 text-white'
            }`}>
              {step === "actionPlan" ? (
                <span className="text-sm font-semibold">2</span>
              ) : (step === "generating" || step === "generatingActivities" || step === "activities") ? (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              ) : (
                <span className="text-sm font-semibold">2</span>
              )}
            </div>

            <div className={`relative z-10 w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
              (step === "generating" || step === "generatingActivities" || step === "activities") ? 'bg-white border-white text-[#FF6B00]' : 'bg-white/20 border-white/30 text-white'
            }`}>
              <span className="text-sm font-semibold">3</span>
            </div>
          </div>
        </div>
      </div>

      {/* Renderização condicional baseada no step */}
      {step === "generating" || step === "generatingActivities" ? (
        <motion.div
          className="relative z-10 flex flex-col items-center justify-center h-full text-center px-4 pt-16"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="relative mb-4">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#FF6B00]/20 border-t-[#FF6B00] mx-auto"></div>
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[#FF6B00]/10 to-transparent animate-pulse"></div>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-3">
            {step === "generating"
              ? "🤖 Analisando com IA Gemini"
              : "🎯 Gerando Atividades"}
          </h3>
          <p className="text-gray-700 dark:text-gray-300 mb-4 max-w-lg text-sm sm:text-base">
            {step === "generating"
              ? "A IA está processando sua mensagem e contexto para criar um plano de ação personalizado..."
              : "As atividades aprovadas estão sendo geradas automaticamente pelo School Power..."}
          </p>
          <div className="bg-gradient-to-r from-[#FF6B00]/10 to-orange-100/20 dark:to-[#29335C]/10 rounded-lg p-3 sm:p-4 mb-4 border border-[#FF6B00]/20 max-w-md w-full">
            <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
              {step === "generating" ? (
                <>
                  ✨ Consultando 137 atividades disponíveis
                  <br />
                  🎯 Personalizando para seu contexto específico
                  <br />
                  📝 Gerando sugestões inteligentes
                  <br />
                  🔍 Validando compatibilidade das atividades
                </>
              ) : (
                <>
                  ✅ Personalizando conteúdo das atividades
                  <br />
                  🎨 Criando materiais visuais
                  <br />
                  📝 Formatando atividades finais
                  <br />
                  🚀 Preparando download
                </>
              )}
            </p>
          </div>
          <div className="flex gap-3 justify-center">
            {onResetFlow && (
              <button
                onClick={onResetFlow}
                className="px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white border border-gray-400 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
              >
                Cancelar
              </button>
            )}
          </div>
        </motion.div>
      ) : step === "activities" ? (
        <motion.div
          key="activities-content"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="relative z-10 h-full flex flex-col pt-16"
        >
          <div className="flex items-center justify-end mb-4">
            {/* Botão de voltar - escondido em modo Quiz */}
            {!isQuizMode && (
              <div className="absolute top-4 right-4 z-20">
                <button
                  onClick={onResetFlow}
                  className="flex items-center gap-2 px-3 py-2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-lg border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
                >
                  Voltar ao início
                </button>
              </div>
            )}
          </div>

          {/* Interface de Construção */}
          <div className="flex-1 overflow-hidden relative">
            {console.log('🎯 CardDeConstrucao: Passando atividades para ConstructionInterface:', selectedActivities.length > 0 ? selectedActivities : selectedActivities2)}
            <ConstructionInterface 
              approvedActivities={selectedActivities.length > 0 ? selectedActivities : selectedActivities2} 
              handleEditActivity={handleEditActivity} 
            />
            
            {/* Cronômetro e Botão de Acesso Vitalício - Apenas na página de Quiz */}
            {isQuizMode && selectedActivities.length > 0 && (
              <TimerCard />
            )}
          </div>
        </motion.div>
      ) : (
        <motion.div
          className="relative z-10 h-full flex flex-col pt-16"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <div className="text-center mb-4 sm:mb-6"></div>

          {step === "contextualization" ? (
            <motion.div
              key="contextualization-content"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className="flex-1 flex flex-col overflow-hidden"
            >
              <div
                className="flex-1 overflow-y-auto space-y-3 sm:space-y-4 mb-3 sm:mb-4 pr-1 sm:pr-2"
                style={{
                  maxHeight: "calc(100vh - 200px)",
                  minHeight: "400px",
                  scrollbarWidth: "thin",
                  scrollbarColor: "#FF6B00 rgba(255,107,0,0.1)",
                }}
              >
                <div>
                  <label className="block text-sm font-semibold text-gray-800 dark:text-white mb-2">
                    📚 Quais matérias e temas serão trabalhados? *
                  </label>
                  <textarea
                    value={formData.materias}
                    onChange={(e) =>
                      handleInputChange("materias", e.target.value)
                    }
                    className="w-full p-2 sm:p-3 border-2 border-[#FF6B00]/30 dark:border-[#FF6B00]/40 bg-white/90 dark:bg-gray-800/80 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-[#FF6B00] focus:border-[#FF6B00] transition-all duration-200 backdrop-blur-sm placeholder-gray-500 dark:placeholder-gray-400 text-sm"
                    rows={2}
                    placeholder="Descreva as matérias e temas que você quer estudar..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-800 dark:text-white mb-2">
                    🎯 Qual o público-alvo? *
                  </label>
                  <input
                    type="text"
                    value={formData.publicoAlvo}
                    onChange={(e) =>
                      handleInputChange("publicoAlvo", e.target.value)
                    }
                    className="w-full p-2 sm:p-3 border-2 border-[#FF6B00]/30 dark:border-[#FF6B00]/40 bg-white/90 dark:bg-gray-800/80 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-[#FF6B00] focus:border-[#FF6B00] transition-all duration-200 backdrop-blur-sm placeholder-gray-500 dark:placeholder-gray-400 text-sm"
                    placeholder="Ex: Ensino Médio, 3º ano, vestibular..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-800 dark:text-white mb-2">
                    ⚠️ Quais restrições ou preferências específicas? *
                  </label>
                  <textarea
                    value={formData.restricoes}
                    onChange={(e) =>
                      handleInputChange("restricoes", e.target.value)
                    }
                    className="w-full p-2 sm:p-3 border-2 border-[#FF6B00]/30 dark:border-[#FF6B00]/40 bg-white/90 dark:bg-gray-800/80 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-[#FF6B00] focus:border-[#FF6B00] transition-all duration-200 backdrop-blur-sm placeholder-gray-500 dark:placeholder-gray-400 text-sm"
                    rows={2}
                    placeholder="Descreva limitações de tempo, dificuldades específicas, etc..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-800 dark:text-white mb-2">
                    📅 Período de entrega ou datas importantes
                  </label>
                  <input
                    type="text"
                    value={formData.datasImportantes}
                    onChange={(e) =>
                      handleInputChange("datasImportantes", e.target.value)
                    }
                    className="w-full p-2 sm:p-3 border-2 border-[#FF6B00]/30 dark:border-[#FF6B00]/40 bg-white/90 dark:bg-gray-800/80 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-[#FF6B00] focus:border-[#FF6B00] transition-all duration-200 backdrop-blur-sm placeholder-gray-500 dark:placeholder-gray-400 text-sm"
                    placeholder="Ex: Prova em 2 semanas, ENEM em novembro..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-800 dark:text-white mb-2">
                    📝 Outras observações importantes
                  </label>
                  <textarea
                    value={formData.observacoes}
                    onChange={(e) =>
                      handleInputChange("observacoes", e.target.value)
                    }
                    className="w-full p-2 sm:p-3 border-2 border-[#FF6B00]/30 dark:border-[#FF6B00]/40 bg-white/90 dark:bg-gray-800/80 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-[#FF6B00] focus:border-[#FF6B00] transition-all duration-200 backdrop-blur-sm placeholder-gray-500 dark:placeholder-gray-400 text-sm"
                    rows={2}
                    placeholder="Informações adicionais que podem ajudar..."
                  />
                </div>
              </div>

              <div className="flex justify-end pt-3 sm:pt-4 border-t border-gray-300 dark:border-gray-700">
                <button
                  onClick={handleSubmitContextualization}
                  disabled={!isContextualizationValid || isLoading}
                  className="px-4 sm:px-6 py-2 sm:py-3 bg-[#FF6B00] hover:bg-[#D65A00] text-white font-semibold rounded-xl transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                >
                  {isLoading ? "Processando..." : "Gerar Plano de Aula"}
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="actionplan-content"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className="flex-1 flex flex-col overflow-hidden"
            >
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                  {showAddActivityInterface ? "Adicionar Atividade Manual" : "Atividades Sugeridas"}
                </h3>
                {!showAddActivityInterface && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowAddActivityInterface(true)}
                      className="w-9 h-9 flex items-center justify-center rounded-xl bg-gradient-to-br from-[#FF6B00]/10 to-[#FF9248]/5 hover:from-[#FF6B00]/20 hover:to-[#FF9248]/10 border border-[#FF6B00]/30 hover:border-[#FF6B00]/50 transition-all duration-300 shadow-sm hover:shadow-md"
                      title="Adicionar Atividade Manual"
                    >
                      <svg className="w-4 h-4 text-[#FF6B00] transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                      </svg>
                    </button>
                    <div className="bg-[#FF6B00]/10 text-[#FF6B00] px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium">
                      {selectedActivities2.length} selecionada
                      {selectedActivities2.length !== 1 ? "s" : ""}
                      {selectedTrilhasCount > 0 && (
                        <span className="ml-1 text-orange-600">
                          ({selectedTrilhasCount} trilha{selectedTrilhasCount !== 1 ? "s" : ""})
                        </span>
                      )}
                    </div>
                    <GridToggleComponent 
                      viewMode={viewMode}
                      onToggle={() => setViewMode(viewMode === 'list' ? 'grid' : 'list')}
                    />
                    <FilterComponent 
                      activities={getCombinedActivities()}
                      selectedActivities2={selectedActivities2}
                      onFilterApply={(filterType) => handleFilterApply(filterType)}
                    />
                  </div>
                )}
              </div>

              {showAddActivityInterface ? (
                <motion.div
                  className="flex-1 overflow-y-auto mb-3 sm:mb-4 pr-1 sm:pr-2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                  style={{
                    maxHeight: "calc(100vh - 250px)",
                    minHeight: "400px"
                  }}
                >
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-800 dark:text-white mb-2">
                        📝 Título da Atividade *
                      </label>
                      <input
                        type="text"
                        value={manualActivityForm.title}
                        onChange={(e) => handleManualFormChange('title', e.target.value)}
                        className="w-full p-2 sm:p-3 border-2 border-[#FF6B00]/30 dark:border-[#FF6B00]/40 bg-white/90 dark:bg-gray-800/80 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-[#FF6B00] focus:border-[#FF6B00] transition-all duration-200 backdrop-blur-sm placeholder-gray-500 dark:placeholder-gray-400"
                        placeholder="Ex: Lista de Exercícios sobre Funções"
                        maxLength={100}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-800 dark:text-white mb-2">
                        🎯 Tipo de Atividade *
                      </label>
                      <select
                        value={manualActivityForm.typeId}
                        onChange={(e) => handleManualFormChange('typeId', e.target.value)}
                        className="w-full p-2 sm:p-3 border-2 border-[#FF6B00]/30 dark:border-[#FF6B00]/40 bg-white/90 dark:bg-gray-800/80 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-[#FF6B00] focus:border-[#FF6B00] transition-all duration-200 backdrop-blur-sm"
                      >
                        <option value="">Selecione o tipo de atividade...</option>
                        {schoolPowerActivities.map((activity) => (
                          <option key={activity.id} value={activity.id}>
                            {activity.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-800 dark:text-white mb-2">
                        📋 Descrição da Atividade *
                      </label>
                      <textarea
                        value={manualActivityForm.description}
                        onChange={(e) => handleManualFormChange('description', e.target.value)}
                        className="w-full p-2 sm:p-3 border-2 border-[#FF6B00]/30 dark:border-[#FF6B00]/40 bg-white/90 dark:bg-gray-800/80 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-[#FF6B00] focus:border-[#FF6B00] transition-all duration-200 backdrop-blur-sm placeholder-gray-500 dark:placeholder-gray-400"
                        rows={4}
                        placeholder="Descreva detalhadamente o que você quer que seja feito nesta atividade..."
                        maxLength={500}
                      />
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {manualActivityForm.description.length}/500 caracteres
                      </div>
                    </div>

                    <div className="flex gap-3 pt-4">
                      <button
                        onClick={() => setShowAddActivityInterface(false)}
                        className="flex-1 px-4 py-3 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white border border-gray-400 dark:border-gray-600 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={handleAddManualActivity}
                        disabled={!manualActivityForm.title.trim() || !manualActivityForm.typeId || !manualActivityForm.description.trim()}
                        className="flex-1 px-4 py-3 bg-[#FF6B00] hover:bg-[#D65A00] text-white font-semibold rounded-xl transition-colors duration-200disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                        </svg>
                        Adicionar Atividade
                      </button>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <div
                  className={`flex-1 overflow-y-auto mb-3 sm:mb-4 pr-1 sm:pr-2 ${
                    viewMode === 'grid' 
                      ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 auto-rows-min' 
                      : 'space-y-2 sm:space-y-3'
                  }`}
                  style={{
                    maxHeight: "calc(100vh - 250px)",
                    minHeight: "500px",
                    scrollbarWidth: "thin",
                    scrollbarColor: "#FF6B00 rgba(255,107,0,0.1)",
                  }}
                >
                  {(filterState === 'selected' 
                    ? selectedActivities2 
                    : getCombinedActivities()
                  )?.map((activity, index) => {
                    const isSelected = selectedActivities2.some(
                      (item) => item.id === activity.id,
                    );

                    const badgeProps = getTrilhasBadgeProps(activity.id);

                    return (
                      <motion.div
                        key={activity.id}
                        className={`relative p-4 border-2 transition-all duration-300 cursor-pointer ${
                          viewMode === 'grid' ? 'rounded-[24px]' : 'rounded-[24px] mb-3'
                        } ${
                          isSelected
                            ? 'border-[#FF6B00] bg-[#FF6B00]/5 dark:bg-[#FF6B00]/10 shadow-lg transform scale-[1.01]'
                            : 'border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 hover:border-[#FF6B00]/50 hover:shadow-md'
                        }`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2, delay: Math.min(index * 0.03, 0.3) }}
                        onClick={() => handleActivityToggle(activity)}
                        style={{ minHeight: viewMode === 'grid' ? '180px' : '140px' }}
                      >
                        {/* Badge Manual - para atividades manuais */}
                        {activity.isManual && (
                          <div className={`absolute top-4 z-20 ${badgeProps.showBadge ? 'right-[131px]' : 'right-4'}`}>
                            <div className="flex items-center gap-3 px-4 py-2 border-2 border-purple-500 rounded-full bg-purple-500/10 hover:bg-purple-500/15 hover:border-purple-600 transition-all duration-300 cursor-default hover:scale-105">
                              <div className="w-2 h-6 min-w-2 min-h-6 flex items-center justify-center relative flex-shrink-0">
                                <svg className="w-5 h-5 text-purple-600 transition-all duration-300 relative z-10" fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                </svg>
                              </div>
                              <span className="text-sm font-bold text-purple-600 whitespace-nowrap transition-all duration-300">
                                Manual
                              </span>                            </div>
                          </div>
                        )}

                        {/* Badge Trilhas */}
                        {badgeProps.showBadge && (
                          <div className="absolute top-4 right-4 z-20">
                            <TrilhasBadge />
                          </div>
                        )}

                        <div className="flex items-start gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <div 
                                className={`icon-container ${isSelected ? 'active' : ''}`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleActivityToggle(activity);
                                }}
                                style={{
                                  width: '40px',
                                  height: '40px',
                                  minWidth: '40px',
                                  minHeight: '40px',
                                  borderRadius: '14px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  background: isSelected 
                                    ? 'linear-gradient(135deg, #FF6E06, #FF8A39)' 
                                    : 'rgba(255, 110, 6, 0.1)',
                                  transition: 'all 0.3s ease',
                                  position: 'relative',
                                  overflow: 'hidden',
                                  cursor: 'pointer',
                                  boxShadow: isSelected 
                                    ? '0 6px 12px rgba(255, 110, 6, 0.3)' 
                                    : 'none',
                                  transform: isSelected ? 'scale(1.05)' : 'scale(1)'
                                }}
                              >
                                {isSelected ? (
                                  <svg 
                                    className="w-5 h-5 text-white transition-all duration-300 relative z-10" 
                                    fill="currentColor" 
                                    viewBox="0 0 20 20"
                                  >
                                    <path 
                                      fillRule="evenodd" 
                                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" 
                                      clipRule="evenodd"/>
                                  </svg>
                                ) : (
                                  React.createElement(getIconByActivityId(activity.id), {
                                    className: `w-5 h-5 transition-all duration-300 relative z-10`,
                                    style: {
                                      color: '#FF6E06'
                                    }
                                  })
                                )}
                                <div 
                                  className="icon-glow"
                                  style={{
                                    position: 'absolute',
                                    top: '50%',
                                    left: '50%',
                                    width: '20px',
                                    height: '20px',
                                    background: 'radial-gradient(circle, rgba(255, 110, 6, 0.5), transparent)',
                                    borderRadius: '50%',
                                    transform: isSelected 
                                      ? 'translate(-50%, -50%) scale(2.2)' 
                                      : 'translate(-50%, -50%) scale(0)',
                                    transition: 'transform 0.3s ease'
                                  }}
                                />
                              </div>

                              <h3 className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-2 flex-1 pr-8">
                                {activity.title}
                              </h3>
                            </div>

                            <p className="text-gray-600 dark:text-gray-400 leading-relaxed line-clamp-2 mb-2 text-sm">
                              {activity.description}
                            </p>

                            <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                        📊 {activity.difficulty} • ⏱️ {activity.duration || '30 min'}
                                      </div>

                                      {/* Exibir customFields como tags/badges */}
                                      {activity.customFields && Object.keys(activity.customFields).length > 0 && (
                                        <div className="mt-3 flex flex-wrap gap-2">
                                          {Object.entries(activity.customFields).map(([key, value]) => {
                                            // Função para garantir renderização segura
                                            const safeValue = (val: any): string => {
                                              if (val === null || val === undefined) return '';
                                              if (typeof val === 'object') {
                                                // Se for um objeto, tentar extrair propriedades comuns
                                                if (val.nome) return String(val.nome);
                                                if (val.title) return String(val.title);
                                                if (val.descricao) return String(val.descricao);
                                                if (val.description) return String(val.description);
                                                return '[Dados Complexos]';
                                              }
                                              return String(val);
                                            };

                                            const displayValue = safeValue(value);

                                            return (
                                              <div 
                                                key={key} 
                                                className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-700 hover:from-blue-100 hover:to-indigo-100 dark:hover:from-blue-900/40 dark:hover:to-indigo-900/40 transition-all duration-200"
                                              >
                                                <span className="font-semibold">{key}:</span>
                                                <span className="ml-1 truncate max-w-[150px]">{displayValue}</span>
                                              </div>
                                            );
                                          })}
                                        </div>
                                      )}

                            <div className="mt-2">
                              <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 rounded">
                                ID: {activity.id}
                              </span>
                            </div>
                          </div>
                        </div>

                        {isSelected && (
                          <div className="absolute inset-0 rounded-[32px] border-2 border-[#FF6B00] animate-pulse opacity-50 pointer-events-none"></div>
                        )}
                      </motion.div>
                    );
                  })}

                  {filterState === 'selected' && selectedActivities2.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                        <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        Nenhuma atividade selecionada
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs">
                        Selecione algumas atividades primeiro para vê-las aqui
                      </p>
                    </div>
                  )}

                  {getCombinedActivities().length === 0 && (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                        <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        Nenhuma atividade disponível
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs">
                        Adicione atividades manuais ou aguarde as sugestões da IA
                      </p>
                    </div>
                  )}
                </div>
              )}

              {!showAddActivityInterface && (
                <div className="flex justify-end pt-3 sm:pt-4 border-t border-gray-300 dark:border-gray-700">
                  <Button
                    onClick={handleApproveActionPlan}
                    disabled={selectedActivities2.length === 0 || isLoading}
                    className="px-4 sm:px-6 py-2 sm:py-3 bg-[#FF6B00] hover:bg-[#D65A00] text-white font-semibold rounded-xl transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm sm:text-base"
                  >
                    <Target className="w-4 h-4 sm:w-5 sm:h-5" />
                    {isLoading
                      ? "Processando..."
                      : `Aprovar Plano (${selectedActivities2.length})`}
                  </Button>
                </div>
              )}
            </motion.div>
          )}
        </motion.div>
      )}

      {/* Debug Panels para desenvolvimento */}
      {/* <TrilhasDebugPanel /> - Removido */}
      {/* <AutomationDebugPanel /> */}
      <EditActivityModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedActivity(null);
        }}
        activity={selectedActivity}
        onUpdateActivity={handleUpdateActivity}
      />
    </motion.div>
  );
}