
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  Plus,
  Filter,
  Search,
  Video,
  BookOpen,
  Coffee,
  Presentation
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location?: string;
  type: 'meeting' | 'study' | 'project' | 'presentation' | 'social';
  participants: number;
  max_participants?: number;
  is_online: boolean;
  created_by: string;
  created_at: string;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
}

interface EventosTabProps {
  groupId: string;
}

export default function EventosTab({ groupId }: EventosTabProps) {
  const [events, setEvents] = useState<Event[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'upcoming' | 'completed'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    loadEvents();
  }, [groupId]);

  const loadEvents = async () => {
    try {
      // Simulação de dados de eventos - substitua pela consulta real ao Supabase
      const mockEvents: Event[] = [
        {
          id: '1',
          title: 'Reunião Semanal de Estudos',
          description: 'Discussão sobre os tópicos da semana e planejamento das próximas atividades.',
          date: '2024-01-15',
          time: '19:00',
          location: 'Sala Virtual',
          type: 'meeting',
          participants: 8,
          max_participants: 15,
          is_online: true,
          created_by: user?.id || '',
          created_at: '2024-01-10T10:00:00Z',
          status: 'upcoming'
        },
        {
          id: '2',
          title: 'Apresentação de Projetos',
          description: 'Cada membro apresentará seu projeto individual para feedback do grupo.',
          date: '2024-01-20',
          time: '15:00',
          location: 'Biblioteca Central',
          type: 'presentation',
          participants: 12,
          max_participants: 20,
          is_online: false,
          created_by: user?.id || '',
          created_at: '2024-01-08T14:30:00Z',
          status: 'upcoming'
        },
        {
          id: '3',
          title: 'Sessão de Estudos Colaborativa',
          description: 'Resolução de exercícios em grupo e troca de conhecimentos.',
          date: '2024-01-05',
          time: '14:00',
          location: 'Sala 205',
          type: 'study',
          participants: 6,
          is_online: false,
          created_by: user?.id || '',
          created_at: '2024-01-01T09:00:00Z',
          status: 'completed'
        }
      ];

      setEvents(mockEvents);
    } catch (error) {
      console.error('Erro ao carregar eventos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    switch (selectedFilter) {
      case 'upcoming':
        return matchesSearch && event.status === 'upcoming';
      case 'completed':
        return matchesSearch && event.status === 'completed';
      default:
        return matchesSearch;
    }
  });

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'meeting':
        return <Video className="w-5 h-5 text-blue-500" />;
      case 'study':
        return <BookOpen className="w-5 h-5 text-green-500" />;
      case 'presentation':
        return <Presentation className="w-5 h-5 text-purple-500" />;
      case 'social':
        return <Coffee className="w-5 h-5 text-orange-500" />;
      default:
        return <Calendar className="w-5 h-5 text-gray-500" />;
    }
  };

  const getEventTypeLabel = (type: string) => {
    switch (type) {
      case 'meeting':
        return 'Reunião';
      case 'study':
        return 'Estudo';
      case 'presentation':
        return 'Apresentação';
      case 'project':
        return 'Projeto';
      case 'social':
        return 'Social';
      default:
        return 'Evento';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming':
        return 'bg-blue-100 text-blue-800';
      case 'ongoing':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-sm">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Calendar className="w-6 h-6 text-[#FF6B00]" />
            <div>
              <h3 className="text-xl font-semibold text-gray-800">Eventos do Grupo</h3>
              <p className="text-sm text-gray-500">
                {events.length} {events.length === 1 ? 'evento' : 'eventos'} programados
              </p>
            </div>
          </div>
          <Button className="bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] hover:from-[#FF8C40] hover:to-[#FF6B00] text-white">
            <Plus className="w-4 h-4 mr-2" />
            Criar Evento
          </Button>
        </div>

        {/* Barra de Pesquisa e Filtros */}
        <div className="flex items-center justify-between space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Pesquisar eventos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 border-gray-300 focus:border-[#FF6B00] focus:ring-[#FF6B00]"
            />
          </div>
          <div className="flex space-x-2">
            <Button
              variant={selectedFilter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedFilter('all')}
              className={selectedFilter === 'all' ? 'bg-[#FF6B00] hover:bg-[#FF8C40]' : ''}
            >
              Todos
            </Button>
            <Button
              variant={selectedFilter === 'upcoming' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedFilter('upcoming')}
              className={selectedFilter === 'upcoming' ? 'bg-[#FF6B00] hover:bg-[#FF8C40]' : ''}
            >
              Próximos
            </Button>
            <Button
              variant={selectedFilter === 'completed' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedFilter('completed')}
              className={selectedFilter === 'completed' ? 'bg-[#FF6B00] hover:bg-[#FF8C40]' : ''}
            >
              Concluídos
            </Button>
          </div>
        </div>
      </div>

      {/* Lista de Eventos */}
      <div className="flex-1 overflow-y-auto p-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF6B00] mx-auto mb-4"></div>
              <p className="text-gray-500">Carregando eventos...</p>
            </div>
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Nenhum evento encontrado.</p>
            <p className="text-sm text-gray-400">Crie o primeiro evento para o grupo!</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredEvents.map((event) => (
              <Card key={event.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      {getEventIcon(event.type)}
                      <div>
                        <CardTitle className="text-lg text-gray-800">{event.title}</CardTitle>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge variant="secondary" className="text-xs">
                            {getEventTypeLabel(event.type)}
                          </Badge>
                          <Badge className={`text-xs ${getStatusColor(event.status)}`}>
                            {event.status === 'upcoming' ? 'Próximo' : 
                             event.status === 'completed' ? 'Concluído' : 
                             event.status === 'ongoing' ? 'Em andamento' : 'Cancelado'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center space-x-1 text-sm text-gray-500">
                        <Users className="w-4 h-4" />
                        <span>{event.participants}</span>
                        {event.max_participants && (
                          <span>/ {event.max_participants}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-gray-600 mb-4">{event.description}</p>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(event.date)}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <Clock className="w-4 h-4" />
                      <span>{event.time}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <MapPin className="w-4 h-4" />
                      <span>{event.is_online ? 'Online' : event.location}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-end space-x-2 mt-4">
                    {event.status === 'upcoming' && (
                      <>
                        <Button variant="outline" size="sm">
                          Editar
                        </Button>
                        <Button 
                          size="sm"
                          className="bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] hover:from-[#FF8C40] hover:to-[#FF6B00] text-white"
                        >
                          Participar
                        </Button>
                      </>
                    )}
                    {event.status === 'completed' && (
                      <Button variant="outline" size="sm">
                        Ver Detalhes
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
