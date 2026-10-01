import { relations } from 'drizzle-orm';
import { boolean, integer, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';

// 1. Users table (linked to local auth & optional Firebase Auth)
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(),
  username: text('username').unique(),
  memberId: text('member_id').unique(),
  email: text('email').notNull(),
  role: text('role').notNull().default('member'), // 'super_admin' | 'admin' | 'moderator' | 'member'
  passwordHash: text('password_hash'),
  mustChangePassword: boolean('must_change_password').default(false),
  createdAt: timestamp('created_at').defaultNow(),
});

// 2. Profiles table (Digital Memory Book)
export const profiles = pgTable('profiles', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull().unique(),
  username: text('username').unique(),
  memberId: text('member_id').notNull().unique(), // e.g. BGPS23-0001
  fullName: text('full_name').notNull(),
  nickname: text('nickname'),
  mobileNumber: text('mobile_number'),
  gender: text('gender'),
  dateOfBirth: text('date_of_birth'),
  currentCity: text('current_city'),
  currentCountry: text('current_country').default('Bangladesh'),
  profession: text('profession'),
  universityCollege: text('university_college'),
  organization: text('organization'),
  bio: text('bio'),
  profilePhotoUrl: text('profile_photo_url'),
  verificationStatus: text('verification_status').notNull().default('pending'), // 'pending' | 'verified' | 'rejected' | 'suspended'
  rejectionReason: text('rejection_reason'),
  correctionNotes: text('correction_notes'),
  verifiedAt: timestamp('verified_at'),
  verifiedBy: integer('verified_by').references(() => users.id),
  showPhone: boolean('show_phone').default(false),
  showEmail: boolean('show_email').default(false),
  showCity: boolean('show_city').default(true),
  showFacebook: boolean('show_facebook').default(true),
  showInstagram: boolean('show_instagram').default(true),
  showLinkedin: boolean('show_linkedin').default(true),
  facebookUrl: text('facebook_url'),
  instagramUrl: text('instagram_url'),
  linkedinUrl: text('linkedin_url'),
  whatsappNumber: text('whatsapp_number'),
  websiteUrl: text('website_url'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// 3. School Information table
export const schoolInformation = pgTable('school_information', {
  id: serial('id').primaryKey(),
  profileId: integer('profile_id').references(() => profiles.id).notNull().unique(),
  schoolName: text('school_name').notNull().default("Border Guard Public School, Cox's Bazar"),
  sscYear: integer('ssc_year').notNull().default(2023),
  rollNumber: text('roll_number').notNull(),
  groupStream: text('group_stream').notNull(), // 'Science' | 'Humanities' | 'Business Studies' | 'Other'
  section: text('section').notNull().default('A'), // 'A', 'B', 'C', 'Padma', 'Meghna', etc.
  studentId: text('student_id'),
  house: text('house'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// 4. Verification Documents (Private proof - extensible for future)
export const verificationDocuments = pgTable('verification_documents', {
  id: serial('id').primaryKey(),
  profileId: integer('profile_id').references(() => profiles.id).notNull(),
  documentType: text('document_type').notNull(),
  fileUrl: text('file_url').notNull(),
  fileName: text('file_name'),
  fileSize: integer('file_size'),
  createdAt: timestamp('created_at').defaultNow(),
});

// 5. Feature Flags (Modular architecture: toggle features on/off)
export const featureFlags = pgTable('feature_flags', {
  id: serial('id').primaryKey(),
  featureName: text('feature_name').notNull().unique(),
  displayName: text('display_name').notNull(),
  enabled: boolean('enabled').notNull().default(false),
  description: text('description'),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// 6. Events table (Future-ready database architecture)
export const events = pgTable('events', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  eventType: text('event_type').notNull().default('Reunion'),
  eventDate: text('event_date').notNull(),
  startTime: text('start_time'),
  endTime: text('end_time'),
  venue: text('venue').notNull(),
  address: text('address'),
  description: text('description'),
  coverImage: text('cover_image'),
  registrationDeadline: text('registration_deadline'),
  registrationFee: integer('registration_fee').notNull().default(0),
  maxParticipants: integer('max_participants'),
  organizer: text('organizer').default('SSC 2023 Committee'),
  contactInfo: text('contact_info'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
});

// 7. Event Registrations (Future-ready)
export const eventRegistrations = pgTable('event_registrations', {
  id: serial('id').primaryKey(),
  eventId: integer('event_id').references(() => events.id).notNull(),
  userId: integer('user_id').references(() => users.id).notNull(),
  profileId: integer('profile_id').references(() => profiles.id).notNull(),
  status: text('status').notNull().default('payment_pending'),
  guestCount: integer('guest_count').default(0),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
});

// 8. Payments table (Future-ready)
export const payments = pgTable('payments', {
  id: serial('id').primaryKey(),
  eventId: integer('event_id').references(() => events.id).notNull(),
  registrationId: integer('registration_id').references(() => eventRegistrations.id),
  userId: integer('user_id').references(() => users.id).notNull(),
  paymentMethod: text('payment_method').notNull(),
  amount: integer('amount').notNull(),
  senderNumber: text('sender_number').notNull(),
  transactionId: text('transaction_id').notNull(),
  screenshotUrl: text('screenshot_url').notNull(),
  paymentDate: text('payment_date').notNull(),
  note: text('note'),
  status: text('status').notNull().default('pending'),
  adminNotes: text('admin_notes'),
  reviewedBy: integer('reviewed_by').references(() => users.id),
  reviewedAt: timestamp('reviewed_at'),
  createdAt: timestamp('created_at').defaultNow(),
});

// 9. Notices table (Future-ready)
export const notices = pgTable('notices', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  priority: text('priority').notNull().default('normal'),
  targetAudience: text('target_audience').default('all'),
  relatedEventId: integer('related_event_id').references(() => events.id),
  attachmentUrl: text('attachment_url'),
  publishedBy: integer('published_by').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow(),
});

// 10. Notifications table
export const notifications = pgTable('notifications', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  title: text('title').notNull(),
  message: text('message').notNull(),
  type: text('type').default('system'),
  isRead: boolean('is_read').default(false),
  link: text('link'),
  createdAt: timestamp('created_at').defaultNow(),
});

// 11. Gallery / School Memories (Active)
export const gallery = pgTable('gallery', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  title: text('title').notNull(),
  caption: text('caption'),
  category: text('category').default('School Days'),
  imageUrl: text('image_url').notNull(),
  status: text('status').default('approved'),
  uploadedByName: text('uploaded_by_name'),
  createdAt: timestamp('created_at').defaultNow(),
});

// 12. Site Settings
export const siteSettings = pgTable('site_settings', {
  id: serial('id').primaryKey(),
  schoolName: text('school_name').default("Border Guard Public School, Cox's Bazar"),
  batchYear: text('batch_year').default("SSC 2023"),
  tagline: text('tagline').default("Old Memories. New Connections. One Batch."),
  aboutText: text('about_text'),
  bkashNumber: text('bkash_number').default("01819-123456 (Personal)"),
  nagadNumber: text('nagad_number').default("01711-654321 (Personal)"),
  rocketNumber: text('rocket_number').default("01819-123456-7 (Personal)"),
  bankInfo: text('bank_info').default("Islami Bank Bangladesh Ltd, Cox's Bazar Branch"),
  paymentInstructions: text('payment_instructions').default("Reunion payment instructions will appear when reunion registration opens."),
  contactEmail: text('contact_email').default("bgps.ssc2023@gmail.com"),
  contactPhone: text('contact_phone').default("+880 1819-123456"),
  facebookGroup: text('facebook_group').default("https://facebook.com/groups/bgpsssc2023"),
  registrationOpen: boolean('registration_open').default(true),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// 13. Audit Logs
export const auditLogs = pgTable('audit_logs', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id),
  userEmail: text('user_email'),
  action: text('action').notNull(),
  recordType: text('record_type'),
  recordId: text('record_id'),
  details: text('details'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  profile: one(profiles, {
    fields: [users.id],
    references: [profiles.userId],
  }),
  notifications: many(notifications),
  galleryUploads: many(gallery),
}));

export const profilesRelations = relations(profiles, ({ one }) => ({
  user: one(users, {
    fields: [profiles.userId],
    references: [users.id],
  }),
  schoolInfo: one(schoolInformation, {
    fields: [profiles.id],
    references: [schoolInformation.profileId],
  }),
}));
