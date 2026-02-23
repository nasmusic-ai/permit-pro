import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Building2,
  User,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  Save,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuthStore, useApplicationStore, useNotificationStore } from '@/store';

const businessTypes = [
  { value: 'sole_proprietorship', label: 'Sole Proprietorship' },
  { value: 'partnership', label: 'Partnership' },
  { value: 'corporation', label: 'Corporation' },
  { value: 'cooperative', label: 'Cooperative' },
  { value: 'single_proprietor', label: 'Single Proprietor' },
];

const civilStatusOptions = [
  { value: 'single', label: 'Single' },
  { value: 'married', label: 'Married' },
  { value: 'widowed', label: 'Widowed' },
  { value: 'separated', label: 'Separated' },
  { value: 'divorced', label: 'Divorced' },
];

const idTypes = [
  { value: 'passport', label: 'Passport' },
  { value: 'drivers_license', label: 'Driver\'s License' },
  { value: 'umid', label: 'UMID' },
  { value: 'sss', label: 'SSS ID' },
  { value: 'philhealth', label: 'PhilHealth ID' },
  { value: 'voters_id', label: 'Voter\'s ID' },
  { value: 'postal_id', label: 'Postal ID' },
  { value: 'national_id', label: 'National ID' },
];

const businessInfoSchema = z.object({
  businessName: z.string().min(2, 'Business name is required'),
  businessType: z.string().min(1, 'Business type is required'),
  tradeName: z.string().optional(),
  registrationNumber: z.string().optional(),
  tinNumber: z.string().optional(),
  vatNumber: z.string().optional(),
  businessAddress: z.string().min(5, 'Business address is required'),
  barangay: z.string().min(1, 'Barangay is required'),
  city: z.string().min(1, 'City is required'),
  province: z.string().min(1, 'Province is required'),
  zipCode: z.string().min(4, 'Valid ZIP code is required'),
  businessPhone: z.string().min(10, 'Valid phone number is required'),
  businessEmail: z.string().email('Valid email is required'),
  businessArea: z.number().min(1, 'Business area is required'),
  totalFloorArea: z.number().min(1, 'Floor area is required'),
  numberOfEmployees: z.number().min(0, 'Number of employees is required'),
  dateEstablished: z.string().min(1, 'Date established is required'),
});

const ownerInfoSchema = z.object({
  firstName: z.string().min(2, 'First name is required'),
  lastName: z.string().min(2, 'Last name is required'),
  middleName: z.string().optional(),
  suffix: z.string().optional(),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  gender: z.enum(['male', 'female', 'other']),
  nationality: z.string().min(1, 'Nationality is required'),
  civilStatus: z.string().min(1, 'Civil status is required'),
  homeAddress: z.string().min(5, 'Home address is required'),
  barangay: z.string().min(1, 'Barangay is required'),
  city: z.string().min(1, 'City is required'),
  province: z.string().min(1, 'Province is required'),
  zipCode: z.string().min(4, 'Valid ZIP code is required'),
  phone: z.string().min(10, 'Valid phone number is required'),
  email: z.string().email('Valid email is required'),
  idType: z.string().min(1, 'ID type is required'),
  idNumber: z.string().min(1, 'ID number is required'),
});

type BusinessInfoData = z.infer<typeof businessInfoSchema>;
type OwnerInfoData = z.infer<typeof ownerInfoSchema>;

