import { useState } from 'react';
import {
  Search,
  Filter,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  ArrowRight,
  Building2,
  User,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useApplicationStore, useNotificationStore, useAuthStore } from '@/store';
import { format } from 'date-fns';
import type { Application } from '@/types';

const statusColors: Record<string, string> = {
  submitted: 'bg-blue-100 text-blue-700',
  under_review: 'bg-yellow-100 text-yellow-700',
  pending_payment: 'bg-orange-100 text-orange-700',
  approved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
};

const statusLabels: Record<string, string> = {
  submitted: 'Submitted',
  under_review: 'Under Review',
  pending_payment: 'Pending Payment',
  approved: 'Approved',
  rejected: 'Rejected',
};

export function StaffReview() {
  const { user } = useAuthStore();
  const { applications, updateStatus } = useApplicationStore();
  const { addNotification } = useNotificationStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);

  // Filter applications that need staff review
  const reviewableApplications = applications.filter(
    (app) => ['submitted', 'under_review', 'pending_payment'].includes(app.status)
  );

  const filteredApplications = reviewableApplications.filter((app) => {
    const matchesSearch =
      app.businessInfo.businessName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.referenceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.ownerInfo.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.ownerInfo.lastName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleApprove = () => {
    if (!selectedApplication || !user) return;

    updateStatus(selectedApplication.id, 'approved', reviewNotes);

    // Notify applicant
    addNotification({
      userId: selectedApplication.applicantId,
      title: 'Application Approved',
      message: `Your application ${selectedApplication.referenceNumber} has been approved.`,
      type: 'success',
      isRead: false,
      relatedTo: 'application',
      relatedId: selectedApplication.id,
    });

    setShowApproveDialog(false);
    setSelectedApplication(null);
    setReviewNotes('');
  };

  const handleReject = () => {
    if (!selectedApplication || !user) return;

    updateStatus(selectedApplication.id, 'rejected', reviewNotes);

    // Notify applicant
    addNotification({
      userId: selectedApplication.applicantId,
      title: 'Application Rejected',
      message: `Your application ${selectedApplication.referenceNumber} has been rejected. Reason: ${reviewNotes}`,
      type: 'error',
      isRead: false,
      relatedTo: 'application',
      relatedId: selectedApplication.id,
    });

    setShowRejectDialog(false);
    setSelectedApplication(null);
    setReviewNotes('');
  };

  const handleRequestPayment = () => {
    if (!selectedApplication || !user) return;

    updateStatus(selectedApplication.id, 'pending_payment', reviewNotes);

    // Notify applicant
    addNotification({
      userId: selectedApplication.applicantId,
      title: 'Payment Required',
      message: `Please complete payment for your application ${selectedApplication.referenceNumber}.`,
      type: 'warning',
      isRead: false,
      relatedTo: 'application',
      relatedId: selectedApplication.id,
    });

    setSelectedApplication(null);
    setReviewNotes('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#1A237E]">Review Applications</h1>
        <p className="text-gray-600">Review and process business permit applications</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Pending Review</p>
                <p className="text-xl font-bold text-[#1A237E]">
                  {reviewableApplications.filter((a) => a.status === 'submitted').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Under Review</p>
                <p className="text-xl font-bold text-[#1A237E]">
                  {reviewableApplications.filter((a) => a.status === 'under_review').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Pending Payment</p>
                <p className="text-xl font-bold text-[#1A237E]">
                  {reviewableApplications.filter((a) => a.status === 'pending_payment').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Approved Today</p>
                <p className="text-xl font-bold text-[#1A237E]">5</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search by business name, reference, or owner..."
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
                <SelectItem value="submitted">Submitted</SelectItem>
                <SelectItem value="under_review">Under Review</SelectItem>
                <SelectItem value="pending_payment">Pending Payment</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Applications List */}
      <div className="space-y-4">
        {filteredApplications.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-700">No applications to review</h3>
              <p className="text-gray-500">All caught up!</p>
            </CardContent>
          </Card>
        ) : (
          filteredApplications.map((application) => (
            <Card
              key={application.id}
              className="hover:shadow-md transition-shadow"
            >
              <CardContent className="p-4">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-[#E3F2FD] rounded-lg flex items-center justify-center">
                      <Building2 className="w-6 h-6 text-[#1A237E]" />
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
                      onClick={() => setSelectedApplication(application)}
                      className="border-[#1A237E]/20 text-[#1A237E]"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      Review
                    </Button>
                    {application.status === 'submitted' && (
                      <>
                        <Button
                          size="sm"
                          onClick={() => {
                            setSelectedApplication(application);
                            setShowApproveDialog(true);
                          }}
                          className="bg-green-600 text-white hover:bg-green-700"
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => {
                            setSelectedApplication(application);
                            setShowRejectDialog(true);
                          }}
                        >
                          <XCircle className="w-4 h-4 mr-1" />
                          Reject
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Review Dialog */}
      <Dialog open={!!selectedApplication && !showApproveDialog && !showRejectDialog} onOpenChange={() => setSelectedApplication(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle className="text-[#1A237E]">Application Review</DialogTitle>
          </DialogHeader>
          {selectedApplication && (
            <div className="space-y-6">
              {/* Business Info */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold text-[#1A237E] mb-3 flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  Business Information
                </h3>
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
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold text-[#1A237E] mb-3 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Owner Information
                </h3>
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

              {/* Documents */}
              <div>
                <h3 className="font-semibold text-[#1A237E] mb-3">Documents</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm">DTI Registration</span>
                    <Badge variant="outline" className="bg-green-50 text-green-700">Verified</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm">Barangay Clearance</span>
                    <Badge variant="outline" className="bg-green-50 text-green-700">Verified</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm">Valid ID</span>
                    <Badge variant="outline" className="bg-green-50 text-green-700">Verified</Badge>
                  </div>
                </div>
              </div>

              {/* Review Notes */}
              <div>
                <Label htmlFor="reviewNotes">Review Notes</Label>
                <Textarea
                  id="reviewNotes"
                  placeholder="Add your review notes here..."
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  className="mt-2 border-[#1A237E]/20"
                />
              </div>

              {/* Actions */}
              <DialogFooter className="gap-2">
                {selectedApplication.status === 'submitted' && (
                  <>
                    <Button
                      variant="outline"
                      onClick={() => setShowRejectDialog(true)}
                      className="border-red-200 text-red-600 hover:bg-red-50"
                    >
                      <XCircle className="w-4 h-4 mr-1" />
                      Reject
                    </Button>
                    <Button
                      onClick={() => setShowApproveDialog(true)}
                      className="bg-green-600 text-white hover:bg-green-700"
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Approve
                    </Button>
                  </>
                )}
                {selectedApplication.status === 'under_review' && (
                  <Button
                    onClick={handleRequestPayment}
                    className="bg-[#FFEB3B] text-[#1A237E] hover:bg-[#FDD835]"
                  >
                    <ArrowRight className="w-4 h-4 mr-1" />
                    Request Payment
                  </Button>
                )}
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Approve Dialog */}
      <Dialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-[#1A237E]">Approve Application</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-gray-600">
              Are you sure you want to approve{' '}
              <strong>{selectedApplication?.referenceNumber}</strong>?
            </p>
            <Textarea
              placeholder="Add approval notes (optional)..."
              value={reviewNotes}
              onChange={(e) => setReviewNotes(e.target.value)}
              className="border-[#1A237E]/20"
            />
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setShowApproveDialog(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleApprove}
                className="flex-1 bg-green-600 text-white hover:bg-green-700"
              >
                <CheckCircle className="w-4 h-4 mr-1" />
                Approve
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-[#1A237E]">Reject Application</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-gray-600">
              Are you sure you want to reject{' '}
              <strong>{selectedApplication?.referenceNumber}</strong>?
            </p>
            <Textarea
              placeholder="Provide reason for rejection..."
              value={reviewNotes}
              onChange={(e) => setReviewNotes(e.target.value)}
              className="border-[#1A237E]/20"
            />
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setShowRejectDialog(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleReject}
                variant="destructive"
                className="flex-1"
              >
                <XCircle className="w-4 h-4 mr-1" />
                Reject
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
