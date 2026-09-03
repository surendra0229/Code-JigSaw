import { Admin } from '../models/Admin.js';
import { hashPassword, verifyPassword } from './authUtils.js';

export const ensureAdminAccount = async (): Promise<void> => {
  try {
    const adminName = process.env.ADMIN_NAME || 'Admin';
    const adminEmail = (process.env.ADMIN_EMAIL || 'surendrachennamalli177@gmail.com').toLowerCase().trim();
    const adminUserId = (process.env.ADMIN_USER_ID || '02092006').trim();
    const adminPass = process.env.ADMIN_PASSWORD || process.env.ADMIN_INITIAL_PASSWORD || 'Surendra@1919';

    // Remove legacy admin accounts that do not match the target email or userId
    await Admin.deleteMany({
      $and: [
        { email: { $ne: adminEmail } },
        { userId: { $ne: adminUserId } }
      ]
    });

    let adminDoc = await Admin.findOne({
      $or: [{ email: adminEmail }, { userId: adminUserId }]
    });

    if (!adminDoc) {
      adminDoc = new Admin({
        email: adminEmail,
        userId: adminUserId,
        displayName: adminName,
        passwordHash: hashPassword(adminPass),
        role: 'admin'
      });
      await adminDoc.save();
      console.log(`[Server] Single Admin account initialized: ${adminEmail} (User ID: ${adminUserId})`);
    } else {
      adminDoc.email = adminEmail;
      adminDoc.userId = adminUserId;
      adminDoc.displayName = adminName;
      adminDoc.role = 'admin';
      
      // Update password hash if password differs or is uninitialized
      if (!adminDoc.passwordHash || !verifyPassword(adminPass, adminDoc.passwordHash)) {
        adminDoc.passwordHash = hashPassword(adminPass);
      }
      await adminDoc.save();
      console.log(`[Server] Single Admin account verified & updated: ${adminEmail} (User ID: ${adminUserId})`);
    }
  } catch (err: any) {
    console.warn('[Server Warning] ensureAdminAccount initialization failed:', err.message || err);
  }
};
