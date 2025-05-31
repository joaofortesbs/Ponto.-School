import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  MapPin,
  Calendar,
  Users,
  BookOpen,
  Award,
  Settings,
  Camera,
  Edit,
  MessageCircle,
  Share,
  MoreHorizontal,
  Star,
  Heart,
  UserCheck,
  Clock,
  Target,
  TrendingUp,
  Zap,
  Trophy
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

interface ProfileHeaderProps {
  isOwnProfile: boolean;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({ isOwnProfile }) => {
  const [isFollowing, setIsFollowing] = useState(false);

  const [open, setOpen] = React.useState(false);
  const [isDarkMode, setDarkMode] = React.useState(false);

  const toggleDarkMode = () => {
    setDarkMode(!isDarkMode);
    if (typeof document !== 'undefined') {
      document.documentElement.classList.toggle('dark');
    }
  };

  const mockUser = {
    id: "1",
    name: "João Silva",
    username: "@joaosilva",
    email: "joao.silva@email.com",
    bio: "Estudante de Engenharia da Computação apaixonado por tecnologia e inovação. Sempre em busca de novos desafios e oportunidades de aprendizado.",
    location: "São Paulo, Brasil",
    joinDate: "Janeiro 2023",
    avatar: "/placeholder-avatar.jpg",
    coverPhoto: "/placeholder-cover.jpg",
    stats: {
      followers: 2845,
      following: 892,
      posts: 234,
      points: 15420,
      studyHours: 1250,
      coursesCompleted: 28,
      achievements: 45,
      streak: 23,
      rank: "Ouro",
      level: 12
    },
    badges: [
      { id: 1, name: "Estudante Dedicado", icon: "📚", color: "blue" },
      { id: 2, name: "Mentor Ativo", icon: "🎓", color: "green" },
      { id: 3, name: "Inovador", icon: "💡", color: "yellow" },
      { id: 4, name: "Colaborador", icon: "🤝", color: "purple" }
    ],
    recentAchievements: [
      { id: 1, title: "100 Dias de Estudo", date: "2 dias atrás", icon: "🔥" },
      { id: 2, title: "Curso de React Concluído", date: "1 semana atrás", icon: "⚛️" },
      { id: 3, title: "Top 10 da Turma", date: "2 semanas atrás", icon: "🏆" }
    ],
    subjects: [
      { name: "Matemática", progress: 85, color: "blue" },
      { name: "Física", progress: 72, color: "green" },
      { name: "Programação", progress: 94, color: "purple" },
      { name: "Química", progress: 68, color: "red" }
    ]
  };

  return (
    <div className="w-full space-y-6">
      {/* Cover Photo Section */}
      <div className="relative">
        <div 
          className="h-64 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 rounded-t-xl relative overflow-hidden"
          style={{
            backgroundImage: mockUser.coverPhoto ? `url(${mockUser.coverPhoto})` : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          <div className="absolute inset-0 bg-black/20" />
          {isOwnProfile && (
            <Button
              variant="secondary"
              size="sm"
              className="absolute top-4 right-4 bg-white/90 hover:bg-white text-gray-900"
            >
              <Camera className="h-4 w-4 mr-2" />
              Alterar Capa
            </Button>
          )}
        </div>

        {/* Profile Avatar */}
        <div className="absolute -bottom-16 left-8">
          <div className="relative">
            <Avatar className="h-32 w-32 border-4 border-white shadow-lg">
              <AvatarImage src={mockUser.avatar} alt={mockUser.name} />
              <AvatarFallback className="text-2xl bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                {mockUser.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            {isOwnProfile && (
              <Button
                variant="secondary"
                size="icon"
                className="absolute -bottom-2 -right-2 h-10 w-10 rounded-full bg-white hover:bg-gray-50 shadow-lg"
              >
                <Camera className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Profile Info Section */}
      <Card className="p-6 pt-20">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
          {/* Left Side - Basic Info */}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {mockUser.name}
              </h1>
              <Badge variant="secondary" className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
                {mockUser.stats.rank}
              </Badge>
              <Badge variant="outline" className="text-blue-600 border-blue-600">
                Nível {mockUser.stats.level}
              </Badge>
            </div>

            <p className="text-lg text-gray-600 dark:text-gray-300 mb-2">
              {mockUser.username}
            </p>

            <p className="text-gray-700 dark:text-gray-300 mb-4 max-w-2xl leading-relaxed">
              {mockUser.bio}
            </p>

            {/* Location and Join Date */}
            <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600 dark:text-gray-400 mb-6">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span>{mockUser.location}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>Membro desde {mockUser.joinDate}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>{mockUser.stats.studyHours}h de estudo</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4" />
                <span>{mockUser.stats.streak} dias consecutivos</span>
              </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6 mb-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {mockUser.stats.followers.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Seguidores</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {mockUser.stats.following.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Seguindo</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {mockUser.stats.points.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Pontos</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  {mockUser.stats.coursesCompleted}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Cursos</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {mockUser.stats.achievements}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Conquistas</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                  {mockUser.stats.posts}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Posts</div>
              </div>
            </div>
          </div>

          {/* Right Side - Action Buttons */}
          <div className="flex flex-col gap-3 min-w-[200px]">
            {isOwnProfile ? (
              <>
                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                  <Edit className="h-4 w-4 mr-2" />
                  Editar Perfil
                </Button>
                <Button variant="outline" className="w-full">
                  <Settings className="h-4 w-4 mr-2" />
                  Configurações
                </Button>
              </>
            ) : (
              <>
                <Button 
                  className={`w-full ${isFollowing ? 'bg-gray-600 hover:bg-gray-700' : 'bg-blue-600 hover:bg-blue-700'} text-white`}
                  onClick={() => setIsFollowing(!isFollowing)}
                >
                  <UserCheck className="h-4 w-4 mr-2" />
                  {isFollowing ? 'Seguindo' : 'Seguir'}
                </Button>
                <Button variant="outline" className="w-full">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Mensagem
                </Button>
              </>
            )}
            <Button variant="outline" className="w-full">
              <Share className="h-4 w-4 mr-2" />
              Compartilhar
            </Button>
            <Button variant="ghost" size="icon" className="w-full">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <Separator className="my-6" />

        {/* Badges Section */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <Award className="h-5 w-5 text-yellow-500" />
            Badges Conquistados
          </h3>
          <div className="flex flex-wrap gap-2">
            {mockUser.badges.map((badge) => (
              <Badge
                key={badge.id}
                variant="secondary"
                className={`px-3 py-2 text-sm font-medium ${
                  badge.color === 'blue' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' :
                  badge.color === 'green' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                  badge.color === 'yellow' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' :
                  'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300'
                }`}
              >
                <span className="mr-2">{badge.icon}</span>
                {badge.name}
              </Badge>
            ))}
          </div>
        </div>

        {/* Recent Achievements */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            Conquistas Recentes
          </h3>
          <div className="space-y-3">
            {mockUser.recentAchievements.map((achievement) => (
              <div key={achievement.id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                <span className="text-2xl">{achievement.icon}</span>
                <div className="flex-1">
                  <div className="font-medium text-gray-900 dark:text-white">
                    {achievement.title}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {achievement.date}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Study Progress */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-blue-500" />
            Progresso de Estudos
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {mockUser.subjects.map((subject) => (
              <div key={subject.name} className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium text-gray-900 dark:text-white">
                    {subject.name}
                  </span>
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {subject.progress}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${
                      subject.color === 'blue' ? 'bg-blue-500' :
                      subject.color === 'green' ? 'bg-green-500' :
                      subject.color === 'purple' ? 'bg-purple-500' :
                      'bg-red-500'
                    }`}
                    style={{ width: `${subject.progress}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ProfileHeader;
