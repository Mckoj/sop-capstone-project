'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/lib/auth-client';

interface UserWithRole {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'MANAGER' | 'CASHIER';
  image?: string | null;
}

export default function Home() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [isChecking, setIsChecking] = useState(true);
  const [debugInfo, setDebugInfo] = useState<string>('');

  useEffect(() => {
    const checkRoleAndRedirect = async () => {
      setDebugInfo('Checking session...');
      
      if (isPending) {
        setDebugInfo('Session is still loading...');
        return;
      }

      if (session && session.user) {
        setDebugInfo(`Session found for user: ${session.user.email}`);
        
        // Intercept pending user immediately before fetching full role
        if ((session.user as any).status === 'PENDING') {
          setDebugInfo('Account is pending manager approval. Redirecting...');
          router.replace('/account/pending');
          setIsChecking(false);
          return;
        }
        
        try {
          setDebugInfo('Fetching user role from API...');
          // Fetch user with role from API
          const res = await fetch('/api/user');
          
          if (res.ok) {
            const user: UserWithRole = await res.json();
            setDebugInfo(`Raw user data: ${JSON.stringify(user)}`);
            
            const role = user.role?.toLowerCase() || 'cashier';
            setDebugInfo(`User role from API: ${user.role} | Lowercase: ${role}`);
            
            setDebugInfo(`Redirecting to: /${role}...`);
            
            // Redirect based on role
            if (role === 'admin') {
              router.push('/admin');
            } else if (role === 'manager') {
              router.push('/manager');
            } else if (role === 'cashier') {
              router.push('/cashier');
            } else {
              setDebugInfo(`Unknown role: ${role} | User object: ${JSON.stringify(user)}`);
              console.error('Unknown role:', role, 'Full user:', user);
            }
          } else {
            const error = await res.json();
            setDebugInfo(`API Error: ${error.error}`);
          }
        } catch (error) {
          setDebugInfo(`Error fetching user role: ${error}`);
          console.error('Error fetching user role:', error);
        }
      } else {
        setDebugInfo('No session found - redirecting to login');
        router.push('/auth/sign-in');
      }
      
      setIsChecking(false);
    };

    checkRoleAndRedirect();
  }, [session, isPending, router]);

  // Show loading state while checking session and role
  if (isPending || isChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white dark:bg-black">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-zinc-600 dark:text-zinc-400">Loading...</p>
          <p className="text-sm text-zinc-500 dark:text-zinc-500 mt-4">{debugInfo}</p>
        </div>
      </div>
    );
  }

  // If user is logged in, don't show login page (redirect already triggered)
  if (session && session.user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white dark:bg-black">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-zinc-600 dark:text-zinc-400">Redirecting...</p>
          <p className="text-sm text-zinc-500 dark:text-zinc-500 mt-4">{debugInfo}</p>
        </div>
      </div>
    );
  }

  // Show connecting state while pushing to login
  return (
    <div className="flex items-center justify-center min-h-screen bg-white dark:bg-black">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-zinc-600 dark:text-zinc-400">Redirecting to login...</p>
        <p className="text-sm text-zinc-500 dark:text-zinc-500 mt-4">{debugInfo}</p>
      </div>
    </div>
  );
}
