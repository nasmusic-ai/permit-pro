import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  CreditCard,
  Wallet,
  Building2,
  Smartphone,
  CheckCircle,
  Lock,
  AlertCircle,
  ArrowRight,
  Receipt,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAuthStore, useApplicationStore, usePaymentStore, useNotificationStore } from '@/store';

const paymentMethods = [
  { id: 'credit_card', label: 'Credit Card', icon: CreditCard, color: 'bg-blue-500' },
  { id: 'gcash', label: 'GCash', icon: Smartphone, color: 'bg-blue-600' },
  { id: 'maya', label: 'Maya', icon: Wallet, color: 'bg-green-500' },
  { id: 'bank_transfer', label: 'Bank Transfer', icon: Building2, color: 'bg-purple-500' },
];

const feeBreakdown = [
  { item: 'Mayor\'s Permit Fee', amount: 1500 },
  { item: 'Business Tax', amount: 2500 },
  { item: 'Sanitary Permit Fee', amount: 500 },
  { item: 'Health Certificate Fee', amount: 300 },
  { item: 'Environmental Fee', amount: 200 },
  { item: 'Processing Fee', amount: 150 },
];

export function PaymentGateway() {
  const [searchParams] = useSearchParams();
  const appId = searchParams.get('app');
  const { user } = useAuthStore();
  const { getApplicationById } = useApplicationStore();
  const { addPayment } = usePaymentStore();
  const { addNotification } = useNotificationStore();

  const [selectedMethod, setSelectedMethod] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [cardDetails, setCardDetails] = useState({
    number: '',
    name: '',
    expiry: '',
    cvv: '',
  });

  const application = appId ? getApplicationById(appId) : null;
  const totalAmount = feeBreakdown.reduce((sum, item) => sum + item.amount, 0);

  const handlePayment = async () => {
    if (!application || !selectedMethod) return;

    setIsProcessing(true);

    // Simulate payment processing
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Create payment record
    addPayment({
      applicationId: application.id,
      amount: totalAmount,
      feeType: 'business_permit',
      paymentMethod: selectedMethod as any,
      status: 'completed',
      paymentDate: new Date(),
    });

    // Add notification
    addNotification({
      userId: user?.id || '',
      title: 'Payment Successful',
      message: `Payment of ₱${totalAmount.toLocaleString()} for ${application.referenceNumber} has been received.`,
      type: 'success',
      isRead: false,
      relatedTo: 'payment',
      relatedId: application.id,
    });

    setIsProcessing(false);
    setShowSuccess(true);
  };

  if (!application) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-[#1A237E]">Payment</h1>
        <Card>
          <CardContent className="p-12 text-center">
            <AlertCircle className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-700 mb-2">No application selected</h3>
            <p className="text-gray-500">Please select an application to make a payment</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1A237E]">Make Payment</h1>
          <p className="text-gray-600">Complete payment for your business permit application</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Payment Methods */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-[#1A237E]">Select Payment Method</CardTitle>
              <CardDescription>Choose your preferred payment option</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {paymentMethods.map((method) => {
                  const Icon = method.icon;
                  return (
                    <button
                      key={method.id}
                      onClick={() => setSelectedMethod(method.id)}
                      className={`p-4 rounded-lg border-2 transition-all flex flex-col items-center gap-2 ${
                        selectedMethod === method.id
                          ? 'border-[#1A237E] bg-[#E3F2FD]'
                          : 'border-gray-200 hover:border-[#1A237E]/50'
                      }`}
                    >
                      <div className={`w-10 h-10 ${method.color} rounded-lg flex items-center justify-center`}>
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <span className="font-medium text-sm">{method.label}</span>
                    </button>
                  );
                })}
              </div>

              {selectedMethod === 'credit_card' && (
                <div className="mt-6 space-y-4 animate-fade-in">
                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                    <Lock className="w-4 h-4" />
                    <span>Your payment information is secure and encrypted</span>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cardNumber">Card Number</Label>
                    <Input
                      id="cardNumber"
                      placeholder="1234 5678 9012 3456"
                      value={cardDetails.number}
                      onChange={(e) => setCardDetails({ ...cardDetails, number: e.target.value })}
                      className="border-[#1A237E]/20"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cardName">Cardholder Name</Label>
                    <Input
                      id="cardName"
                      placeholder="Juan Dela Cruz"
                      value={cardDetails.name}
                      onChange={(e) => setCardDetails({ ...cardDetails, name: e.target.value })}
                      className="border-[#1A237E]/20"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="expiry">Expiry Date</Label>
                      <Input
                        id="expiry"
                        placeholder="MM/YY"
                        value={cardDetails.expiry}
                        onChange={(e) => setCardDetails({ ...cardDetails, expiry: e.target.value })}
                        className="border-[#1A237E]/20"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cvv">CVV</Label>
                      <Input
                        id="cvv"
                        type="password"
                        placeholder="123"
                        maxLength={4}
                        value={cardDetails.cvv}
                        onChange={(e) => setCardDetails({ ...cardDetails, cvv: e.target.value })}
                        className="border-[#1A237E]/20"
                      />
                    </div>
                  </div>
                </div>
              )}

              {selectedMethod === 'gcash' && (
                <div className="mt-6 p-4 bg-blue-50 rounded-lg animate-fade-in">
                  <p className="text-sm text-blue-800">
                    You will be redirected to GCash to complete your payment.
                  </p>
                </div>
              )}

              {selectedMethod === 'maya' && (
                <div className="mt-6 p-4 bg-green-50 rounded-lg animate-fade-in">
                  <p className="text-sm text-green-800">
                    You will be redirected to Maya to complete your payment.
                  </p>
                </div>
              )}

              {selectedMethod === 'bank_transfer' && (
                <div className="mt-6 space-y-4 animate-fade-in">
                  <Alert className="bg-purple-50 border-purple-200">
                    <AlertCircle className="w-4 h-4 text-purple-600" />
                    <AlertDescription className="text-purple-700">
                      Please transfer the exact amount to the following account:
                    </AlertDescription>
                  </Alert>
                  <div className="p-4 bg-gray-50 rounded-lg space-y-2">
                    <p><strong>Bank:</strong> BDO Unibank</p>
                    <p><strong>Account Name:</strong> City Treasurer's Office</p>
                    <p><strong>Account Number:</strong> 1234-5678-9012</p>
                    <p><strong>Reference:</strong> {application.referenceNumber}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Order Summary */}
        <div>
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle className="text-[#1A237E]">Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="pb-4 border-b">
                <p className="text-sm text-gray-500">Application</p>
                <p className="font-medium text-[#1A237E]">{application.referenceNumber}</p>
                <p className="text-sm">{application.businessInfo.businessName}</p>
              </div>

              <div className="space-y-2">
                <p className="font-medium text-[#1A237E]">Fee Breakdown</p>
                {feeBreakdown.map((item) => (
                  <div key={item.item} className="flex justify-between text-sm">
                    <span className="text-gray-600">{item.item}</span>
                    <span>₱{item.amount.toLocaleString()}</span>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-[#1A237E]">Total Amount</span>
                  <span className="text-2xl font-bold text-[#1A237E]">
                    ₱{totalAmount.toLocaleString()}
                  </span>
                </div>
              </div>

              <Button
                onClick={handlePayment}
                disabled={!selectedMethod || isProcessing}
                className="w-full bg-[#1A237E] text-white hover:bg-[#283593]"
              >
                {isProcessing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                    Processing...
                  </>
                ) : (
                  <>
                    Pay ₱{totalAmount.toLocaleString()}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>

              <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                <Lock className="w-3 h-3" />
                <span>Secure SSL Encrypted Payment</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Success Dialog */}
      <Dialog open={showSuccess} onOpenChange={setShowSuccess}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-[#1A237E]">Payment Successful!</DialogTitle>
          </DialogHeader>
          <div className="text-center py-6">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <p className="text-lg font-medium text-gray-700 mb-2">
              ₱{totalAmount.toLocaleString()}
            </p>
            <p className="text-gray-500 mb-4">
              Payment for {application.referenceNumber} has been received.
            </p>
            <p className="text-sm text-gray-400">
              A receipt has been sent to your email.
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1 border-[#1A237E] text-[#1A237E]"
              onClick={() => setShowSuccess(false)}
            >
              <Receipt className="w-4 h-4 mr-2" />
              View Receipt
            </Button>
            <Button
              className="flex-1 bg-[#1A237E] text-white"
              onClick={() => setShowSuccess(false)}
            >
              Done
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
