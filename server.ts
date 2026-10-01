import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { and, desc, eq, ilike, or, sql } from 'drizzle-orm';
import { db } from './src/db/index.ts';
import {
  auditLogs,
  eventRegistrations,
  events,
  featureFlags,
  gallery,
  notices,
  notifications,
  payments,
  profiles,
  schoolInformation,
  siteSettings,
  users,
  verificationDocuments,
} from './src/db/schema.ts';
import { generateToken, requireAdmin, requireAuth, requireModerator, requireSuperAdmin, AuthRequest } from './src/middleware/auth.ts';
import {
  generateSecureTemporaryPassword,
  generateUniqueUsername,
  hashPassword,
  verifyPassword,
} from './src/lib/auth-utils.ts';
import { getOrCreateUser } from './src/db/users.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// CORS headers for iframe & preview environments
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Helper to log audit actions
async function recordAudit(userId: number | null, userEmail: string | null, action: string, recordType: string, recordId: string, details?: string) {
  try {
    await db.insert(auditLogs).values({
      userId,
      userEmail,
      action,
      recordType,
      recordId,
      details: details || '',
    });
  } catch (err) {
    console.error('Failed to write audit log:', err);
  }
}

// Helper to send notification
async function sendNotification(userId: number, title: string, message: string, type: string = 'system', link?: string) {
  try {
    await db.insert(notifications).values({
      userId,
      title,
      message,
      type,
      link: link || '',
    });
  } catch (err) {
    console.error('Failed to send notification:', err);
  }
}

// --- FEATURE FLAGS API ---

app.get('/api/features', async (_req, res) => {
  try {
    const flags = await db.select().from(featureFlags);
    // Return key-value dictionary and list
    const dict: Record<string, boolean> = {};
    for (const f of flags) {
      dict[f.featureName] = f.enabled;
    }
    res.json({ flags, dict });
  } catch (err) {
    console.error('Failed to load feature flags:', err);
    res.json({
      dict: {
        member_directory: true,
        registration: true,
        gallery: true,
        events: false,
        payments: false,
        notices: false,
        reunion_registration: false,
        donations: false,
      },
      flags: [],
    });
  }
});

app.put('/api/admin/features/:name', requireSuperAdmin, async (req: AuthRequest, res) => {
  try {
    const { name } = req.params;
    const { enabled } = req.body;
    const superAdmin = req.dbUser!;

    await db
      .update(featureFlags)
      .set({ enabled: Boolean(enabled), updatedAt: new Date() })
      .where(eq(featureFlags.featureName, name));

    await recordAudit(
      superAdmin.id,
      superAdmin.email,
      'FEATURE_TOGGLE',
      'feature_flags',
      name,
      `Set feature ${name} to ${enabled ? 'ENABLED' : 'DISABLED'}`
    );

    res.json({ success: true, feature: name, enabled: Boolean(enabled) });
  } catch (err: any) {
    console.error('Failed to update feature flag:', err);
    res.status(500).json({ error: err.message || 'Failed to update feature' });
  }
});

// --- PUBLIC & SETTINGS APIS ---

app.get('/api/settings', async (_req, res) => {
  try {
    const settingsList = await db.select().from(siteSettings).limit(1);
    if (settingsList.length > 0) {
      return res.json(settingsList[0]);
    }
    res.json({
      schoolName: "Border Guard Public School, Cox's Bazar",
      batchYear: "SSC Batch 2023",
      tagline: "Old Memories. New Connections. One Batch.",
      aboutText: "School days may be over, but the memories never have to be. A digital memory book dedicated to preserving the precious moments and lifelong bonds of the SSC 2023 batch of Border Guard Public School, Cox's Bazar.",
      contactEmail: "bgps.ssc2023@gmail.com",
      contactPhone: "+880 1819-876543",
      registrationOpen: true,
    });
  } catch (error) {
    console.error('Failed to fetch settings:', error);
    res.status(500).json({ error: 'Failed to load site settings' });
  }
});

