import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, UserRole, Application, Document, Payment, Notification, Permit, DashboardStats, BusinessInfo, OwnerInfo } from '@/types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  register: (data: RegisterData) => Promise<boolean>;
}

interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
  role?: UserRole;
}

interface ApplicationState {
  applications: Application[];
  currentApplication: Application | null;
  createApplication: (data: Partial<Application>) => Application;
  updateApplication: (id: string, data: Partial<Application>) => void;
  submitApplication: (id: string) => void;
  getApplicationsByUser: (userId: string) => Application[];
  getApplicationById: (id: string) => Application | undefined;
  updateStatus: (id: string, status: Application['status'], notes?: string) => void;
}

interface DocumentState {
  documents: Document[];
  addDocument: (doc: Omit<Document, 'id' | 'uploadDate'>) => Document;
  removeDocument: (id: string) => void;
  verifyDocument: (id: string, status: Document['status'], notes?: string) => void;
  getDocumentsByApplication: (applicationId: string) => Document[];
}

interface PaymentState {
  payments: Payment[];
  addPayment: (payment: Omit<Payment, 'id'>) => Payment;
  verifyPayment: (id: string, verifiedBy: string) => void;
  getPaymentsByApplication: (applicationId: string) => Payment[];
}

interface NotificationState {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: (userId: string) => void;
  getUnreadCount: (userId: string) => number;
  getNotificationsByUser: (userId: string) => Notification[];
}

interface PermitState {
  permits: Permit[];
  generatePermit: (application: Application) => Permit;
  revokePermit: (id: string) => void;
  getPermitByApplication: (applicationId: string) => Permit | undefined;
}

interface DashboardState {
  stats: DashboardStats;
  updateStats: () => void;
}

// Mock users for demo
const mockUsers: User[] = [
  {
    id: '1',
    email: 'applicant@demo.com',
    firstName: 'Juan',
    lastName: 'Dela Cruz',
    role: 'applicant',
    phone: '09123456789',
    createdAt: new Date('2024-01-01'),
    isActive: true,
  },
  {
    id: '2',
    email: 'staff@demo.com',
    firstName: 'Maria',
    lastName: 'Santos',
    role: 'staff',
    phone: '09187654321',
    createdAt: new Date('2024-01-01'),
    isActive: true,
  },
  {
    id: '3',
    email: 'treasurer@demo.com',
    firstName: 'Pedro',
    lastName: 'Reyes',
    role: 'treasurer',
    phone: '09234567890',
    createdAt: new Date('2024-01-01'),
    isActive: true,
  },
  {
    id: '4',
    email: 'admin@demo.com',
    firstName: 'Ana',
    lastName: 'Garcia',
    role: 'admin',
    phone: '09345678901',
    createdAt: new Date('2024-01-01'),
    isActive: true,
  },
];

// Sample applications
const sampleApplications: Application[] = [
  {
    id: 'app-001',
    applicantId: '1',
    referenceNumber: 'BP-2024-0001',
    status: 'approved',
    businessInfo: {
      businessName: 'Dela Cruz Sari-Sari Store',
      businessType: 'sole_proprietorship',
      businessAddress: '123 Main Street',
      barangay: 'Barangay 1',
      city: 'Manila',
      province: 'Metro Manila',
      zipCode: '1000',
      businessPhone: '09123456789',
      businessEmail: 'business@delacruz.com',
      businessArea: 50,
      totalFloorArea: 50,
      numberOfEmployees: 2,
      dateEstablished: '2024-01-15',
    },
    ownerInfo: {
      firstName: 'Juan',
      lastName: 'Dela Cruz',
      dateOfBirth: '1985-05-15',
      gender: 'male',
      nationality: 'Filipino',
      civilStatus: 'married',
      homeAddress: '123 Main Street',
      barangay: 'Barangay 1',
      city: 'Manila',
      province: 'Metro Manila',
      zipCode: '1000',
      phone: '09123456789',
      email: 'juan@delacruz.com',
      idType: 'passport',
      idNumber: 'P123456789',
    },
    documents: [],
    payments: [],
    submittedAt: new Date('2024-02-01'),
    reviewedAt: new Date('2024-02-03'),
    reviewedBy: '2',
    approvedAt: new Date('2024-02-05'),
    approvedBy: '2',
    permitId: 'PERMIT-001',
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-02-05'),
  },
  {
    id: 'app-002',
    applicantId: '1',
    referenceNumber: 'BP-2024-0002',
    status: 'pending_payment',
    businessInfo: {
      businessName: 'Juan\'s Computer Shop',
      businessType: 'sole_proprietorship',
      businessAddress: '456 Tech Street',
      barangay: 'Barangay 5',
      city: 'Manila',
      province: 'Metro Manila',
      zipCode: '1000',
      businessPhone: '09123456790',
      businessEmail: 'tech@juanshop.com',
      businessArea: 100,
      totalFloorArea: 100,
      numberOfEmployees: 5,
      dateEstablished: '2024-02-01',
    },
    ownerInfo: {
      firstName: 'Juan',
      lastName: 'Dela Cruz',
      dateOfBirth: '1985-05-15',
      gender: 'male',
      nationality: 'Filipino',
      civilStatus: 'married',
      homeAddress: '123 Main Street',
      barangay: 'Barangay 1',
      city: 'Manila',
      province: 'Metro Manila',
      zipCode: '1000',
      phone: '09123456789',
      email: 'juan@delacruz.com',
      idType: 'passport',
      idNumber: 'P123456789',
    },
    documents: [],
    payments: [],
    submittedAt: new Date('2024-02-10'),
    reviewedAt: new Date('2024-02-12'),
    reviewedBy: '2',
    createdAt: new Date('2024-02-10'),
    updatedAt: new Date('2024-02-12'),
  },
];

