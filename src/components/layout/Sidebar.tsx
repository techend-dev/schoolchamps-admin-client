import { NavLink, useLocation } from 'react-router-dom';
import {
  Home,
  FileText,
  BarChart3,
  Bell,
  Wand2,
  Settings,
  LogOut,
  Menu,
  X,
  Sparkles,
  Bolt,
  CheckSquare,
  Users as UsersIcon,
  Coins,
} from 'lucide-react';
import { useAuth, UserRole } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface NavItem {
  title: string;
  href: string;
  icon: any;
  roles: UserRole[];
}

const navItems: NavItem[] = [
  {
    title: 'Home',
    href: '/dashboard',
    icon: Home,
    roles: ['admin', 'writer', 'school', 'marketer'],
  },
  {
    title: 'Blogs',
    href: '/dashboard/blogs',
    icon: FileText,
    roles: ['admin', 'writer', 'school', 'marketer'],
  },
  {
    title: 'Review',
    href: '/dashboard/approvals',
    icon: CheckSquare,
    roles: ['admin', 'writer'],
  },
  {
    title: 'Users',
    href: '/dashboard/users',
    icon: UsersIcon,
    roles: ['admin'],
  },
  {
    title: 'Analytics',
    href: '/dashboard/analytics',
    icon: BarChart3,
    roles: ['admin', 'marketer'],
  },
  {
    title: 'Credit Analytics',
    href: '/dashboard/admin/credits',
    icon: Coins,
    roles: ['admin'],
  },
  {
    title: 'Notifications',
    href: '/dashboard/notifications',
    icon: Bell,
    roles: ['admin', 'school'],
  },
  {
    title: 'AI Tools',
    href: '/dashboard/ai-tools',
    icon: Wand2,
    roles: ['admin', 'writer', 'marketer'],
  },
  {
    title: 'Settings',
    href: '/dashboard/settings',
    icon: Bolt,
    roles: ['admin', 'writer', 'school', 'marketer'],
  },
  {
    title: 'Credits',
    href: '/dashboard/credits',
    icon: Coins,
    roles: ['school'],
  },
];

export const Sidebar = ({ isOpen, setIsOpen }: { isOpen: boolean; setIsOpen: (open: boolean) => void }) => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const filteredNavItems = navItems.filter((item) =>
    user?.role ? item.roles.includes(user.role) : false
  );

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-md z-[60] lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 h-screen w-[280px] bg-sidebar border-r border-white/10 z-[70] transition-transform duration-300 ease-in-out shadow-2xl',
          'lg:relative lg:translate-x-0 lg:z-40 lg:shadow-none',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo Section */}
          <div className="p-6 mb-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center p-2">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight text-white uppercase">SchoolChamps</h1>
                <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-[0.2em]">Empowering Schools</p>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto no-scrollbar px-4 py-2 space-y-8">
            {/* Main Menu Section */}
            <div>
              <p className="px-4 text-[11px] font-bold text-muted-foreground uppercase tracking-widest mb-4">MAIN MENU</p>
              <nav className="space-y-1">
                {filteredNavItems.filter(i => !['Settings'].includes(i.title)).map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.href;

                  return (
                    <NavLink
                      key={item.href}
                      to={item.href}
                      onClick={() => setIsOpen(false)}
                      className={cn(
                        'flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group',
                        isActive
                          ? 'bg-primary text-white shadow-glow'
                          : 'text-muted-foreground hover:text-white hover:bg-white/5'
                      )}
                    >
                      <Icon className={cn("h-5 w-5", isActive ? "text-white" : "text-muted-foreground group-hover:text-white")} />
                      <span className="font-semibold">{item.title}</span>
                    </NavLink>
                  );
                })}
              </nav>
            </div>

            {/* Account Section */}
            <div>
              <p className="px-4 text-[11px] font-bold text-muted-foreground uppercase tracking-widest mb-4">ACCOUNT</p>
              <nav className="space-y-1">
                {filteredNavItems.filter(i => ['Settings'].includes(i.title)).map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.href;

                  return (
                    <NavLink
                      key={item.href}
                      to={item.href}
                      onClick={() => setIsOpen(false)}
                      className={cn(
                        'flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group',
                        isActive
                          ? 'bg-primary text-white shadow-glow'
                          : 'text-muted-foreground hover:text-white hover:bg-white/5'
                      )}
                    >
                      <Icon className={cn("h-5 w-5", isActive ? "text-white" : "text-muted-foreground group-hover:text-white")} />
                      <span className="font-semibold">{item.title}</span>
                    </NavLink>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* User Profile Section */}
          <div className="p-4 border-t border-white/[0.05]">
            <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-white/5 border border-white/10 group">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center text-primary font-bold shrink-0">
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-white truncate">{user?.name}</p>
                  <p className="text-[10px] text-muted-foreground truncate">{user?.email}</p>
                </div>
              </div>
              <button
                onClick={logout}
                className="p-2 rounded-lg hover:bg-white/10 text-muted-foreground hover:text-white transition-all flex-shrink-0"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