// Memory-First Batch Statistics
app.get('/api/stats', async (_req, res) => {
  try {
    const totalMembersRes = await db.select({ count: sql<number>`count(*)` }).from(profiles);
    const verifiedMembersRes = await db
      .select({ count: sql<number>`count(*)` })
      .from(profiles)
      .where(eq(profiles.verificationStatus, 'verified'));

    // Count by groups
    const scienceRes = await db
      .select({ count: sql<number>`count(*)` })
      .from(schoolInformation)
      .where(eq(schoolInformation.groupStream, 'Science'));

    const humanitiesRes = await db
      .select({ count: sql<number>`count(*)` })
      .from(schoolInformation)
      .where(eq(schoolInformation.groupStream, 'Humanities'));

    const businessRes = await db
      .select({ count: sql<number>`count(*)` })
      .from(schoolInformation)
      .where(eq(schoolInformation.groupStream, 'Business Studies'));

    res.json({
      totalMembers: Number(totalMembersRes[0]?.count || 0),
      verifiedMembers: Number(verifiedMembersRes[0]?.count || 0),
      scienceCount: Number(scienceRes[0]?.count || 0),
      humanitiesCount: Number(humanitiesRes[0]?.count || 0),
      businessCount: Number(businessRes[0]?.count || 0),
      upcomingEvents: 0,
      reunionParticipants: 0,
    });
  } catch (error) {
    console.error('Failed to fetch stats:', error);
    res.status(500).json({ error: 'Failed to load statistics' });
  }
});

// --- SIMPLE REGISTRATION: JOIN OUR BATCH MEMORY ---
// Only 4 required fields: Full Name, School Roll Number, Group/Department, Profile Photo
// Automatically generates unique Username, secure Temporary Password, and unique Member ID
app.post('/api/auth/register-simple', async (req, res) => {
  try {
    const { fullName, rollNumber, groupStream, profilePhotoUrl } = req.body;

    // Strict validation of the 4 initial fields
    if (!fullName || !fullName.trim()) {
      return res.status(400).json({ error: 'Please enter your full name.' });
    }
    if (!rollNumber || !rollNumber.trim()) {
      return res.status(400).json({ error: 'Please enter your school roll number.' });
    }
    if (!groupStream || !groupStream.trim()) {
      return res.status(400).json({ error: 'Please select your group.' });
    }
    if (!profilePhotoUrl || !profilePhotoUrl.trim()) {
      return res.status(400).json({ error: 'Please upload a profile photo.' });
    }

    const cleanFullName = fullName.trim();
    const cleanRoll = rollNumber.trim();
    const cleanGroup = groupStream.trim();

    // Check duplicate roll number
    const existingRoll = await db
      .select()
      .from(schoolInformation)
      .where(eq(schoolInformation.rollNumber, cleanRoll))
      .limit(1);

    if (existingRoll.length > 0) {
      return res.status(400).json({ error: `School Roll ${cleanRoll} has already been registered in the batch directory.` });
    }

    // 1. AUTOMATIC UNIQUE USERNAME GENERATION
    const username = await generateUniqueUsername(cleanFullName);

    // 2. AUTOMATIC SECURE TEMPORARY PASSWORD GENERATION
    const temporaryPassword = generateSecureTemporaryPassword();
    const hashedPassword = hashPassword(temporaryPassword);

    // 3. AUTOMATIC SEQUENTIAL MEMBER ID (e.g. BGPS23-0042)
    const profileCountRes = await db.select({ count: sql<number>`count(*)` }).from(profiles);
    const nextNum = Number(profileCountRes[0]?.count || 0) + 1;
    const memberId = `BGPS23-${String(nextNum).padStart(4, '0')}`;

    const internalEmail = `${username}@bgps2023.batch`;
    const uid = `mem_${username}_${Date.now()}`;

    // Create User record
    const newUserRows = await db
      .insert(users)
      .values({
        uid,
        username,
        memberId,
        email: internalEmail,
        role: 'member',
        passwordHash: hashedPassword,
        mustChangePassword: true,
      })
      .returning();
    const newUser = newUserRows[0];

    // Create Profile record (Initial status: Pending)
    const newProfileRows = await db
      .insert(profiles)
      .values({
        userId: newUser.id,
        username,
        memberId,
        fullName: cleanFullName,
        profilePhotoUrl: profilePhotoUrl.trim(),
        verificationStatus: 'pending',
        showCity: true,
        showFacebook: false,
        showInstagram: false,
        showLinkedin: false,
        showPhone: false,
        showEmail: false,
      })
      .returning();
    const newProfile = newProfileRows[0];

    // Create School Information record
    await db.insert(schoolInformation).values({
      profileId: newProfile.id,
      schoolName: "Border Guard Public School, Cox's Bazar",
      sscYear: 2023,
      rollNumber: cleanRoll,
      groupStream: cleanGroup,
      section: 'A',
    });

    await recordAudit(
      newUser.id,
      newUser.username,
      'SIMPLE_REGISTRATION',
      'profiles',
      String(newProfile.id),
      `Registered ${cleanFullName} (Username: ${username}, Roll: ${cleanRoll}, Group: ${cleanGroup})`
    );

    await sendNotification(
      newUser.id,
      'Welcome to BGPS SSC 2023!',
      `Welcome ${cleanFullName}! Your batch memory profile has been submitted (Member ID: ${memberId}). Please save your generated username (${username}) and temporary password safely.`,
      'system',
      '/dashboard'
    );

    const token = generateToken({ uid: newUser.uid, email: newUser.email, role: newUser.role });

    // Return the generated credentials clearly to show on the success screen
    res.json({
      success: true,
      message: 'Welcome to BGPS SSC 2023! Your batch profile has been created successfully.',
      memberId,
      username,
      temporaryPassword,
      token,
      profile: newProfile,
      user: {
        id: newUser.id,
        username: newUser.username,
        memberId: newUser.memberId,
        role: newUser.role,
      },
    });
  } catch (error: any) {
    console.error('Simple registration failed:', error);
    res.status(500).json({ error: error.message || 'Registration failed. Please try again.' });
  }
});

