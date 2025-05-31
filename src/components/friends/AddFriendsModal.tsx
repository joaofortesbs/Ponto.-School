
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, Search, Users, UserPlus } from 'lucide-react';
import { User, useFriendSystem } from '@/hooks/useFriendSystem';
import { UserSearchCard } from './UserSearchCard';

interface AddFriendsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddFriendsModal: React.FC<AddFriendsModalProps> = ({ isOpen, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const { searchUsers, loading, error } = useFriendSystem();

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
    
    setHasSearched(true);
    const results = await searchUsers(searchTerm);
    setSearchResults(results);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleClose = () => {
    setSearchTerm('');
    setSearchResults([]);
    setHasSearched(false);
    onClose();
  };

  const handleFriendRequestSent = () => {
    // Atualizar resultados da busca para refletir o novo status
    handleSearch();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="bg-white dark:bg-[#0A2540] rounded-xl overflow-hidden w-[600px] max-w-full shadow-xl relative max-h-[80vh]"
        >
          {/* Header */}
          <div className="sticky top-0 z-10 bg-white dark:bg-[#0A2540] border-b border-[#E0E1DD] dark:border-white/10 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-[#29335C] dark:text-white flex items-center">
                  <UserPlus className="h-6 w-6 mr-3 text-[#FF6B00]" />
                  Adicionar Amigos
                </h2>
                <p className="text-[#64748B] dark:text-white/60 text-sm mt-1">
                  Encontre e conecte-se com outros usuários da plataforma
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-full text-[#64748B] hover:text-[#29335C] dark:text-white/60 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10"
                onClick={handleClose}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Search Section */}
          <div className="p-6">
            <div className="flex gap-3 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-[#64748B] dark:text-white/60" />
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Buscar por nome de usuário ou nome completo..."
                  className="pl-10 border-[#E0E1DD] dark:border-white/10 bg-white dark:bg-[#0A2540] text-[#29335C] dark:text-white placeholder:text-[#64748B] dark:placeholder:text-white/60 focus:border-[#FF6B00] dark:focus:border-[#FF6B00]"
                />
              </div>
              <Button
                onClick={handleSearch}
                disabled={!searchTerm.trim() || loading}
                className="bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white px-6"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Search className="h-4 w-4 mr-2" />
                    Buscar
                  </>
                )}
              </Button>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
              </div>
            )}

            {/* Results Section */}
            <div className="max-h-[400px] overflow-y-auto">
              {hasSearched && !loading && (
                <>
                  {searchResults.length > 0 ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 mb-4">
                        <Users className="h-4 w-4 text-[#64748B] dark:text-white/60" />
                        <span className="text-sm text-[#64748B] dark:text-white/60">
                          {searchResults.length} usuário{searchResults.length !== 1 ? 's' : ''} encontrado{searchResults.length !== 1 ? 's' : ''}
                        </span>
                      </div>
                      {searchResults.map((user) => (
                        <UserSearchCard
                          key={user.id}
                          user={user}
                          onFriendRequestSent={handleFriendRequestSent}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Users className="h-12 w-12 mx-auto text-[#64748B] dark:text-white/60 mb-3" />
                      <h3 className="text-lg font-medium text-[#29335C] dark:text-white mb-2">
                        Nenhum usuário encontrado
                      </h3>
                      <p className="text-[#64748B] dark:text-white/60 text-sm">
                        Tente buscar com termos diferentes ou verifique a ortografia.
                      </p>
                    </div>
                  )}
                </>
              )}

              {!hasSearched && !loading && (
                <div className="text-center py-8">
                  <Search className="h-12 w-12 mx-auto text-[#64748B] dark:text-white/60 mb-3" />
                  <h3 className="text-lg font-medium text-[#29335C] dark:text-white mb-2">
                    Encontre seus amigos
                  </h3>
                  <p className="text-[#64748B] dark:text-white/60 text-sm">
                    Use a barra de busca acima para encontrar outros usuários pelo nome de usuário ou nome completo.
                  </p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