export function ApplicationForm() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { createApplication, updateApplication } = useApplicationStore();
  const { addNotification } = useNotificationStore();
  const [currentStep, setCurrentStep] = useState(1);
  const [applicationId, setApplicationId] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const businessForm = useForm<BusinessInfoData>({
    resolver: zodResolver(businessInfoSchema),
    defaultValues: {
      businessArea: 0,
      totalFloorArea: 0,
      numberOfEmployees: 0,
    },
  });

  const ownerForm = useForm<OwnerInfoData>({
    resolver: zodResolver(ownerInfoSchema),
  });

  const handleSaveBusinessInfo = (data: BusinessInfoData) => {
    if (!applicationId) {
      const newApp = createApplication({
        applicantId: user?.id || '',
        businessInfo: data,
      });
      setApplicationId(newApp.id);
    } else {
      updateApplication(applicationId, { businessInfo: data });
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleSubmitApplication = (data: OwnerInfoData) => {
    if (applicationId) {
      updateApplication(applicationId, {
        ownerInfo: data,
        status: 'submitted',
        submittedAt: new Date(),
      });

      // Add notification
      addNotification({
        userId: user?.id || '',
        title: 'Application Submitted',
        message: 'Your business permit application has been submitted successfully.',
        type: 'success',
        isRead: false,
        relatedTo: 'application',
        relatedId: applicationId,
      });

      navigate('/applications');
    }
  };

  const steps = [
    { number: 1, title: 'Business Information', description: 'Enter business details' },
    { number: 2, title: 'Owner Information', description: 'Enter owner details' },
    { number: 3, title: 'Documents', description: 'Upload required documents' },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#1A237E] to-[#283593] rounded-xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">Business Permit Application</h1>
        <p className="text-white/80">Complete the form below to apply for a business permit.</p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={step.number} className="flex items-center">
            <div className={`flex flex-col items-center ${index < steps.length - 1 ? 'flex-1' : ''}`}>
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                  currentStep >= step.number
                    ? 'bg-[#1A237E] text-white'
                    : 'bg-gray-200 text-gray-500'
                }`}
              >
                {step.number}
              </div>
              <p className={`text-sm mt-2 font-medium ${currentStep >= step.number ? 'text-[#1A237E]' : 'text-gray-500'}`}>
                {step.title}
              </p>
            </div>
            {index < steps.length - 1 && (
              <div className={`w-full h-1 mx-4 ${currentStep > step.number ? 'bg-[#1A237E]' : 'bg-gray-200'}`} />
            )}
          </div>
        ))}
      </div>

      {/* Step 1: Business Information */}
      {currentStep === 1 && (
        <Card className="animate-fade-in">
          <CardHeader>
            <CardTitle className="text-[#1A237E] flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              Business Information
            </CardTitle>
            <CardDescription>
              Provide details about your business
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={businessForm.handleSubmit(handleSaveBusinessInfo)} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="businessName">Business Name *</Label>
                  <Input
                    id="businessName"
                    {...businessForm.register('businessName')}
                    className="border-[#1A237E]/20"
                  />
                  {businessForm.formState.errors.businessName && (
                    <p className="text-sm text-red-600">{businessForm.formState.errors.businessName.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="businessType">Business Type *</Label>
                  <Select onValueChange={(value) => businessForm.setValue('businessType', value)}>
                    <SelectTrigger className="border-[#1A237E]/20">
                      <SelectValue placeholder="Select business type" />
                    </SelectTrigger>
                    <SelectContent>
                      {businessTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tradeName">Trade Name (Optional)</Label>
                  <Input
                    id="tradeName"
                    {...businessForm.register('tradeName')}
                    className="border-[#1A237E]/20"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tinNumber">TIN Number</Label>
                  <Input
                    id="tinNumber"
                    {...businessForm.register('tinNumber')}
                    className="border-[#1A237E]/20"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="businessAddress">Business Address *</Label>
                  <Input
                    id="businessAddress"
                    {...businessForm.register('businessAddress')}
                    className="border-[#1A237E]/20"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="barangay">Barangay *</Label>
                  <Input
                    id="barangay"
                    {...businessForm.register('barangay')}
                    className="border-[#1A237E]/20"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city">City/Municipality *</Label>
                  <Input
                    id="city"
                    {...businessForm.register('city')}
                    className="border-[#1A237E]/20"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="province">Province *</Label>
                  <Input
                    id="province"
                    {...businessForm.register('province')}
                    className="border-[#1A237E]/20"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="zipCode">ZIP Code *</Label>
                  <Input
                    id="zipCode"
                    {...businessForm.register('zipCode')}
                    className="border-[#1A237E]/20"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="businessPhone">Business Phone *</Label>
                  <Input
                    id="businessPhone"
                    {...businessForm.register('businessPhone')}
                    className="border-[#1A237E]/20"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="businessEmail">Business Email *</Label>
                  <Input
                    id="businessEmail"
                    type="email"
                    {...businessForm.register('businessEmail')}
                    className="border-[#1A237E]/20"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="businessArea">Business Area (sqm) *</Label>
                  <Input
                    id="businessArea"
                    type="number"
                    {...businessForm.register('businessArea', { valueAsNumber: true })}
                    className="border-[#1A237E]/20"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="totalFloorArea">Total Floor Area (sqm) *</Label>
                  <Input
                    id="totalFloorArea"
                    type="number"
                    {...businessForm.register('totalFloorArea', { valueAsNumber: true })}
                    className="border-[#1A237E]/20"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="numberOfEmployees">Number of Employees *</Label>
                  <Input
                    id="numberOfEmployees"
                    type="number"
                    {...businessForm.register('numberOfEmployees', { valueAsNumber: true })}
                    className="border-[#1A237E]/20"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dateEstablished">Date Established *</Label>
                  <Input
                    id="dateEstablished"
                    type="date"
                    {...businessForm.register('dateEstablished')}
                    className="border-[#1A237E]/20"
                  />
                </div>
              </div>

              <div className="flex justify-between pt-4">
                <Button
                  type="submit"
                  variant="outline"
                  className="border-[#1A237E] text-[#1A237E]"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Draft
                </Button>
                <Button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="bg-[#1A237E] text-white"
                >
                  Next Step
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>

              {saved && (
                <Alert className="bg-green-50 border-green-200">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <AlertDescription className="text-green-700">
                    Draft saved successfully!
                  </AlertDescription>
                </Alert>
              )}
            </form>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Owner Information */}
      {currentStep === 2 && (
        <Card className="animate-fade-in">
          <CardHeader>
            <CardTitle className="text-[#1A237E] flex items-center gap-2">
              <User className="w-5 h-5" />
              Owner Information
            </CardTitle>
            <CardDescription>
              Provide details about the business owner
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={ownerForm.handleSubmit(handleSubmitApplication)} className="space-y-4">
              <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    {...ownerForm.register('firstName')}
                    className="border-[#1A237E]/20"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    {...ownerForm.register('lastName')}
                    className="border-[#1A237E]/20"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="middleName">Middle Name</Label>
                  <Input
                    id="middleName"
                    {...ownerForm.register('middleName')}
                    className="border-[#1A237E]/20"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    {...ownerForm.register('dateOfBirth')}
                    className="border-[#1A237E]/20"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gender">Gender *</Label>
                  <Select onValueChange={(value) => ownerForm.setValue('gender', value as 'male' | 'female' | 'other')}>
                    <SelectTrigger className="border-[#1A237E]/20">
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="civilStatus">Civil Status *</Label>
                  <Select onValueChange={(value) => ownerForm.setValue('civilStatus', value)}>
                    <SelectTrigger className="border-[#1A237E]/20">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      {civilStatusOptions.map((status) => (
                        <SelectItem key={status.value} value={status.value}>
                          {status.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="homeAddress">Home Address *</Label>
                <Input
                  id="homeAddress"
                  {...ownerForm.register('homeAddress')}
                  className="border-[#1A237E]/20"
                />
              </div>

              <div className="grid md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="ownerBarangay">Barangay *</Label>
                  <Input
                    id="ownerBarangay"
                    {...ownerForm.register('barangay')}
                    className="border-[#1A237E]/20"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ownerCity">City *</Label>
                  <Input
                    id="ownerCity"
                    {...ownerForm.register('city')}
                    className="border-[#1A237E]/20"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ownerProvince">Province *</Label>
                  <Input
                    id="ownerProvince"
                    {...ownerForm.register('province')}
                    className="border-[#1A237E]/20"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ownerZipCode">ZIP Code *</Label>
                  <Input
                    id="ownerZipCode"
                    {...ownerForm.register('zipCode')}
                    className="border-[#1A237E]/20"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    {...ownerForm.register('phone')}
                    className="border-[#1A237E]/20"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    {...ownerForm.register('email')}
                    className="border-[#1A237E]/20"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="idType">ID Type *</Label>
                  <Select onValueChange={(value) => ownerForm.setValue('idType', value)}>
                    <SelectTrigger className="border-[#1A237E]/20">
                      <SelectValue placeholder="Select ID type" />
                    </SelectTrigger>
                    <SelectContent>
                      {idTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="idNumber">ID Number *</Label>
                  <Input
                    id="idNumber"
                    {...ownerForm.register('idNumber')}
                    className="border-[#1A237E]/20"
                  />
                </div>
              </div>

              <div className="flex justify-between pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCurrentStep(1)}
                  className="border-[#1A237E] text-[#1A237E]"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Previous
                </Button>
                <Button
                  type="submit"
                  className="bg-[#1A237E] text-white"
                >
                  Submit Application
                  <CheckCircle className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
