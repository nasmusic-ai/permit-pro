import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  Search,
  Filter,
  Eye,
  Download,
  Clock,
  CheckCircle,
  XCircle,
  CreditCard,
  Plus,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useAuthStore, useApplicationStore } from '@/store';
import { format } from 'date-fns';
import type { Application } from '@/types';

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

const statusIcons: Record<string, React.ElementType> = {
  draft: FileText,
  submitted: FileText,
  under_review: Clock,
  pending_payment: CreditCard,
  payment_verified: CheckCircle,
  approved: CheckCircle,
  rejected: XCircle,
  permit_issued: CheckCircle,
};

export function ApplicationsList() {
  const { user } = useAuthStore();
  const { getApplicationsByUser } = useApplicationStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);

  const userApplications = user ? getApplicationsByUser(user.id) : [];

  const filteredApplications = userApplications.filter((app) => {
    const matchesSearch =
      app.businessInfo.businessName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.referenceNumber.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1A237E]">My Applications</h1>
          <p className="text-gray-600">View and manage your business permit applications</p>
        </div>
        <Link to="/apply">
          <Button className="bg-[#1A237E] text-white">
            <Plus className="w-4 h-4 mr-2" />
            New Application
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search by business name or reference number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 border-[#1A237E]/20"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48 border-[#1A237E]/20">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="submitted">Submitted</SelectItem>
                <SelectItem value="under_review">Under Review</SelectItem>
                <SelectItem value="pending_payment">Pending Payment</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="permit_issued">Permit Issued</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Applications List */}
      {filteredApplications.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-700 mb-2">No applications found</h3>
            <p className="text-gray-500 mb-4">
              {searchQuery || statusFilter !== 'all'
                ? 'Try adjusting your search or filter criteria'
                : 'Start by creating your first business permit application'}
            </p>
            {!searchQuery && statusFilter === 'all' && (
              <Link to="/apply">
                <Button className="bg-[#1A237E] text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  Apply for Permit
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredApplications.map((application) => {
            const StatusIcon = statusIcons[application.status];
            return (
              <Card
                key={application.id}
                className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => setSelectedApplication(application)}
              >
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${statusColors[application.status].split(' ')[0]}`}>
                        <StatusIcon className={`w-6 h-6 ${statusColors[application.status].split(' ')[1]}`} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-[#1A237E]">
                          {application.businessInfo.businessName}
                        </h3>
                        <p className="text-sm text-gray-500">{application.referenceNumber}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge className={statusColors[application.status]}>
                            {statusLabels[application.status]}
                          </Badge>
                          <span className="text-xs text-gray-400">
                            Submitted {application.submittedAt ? format(application.submittedAt, 'MMM d, yyyy') : 'N/A'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-[#1A237E]/20 text-[#1A237E]"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedApplication(application);
                        }}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                      {application.status === 'pending_payment' && (
                        <Link to={`/payments?app=${application.id}`} onClick={(e) => e.stopPropagation()}>
                          <Button size="sm" className="bg-[#FFEB3B] text-[#1A237E] hover:bg-[#FDD835]">
                            <CreditCard className="w-4 h-4 mr-1" />
                            Pay
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Application Details Dialog */}
      <Dialog open={!!selectedApplication} onOpenChange={() => setSelectedApplication(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle className="text-[#1A237E]">Application Details</DialogTitle>
          </DialogHeader>
          {selectedApplication && (
            <div className="space-y-6">
              {/* Status Banner */}
              <div className={`p-4 rounded-lg ${statusColors[selectedApplication.status]}`}>
                <div className="flex items-center gap-2">
                  {(() => {
                    const Icon = statusIcons[selectedApplication.status];
                    return <Icon className="w-5 h-5" />;
                  })()}
                  <span className="font-semibold">{statusLabels[selectedApplication.status]}</span>
                </div>
              </div>

              {/* Reference Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Reference Number</p>
                  <p className="font-medium text-[#1A237E]">{selectedApplication.referenceNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Date Submitted</p>
                  <p className="font-medium text-[#1A237E]">
                    {selectedApplication.submittedAt
                      ? format(selectedApplication.submittedAt, 'MMM d, yyyy')
                      : 'Not submitted'}
                  </p>
                </div>
              </div>

              {/* Business Info */}
              <div>
                <h3 className="font-semibold text-[#1A237E] mb-3">Business Information</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Business Name</p>
                    <p className="font-medium">{selectedApplication.businessInfo.businessName}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Business Type</p>
                    <p className="font-medium capitalize">
                      {selectedApplication.businessInfo.businessType.replace('_', ' ')}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Address</p>
                    <p className="font-medium">{selectedApplication.businessInfo.businessAddress}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Contact</p>
                    <p className="font-medium">{selectedApplication.businessInfo.businessPhone}</p>
                  </div>
                </div>
              </div>

              {/* Owner Info */}
              <div>
                <h3 className="font-semibold text-[#1A237E] mb-3">Owner Information</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Name</p>
                    <p className="font-medium">
                      {selectedApplication.ownerInfo.firstName} {selectedApplication.ownerInfo.lastName}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Email</p>
                    <p className="font-medium">{selectedApplication.ownerInfo.email}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Phone</p>
                    <p className="font-medium">{selectedApplication.ownerInfo.phone}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">ID</p>
                    <p className="font-medium">
                      {selectedApplication.ownerInfo.idType.replace('_', ' ').toUpperCase()} - {selectedApplication.ownerInfo.idNumber}
                    </p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-4 border-t">
                {selectedApplication.status === 'pending_payment' && (
                  <Link to={`/payments?app=${selectedApplication.id}`} className="flex-1">
                    <Button className="w-full bg-[#FFEB3B] text-[#1A237E] hover:bg-[#FDD835]">
                      <CreditCard className="w-4 h-4 mr-2" />
                      Make Payment
                    </Button>
                  </Link>
                )}
                {selectedApplication.permitUrl && (
                  <Button variant="outline" className="border-[#1A237E] text-[#1A237E]">
                    <Download className="w-4 h-4 mr-2" />
                    Download Permit
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
