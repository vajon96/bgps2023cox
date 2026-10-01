export interface User {
  id: number;
  username?: string | null;
  memberId?: string | null;
  email: string;
  role: 'super_admin' | 'admin' | 'moderator' | 'member';
  uid: string;
  mustChangePassword?: boolean;
}

export interface SchoolInfo {
  id?: number;
  profileId?: number;
  schoolName: string;
  sscYear: number;
  rollNumber: string;
  groupStream: 'Science' | 'Humanities' | 'Business Studies' | 'Other';
  section: string;
  studentId?: string | null;
  house?: string | null;
}

export interface Profile {
  id: number;
  userId: number;
  username?: string | null;
  memberId: string;
  fullName: string;
  nickname?: string | null;
  mobileNumber?: string | null;
  gender?: string | null;
  dateOfBirth?: string | null;
  currentCity?: string | null;
  currentCountry?: string | null;
  profession?: string | null;
  universityCollege?: string | null;
  organization?: string | null;
  bio?: string | null;
  profilePhotoUrl?: string | null;
  verificationStatus: 'pending' | 'verified' | 'rejected' | 'suspended' | 'correction_required';
  rejectionReason?: string | null;
  correctionNotes?: string | null;
  verifiedAt?: string | null;
  verifiedBy?: number | null;
  showPhone?: boolean;
  showEmail?: boolean;
  showCity?: boolean;
  showFacebook?: boolean;
  showInstagram?: boolean;
  showLinkedin?: boolean;
  facebookUrl?: string | null;
  instagramUrl?: string | null;
  linkedinUrl?: string | null;
  whatsappNumber?: string | null;
  websiteUrl?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface FeatureFlag {
  id: number;
  featureName: string;
  displayName: string;
  enabled: boolean;
  description?: string | null;
}

export interface ReunionEvent {
  id: number;
  title: string;
  eventType: string;
  eventDate: string;
  startTime?: string | null;
  endTime?: string | null;
  venue: string;
  address?: string | null;
  description?: string | null;
  coverImage?: string | null;
  registrationDeadline?: string | null;
  registrationFee: number;
  maxParticipants?: number | null;
  organizer?: string | null;
  contactInfo?: string | null;
  isActive: boolean;
  confirmedParticipants?: number;
}

export interface EventRegistration {
  id: number;
  eventId: number;
  userId: number;
  profileId: number;
  status: 'payment_pending' | 'confirmed' | 'rejected' | 'cancelled';
  guestCount: number;
  notes?: string | null;
  createdAt: string;
}

export interface Payment {
  id: number;
  eventId: number;
  eventTitle?: string;
  registrationId?: number;
  userId: number;
  memberId?: string;
  memberName?: string;
  memberRoll?: string;
  memberGroup?: string;
  paymentMethod: 'bKash' | 'Nagad' | 'Rocket' | 'Bank Transfer' | 'Other';
  amount: number;
  senderNumber: string;
  transactionId: string;
  screenshotUrl: string;
  paymentDate: string;
  note?: string | null;
  status: 'pending' | 'confirmed' | 'rejected' | 'correction_required';
  adminNotes?: string | null;
  reviewedBy?: number | null;
  reviewedAt?: string | null;
  createdAt: string;
}

export interface Notice {
  id: number;
  title: string;
  description: string;
  priority: 'normal' | 'important' | 'urgent';
  targetAudience?: string;
  relatedEventId?: number | null;
  attachmentUrl?: string | null;
  publishedBy?: number | null;
  createdAt: string;
}

export interface NotificationItem {
  id: number;
  userId: number;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  link?: string | null;
  createdAt: string;
}

export interface MemoryGallery {
  id: number;
  userId: number;
  title: string;
  caption?: string | null;
  category: string;
  imageUrl: string;
  status: 'pending' | 'approved' | 'rejected';
  uploadedByName?: string | null;
  createdAt: string;
}

export interface SiteSettings {
  id?: number;
  schoolName: string;
  batchYear: string;
  tagline: string;
  aboutText: string;
  bkashNumber?: string;
  nagadNumber?: string;
  rocketNumber?: string;
  bankInfo?: string;
  paymentInstructions?: string;
  contactEmail: string;
  contactPhone: string;
  facebookGroup?: string;
  registrationOpen: boolean;
}

export interface BatchStats {
  totalMembers: number;
  verifiedMembers: number;
  scienceCount: number;
  humanitiesCount: number;
  businessCount: number;
  upcomingEvents?: number;
  reunionParticipants?: number;
}
