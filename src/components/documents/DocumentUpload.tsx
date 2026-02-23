import { useState, useRef } from 'react';
import {
  Upload,
  CheckCircle,
  AlertCircle,
  FileText,
  Trash2,
  Eye,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useDocumentStore, useApplicationStore, useAuthStore } from '@/store';
import type { DocumentType } from '@/types';

const requiredDocuments: { type: DocumentType; label: string; description: string }[] = [
  { type: 'dti_registration', label: 'DTI Registration', description: 'Certificate of Business Name Registration' },
  { type: 'barangay_clearance', label: 'Barangay Clearance', description: 'Barangay Business Clearance' },
  { type: 'lease_contract', label: 'Lease Contract', description: 'Contract of Lease or Land Title' },
  { type: 'tax_declaration', label: 'Tax Declaration', description: 'Latest Tax Declaration' },
  { type: 'occupancy_permit', label: 'Occupancy Permit', description: 'Certificate of Occupancy' },
  { type: 'sanitary_permit', label: 'Sanitary Permit', description: 'Health/Sanitary Permit' },
  { type: 'fire_safety', label: 'Fire Safety Certificate', description: 'Fire Safety Inspection Certificate' },
  { type: 'zoning_clearance', label: 'Zoning Clearance', description: 'Zoning Compliance Certificate' },
  { type: 'valid_id', label: 'Valid ID', description: 'Government-issued ID of owner' },
  { type: 'picture', label: '2x2 Picture', description: 'Recent 2x2 photo of owner' },
];

export function DocumentUpload() {
  const { user } = useAuthStore();
  const { getApplicationsByUser } = useApplicationStore();
  const { addDocument, removeDocument, getDocumentsByApplication } = useDocumentStore();
  const [selectedApplication, setSelectedApplication] = useState<string>('');
  const [uploading, setUploading] = useState<Record<string, boolean>>({});
  const [progress, setProgress] = useState<Record<string, number>>({});
  const [previewDoc, setPreviewDoc] = useState<{ url: string; name: string } | null>(null);
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const userApplications = user ? getApplicationsByUser(user.id) : [];
  const activeApplications = userApplications.filter(a => ['draft', 'submitted', 'under_review'].includes(a.status));

  const handleFileSelect = async (docType: DocumentType, files: FileList | null) => {
    if (!files || files.length === 0 || !selectedApplication) return;

    const file = files[0];
    setUploading((prev) => ({ ...prev, [docType]: true }));
    setProgress((prev) => ({ ...prev, [docType]: 0 }));

    // Simulate upload progress
    for (let i = 0; i <= 100; i += 10) {
      await new Promise((resolve) => setTimeout(resolve, 100));
      setProgress((prev) => ({ ...prev, [docType]: i }));
    }

    // Create mock document
    const mockUrl = URL.createObjectURL(file);
    addDocument({
      applicationId: selectedApplication,
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
      documentType: docType,
      status: 'pending',
      url: mockUrl,
    });

    setUploading((prev) => ({ ...prev, [docType]: false }));
  };

  const handleDelete = (docId: string) => {
    removeDocument(docId);
  };

  const getDocumentForType = (docType: DocumentType) => {
    if (!selectedApplication) return null;
    return getDocumentsByApplication(selectedApplication).find((d) => d.documentType === docType);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1A237E]">Document Upload</h1>
          <p className="text-gray-600">Upload required documents for your permit application</p>
        </div>
      </div>

      {/* Application Selector */}
      <Card>
        <CardContent className="p-4">
          <label className="block text-sm font-medium text-[#1A237E] mb-2">
            Select Application
          </label>
          <select
            value={selectedApplication}
            onChange={(e) => setSelectedApplication(e.target.value)}
            className="w-full p-2 border border-[#1A237E]/20 rounded-lg focus:ring-2 focus:ring-[#1A237E] focus:border-transparent"
          >
            <option value="">Select an application</option>
            {activeApplications.map((app) => (
              <option key={app.id} value={app.id}>
                {app.referenceNumber} - {app.businessInfo.businessName}
              </option>
            ))}
          </select>
          {activeApplications.length === 0 && (
            <Alert className="mt-4 bg-yellow-50 border-yellow-200">
              <AlertCircle className="w-4 h-4 text-yellow-600" />
              <AlertDescription className="text-yellow-700">
                You don't have any active applications.{' '}
                <a href="/apply" className="underline font-medium">Apply for a permit</a>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Documents Grid */}
      {selectedApplication && (
        <div className="grid md:grid-cols-2 gap-4">
          {requiredDocuments.map((doc) => {
            const uploadedDoc = getDocumentForType(doc.type);
            const isUploading = uploading[doc.type];
            const uploadProgress = progress[doc.type];

            return (
              <Card
                key={doc.type}
                className={`transition-all ${uploadedDoc ? 'border-green-200 bg-green-50/30' : ''}`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      uploadedDoc ? 'bg-green-100' : 'bg-[#E3F2FD]'
                    }`}>
                      {uploadedDoc ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : (
                        <FileText className="w-5 h-5 text-[#1A237E]" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-[#1A237E]">{doc.label}</h3>
                      <p className="text-sm text-gray-500">{doc.description}</p>

                      {uploadedDoc ? (
                        <div className="mt-3 flex items-center gap-2">
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            Uploaded
                          </Badge>
                          <span className="text-xs text-gray-500">
                            {formatFileSize(uploadedDoc.fileSize)}
                          </span>
                        </div>
                      ) : isUploading ? (
                        <div className="mt-3">
                          <Progress value={uploadProgress} className="h-2" />
                          <p className="text-xs text-gray-500 mt-1">Uploading... {uploadProgress}%</p>
                        </div>
                      ) : (
                        <div className="mt-3">
                          <input
                            type="file"
                            ref={(el) => { fileInputRefs.current[doc.type] = el; }}
                            onChange={(e) => handleFileSelect(doc.type, e.target.files)}
                            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                            className="hidden"
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => fileInputRefs.current[doc.type]?.click()}
                            className="border-[#1A237E]/20 text-[#1A237E]"
                          >
                            <Upload className="w-4 h-4 mr-1" />
                            Upload
                          </Button>
                        </div>
                      )}

                      {uploadedDoc && (
                        <div className="mt-3 flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setPreviewDoc({ url: uploadedDoc.url, name: uploadedDoc.fileName })}
                            className="text-[#1A237E]"
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(uploadedDoc.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            Remove
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Document Preview Dialog */}
      <Dialog open={!!previewDoc} onOpenChange={() => setPreviewDoc(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="text-[#1A237E]">{previewDoc?.name}</DialogTitle>
          </DialogHeader>
          {previewDoc && (
            <div className="flex items-center justify-center bg-gray-100 rounded-lg overflow-hidden" style={{ height: '60vh' }}>
              {previewDoc.url.match(/\.(jpg|jpeg|png)$/i) ? (
                <img
                  src={previewDoc.url}
                  alt={previewDoc.name}
                  className="max-w-full max-h-full object-contain"
                />
              ) : (
                <div className="text-center p-8">
                  <FileText className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-600">Document preview not available</p>
                  <a
                    href={previewDoc.url}
                    download={previewDoc.name}
                    className="mt-4 inline-block"
                  >
                    <Button className="bg-[#1A237E] text-white">
                      <Upload className="w-4 h-4 mr-2" />
                      Download File
                    </Button>
                  </a>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