// Sample notifications
const sampleNotifications: Notification[] = [
  {
    id: 'notif-001',
    userId: '1',
    title: 'Application Approved',
    message: 'Your business permit application BP-2024-0001 has been approved.',
    type: 'success',
    isRead: false,
    relatedTo: 'application',
    relatedId: 'app-001',
    createdAt: new Date('2024-02-05'),
  },
  {
    id: 'notif-002',
    userId: '1',
    title: 'Payment Required',
    message: 'Please complete payment for application BP-2024-0002.',
    type: 'warning',
    isRead: false,
    relatedTo: 'application',
    relatedId: 'app-002',
    createdAt: new Date('2024-02-12'),
  },
];

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      login: async (email: string, password: string) => {
        // Mock login - in real app, this would call an API
        const user = mockUsers.find(u => u.email === email);
        if (user && password === 'demo123') {
          set({ user, isAuthenticated: true });
          return true;
        }
        return false;
      },
      logout: () => {
        set({ user: null, isAuthenticated: false });
      },
      register: async (data: RegisterData) => {
        // Mock registration
        const newUser: User = {
          id: `user-${Date.now()}`,
          email: data.email,
          firstName: data.firstName,
          lastName: data.lastName,
          role: data.role || 'applicant',
          phone: data.phone,
          createdAt: new Date(),
          isActive: true,
        };
        set({ user: newUser, isAuthenticated: true });
        return true;
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);