// --- LOGIN (SUPPORTS USERNAME OR EMAIL) ---
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Please enter your username and password.' });
    }

    const cleanInput = username.toLowerCase().trim();

    // Look up by username or email
    const userRows = await db
      .select()
      .from(users)
      .where(or(eq(users.username, cleanInput), eq(users.email, cleanInput)))
      .limit(1);

    if (userRows.length === 0) {
      return res.status(401).json({ error: 'Invalid username or password.' });
    }

    const user = userRows[0];
    if (!user.passwordHash || !verifyPassword(password, user.passwordHash)) {
      return res.status(401).json({ error: 'Invalid username or password.' });
    }

    const token = generateToken({ uid: user.uid, email: user.email, role: user.role });

    const profileRows = await db.select().from(profiles).where(eq(profiles.userId, user.id)).limit(1);
    const profile = profileRows[0] || null;

    let schoolInfo = null;
    if (profile) {
      const sInfo = await db.select().from(schoolInformation).where(eq(schoolInformation.profileId, profile.id)).limit(1);
      schoolInfo = sInfo[0] || null;
    }

    await recordAudit(user.id, user.username || user.email, 'LOGIN', 'users', String(user.id), 'Logged in to memory portal');

    res.json({
      success: true,
      token,
      mustChangePassword: user.mustChangePassword,
      user: {
        id: user.id,
        username: user.username,
        memberId: user.memberId,
        email: user.email,
        role: user.role,
        uid: user.uid,
      },
      profile,
      schoolInfo,
    });
  } catch (error: any) {
    console.error('Login failed:', error);
    res.status(500).json({ error: 'Authentication failed. Please try again.' });
  }
});

