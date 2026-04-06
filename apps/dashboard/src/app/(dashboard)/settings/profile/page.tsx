'use client';

import { useSession } from 'next-auth/react';
import ProfileForm from '@/components/settings/ProfileForm';
import LoadingSpinner from '@/components/shared/LoadingSpinner';

export default function ProfilePage() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner className="w-6 h-6 text-cyan-500" />
      </div>
    );
  }

  const user = {
    name: session?.user?.name || '',
    email: session?.user?.email || '',
  };

  return <ProfileForm user={user} />;
}
