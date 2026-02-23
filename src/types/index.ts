export type UserRole = 'applicant' | 'staff' | 'treasurer' | 'admin';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  phone?: string;
  createdAt: Date;
  isActive: boolean;
}

export type ApplicationStatus = 
  | 'draft'
  | 'submitted'
  | 'under_review'
  | 'pending_payment'
  | 'payment_verified'
  | 'approved'
  | 'rejected'
  | 'permit_issued';

export interface BusinessInfo {
  businessName: string;
  businessType: string;
  tradeName?: string;
  registrationNumber?: string;
  tinNumber?: string;
  vatNumber?: string;
  businessAddress: string;
  barangay: string;
  city: string;
  province: string;
  zipCode: string;
  businessPhone: string;
  businessEmail: string;
  businessArea: number;
  totalFloorArea: number;
  numberOfEmployees: number;
  dateEstablished: string;
}

export interface OwnerInfo {
  firstName: string;
  lastName: string;
  middleName?: string;
  suffix?: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other';
  nationality: string;
  civilStatus: string;
  homeAddress: string;
  barangay: string;
  city: string;
  province: string;
  zipCode: string;
  phone: string;
  email: string;
  idType: string;
  idNumber: string;
}

export interface Document {
  id: string;
  applicationId: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  documentType: DocumentType;
  uploadDate: Date;
  status: 'pending' | 'verified' | 'rejected';
  notes?: string;
  url: string;
}

export type DocumentType =
  | 'dti_registration'
  | 'barangay_clearance'
  | 'lease_contract'
  | 'tax_declaration'
  | 'occupancy_permit'
  | 'sanitary_permit'
  | 'fire_safety'
  | 'zoning_clearance'
  | 'valid_id'
  | 'picture'
  | 'other';

export interface Payment {
  id: string;
  applicationId: string;
  amount: number;
  feeType: string;
  paymentMethod: 'credit_card' | 'debit_card' | 'gcash' | 'maya' | 'bank_transfer' | 'over_counter';
  transactionId?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';
  paymentDate?: Date;
  verifiedBy?: string;
  verifiedAt?: Date;
  receiptUrl?: string;
  notes?: string;
}

export interface Application {
  id: string;
  applicantId: string;
  referenceNumber: string;
  status: ApplicationStatus;
  businessInfo: BusinessInfo;
  ownerInfo: OwnerInfo;
  documents: Document[];
  payments: Payment[];
  submittedAt?: Date;
  reviewedAt?: Date;
  reviewedBy?: string;
  approvedAt?: Date;
  approvedBy?: string;
  permitId?: string;
  permitUrl?: string;
  expiryDate?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface StatusHistory {
  id: string;
  applicationId: string;
  status: ApplicationStatus;
  notes?: string;
  createdBy: string;
  createdByName: string;
  createdAt: Date;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  isRead: boolean;
  relatedTo?: string;
  relatedId?: string;
  createdAt: Date;
}

export interface Permit {
  id: string;
  applicationId: string;
  permitNumber: string;
  businessName: string;
  ownerName: string;
  businessAddress: string;
  issueDate: Date;
  expiryDate: Date;
  qrCode: string;
  pdfUrl: string;
  isActive: boolean;
}

export interface DashboardStats {
  totalApplications: number;
  pendingReview: number;
  pendingPayment: number;
  approved: number;
  rejected: number;
  permitsIssued: number;
  totalRevenue: number;
}

export interface FeeStructure {
  id: string;
  businessType: string;
  feeType: string;
  amount: number;
  description?: string;
  isActive: boolean;
}