// Change Password (e.g. on first login or profile)
app.post('/api/auth/change-password', requireAuth, async (req: AuthRequest, res) => {
  try {
    const user = req.dbUser!;
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
    }

    const newHashed = hashPassword(newPassword);

    await db
      .update(users)
      .set({
        passwordHash: newHashed,
        mustChangePassword: false,
      })
      .where(eq(users.id, user.id));

    await recordAudit(user.id, user.username || user.email, 'PASSWORD_CHANGED', 'users', String(user.id), 'Updated password');

    res.json({ success: true, message: 'Password updated successfully! Please use your new password for future logins.' });
  } catch (error: any) {
    console.error('Failed to change password:', error);
    res.status(500).json({ error: error.message || 'Failed to update password' });
  }
});

// Current User & Profile Info
app.get('/api/auth/me', requireAuth, async (req: AuthRequest, res) => {
  try {
    const user = req.dbUser!;
    const profileRows = await db.select().from(profiles).where(eq(profiles.userId, user.id)).limit(1);
    const profile = profileRows[0] || null;

    let schoolInfo = null;
    if (profile) {
      const sRows = await db.select().from(schoolInformation).where(eq(schoolInformation.profileId, profile.id)).limit(1);
      schoolInfo = sRows[0] || null;
    }

    res.json({
      user: {
        id: user.id,
        username: user.username,
        memberId: user.memberId,
        email: user.email,
        role: user.role,
        uid: user.uid,
        mustChangePassword: user.mustChangePassword,
      },
      profile,
      schoolInfo,
    });
  } catch (error) {
    console.error('Error fetching current user:', error);
    res.status(500).json({ error: 'Failed to retrieve profile data' });
  }
});

// Update Member Profile (Nostalgic Book)
app.put('/api/members/my-profile', requireAuth, async (req: AuthRequest, res) => {
  try {
    const user = req.dbUser!;
    const profileRows = await db.select().from(profiles).where(eq(profiles.userId, user.id)).limit(1);
    if (profileRows.length === 0) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    const currentProfile = profileRows[0];
    const { fullName, nickname, bio, profilePhotoUrl, currentCity, profession } = req.body;

    const updated = await db
      .update(profiles)
      .set({
        fullName: fullName ? fullName.trim() : currentProfile.fullName,
        nickname: nickname !== undefined ? nickname : currentProfile.nickname,
        bio: bio !== undefined ? bio : currentProfile.bio,
        profilePhotoUrl: profilePhotoUrl !== undefined ? profilePhotoUrl : currentProfile.profilePhotoUrl,
        currentCity: currentCity !== undefined ? currentCity : currentProfile.currentCity,
        profession: profession !== undefined ? profession : currentProfile.profession,
        updatedAt: new Date(),
      })
      .where(eq(profiles.id, currentProfile.id))
      .returning();

    res.json({ success: true, profile: updated[0], message: 'Profile updated successfully!' });
  } catch (error: any) {
    console.error('Failed to update profile:', error);
    res.status(500).json({ error: error.message || 'Failed to update profile' });
  }
});