export const useApplicationStore = create<ApplicationState>((set, get) => ({
  applications: sampleApplications,
  currentApplication: null,
  createApplication: (data: Partial<Application>) => {
    const newApp: Application = {
      id: `app-${Date.now()}`,
      applicantId: data.applicantId || '',
      referenceNumber: `BP-2024-${String(get().applications.length + 1).padStart(4, '0')}`,
      status: 'draft',
      businessInfo: data.businessInfo || {} as BusinessInfo,
      ownerInfo: data.ownerInfo || {} as OwnerInfo,
      documents: [],
      payments: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    set(state => ({
      applications: [...state.applications, newApp],
      currentApplication: newApp,
    }));
    return newApp;
  },
  updateApplication: (id: string, data: Partial<Application>) => {
    set(state => ({
      applications: state.applications.map(app =>
        app.id === id ? { ...app, ...data, updatedAt: new Date() } : app
      ),
      currentApplication: state.currentApplication?.id === id
        ? { ...state.currentApplication, ...data, updatedAt: new Date() }
        : state.currentApplication,
    }));
  },
  submitApplication: (id: string) => {
    set(state => ({
      applications: state.applications.map(app =>
        app.id === id
          ? { ...app, status: 'submitted' as const, submittedAt: new Date(), updatedAt: new Date() }
          : app
      ),
    }));
  },
  getApplicationsByUser: (_userId: string) => {
    return [];
  },
  getApplicationById: (_id: string) => {
    return undefined;
  },
  updateStatus: (id: string, status: Application['status'], notes?: string) => {
    set(state => ({
      applications: state.applications.map(app =>
        app.id === id
          ? { ...app, status, notes: notes || app.notes, updatedAt: new Date() }
          : app
      ),
    }));
  },
}));

export const useDocumentStore = create<DocumentState>((set, get) => ({
  documents: [],
  addDocument: (doc: Omit<Document, 'id' | 'uploadDate'>) => {
    const newDoc: Document = {
      ...doc,
      id: `doc-${Date.now()}`,
      uploadDate: new Date(),
    };
    set(state => ({ documents: [...state.documents, newDoc] }));
    return newDoc;
  },
  removeDocument: (id: string) => {
    set(state => ({
      documents: state.documents.filter(doc => doc.id !== id),
    }));
  },
  verifyDocument: (id: string, status: Document['status'], notes?: string) => {
    set(state => ({
      documents: state.documents.map(doc =>
        doc.id === id ? { ...doc, status, notes } : doc
      ),
    }));
  },
  getDocumentsByApplication: (applicationId: string) => {
    return get().documents.filter(doc => doc.applicationId === applicationId);
  },
}));

export const usePaymentStore = create<PaymentState>((set, get) => ({
  payments: [],
  addPayment: (payment: Omit<Payment, 'id'>) => {
    const newPayment: Payment = {
      ...payment,
      id: `pay-${Date.now()}`,
    };
    set(state => ({ payments: [...state.payments, newPayment] }));
    return newPayment;
  },
  verifyPayment: (id: string, verifiedBy: string) => {
    set(state => ({
      payments: state.payments.map(pay =>
        pay.id === id
          ? { ...pay, status: 'completed' as const, verifiedBy, verifiedAt: new Date() }
          : pay
      ),
    }));
  },
  getPaymentsByApplication: (applicationId: string) => {
    return get().payments.filter(pay => pay.applicationId === applicationId);
  },
}));

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: sampleNotifications,
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt'>) => {
    const newNotif: Notification = {
      ...notification,
      id: `notif-${Date.now()}`,
      createdAt: new Date(),
    };
    set(state => ({ notifications: [...state.notifications, newNotif] }));
  },
  markAsRead: (id: string) => {
    set(state => ({
      notifications: state.notifications.map(notif =>
        notif.id === id ? { ...notif, isRead: true } : notif
      ),
    }));
  },
  markAllAsRead: (userId: string) => {
    set(state => ({
      notifications: state.notifications.map(notif =>
        notif.userId === userId ? { ...notif, isRead: true } : notif
      ),
    }));
  },
  getUnreadCount: (userId: string) => {
    return get().notifications.filter(n => n.userId === userId && !n.isRead).length;
  },
  getNotificationsByUser: (userId: string) => {
    return get().notifications
      .filter(n => n.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  },
}));

export const usePermitStore = create<PermitState>((set, get) => ({
  permits: [],
  generatePermit: (application: Application) => {
    const permit: Permit = {
      id: `permit-${Date.now()}`,
      applicationId: application.id,
      permitNumber: `BP-${new Date().getFullYear()}-${String(get().permits.length + 1).padStart(6, '0')}`,
      businessName: application.businessInfo.businessName,
      ownerName: `${application.ownerInfo.firstName} ${application.ownerInfo.lastName}`,
      businessAddress: application.businessInfo.businessAddress,
      issueDate: new Date(),
      expiryDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
      qrCode: '',
      pdfUrl: '',
      isActive: true,
    };
    set(state => ({ permits: [...state.permits, permit] }));
    return permit;
  },
  revokePermit: (id: string) => {
    set(state => ({
      permits: state.permits.map(p =>
        p.id === id ? { ...p, isActive: false } : p
      ),
    }));
  },
  getPermitByApplication: (applicationId: string) => {
    return get().permits.find(p => p.applicationId === applicationId);
  },
}));

export const useDashboardStore = create<DashboardState>(() => ({
  stats: {
    totalApplications: 156,
    pendingReview: 23,
    pendingPayment: 18,
    approved: 89,
    rejected: 12,
    permitsIssued: 87,
    totalRevenue: 2458000,
  },
  updateStats: () => {
    // In real app, this would fetch from API
  },
}));
