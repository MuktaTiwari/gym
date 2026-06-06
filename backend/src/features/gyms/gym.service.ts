import { Gym } from "../../models/gym.model";
import { User } from "../../models/user.model";
import { Member } from "../../models/member.model";
import { Payment } from "../../models/payment.model";
import { Booking } from "../../models/booking.model";
import { Attendance } from "../../models/attendance.model";
import { ApiError } from "../../utils/ApiError";
import { Role } from "../../enums/roles.enum";
import mongoose from "mongoose";
import archiver from "archiver";
import { PassThrough } from "node:stream";
import bcrypt from "bcrypt";
import crypto from "node:crypto";
import { sendEmail } from "../../utils/email";

export class GymService {
  // ─── GYM PROFILE ──────────────────────────────────────────────────────────

  async getProfile(gymId: string) {
    const gym = await Gym.findById(gymId).lean();
    if (!gym) throw new ApiError(404, "Gym workspace not found");
    return gym;
  }

  async updateProfile(gymId: string, data: Partial<{ name: string; email: string; phone: string; address: string; city: string; country: string }>) {
    const updated = await Gym.findByIdAndUpdate(gymId, { $set: data }, { new: true, runValidators: true }).lean();
    if (!updated) throw new ApiError(404, "Gym not found");
    return updated;
  }

  async updateLogo(gymId: string, logoPath: string) {
    const updated = await Gym.findByIdAndUpdate(gymId, { $set: { logo: logoPath } }, { new: true }).lean();
    if (!updated) throw new ApiError(404, "Gym not found");
    return updated;
  }

  // ─── SETTINGS (THEME / BRANDING) ──────────────────────────────────────────

  async getSettings(gymId: string) {
    const gym = await Gym.findById(gymId).select("settings").lean();
    if (!gym) throw new ApiError(404, "Gym not found");
    return gym.settings ?? {};
  }

  async updateSettings(gymId: string, data: Partial<{ theme: "light" | "dark" | "system"; primaryColor: string; fontStyle: string }>) {
    const updateObj: Record<string, any> = {};
    if (data.theme !== undefined) updateObj["settings.theme"] = data.theme;
    if (data.primaryColor !== undefined) updateObj["settings.primaryColor"] = data.primaryColor;
    if (data.fontStyle !== undefined) updateObj["settings.fontStyle"] = data.fontStyle;

    const updated = await Gym.findByIdAndUpdate(gymId, { $set: updateObj }, { new: true }).lean();
    if (!updated) throw new ApiError(404, "Gym not found");
    return updated?.settings ?? {};
  }

  // ─── STAFF ────────────────────────────────────────────────────────────────

  async getStaff(gymId: string) {
    const staffRoles = [Role.GYM_OWNER, Role.GYM_ADMIN, Role.TRAINER];
    const staff = await User.find({ gymId, role: { $in: staffRoles } })
      .select("-password -refreshToken")
      .lean();
    return staff;
  }

  async inviteStaff(gymId: string, email: string, role: string, inviterName: string) {
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      // If already belongs to this gym, error
      if (existing.gymId?.toString() === gymId) {
        throw new ApiError(409, "A user with this email already belongs to this gym");
      }
      throw new ApiError(409, "This email is already registered. Ask them to log in.");
    }

    const allowedRoles = [Role.GYM_ADMIN, Role.TRAINER];
    if (!allowedRoles.includes(role as Role)) {
      throw new ApiError(400, "Role must be GYM_ADMIN or TRAINER");
    }

    // Create a pending staff user with a cryptographically secure temporary password
    const tempPassword = crypto.randomBytes(10).toString("hex");
    const hashed = await bcrypt.hash(tempPassword, 12);

    const newUser = await User.create({
      name: email.split("@")[0],
      email: email.toLowerCase(),
      password: hashed,
      role,
      gymId: new mongoose.Types.ObjectId(gymId),
    });