// --- DIGITAL YEARBOOK & MEMBER DIRECTORY ---
// Search by Name, Username, Roll Number
// Group Filter: All, Science, Humanities, Business Studies, Other
app.get('/api/members/directory', async (req, res) => {
  try {
    const { search, group, section, city, page = '1', limit = '60' } = req.query;

    const pageNum = Math.max(1, parseInt(page as string) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string) || 60));
    const offset = (pageNum - 1) * limitNum;

    // Query verified batch members with school information
    const allVerified = await db
      .select({
        id: profiles.id,
        memberId: profiles.memberId,
        username: profiles.username,
        fullName: profiles.fullName,
        nickname: profiles.nickname,
        profilePhotoUrl: profiles.profilePhotoUrl,
        bio: profiles.bio,
        currentCity: profiles.currentCity,
        profession: profiles.profession,
        rollNumber: schoolInformation.rollNumber,
        groupStream: schoolInformation.groupStream,
        section: schoolInformation.section,
        sscYear: schoolInformation.sscYear,
        verificationStatus: profiles.verificationStatus,
      })
      .from(profiles)
      .innerJoin(schoolInformation, eq(profiles.id, schoolInformation.profileId))
      .where(eq(profiles.verificationStatus, 'verified'))
      .orderBy(sql`CAST(NULLIF(regexp_replace(${schoolInformation.rollNumber}, '\\D', '', 'g'), '') AS INTEGER) ASC NULLS LAST`);

    let filtered = allVerified;

    if (search && typeof search === 'string' && search.trim() !== '') {
      const q = search.trim().toLowerCase();
      filtered = filtered.filter(
        (m) =>
          m.fullName.toLowerCase().includes(q) ||
          (m.username && m.username.toLowerCase().includes(q)) ||
          m.rollNumber.toLowerCase().includes(q) ||
          m.memberId.toLowerCase().includes(q) ||
          (m.profession && m.profession.toLowerCase().includes(q)) ||
          (m.currentCity && m.currentCity.toLowerCase().includes(q))
      );
    }

    if (group && typeof group === 'string' && group !== 'All') {
      filtered = filtered.filter((m) => m.groupStream.toLowerCase() === group.toLowerCase());
    }

    if (section && typeof section === 'string' && section !== 'All') {
      filtered = filtered.filter((m) => m.section && m.section.toLowerCase() === section.toLowerCase());
    }

    if (city && typeof city === 'string' && city !== 'All') {
      filtered = filtered.filter((m) => m.currentCity && m.currentCity.toLowerCase() === city.toLowerCase());
    }

    const total = filtered.length;
    const paginated = filtered.slice(offset, offset + limitNum);

    res.json({
      members: paginated,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
    });
  } catch (error) {
    console.error('Failed to load directory:', error);
    res.status(500).json({ error: 'Failed to load member directory' });
  }
});

// Single Classmate Profile by Username or Member ID
app.get('/api/members/:identifier', async (req, res) => {
  try {
    const { identifier } = req.params;
    const cleanId = identifier.trim().toLowerCase();

    const profileRows = await db
      .select()
      .from(profiles)
      .where(or(ilike(profiles.username, cleanId), eq(profiles.memberId, identifier.toUpperCase())))
      .limit(1);

    if (profileRows.length === 0) {
      return res.status(404).json({ error: 'Classmate profile not found' });
    }

    const profile = profileRows[0];
    const sRows = await db.select().from(schoolInformation).where(eq(schoolInformation.profileId, profile.id)).limit(1);
    const schoolInfo = sRows[0] || null;

    res.json({
      memberId: profile.memberId,
      username: profile.username,
      fullName: profile.fullName,
      nickname: profile.nickname,
      profilePhotoUrl: profile.profilePhotoUrl,
      bio: profile.bio,
      schoolName: schoolInfo?.schoolName || "Border Guard Public School, Cox's Bazar",
      sscYear: schoolInfo?.sscYear || 2023,
      rollNumber: schoolInfo?.rollNumber,
      groupStream: schoolInfo?.groupStream,
      section: schoolInfo?.section,
      verificationStatus: profile.verificationStatus,
      joinedAt: profile.createdAt,
    });
  } catch (error) {
    console.error('Failed to fetch member:', error);
    res.status(500).json({ error: 'Failed to load profile' });
  }
});

// --- MEMORIES / SCHOOL GALLERY (ACTIVE) ---

app.get('/api/gallery', async (_req, res) => {
  try {
    const approvedMemories = await db
      .select()
      .from(gallery)
      .where(eq(gallery.status, 'approved'))
      .orderBy(desc(gallery.createdAt));

    res.json(approvedMemories);
  } catch (error) {
    console.error('Failed to fetch gallery:', error);
    res.status(500).json({ error: 'Failed to load memories' });
  }
});

