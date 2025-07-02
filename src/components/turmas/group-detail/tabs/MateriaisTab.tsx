
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  FileText, 
  Upload, 
  Download, 
  Search, 
  Filter,
  BookOpen,
  Video,
  Image,
  Archive,
  Link,
  Calendar,
  User,
  Eye,
  MoreHorizontal
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';

interface Material {
  id: string;
  title: string;
  description: string;
  type: 'pdf' | 'video' | 'image' | 'document' | 'link' | 'archive';
  file_url?: string;
  file_size?: number;
  uploaded_by: string;
  uploaded_at: string;
  downloads: number;
  views: number;
  tags: string[];
  category: string;
  uploader_name: string;
}

interface MateriaisTabProps {
  groupId: string;
}

export default function MateriaisTab({ groupId }: MateriaisTabProps) {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    loadMaterials();
  }, [groupId]);

  const loadMaterials = async () => {
    try {
      // Simulação de dados de materiais - substitua pela consulta real ao Supabase
      const mockMaterials: Material[] = [
        {
          id: '1',
          title: 'Apostila de Matemática Básica',
          description: 'Material completo sobre álgebra e geometria para iniciantes',
          type: 'pdf',
          file_url: '#',
          file_size: 2048000,
          uploaded_by: user?.id || '',
          uploaded_at: '2024-01-10T10:00:00Z',
          downloads: 45,
          views: 123,
          tags: ['matemática', 'básico', 'álgebra'],
          category: 'Apostilas',
          uploader_name: 'Ana Silva'
        },
        {
          id: '2',
          title: 'Videoaula - Equações Quadráticas',
          description: 'Explicação detalhada sobre resolução de equações do segundo grau',
          type: 'video',
          file_url: '#',
          uploaded_by: user?.id || '',
          uploaded_at: '2024-01-08T14:30:00Z',
          downloads: 0,
          views: 87,
          tags: ['matemática', 'equações', 'videoaula'],
          category: 'Vídeos',
          uploader_name: 'Prof. Carlos'
        },
        {
          id: '3',
          title: 'Lista de Exercícios - Trigonometria',
          description: 'Exercícios práticos para fixação do conteúdo de trigonometria',
          type: 'document',
          file_url: '#',
          file_size: 512000,
          uploaded_by: user?.id || '',
          uploaded_at: '2024-01-05T09:15:00Z',
          downloads: 32,
          views: 76,
          tags: ['matemática', 'exercícios', 'trigonometria'],
          category: 'Exercícios',
          uploader_name: 'Maria Santos'
        }
      ];

      setMaterials(mockMaterials);
    } catch (error) {
      console.error('Erro ao carregar materiais:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const categories = ['all', 'Apostilas', 'Vídeos', 'Exercícios', 'Apresentações', 'Links'];

  const filteredMaterials = materials.filter(material => {
    const matchesSearch = material.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         material.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         material.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || material.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'pdf':
      case 'document':
        return <FileText className="w-5 h-5 text-red-500" />;
      case 'video':
        return <Video className="w-5 h-5 text-blue-500" />;
      case 'image':
        return <Image className="w-5 h-5 text-green-500" />;
      case 'archive':
        return <Archive className="w-5 h-5 text-purple-500" />;
      case 'link':
        return <Link className="w-5 h-5 text-orange-500" />;
      default:
        return <FileText className="w-5 h-5 text-gray-500" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-sm">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <BookOpen className="w-6 h-6 text-[#FF6B00]" />
            <div>
              <h3 className="text-xl font-semibold text-gray-800">Materiais do Grupo</h3>
              <p className="text-sm text-gray-500">
                {materials.length} {materials.length === 1 ? 'material' : 'materiais'} disponíveis
              </p>
            </div>
          </div>
          <Button className="bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] hover:from-[#FF8C40] hover:to-[#FF6B00] text-white">
            <Upload className="w-4 h-4 mr-2" />
            Adicionar Material
          </Button>
        </div>

        {/* Barra de Pesquisa e Filtros */}
        <div className="flex items-center justify-between space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Pesquisar materiais..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 border-gray-300 focus:border-[#FF6B00] focus:ring-[#FF6B00]"
            />
          </div>
          <div className="flex space-x-2">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className={selectedCategory === category ? 'bg-[#FF6B00] hover:bg-[#FF8C40]' : ''}
              >
                {category === 'all' ? 'Todos' : category}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Lista de Materiais */}
      <div className="flex-1 overflow-y-auto p-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF6B00] mx-auto mb-4"></div>
              <p className="text-gray-500">Carregando materiais...</p>
            </div>
          </div>
        ) : filteredMaterials.length === 0 ? (
          <div className="text-center py-8">
            <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Nenhum material encontrado.</p>
            <p className="text-sm text-gray-400">Adicione o primeiro material para o grupo!</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredMaterials.map((material) => (
              <Card key={material.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      {getFileIcon(material.type)}
                      <div>
                        <CardTitle className="text-lg text-gray-800">{material.title}</CardTitle>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge variant="secondary" className="text-xs">
                            {material.category}
                          </Badge>
                          {material.file_size && (
                            <Badge variant="outline" className="text-xs">
                              {formatFileSize(material.file_size)}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-gray-500 hover:text-[#FF6B00]"
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-gray-600 mb-4">{material.description}</p>
                  
                  {/* Tags */}
                  <div className="flex flex-wrap gap-1 mb-4">
                    {material.tags.map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  {/* Informações do Material */}
                  <div className="grid grid-cols-2 gap-4 text-sm text-gray-500 mb-4">
                    <div className="flex items-center space-x-2">
                      <User className="w-4 h-4" />
                      <span>Por: {material.uploader_name}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(material.uploaded_at)}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Download className="w-4 h-4" />
                      <span>{material.downloads} downloads</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Eye className="w-4 h-4" />
                      <span>{material.views} visualizações</span>
                    </div>
                  </div>

                  {/* Ações */}
                  <div className="flex items-center justify-end space-x-2">
                    <Button variant="outline" size="sm">
                      <Eye className="w-4 h-4 mr-1" />
                      Visualizar
                    </Button>
                    <Button 
                      size="sm"
                      className="bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] hover:from-[#FF8C40] hover:to-[#FF6B00] text-white"
                    >
                      <Download className="w-4 h-4 mr-1" />
                      Baixar
                    </Button>
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
