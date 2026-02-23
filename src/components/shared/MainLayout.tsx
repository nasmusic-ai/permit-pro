import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  Upload,
  CreditCard,
  Bell,
  Settings,
  LogOut,
  Menu,
  Building2,
  Users,
  CheckCircle,
  Shield,
  BadgeCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useAuthStore, useNotificationStore } from '@/store';
import type { UserRole } from '@/types';

interface NavItem {
  label: string;
  path: string;
  icon: React.ElementType;
  roles: UserRole[];
}

const navItems: NavItem[] = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, roles: ['applicant', 'staff', 'treasurer', 'admin'] },
  { label: 'My Applications', path: '/applications', icon: FileText, roles: ['applicant'] },
  { label: 'New Application', path: '/apply', icon: BadgeCheck, roles: ['applicant'] },
  { label: 'Documents', path: '/documents', icon: Upload, roles: ['applicant'] },
  { label: 'Payments', path: '/payments', icon: CreditCard, roles: ['applicant'] },
  { label: 'Review Applications', path: '/review', icon: CheckCircle, roles: ['staff'] },
  { label: 'Payment Verification', path: '/verify-payments', icon: CreditCard, roles: ['treasurer'] },
  { label: 'User Management', path: '/users', icon: Users, roles: ['admin'] },
  { label: 'Settings', path: '/settings', icon: Settings, roles: ['applicant', 'staff', 'treasurer', 'admin'] },
];

export function MainLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuthStore();
  const { getUnreadCount } = useNotificationStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const unreadCount = user ? getUnreadCount(user.id) : 0;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const filteredNavItems = navItems.filter(
    item => user && item.roles.includes(user.role)
  );

  const NavContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-[#1A237E]/10">
        <Link to="/dashboard" className="flex items-center gap-2">
          <div className="w-10 h-10 bg-[#1A237E] rounded-lg flex items-center justify-center">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-[#1A237E] text-lg leading-tight">BilisPermit</h1>
            <p className="text-xs text-gray-500">Business Permit System</p>
          </div>
        </Link>
      </div>

      <div className="flex-1 overflow-auto py-4">
        <nav className="space-y-1 px-3">
          {filteredNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'bg-[#1A237E] text-white'
                    : 'text-gray-700 hover:bg-[#1A237E]/10 hover:text-[#1A237E]'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="p-4 border-t border-[#1A237E]/10">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-[#E3F2FD] rounded-full flex items-center justify-center">
            <Shield className="w-5 h-5 text-[#1A237E]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-[#1A237E] truncate">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
          </div>
        </div>
        <Button
          variant="outline"
          className="w-full border-[#1A237E]/20 text-[#1A237E] hover:bg-[#1A237E]/10"
          onClick={handleLogout}
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#E3F2FD] flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-72 bg-white shadow-lg flex-col fixed h-full z-10">
        <NavContent />
      </aside>

      {/* Mobile Sidebar */}
      <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <SheetContent side="left" className="w-72 p-0">
          <NavContent />
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div className="flex-1 lg:ml-72">
        {/* Header */}
        <header className="bg-white shadow-sm sticky top-20px z-20">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-3">
              <Sheet>
                <SheetTrigger asChild className="lg:hidden">
                  <Button variant="ghost" size="icon" className="lg:hidden">
                    <Menu className="w-5 h-5 text-[#1A237E]" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-72 p-0">
                  <NavContent />
                </SheetContent>
              </Sheet>
              <h2 className="text-lg font-semibold text-[#1A237E] hidden sm:block">
                {filteredNavItems.find(item => item.path === location.pathname)?.label || 'Dashboard'}
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <Link to="/notifications">
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="w-5 h-5 text-[#1A237E]" />
                  {unreadCount > 0 && (
                    <Badge className="absolute -top-1 -right-1 w-5 h-5 p-0 flex items-center justify-center bg-[#FFEB3B] text-[#1A237E] text-xs font-bold">
                      {unreadCount}
                    </Badge>
                  )}
                </Button>
              </Link>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 lg:p-6 animate-fade-in">
          {children}
        </main>
      </div>
    </div>
  );
}