app.post('/api/gallery/upload', requireAuth, async (req: AuthRequest, res) => {
  try {
    const user = req.dbUser!;
    const { title, caption, category, imageUrl } = req.body;

    if (!title || !imageUrl) {
      return res.status(400).json({ error: 'Title and image are required.' });
    }

    const profileRows = await db.select().from(profiles).where(eq(profiles.userId, user.id)).limit(1);
    const uploaderName = profileRows[0]?.fullName || user.username || 'Classmate';

    const newMemory = await db
      .insert(gallery)
      .values({
        userId: user.id,
        title: title.trim(),
        caption: caption ? caption.trim() : null,
        category: category || 'School Days',
        imageUrl: imageUrl.trim(),
        status: user.role === 'admin' || user.role === 'super_admin' ? 'approved' : 'pending',
        uploadedByName: uploaderName,
      })
      .returning();

    await recordAudit(user.id, user.username, 'GALLERY_UPLOAD', 'gallery', String(newMemory[0].id), `Uploaded photo: ${title}`);

    res.json({
      success: true,
      message: 'Thank you for sharing this memory! It will appear in our batch memory book once approved.',
      memory: newMemory[0],
    });
  } catch (error: any) {
    console.error('Failed to upload memory:', error);
    res.status(500).json({ error: error.message || 'Failed to upload photo' });
  }
});

// --- ADMIN CONTROL CENTER ---

// Admin Overview
app.get('/api/admin/overview', requireModerator, async (_req, res) => {
  try {
    const totalMembersRes = await db.select({ count: sql<number>`count(*)` }).from(profiles);
    const verifiedRes = await db.select({ count: sql<number>`count(*)` }).from(profiles).where(eq(profiles.verificationStatus, 'verified'));
    const pendingRes = await db.select({ count: sql<number>`count(*)` }).from(profiles).where(eq(profiles.verificationStatus, 'pending'));
    const rejectedRes = await db.select({ count: sql<number>`count(*)` }).from(profiles).where(eq(profiles.verificationStatus, 'rejected'));

    // Count by groups
    const scienceRes = await db.select({ count: sql<number>`count(*)` }).from(schoolInformation).where(eq(schoolInformation.groupStream, 'Science'));
    const humanitiesRes = await db.select({ count: sql<number>`count(*)` }).from(schoolInformation).where(eq(schoolInformation.groupStream, 'Humanities'));
    const businessRes = await db.select({ count: sql<number>`count(*)` }).from(schoolInformation).where(eq(schoolInformation.groupStream, 'Business Studies'));

    const recentLogs = await db.select().from(auditLogs).orderBy(desc(auditLogs.createdAt)).limit(8);

    res.json({
      totalMembers: Number(totalMembersRes[0]?.count || 0),
      verifiedMembers: Number(verifiedRes[0]?.count || 0),
      pendingVerification: Number(pendingRes[0]?.count || 0),
      rejectedMembers: Number(rejectedRes[0]?.count || 0),
      scienceCount: Number(scienceRes[0]?.count || 0),
      humanitiesCount: Number(humanitiesRes[0]?.count || 0),
      businessCount: Number(businessRes[0]?.count || 0),
      recentActivity: recentLogs,
    });
  } catch (error) {
    console.error('Failed to get admin overview:', error);
    res.status(500).json({ error: 'Failed to load admin overview' });
  }
});