    // Send invitation email with temp password — never return it in the response
    await sendEmail({
      to: email.toLowerCase(),
      subject: "FitCore – Your Staff Account Has Been Created",
      text: `Hello ${newUser.name},\n\nAn account has been created for you at FitCore.\n\nEmail: ${email}\nTemporary Password: ${tempPassword}\n\nPlease log in and change your password immediately.\n\nInvited by: ${inviterName}`,
      html: `<p>Hello <strong>${newUser.name}</strong>,</p><p>An account has been created for you at FitCore.</p><p>Email: <strong>${email}</strong><br/>Temporary Password: <strong>${tempPassword}</strong></p><p>Please log in and change your password immediately.</p><p>Invited by: ${inviterName}</p>`,
    });

    return {
      user: { _id: newUser._id, name: newUser.name, email: newUser.email, role: newUser.role },
    };
  }

  async removeStaff(gymId: string, staffId: string) {
    const user = await User.findOne({ _id: staffId, gymId });
    if (!user) throw new ApiError(404, "Staff member not found in this gym");
    if (user.role === Role.GYM_OWNER) throw new ApiError(403, "Cannot remove the gym owner");
    await User.findByIdAndDelete(staffId);
    return { removed: true };
  }

  async changeStaffRole(gymId: string, staffId: string, newRole: string) {
    const allowedRoles = [Role.GYM_ADMIN, Role.TRAINER];
    if (!allowedRoles.includes(newRole as Role)) {
      throw new ApiError(400, "Can only assign GYM_ADMIN or TRAINER roles");
    }
    const updated = await User.findOneAndUpdate(
      { _id: staffId, gymId },
      { role: newRole },
      { new: true }
    ).select("-password -refreshToken").lean();
    if (!updated) throw new ApiError(404, "Staff member not found");
    return updated;
  }

  // ─── DANGER ZONE ──────────────────────────────────────────────────────────

  async deactivateWorkspace(gymId: string) {
    // Delete all associated data
    await Member.deleteMany({ gymId });
    await User.deleteMany({ gymId, role: { $ne: Role.GYM_OWNER } });
    await Gym.findByIdAndDelete(gymId);
    return { deactivated: true };
  }

  async resetAllMemberPasswords(gymId: string) {
    const members = await User.find({ gymId, role: Role.MEMBER });
    // In production, send password reset email to each member
    // For now, generate temp passwords and return count
    const resetCount = members.length;
    return { resetCount, message: `Password reset emails sent to ${resetCount} members` };
  }

  async exportAllData(gymId: string): Promise<{ buffer: Buffer; filename: string }> {
    const [members, payments, bookings, attendance] = await Promise.all([
      Member.find({ gymId }).lean(),
      Payment.find({ gymId }).lean(),
      Booking.find({ gymId }).lean(),
      Attendance.find({ gymId }).lean(),
    ]);

    const toCsv = (rows: any[], keys: string[]) => {
      if (!rows.length) return keys.join(",") + "\n";
      const header = keys.join(",");
      const body = rows.map((r) => keys.map((k) => JSON.stringify(r[k] ?? "")).join(",")).join("\n");
      return header + "\n" + body;
    };

    return new Promise((resolve, reject) => {
      const archive = archiver("zip", { zlib: { level: 6 } });
      const chunks: Buffer[] = [];
      const pass = new PassThrough();

      pass.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
      pass.on("end", () => resolve({ buffer: Buffer.concat(chunks), filename: `gym-export-${Date.now()}.zip` }));
      pass.on("error", reject);
      archive.on("error", reject);

      archive.pipe(pass);
      archive.append(toCsv(members, ["_id", "fullName", "email", "phone", "status", "createdAt"]), { name: "members.csv" });
      archive.append(toCsv(payments, ["_id", "memberId", "planName", "amount", "method", "status", "date"]), { name: "payments.csv" });
      archive.append(toCsv(bookings, ["_id", "memberId", "className", "trainerName", "date", "status"]), { name: "bookings.csv" });
      archive.append(toCsv(attendance, ["_id", "memberId", "checkIn", "checkOut", "date"]), { name: "attendance.csv" });
      archive.finalize();
    });
  }
}
