import { useState, useRef } from 'react';
import {
  Download,
  QrCode,
  Building2,
  User,
  MapPin,
  Calendar,
  FileText,
  Shield,
  Printer,
  BadgeCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAuthStore, useApplicationStore, usePermitStore } from '@/store';
import { format, addYears } from 'date-fns';

export function DigitalPermits() {
  const { user } = useAuthStore();
  const { getApplicationsByUser } = useApplicationStore();
  const { permits, generatePermit } = usePermitStore();
  const [selectedPermit, setSelectedPermit] = useState<any>(null);
  const [showPermitDialog, setShowPermitDialog] = useState(false);
  const permitRef = useRef<HTMLDivElement>(null);

  const userApplications = user ? getApplicationsByUser(user.id) : [];
  const approvedApplications = userApplications.filter(
    (app) => app.status === 'approved' || app.status === 'permit_issued'
  );

  const handleViewPermit = (application: any) => {
    // Generate permit if not exists
    let permit = permits.find((p) => p.applicationId === application.id);
    if (!permit) {
      permit = generatePermit(application);
    }
    setSelectedPermit({ ...permit, application });
    setShowPermitDialog(true);
  };

  const handleDownload = () => {
    // In a real app, this would generate a PDF
    alert('Downloading permit PDF...');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#1A237E]">My Permits</h1>
        <p className="text-gray-600">View and download your business permits</p>
      </div>

      {/* Permits List */}
      {approvedApplications.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <BadgeCheck className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-700 mb-2">No permits yet</h3>
            <p className="text-gray-500">
              Your permits will appear here once your applications are approved
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {approvedApplications.map((application) => (
            <Card key={application.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-[#1A237E] to-[#283593] rounded-xl flex items-center justify-center flex-shrink-0">
                    <Shield className="w-8 h-8 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge className="bg-green-100 text-green-700">Active</Badge>
                    </div>
                    <h3 className="font-semibold text-[#1A237E] text-lg">
                      {application.businessInfo.businessName}
                    </h3>
                    <p className="text-sm text-gray-500">{application.referenceNumber}</p>
                    <div className="mt-3 space-y-1 text-sm">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar className="w-4 h-4" />
                        <span>
                          Valid until:{' '}
                          {format(
                            addYears(application.approvedAt || new Date(), 1),
                            'MMM d, yyyy'
                          )}
                        </span>
                      </div>
                    </div>
                    <div className="mt-4 flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleViewPermit(application)}
                        className="bg-[#1A237E] text-white"
                      >
                        <FileText className="w-4 h-4 mr-1" />
                        View Permit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleDownload}
                        className="border-[#1A237E]/20 text-[#1A237E]"
                      >
                        <Download className="w-4 h-4 mr-1" />
                        Download
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Permit Dialog */}
      <Dialog open={showPermitDialog} onOpenChange={setShowPermitDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle className="text-[#1A237E]">Business Permit</DialogTitle>
          </DialogHeader>
          {selectedPermit && (
            <div className="space-y-4">
              {/* Permit Card */}
              <div
                ref={permitRef}
                className="bg-gradient-to-br from-[#1A237E] to-[#283593] rounded-xl p-8 text-white print:bg-white print:text-black"
              >
                {/* Header */}
                <div className="text-center border-b border-white/20 pb-4 mb-6">
                  <div className="flex items-center justify-center gap-3 mb-2">
                    <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center">
                      <Building2 className="w-6 h-6" />
                    </div>
                  </div>
                  <h2 className="text-xl font-bold">Republic of the Philippines</h2>
                  <p className="text-white/80">City/Municipality of ____________</p>
                  <h1 className="text-2xl font-bold mt-4">BUSINESS PERMIT</h1>
                  <p className="text-white/80">Mayor's Permit to Operate</p>
                </div>

                {/* Permit Number */}
                <div className="text-center mb-6">
                  <p className="text-white/60 text-sm">Permit Number</p>
                  <p className="text-2xl font-bold tracking-wider">{selectedPermit.permitNumber}</p>
                </div>

                {/* Business Info */}
                <div className="space-y-4 mb-6">
                  <div className="flex items-start gap-3">
                    <Building2 className="w-5 h-5 mt-0.5 text-white/60" />
                    <div>
                      <p className="text-white/60 text-sm">Business Name</p>
                      <p className="font-semibold text-lg">{selectedPermit.businessName}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <User className="w-5 h-5 mt-0.5 text-white/60" />
                    <div>
                      <p className="text-white/60 text-sm">Owner/Proprietor</p>
                      <p className="font-semibold">{selectedPermit.ownerName}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 mt-0.5 text-white/60" />
                    <div>
                      <p className="text-white/60 text-sm">Business Address</p>
                      <p className="font-semibold">{selectedPermit.businessAddress}</p>
                    </div>
                  </div>
                </div>

                {/* Validity */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-white/10 rounded-lg p-3">
                    <p className="text-white/60 text-sm">Date Issued</p>
                    <p className="font-semibold">{format(selectedPermit.issueDate, 'MMM d, yyyy')}</p>
                  </div>
                  <div className="bg-white/10 rounded-lg p-3">
                    <p className="text-white/60 text-sm">Valid Until</p>
                    <p className="font-semibold">{format(selectedPermit.expiryDate, 'MMM d, yyyy')}</p>
                  </div>
                </div>

                {/* QR Code */}
                <div className="flex items-center justify-center gap-4">
                  <div className="w-24 h-24 bg-white rounded-lg flex items-center justify-center">
                    <QrCode className="w-16 h-16 text-[#1A237E]" />
                  </div>
                  <div className="text-sm text-white/60">
                    <p>Scan to verify</p>
                    <p>authenticity</p>
                  </div>
                </div>

                {/* Footer */}
                <div className="mt-6 pt-4 border-t border-white/20 text-center">
                  <p className="text-white/60 text-sm">
                    This permit is issued pursuant to the provisions of the Local Government Code of 1991
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 print:hidden">
                <Button
                  onClick={handlePrint}
                  variant="outline"
                  className="flex-1 border-[#1A237E] text-[#1A237E]"
                >
                  <Printer className="w-4 h-4 mr-2" />
                  Print
                </Button>
                <Button
                  onClick={handleDownload}
                  className="flex-1 bg-[#1A237E] text-white"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download PDF
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
