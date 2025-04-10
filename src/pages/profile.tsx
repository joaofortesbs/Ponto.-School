import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getUserProfile } from '@/services/profileService';
import ProfilePage from '@/components/profile/ProfilePage';
import { useAuth } from '@/lib/auth-utils';
import { UserProfile } from '@/types/user-profile';
import { ErrorBoundary } from '@/components/ErrorBoundary';

const Profile: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const targetUserId = userId || user?.id;
        if (!targetUserId) {
          setError(new Error('ID de usuário não disponível'));
          setIsLoading(false);
          return;
        }

        const fetchedProfile = await getUserProfile(targetUserId);
        setProfile(fetchedProfile);
      } catch (error) {
        console.error('Error fetching user profile:', error);
        setError(error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchProfile();
    } else {
      // Esperar a autenticação ser concluída
      const authCheckTimeout = setTimeout(() => {
        if (!user) {
          setError(new Error('Usuário não autenticado'));
          setIsLoading(false);
        }
      }, 3000);

      return () => clearTimeout(authCheckTimeout);
    }
  }, [userId, user]);

  const isCurrentUser = !userId || (user && userId === user.id);

  return (
    <ErrorBoundary>
      <main className="bg-gray-50 dark:bg-[#111827] min-h-screen pb-12">
        <ProfilePage 
          profile={profile} 
          isCurrentUser={isCurrentUser} 
          isLoading={isLoading}
          error={error}
        />
      </main>
    </ErrorBoundary>
  );
};

export default Profile;