import { useState } from 'react';
import {
  Search,
  CheckCircle,
  Eye,
  TrendingUp,
  Receipt,
  DollarSign,
  Building2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { usePaymentStore, useApplicationStore, useNotificationStore, useAuthStore } from '@/store';
import { format } from 'date-fns';
import type { Payment } from '@/types';

const paymentStatusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  processing: 'bg-blue-100 text-blue-700',
  completed: 'bg-green-100 text-green-700',
  failed: 'bg-red-100 text-red-700',
  refunded: 'bg-gray-100 text-gray-700',
};

const paymentStatusLabels: Record<string, string> = {
  pending: 'Pending',
  processing: 'Processing',
  completed: 'Completed',
  failed: 'Failed',
  refunded: 'Refunded',
};

const paymentMethodLabels: Record<string, string> = {
  credit_card: 'Credit Card',
  debit_card: 'Debit Card',
  gcash: 'GCash',
  maya: 'Maya',
  bank_transfer: 'Bank Transfer',
  over_counter: 'Over the Counter',
};

export function TreasurerVerification() {
  const { user } = useAuthStore();
  const { payments, verifyPayment } = usePaymentStore();
  const { getApplicationById } = useApplicationStore();
  const { addNotification } = useNotificationStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [verificationNotes, setVerificationNotes] = useState('');
  const [showVerifyDialog, setShowVerifyDialog] = useState(false);

  // Get pending payments
  const pendingPayments = payments.filter((p) => p.status === 'pending');
  const completedPayments = payments.filter((p) => p.status === 'completed');

  const filteredPayments = payments.filter((payment) => {
    const application = getApplicationById(payment.applicationId);
    const matchesSearch =
      application?.businessInfo.businessName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      application?.referenceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.transactionId?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || payment.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleVerify = () => {
    if (!selectedPayment || !user) return;

    verifyPayment(selectedPayment.id, user.id);

    const application = getApplicationById(selectedPayment.applicationId);
    if (application) {
      // Notify applicant
      addNotification({
        userId: application.applicantId,
        title: 'Payment Verified',
        message: `Your payment of ₱${selectedPayment.amount.toLocaleString()} for ${application.referenceNumber} has been verified.`,
        type: 'success',
        isRead: false,
        relatedTo: 'payment',
        relatedId: selectedPayment.id,
      });
    }

    setShowVerifyDialog(false);
    setSelectedPayment(null);
    setVerificationNotes('');
  };

  const totalRevenue = completedPayments.reduce((sum, p) => sum + p.amount, 0);
  const todayRevenue = completedPayments
    .filter((p) => p.paymentDate && new Date(p.paymentDate).toDateString() === new Date().toDateString())
    .reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#1A237E]">Payment Verification</h1>
        <p className="text-gray-600">Verify and manage permit fee payments</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Receipt className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Pending</p>
                <p className="text-xl font-bold text-[#1A237E]">{pendingPayments.length}</p>
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
                <p className="text-sm text-gray-500">Verified Today</p>
                <p className="text-xl font-bold text-[#1A237E]">
                  {completedPayments.filter(
                    (p) =>
                      p.verifiedAt &&
                      new Date(p.verifiedAt).toDateString() === new Date().toDateString()
                  ).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Today's Revenue</p>
                <p className="text-xl font-bold text-[#1A237E]">₱{todayRevenue.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Revenue</p>
                <p className="text-xl font-bold text-[#1A237E]">₱{totalRevenue.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList className="bg-white border">
          <TabsTrigger value="pending" className="data-[state=active]:bg-[#1A237E] data-[state=active]:text-white">
            Pending Verification
          </TabsTrigger>
          <TabsTrigger value="all" className="data-[state=active]:bg-[#1A237E] data-[state=active]:text-white">
            All Payments
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search by business name, reference, or transaction ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 border-[#1A237E]/20"
                />
              </div>
            </CardContent>
          </Card>

          {/* Pending Payments List */}
          <div className="space-y-4">
            {pendingPayments.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-300" />
                  <h3 className="text-lg font-medium text-gray-700">No pending payments</h3>
                  <p className="text-gray-500">All payments have been verified!</p>
                </CardContent>
              </Card>
            ) : (
              pendingPayments.map((payment) => {
                const application = getApplicationById(payment.applicationId);
                if (!application) return null;

                return (
                  <Card key={payment.id} className="hover:shadow-md transition-shadow">
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
                              <Badge className={paymentStatusColors[payment.status]}>
                                {paymentStatusLabels[payment.status]}
                              </Badge>
                              <span className="text-sm font-medium text-[#1A237E]">
                                ₱{payment.amount.toLocaleString()}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedPayment(payment)}
                            className="border-[#1A237E]/20 text-[#1A237E]"
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => {
                              setSelectedPayment(payment);
                              setShowVerifyDialog(true);
                            }}
                            className="bg-green-600 text-white hover:bg-green-700"
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Verify
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </TabsContent>

        <TabsContent value="all" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search payments..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 border-[#1A237E]/20"
                  />
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-[#1A237E]/20 rounded-lg"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="completed">Completed</option>
                  <option value="failed">Failed</option>
                </select>
              </div>
            </CardContent>
          </Card>

          {/* All Payments List */}
          <div className="space-y-4">
            {filteredPayments.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Receipt className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-medium text-gray-700">No payments found</h3>
                </CardContent>
              </Card>
            ) : (
              filteredPayments.map((payment) => {
                const application = getApplicationById(payment.applicationId);
                if (!application) return null;

                return (
                  <Card key={payment.id} className="hover:shadow-md transition-shadow">
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
                              <Badge className={paymentStatusColors[payment.status]}>
                                {paymentStatusLabels[payment.status]}
                              </Badge>
                              <span className="text-sm font-medium text-[#1A237E]">
                                ₱{payment.amount.toLocaleString()}
                              </span>
                              <span className="text-xs text-gray-400">
                                {paymentMethodLabels[payment.paymentMethod]}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="text-right">
                          <p className="text-xs text-gray-400">
                            {payment.paymentDate
                              ? format(payment.paymentDate, 'MMM d, yyyy h:mm a')
                              : 'N/A'}
                          </p>
                          {payment.verifiedAt && (
                            <p className="text-xs text-green-600">
                              Verified {format(payment.verifiedAt, 'MMM d, yyyy')}
                            </p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Payment Details Dialog */}
      <Dialog open={!!selectedPayment && !showVerifyDialog} onOpenChange={() => setSelectedPayment(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-[#1A237E]">Payment Details</DialogTitle>
          </DialogHeader>
          {selectedPayment && (
            <div className="space-y-4">
              {(() => {
                const application = getApplicationById(selectedPayment.applicationId);
                return application ? (
                  <>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-500">Application</p>
                      <p className="font-medium text-[#1A237E]">{application.referenceNumber}</p>
                      <p className="text-sm">{application.businessInfo.businessName}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Amount</p>
                        <p className="text-2xl font-bold text-[#1A237E]">
                          ₱{selectedPayment.amount.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Status</p>
                        <Badge className={paymentStatusColors[selectedPayment.status]}>
                          {paymentStatusLabels[selectedPayment.status]}
                        </Badge>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Payment Method</p>
                        <p className="font-medium">{paymentMethodLabels[selectedPayment.paymentMethod]}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Transaction ID</p>
                        <p className="font-medium">{selectedPayment.transactionId || 'N/A'}</p>
                      </div>
                    </div>

                    {selectedPayment.paymentDate && (
                      <div>
                        <p className="text-sm text-gray-500">Payment Date</p>
                        <p className="font-medium">
                          {format(selectedPayment.paymentDate, 'MMM d, yyyy h:mm a')}
                        </p>
                      </div>
                    )}
                  </>
                ) : null;
              })()}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Verify Dialog */}
      <Dialog open={showVerifyDialog} onOpenChange={setShowVerifyDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-[#1A237E]">Verify Payment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {selectedPayment && (
              <>
                {(() => {
                  const application = getApplicationById(selectedPayment.applicationId);
                  return application ? (
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-500">Application</p>
                      <p className="font-medium text-[#1A237E]">{application.referenceNumber}</p>
                      <p className="text-sm">{application.businessInfo.businessName}</p>
                      <p className="text-lg font-bold text-[#1A237E] mt-2">
                        ₱{selectedPayment.amount.toLocaleString()}
                      </p>
                    </div>
                  ) : null;
                })()}

                <Textarea
                  placeholder="Add verification notes (optional)..."
                  value={verificationNotes}
                  onChange={(e) => setVerificationNotes(e.target.value)}
                  className="border-[#1A237E]/20"
                />

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowVerifyDialog(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleVerify}
                    className="flex-1 bg-green-600 text-white hover:bg-green-700"
                  >
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Verify Payment
                  </Button>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
