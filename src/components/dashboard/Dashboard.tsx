import { Link } from 'react-router-dom';
import {
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  CreditCard,
  TrendingUp,
  Users,
  BadgeCheck,
  AlertCircle,
  ArrowRight,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuthStore, useApplicationStore, useDashboardStore, useNotificationStore } from '@/store';
import { format } from 'date-fns';

const statusColors: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-700',
  submitted: 'bg-blue-100 text-blue-700',
  under_review: 'bg-yellow-100 text-yellow-700',
  pending_payment: 'bg-orange-100 text-orange-700',
  payment_verified: 'bg-purple-100 text-purple-700',
  approved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
  permit_issued: 'bg-[#1A237E] text-white',
};

const statusLabels: Record<string, string> = {
  draft: 'Draft',
  submitted: 'Submitted',
  under_review: 'Under Review',
  pending_payment: 'Pending Payment',
  payment_verified: 'Payment Verified',
  approved: 'Approved',
  rejected: 'Rejected',
  permit_issued: 'Permit Issued',
};

export function Dashboard() {
  const { user } = useAuthStore();

  if (user?.role === 'applicant') {
    return <ApplicantDashboard />;
  }

  if (user?.role === 'staff') {
    return <StaffDashboard />;
  }

  if (user?.role === 'treasurer') {
    return <TreasurerDashboard />;
  }

  if (user?.role === 'admin') {
    return <AdminDashboard />;
  }

  return null;
}

function ApplicantDashboard() {
  const { user } = useAuthStore();
  const { getApplicationsByUser } = useApplicationStore();
  const { getNotificationsByUser } = useNotificationStore();

  const userApplications = user ? getApplicationsByUser(user.id) : [];
  const notifications = user ? getNotificationsByUser(user.id).slice(0, 5) : [];

  const stats = {
    total: userApplications.length,
    pending: userApplications.filter(a => ['submitted', 'under_review'].includes(a.status)).length,
    approved: userApplications.filter(a => ['approved', 'permit_issued'].includes(a.status)).length,
    rejected: userApplications.filter(a => a.status === 'rejected').length,
  };

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-[#1A237E] to-[#283593] rounded-xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">
          Welcome back, {user?.firstName}!
        </h1>
        <p className="text-white/80 mb-4">
          Manage your business permit applications easily and efficiently.
        </p>
        <Link to="/apply">
          <Button className="bg-[#FFEB3B] text-[#1A237E] hover:bg-[#FDD835] font-semibold">
            <BadgeCheck className="w-4 h-4 mr-2" />
            Apply for New Permit
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Applications"
          value={stats.total}
          icon={FileText}
          color="bg-blue-500"
        />
        <StatCard
          title="Pending Review"
          value={stats.pending}
          icon={Clock}
          color="bg-yellow-500"
        />
        <StatCard
          title="Approved"
          value={stats.approved}
          icon={CheckCircle}
          color="bg-green-500"
        />
        <StatCard
          title="Rejected"
          value={stats.rejected}
          icon={XCircle}
          color="bg-red-500"
        />
      </div>

      {/* Recent Applications & Notifications */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-[#1A237E]">Recent Applications</CardTitle>
            <Link to="/applications">
              <Button variant="ghost" size="sm" className="text-[#1A237E]">
                View All <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {userApplications.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>No applications yet</p>
                <Link to="/apply">
                  <Button className="mt-4 bg-[#1A237E] text-white">
                    Start Your First Application
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {userApplications.slice(0, 3).map((app) => (
                  <div
                    key={app.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div>
                      <p className="font-medium text-[#1A237E]">{app.businessInfo.businessName}</p>
                      <p className="text-sm text-gray-500">{app.referenceNumber}</p>
                    </div>
                    <Badge className={statusColors[app.status]}>
                      {statusLabels[app.status]}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-[#1A237E]">Notifications</CardTitle>
            <Link to="/notifications">
              <Button variant="ghost" size="sm" className="text-[#1A237E]">
                View All <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {notifications.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <AlertCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>No notifications</p>
              </div>
            ) : (
              <div className="space-y-3">
                {notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={`p-3 rounded-lg ${notif.isRead ? 'bg-gray-50' : 'bg-[#E3F2FD]'}`}
                  >
                    <p className="font-medium text-[#1A237E]">{notif.title}</p>
                    <p className="text-sm text-gray-600">{notif.message}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {format(notif.createdAt, 'MMM d, yyyy h:mm a')}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StaffDashboard() {
  const { stats } = useDashboardStore();

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-[#1A237E] to-[#283593] rounded-xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">Staff Dashboard</h1>
        <p className="text-white/80">Review and process business permit applications.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Applications"
          value={stats.totalApplications}
          icon={FileText}
          color="bg-blue-500"
        />
        <StatCard
          title="Pending Review"
          value={stats.pendingReview}
          icon={Clock}
          color="bg-yellow-500"
        />
        <StatCard
          title="Approved"
          value={stats.approved}
          icon={CheckCircle}
          color="bg-green-500"
        />
        <StatCard
          title="Rejected"
          value={stats.rejected}
          icon={XCircle}
          color="bg-red-500"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-[#1A237E]">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Link to="/review">
              <Button className="bg-[#1A237E] text-white">
                <CheckCircle className="w-4 h-4 mr-2" />
                Review Applications
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function TreasurerDashboard() {
  const { stats } = useDashboardStore();

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-[#1A237E] to-[#283593] rounded-xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">Treasurer Dashboard</h1>
        <p className="text-white/80">Verify payments and manage fee collections.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Pending Payment"
          value={stats.pendingPayment}
          icon={CreditCard}
          color="bg-orange-500"
        />
        <StatCard
          title="Total Revenue"
          value={`₱${(stats.totalRevenue / 1000000).toFixed(1)}M`}
          icon={TrendingUp}
          color="bg-green-500"
        />
        <StatCard
          title="Permits Issued"
          value={stats.permitsIssued}
          icon={BadgeCheck}
          color="bg-[#1A237E]"
        />
        <StatCard
          title="Total Applications"
          value={stats.totalApplications}
          icon={FileText}
          color="bg-blue-500"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-[#1A237E]">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Link to="/verify-payments">
              <Button className="bg-[#1A237E] text-white">
                <CreditCard className="w-4 h-4 mr-2" />
                Verify Payments
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function AdminDashboard() {
  const { stats } = useDashboardStore();

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-[#1A237E] to-[#283593] rounded-xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-white/80">Manage users, settings, and system configuration.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Users"
          value={24}
          icon={Users}
          color="bg-purple-500"
        />
        <StatCard
          title="Total Applications"
          value={stats.totalApplications}
          icon={FileText}
          color="bg-blue-500"
        />
        <StatCard
          title="Permits Issued"
          value={stats.permitsIssued}
          icon={BadgeCheck}
          color="bg-green-500"
        />
        <StatCard
          title="Total Revenue"
          value={`₱${(stats.totalRevenue / 1000000).toFixed(1)}M`}
          icon={TrendingUp}
          color="bg-[#1A237E]"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-[#1A237E]">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Link to="/users">
              <Button className="bg-[#1A237E] text-white">
                <Users className="w-4 h-4 mr-2" />
                Manage Users
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
}

function StatCard({ title, value, icon: Icon, color }: StatCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 ${color} rounded-lg flex items-center justify-center`}>
            <Icon className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-sm text-gray-500">{title}</p>
            <p className="text-xl font-bold text-[#1A237E]">{value}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