// Admin Member Verification Queue
app.get('/api/admin/members', requireModerator, async (req, res) => {
  try {
    const { status, search } = req.query;

    let memberQuery = db
      .select({
        id: profiles.id,
        userId: profiles.userId,
        memberId: profiles.memberId,
        username: profiles.username,
        fullName: profiles.fullName,
        nickname: profiles.nickname,
        profilePhotoUrl: profiles.profilePhotoUrl,
        verificationStatus: profiles.verificationStatus,
        rejectionReason: profiles.rejectionReason,
        createdAt: profiles.createdAt,
        userRole: users.role,
        rollNumber: schoolInformation.rollNumber,
        groupStream: schoolInformation.groupStream,
        section: schoolInformation.section,
      })
      .from(profiles)
      .innerJoin(users, eq(profiles.userId, users.id))
      .innerJoin(schoolInformation, eq(profiles.id, schoolInformation.profileId))
      .orderBy(desc(profiles.createdAt));

    const allMembers = await memberQuery;
    let filtered = allMembers;

    if (status && status !== 'all') {
      filtered = filtered.filter((m) => m.verificationStatus === status);
    }

    if (search && typeof search === 'string' && search.trim() !== '') {
      const q = search.trim().toLowerCase();
      filtered = filtered.filter(
        (m) =>
          m.fullName.toLowerCase().includes(q) ||
          (m.username && m.username.toLowerCase().includes(q)) ||
          m.rollNumber.toLowerCase().includes(q) ||
          m.memberId.toLowerCase().includes(q)
      );
    }

    res.json(filtered);
  } catch (error) {
    console.error('Failed to get admin members:', error);
    res.status(500).json({ error: 'Failed to load members' });
  }
});

// Admin Verification Actions: Approve, Reject, Suspend
app.post('/api/admin/members/:id/verify', requireModerator, async (req: AuthRequest, res) => {
  try {
    const adminUser = req.dbUser!;
    const profileId = parseInt(req.params.id);
    const { action, reason } = req.body;

    const profileRows = await db.select().from(profiles).where(eq(profiles.id, profileId)).limit(1);
    if (profileRows.length === 0) {
      return res.status(404).json({ error: 'Profile not found' });
    }
    const profile = profileRows[0];

    let newStatus = 'pending';
    let notifTitle = '';
    let notifMsg = '';

    if (action === 'approve') {
      newStatus = 'verified';
      notifTitle = 'Profile Approved!';
      notifMsg = `Congratulations ${profile.fullName}! Your BGPS SSC 2023 memory profile (${profile.memberId}) has been verified and is now live in the classmate directory.`;

      await db
        .update(profiles)
        .set({
          verificationStatus: 'verified',
          rejectionReason: null,
          verifiedAt: new Date(),
          verifiedBy: adminUser.id,
        })
        .where(eq(profiles.id, profileId));
    } else if (action === 'reject') {
      if (!reason || reason.trim() === '') {
        return res.status(400).json({ error: 'A rejection reason is required.' });
      }
      newStatus = 'rejected';
      notifTitle = 'Profile Verification Rejected';
      notifMsg = `Verification note: ${reason}`;

      await db
        .update(profiles)
        .set({
          verificationStatus: 'rejected',
          rejectionReason: reason.trim(),
        })
        .where(eq(profiles.id, profileId));
    } else if (action === 'suspend') {
      newStatus = 'suspended';
      notifTitle = 'Account Suspended';
      notifMsg = 'Your account has been temporarily suspended by the administrator.';

      await db
        .update(profiles)
        .set({
          verificationStatus: 'suspended',
        })
        .where(eq(profiles.id, profileId));
    } else {
      return res.status(400).json({ error: 'Invalid verification action' });
    }

    await recordAudit(
      adminUser.id,
      adminUser.username || adminUser.email,
      `MEMBER_${action.toUpperCase()}`,
      'profiles',
      String(profileId),
      `Set status of ${profile.fullName} (${profile.username}) to ${newStatus}`
    );

    await sendNotification(profile.userId, notifTitle, notifMsg, 'system', '/dashboard');

    res.json({
      success: true,
      message: `Profile status updated to ${newStatus}`,
      status: newStatus,
    });
  } catch (error: any) {
    console.error('Verification update failed:', error);
    res.status(500).json({ error: error.message || 'Verification update failed' });
  }
});

