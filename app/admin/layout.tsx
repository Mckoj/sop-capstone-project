"use client";
import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useSession, signOut } from '@/lib/auth-client';
import { LayoutDashboard, Package, Users, BarChart3, LogOut, ShoppingCart, Box } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, isPending } = useSession();

  useEffect(() => {
    if (!isPending && !session) {
      router.push('/');
    }
  }, [session, isPending, router]);

  const handleLogout = async () => {
    await signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push('/');
        },
      },
    });
  };

  const navItems = [
    { path: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/admin/products', label: 'Products', icon: Package },
    { path: '/admin/inventory', label: 'Inventory', icon: Box },
    { path: '/admin/customers', label: 'Customers', icon: Users },
    { path: '/admin/reports', label: 'Reports', icon: BarChart3 },
  ];

  const isActive = (path: string) => {
    if (path === '/admin') {
      return pathname === '/admin';
    }
    return pathname.startsWith(path);
  };

  if (isPending || !session) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <div className="bg-primary text-primary-foreground px-6 py-4 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <ShoppingCart className="w-6 h-6" />
          <h1 className="text-xl font-bold">Yenpoobi POS - Admin Dashboard</h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-primary-foreground/10 rounded-lg text-sm">
            <Users className="w-4 h-4" />
            <span>Admin: {session.user?.name || 'User'}</span>
          </div>
          <button
            onClick={() => router.push('/cashier')}
            className="px-4 py-2 bg-primary-foreground/10 hover:bg-primary-foreground/20 rounded-lg transition-colors text-sm"
          >
            Switch to Cashier
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 rounded-lg transition-colors text-sm text-white"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <div className="w-64 bg-card border-r border-border p-4">
          <nav className="space-y-2">
            {navItems.map(item => {
              const Icon = item.icon;
              const active = isActive(item.path);
              
              return (
                <button
                  key={item.path}
                  onClick={() => router.push(item.path)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    active
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-secondary text-foreground'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto bg-muted/20">
          {children}
        </div>
      </div>
    </div>
  );
}
