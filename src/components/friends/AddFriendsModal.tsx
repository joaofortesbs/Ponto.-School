
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search } from 'lucide-react';
import { User, useFriendSystem } from '@/hooks/useFriendSystem';
import { UserSearchCard } from './UserSearchCard';
import { useDebounce } from '@/hooks/use-debounce';

interface AddFriendsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddFriendsModal: React.FC<AddFriendsModalProps> = ({ isOpen, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [searching, setSearching] = useState(false);
  const { searchUsers } = useFriendSystem();
  
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  React.useEffect(() => {
    if (debouncedSearchTerm.trim()) {
      handleSearch(debouncedSearchTerm);
    } else {
      setSearchResults([]);
    }
  }, [debouncedSearchTerm]);

  const handleSearch = async (term: string) => {
    setSearching(true);
    const results = await searchUsers(term);
    setSearchResults(results);
    setSearching(false);
  };

  const handleModalClose = () => {
    setSearchTerm('');
    setSearchResults([]);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleModalClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[600px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Adicionar Amigos</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Buscar por nome ou @username"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <ScrollArea className="h-[400px] w-full">
            <div className="space-y-2">
              {searching && (
                <div className="flex items-center justify-center py-8">
                  <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                </div>
              )}
              
              {!searching && searchResults.length === 0 && searchTerm.trim() && (
                <div className="text-center py-8 text-gray-500">
                  Nenhum usuário encontrado
                </div>
              )}
              
              {!searching && searchResults.length === 0 && !searchTerm.trim() && (
                <div className="text-center py-8 text-gray-500">
                  Digite um nome ou username para buscar amigos
                </div>
              )}

              {searchResults.map((user) => (
                <UserSearchCard
                  key={user.id}
                  user={user}
                  onActionComplete={() => {
                    // Opcional: recarregar a busca após uma ação
                    if (searchTerm.trim()) {
                      handleSearch(searchTerm);
                    }
                  }}
                />
              ))}
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
};