// Admin Site Settings Update
app.put('/api/admin/settings', requireAdmin, async (req: AuthRequest, res) => {
  try {
    const adminUser = req.dbUser!;
    const settingsData = req.body;

    const existing = await db.select().from(siteSettings).limit(1);
    if (existing.length > 0) {
      await db
        .update(siteSettings)
        .set({
          ...settingsData,
          updatedAt: new Date(),
        })
        .where(eq(siteSettings.id, existing[0].id));
    } else {
      await db.insert(siteSettings).values(settingsData);
    }

    await recordAudit(adminUser.id, adminUser.username, 'SETTINGS_UPDATED', 'site_settings', '1', 'Updated site configuration');
    res.json({ success: true, message: 'Settings saved successfully' });
  } catch (error: any) {
    console.error('Failed to update settings:', error);
    res.status(500).json({ error: error.message || 'Failed to save settings' });
  }
});

// Admin User Roles Management (Super Admin only)
app.get('/api/admin/users', requireSuperAdmin, async (_req, res) => {
  try {
    const allUsers = await db
      .select({
        id: users.id,
        username: users.username,
        email: users.email,
        role: users.role,
        memberId: users.memberId,
        createdAt: users.createdAt,
        fullName: profiles.fullName,
      })
      .from(users)
      .leftJoin(profiles, eq(users.id, profiles.userId))
      .orderBy(desc(users.createdAt));

    res.json(allUsers);
  } catch (error) {
    console.error('Failed to load users:', error);
    res.status(500).json({ error: 'Failed to load users' });
  }
});

app.post('/api/admin/users/role', requireSuperAdmin, async (req: AuthRequest, res) => {
  try {
    const superAdmin = req.dbUser!;
    const { userId, role } = req.body;

    if (!['super_admin', 'admin', 'moderator', 'member'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role specified' });
    }

    await db.update(users).set({ role }).where(eq(users.id, Number(userId)));
    await recordAudit(superAdmin.id, superAdmin.username, 'ROLE_CHANGED', 'users', String(userId), `Set role of user ${userId} to ${role}`);

    res.json({ success: true, message: `User role updated to ${role}` });
  } catch (error: any) {
    console.error('Failed to change user role:', error);
    res.status(500).json({ error: error.message || 'Failed to change role' });
  }
});

// Admin Audit Logs
app.get('/api/admin/audit-logs', requireAdmin, async (_req, res) => {
  try {
    const logs = await db.select().from(auditLogs).orderBy(desc(auditLogs.createdAt)).limit(60);
    res.json(logs);
  } catch (error) {
    console.error('Failed to fetch audit logs:', error);
    res.status(500).json({ error: 'Failed to load audit logs' });
  }
});

// CSV Export for Yearbook Directory
app.get('/api/admin/export/members', requireAdmin, async (_req, res) => {
  try {
    const list = await db
      .select({
        memberId: profiles.memberId,
        username: profiles.username,
        fullName: profiles.fullName,
        rollNumber: schoolInformation.rollNumber,
        groupStream: schoolInformation.groupStream,
        status: profiles.verificationStatus,
        registered: profiles.createdAt,
      })
      .from(profiles)
      .innerJoin(schoolInformation, eq(profiles.id, schoolInformation.profileId))
      .orderBy(profiles.memberId);

    const csvHeader = 'Member ID,Username,Full Name,Roll Number,Group,Status,Registration Date\n';
    const csvRows = list.map((m) =>
      `"${m.memberId}","${m.username || ''}","${(m.fullName || '').replace(/"/g, '""')}","${m.rollNumber}","${m.groupStream}","${m.status}","${m.registered}"`
    );

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="bgps_ssc2023_yearbook.csv"');
    return res.send(csvHeader + csvRows.join('\n'));
  } catch (error) {
    console.error('CSV export failed:', error);
    res.status(500).json({ error: 'Failed to generate CSV export' });
  }
});

// Explicit API 404 handler: guarantees /api/* routes NEVER fall through to HTML/Vite
app.all('/api/*', (_req, res) => {
  res.status(404).json({ error: 'API route not found' });
});

// Global error handler
app.use((err: any, _req: Request, res: Response, _next: any) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({ error: err?.message || 'Internal Server Error' });
});

// --- VITE MIDDLEWARE & SPA ROUTING ---
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`BGPS SSC 2023 Memory Portal running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal server startup error:', err);
  process.exit(1);
});
