import { MembersRepository } from "./members.repository";
import { ApiError } from "../../utils/ApiError";
import { Member } from "../../models/member.model";
import { User } from "../../models/user.model";
import { Workout } from "../../models/workout.model";
import { Booking } from "../../models/booking.model";
import { Payment } from "../../models/payment.model";
import { ClassSchedule } from "../../models/classSchedule.model";
import { ActivityLog } from "../../models/activityLog.model";
import { MembershipStatus } from "../../enums/membershipStatus.enum";
import { Trainer } from "../../models/trainer.model";
import { Notification } from "../../models/notification.model";
import { Attendance } from "../../models/attendance.model";
import { TrainerChangeRequest } from "../../models/trainerChangeRequest.model";
import bcrypt from "bcrypt";
import { sendWelcomeEmail } from "../../utils/email";
import jwt from "jsonwebtoken";
import { env } from "../../config/env";

export class MembersService {
  private membersRepository: MembersRepository;

  constructor() {
    this.membersRepository = new MembersRepository();
  }

  async getMembers(gymId: string, page?: number, limit?: number) {
    return await this.membersRepository.getMembersByGymId(gymId, page, limit);
  }

  async getMember(memberId: string, gymId: string) {
    return await this.membersRepository.getMemberById(memberId, gymId);
  }

  async createMember(memberData: any, gymId: string) {
    const emailLower = memberData.email.toLowerCase();

    // Enforce email uniqueness across both collections
    const existingMember = await Member.findOne({ email: emailLower });
    if (existingMember) {
      throw new ApiError(400, "A member with this email already exists");
    }

    const existingUser = await User.findOne({ email: emailLower });
    if (existingUser) {
      throw new ApiError(400, "A staff user with this email already exists");
    }

    // Extract profile fields
    const {
      status,
      planId,
      assignedTrainerId,
      joinDate,
      endDate,
      weight,
      height,
      age,
      gender,
      emergencyContact,
      password,
      name,
    } = memberData;

    // Resolve assigned trainer
    let trainerName = undefined;
    let trainerIdObj = undefined;
    if (assignedTrainerId) {
      const trainer = await Trainer.findOne({ _id: assignedTrainerId, gymId });
      if (trainer) {
        trainerName = trainer.fullName;
        trainerIdObj = trainer._id;
      }
    }

    // Generate plain-text password if not provided; pre-save hooks in Member schema will hash it
    const plainPassword = password || "Athlete@123";
    const memberId = memberData.memberId || "MEM-" + Math.floor(100000 + Math.random() * 900000);

    // Save exclusively in Member model
    const newMember = await this.membersRepository.createMember({
      memberId,
      fullName: name,
      email: emailLower,
      password: plainPassword,
      gymId: gymId as unknown as import("mongoose").Types.ObjectId,
      status: status || MembershipStatus.ACTIVE,
      planId: planId || undefined,
      membershipStartDate: joinDate || new Date(),
      membershipEndDate: endDate,
      weight: weight ? Number(weight) : undefined,
      height: height ? Number(height) : undefined,
      age: age ? Number(age) : undefined,
      gender,
      emergencyContact,
      assignedTrainer: trainerName,
      assignedTrainerId: trainerIdObj,
    });

    // Add member to trainer's assignedMembers array
    if (trainerIdObj) {
      await Trainer.updateOne(
        { _id: trainerIdObj },
        { $addToSet: { assignedMembers: newMember._id } }
      );
    }

    // Audit Log
    await ActivityLog.create({
      memberId: newMember._id,
      gymId,
      action: "PROFILE_UPDATED",
      triggeredBy: "ADMIN",
      details: "Membership profile created.",
    });

    // Retrieve the fully populated member document
    const completedMember = await this.membersRepository.getMemberById(String(newMember._id), gymId);
    if (!completedMember) {
      throw new ApiError(500, "Failed to retrieve complete member profile");
    }
    
    // Generate setup token
    const setupToken = jwt.sign(
      { _id: newMember._id, isMember: true }, 
      env.ACCESS_TOKEN_SECRET!, 
      { expiresIn: '7d' }
    );

    // Send welcome email to the new member
    sendWelcomeEmail({
      email: emailLower,
      name: name,
      role: "MEMBER",
      setupToken
    });

    return completedMember;
  }

  // Real Member Dashboard updates
  async updateMemberProfile(memberId: string, gymId: string, updateData: any) {
    const member = await Member.findOne({ _id: memberId, gymId });
    if (!member) {
      throw new ApiError(404, "Member profile not found");
    }

    if (updateData.fullName) member.fullName = updateData.fullName;
    if (updateData.age !== undefined) member.age = Number(updateData.age);
    if (updateData.weight !== undefined) member.weight = Number(updateData.weight);
    if (updateData.height !== undefined) member.height = Number(updateData.height);
    if (updateData.gender) member.gender = updateData.gender;
    if (updateData.phone) member.phone = updateData.phone;
    if (updateData.emergencyContact) {
      member.emergencyContact = {
        name: updateData.emergencyContact.name || member.emergencyContact?.name || "",
        relation: updateData.emergencyContact.relation || member.emergencyContact?.relation || "",
        phone: updateData.emergencyContact.phone || member.emergencyContact?.phone || "",
      };
    }

    await member.save();

    await ActivityLog.create({
      memberId,
      gymId,
      action: "PROFILE_UPDATED",
      triggeredBy: "MEMBER",
      details: "Member updated their personal contact or metrics profile details.",
    });

    return await Member.findOne({ _id: memberId, gymId }).populate("planId");
  }

  async getWorkouts(memberId: string, gymId: string) {
    return await Workout.find({ memberId, gymId }).sort({ date: -1 });
  }

  async logWorkout(memberId: string, gymId: string, workoutData: any) {
    const newWorkout = await Workout.create({
      memberId,
      gymId,
      title: workoutData.title,
      duration: Number(workoutData.duration),
      exercises: workoutData.exercises || [],
      notes: workoutData.notes,
      date: workoutData.date || new Date(),
    });

    await ActivityLog.create({
      memberId,
      gymId,
      action: "CHECK_IN",
      triggeredBy: "MEMBER",
      details: `Logged a workout session: "${workoutData.title}" (${workoutData.duration} mins)`,
    });

    return newWorkout;
  }

  async getBookings(memberId: string, gymId: string) {
    return await Booking.find({ memberId, gymId }).sort({ date: -1 });
  }

  async bookClass(memberId: string, gymId: string, bookingData: any) {
    let classId = bookingData.classId;
    let className = bookingData.className;
    let trainerName = bookingData.trainerName;
    let time = bookingData.time;
    let date = bookingData.date || new Date();

    if (classId) {
      const schedule = await ClassSchedule.findById(classId);
      if (!schedule) {
        throw new ApiError(404, "Class schedule not found");
      }
      if (schedule.status !== "ACTIVE") {
        throw new ApiError(400, "Class is no longer active");
      }
      if (schedule.bookedCount >= schedule.capacity) {
        throw new ApiError(400, "Class is fully booked");
      }

      className = schedule.className;
      trainerName = schedule.trainerName;
      time = schedule.time;

      const existing = await Booking.findOne({ memberId, classId, status: "BOOKED" });
      if (existing) {
        throw new ApiError(400, "You have already booked this class");
      }

      schedule.bookedCount += 1;
      await schedule.save();
    }

    const booking = await Booking.create({
      memberId,
      classId,
      gymId,
      className,
      trainerName,
      time,
      date,
      status: "BOOKED",
    });

    await ActivityLog.create({
      memberId,
      gymId,
      action: "CLASS_BOOKED",
      triggeredBy: "MEMBER",
      details: `Booked slot for class "${className}" on ${new Date(date).toLocaleDateString()} at ${time}`,
    });

    await this.createNotificationHelper(
      gymId,
      memberId,
      "MEMBER",
      `Your booking for class "${className}" on ${new Date(date).toLocaleDateString()} at ${time} is confirmed!`,
      "BOOKING"
    );

    return booking;
  }

  async getPayments(memberId: string, gymId: string) {
    return await Payment.find({ memberId, gymId }).sort({ date: -1 });
  }

  async recordPayment(memberId: string, gymId: string, paymentData: any) {
    const payment = await Payment.create({
      memberId,
      gymId,
      planName: paymentData.planName || paymentData.plan,
      amount: Number(paymentData.amount),
      method: paymentData.method,
      status: paymentData.status || "COMPLETED",
      date: paymentData.date || new Date(),
    });

    // Auto update status
    const member = await Member.findOne({ _id: memberId, gymId });
    if (member) {
      if (payment.status === "COMPLETED") {
        member.status = MembershipStatus.ACTIVE;
        const durationMonths = paymentData.durationMonths ? Number(paymentData.durationMonths) : 1;
        const newEndDate = new Date();
        newEndDate.setMonth(newEndDate.getMonth() + durationMonths);
        member.membershipEndDate = newEndDate;
      }
      await member.save();
    }

    await ActivityLog.create({
      memberId,
      gymId,
      action: "PAYMENT_MADE",
      triggeredBy: "MEMBER",
      details: `Paid $${payment.amount} for plan "${payment.planName}" via ${payment.method}`,
    });

    await this.createNotificationHelper(
      gymId,
      memberId,
      "MEMBER",
      `Payment of $${payment.amount} for "${payment.planName}" was successfully processed.`,
      "PAYMENT"
    );

    return payment;
  }

  // Admin Class Schedules Management
  async getClassSchedules(gymId: string) {
    return await ClassSchedule.find({ gymId }).sort({ createdAt: -1 });
  }

  async createClassSchedule(gymId: string, classData: any) {
    return await ClassSchedule.create({
      className: classData.className,
      trainerName: classData.trainerName,
      time: classData.time,
      capacity: Number(classData.capacity) || 20,
      bookedCount: 0,
      status: "ACTIVE",
      gymId,
    });
  }

  async updateClassSchedule(classId: string, gymId: string, updateData: any) {
    const schedule = await ClassSchedule.findOne({ _id: classId, gymId });
    if (!schedule) {
      throw new ApiError(404, "Class schedule not found");
    }

    const oldStatus = schedule.status;

    if (updateData.className) schedule.className = updateData.className;
    if (updateData.trainerName) schedule.trainerName = updateData.trainerName;
    if (updateData.time) schedule.time = updateData.time;
    if (updateData.capacity !== undefined) schedule.capacity = Number(updateData.capacity);
    if (updateData.status) schedule.status = updateData.status;

    await schedule.save();

    if (updateData.status === "CANCELLED" && oldStatus !== "CANCELLED") {
      const activeBookings = await Booking.find({ classId, status: "BOOKED" });
      for (const booking of activeBookings) {
        booking.status = "CANCELLED";
        await booking.save();

        await ActivityLog.create({
          memberId: booking.memberId,
          gymId,
          action: "CLASS_CANCELLED",
          triggeredBy: "ADMIN",
          details: `Class "${schedule.className}" was cancelled by admin. Booking removed.`,
        });

        await this.createNotificationHelper(
          gymId,
          String(booking.memberId),
          "MEMBER",
          `Class "${schedule.className}" has been cancelled by the gym administrator.`,
          "BOOKING"
        );
      }
    }

    return schedule;
  }

  async deleteClassSchedule(classId: string, gymId: string) {
    const schedule = await ClassSchedule.findOne({ _id: classId, gymId });
    if (!schedule) {
      throw new ApiError(404, "Class schedule not found");
    }

    const activeBookings = await Booking.find({ classId, status: "BOOKED" });
    for (const booking of activeBookings) {
      booking.status = "CANCELLED";
      await booking.save();

      await ActivityLog.create({
        memberId: booking.memberId,
        gymId,
        action: "CLASS_CANCELLED",
        triggeredBy: "ADMIN",
        details: `Class "${schedule.className}" was deleted. Booking removed.`,
      });

      await this.createNotificationHelper(
        gymId,
        String(booking.memberId),
        "MEMBER",
        `Class "${schedule.className}" has been cancelled due to deletion.`,
        "BOOKING"
      );
    }

    await ClassSchedule.deleteOne({ _id: classId, gymId });
    return { success: true };
  }

  // Cancel dynamic booking
  async cancelBooking(bookingId: string, userId: string, role: string, gymId: string) {
    const booking = await Booking.findOne({ _id: bookingId, gymId });
    if (!booking) {
      throw new ApiError(404, "Booking not found");
    }

    if (booking.status === "CANCELLED") {
      return booking;
    }

    if (role === "MEMBER" && String(booking.memberId) !== String(userId)) {
      throw new ApiError(403, "Forbidden: You can only cancel your own bookings");
    }

    booking.status = "CANCELLED";
    await booking.save();

    if (booking.classId) {
      const schedule = await ClassSchedule.findById(booking.classId);
      if (schedule && schedule.bookedCount > 0) {
        schedule.bookedCount -= 1;
        await schedule.save();
      }
    }

    await ActivityLog.create({
      memberId: booking.memberId,
      gymId,
      action: "CLASS_CANCELLED",
      triggeredBy: role === "MEMBER" ? "MEMBER" : "ADMIN",
      details: `Cancelled booking for class "${booking.className}"`,
    });

    return booking;
  }

  async getAllBookings(gymId: string) {
    return await Booking.find({ gymId })
      .populate({ path: "memberId", select: "fullName email memberId profilePhoto" })
      .sort({ date: -1 });
  }

  // Admin Payments & Audit Trails
  async getAllPayments(gymId: string) {
    return await Payment.find({ gymId })
      .populate({ path: "memberId", select: "fullName email memberId" })
      .sort({ date: -1 });
  }

  async updatePaymentStatus(paymentId: string, gymId: string, updateData: any) {
    const payment = await Payment.findOne({ _id: paymentId, gymId });
    if (!payment) {
      throw new ApiError(404, "Payment record not found");
    }

    const oldStatus = payment.status;
    payment.status = updateData.status;
    if (updateData.method) payment.method = updateData.method;
    if (updateData.amount !== undefined) payment.amount = Number(updateData.amount);
    await payment.save();

    const member = await Member.findOne({ _id: payment.memberId, gymId });
    if (member) {
      if (payment.status === "COMPLETED") {
        member.status = MembershipStatus.ACTIVE;
        if (!member.membershipEndDate || member.membershipEndDate < new Date()) {
          const newEndDate = new Date();
          newEndDate.setMonth(newEndDate.getMonth() + 1);
          member.membershipEndDate = newEndDate;
        }
      } else if (payment.status === "OVERDUE") {
        member.status = MembershipStatus.EXPIRED;
      }
      await member.save();
    }

    await ActivityLog.create({
      memberId: payment.memberId,
      gymId,
      action: "PAYMENT_UPDATED",
      triggeredBy: "ADMIN",
      details: `Admin changed payment status from "${oldStatus}" to "${payment.status}"`,
    });

    return payment;
  }

  async getActivityLogs(gymId: string, limit = 50, skip = 0) {
    return await ActivityLog.find({ gymId })
      .populate({ path: "memberId", select: "fullName email memberId profilePhoto" })
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit);
  }

  // Admin update member profiles
  async adminUpdateMember(memberId: string, gymId: string, updateData: any) {
    const member = await Member.findOne({ _id: memberId, gymId });
    if (!member) {
      throw new ApiError(404, "Member profile not found");
    }

    const oldPlan = member.planId ? String(member.planId) : "";
    const oldTrainer = member.assignedTrainer || "";
    const oldStatus = member.status;

    if (updateData.fullName) member.fullName = updateData.fullName;
    if (updateData.phone) member.phone = updateData.phone;
    if (updateData.age !== undefined) member.age = Number(updateData.age);
    if (updateData.weight !== undefined) member.weight = Number(updateData.weight);
    if (updateData.height !== undefined) member.height = Number(updateData.height);
    if (updateData.gender) member.gender = updateData.gender;
    if (updateData.status) member.status = updateData.status;
    if (updateData.planId !== undefined) {
      member.planId = updateData.planId || undefined;
    }
    if (updateData.membershipEndDate) {
      member.membershipEndDate = new Date(updateData.membershipEndDate);
    }

    // Advanced: Handle assignment of trainers via trainer schema
    if (updateData.assignedTrainerId !== undefined) {
      member.assignedTrainerId = updateData.assignedTrainerId || undefined;
      if (updateData.assignedTrainerId) {
        const trn = await Trainer.findOne({ _id: updateData.assignedTrainerId, gymId });
        if (trn) {
          member.assignedTrainer = trn.fullName;
          // Add member to trainer's assigned list
          const memberObjId = member._id as unknown as (typeof trn.assignedMembers)[number];
          if (!trn.assignedMembers.includes(memberObjId)) {
            trn.assignedMembers.push(memberObjId);
            await trn.save();
          }
          // Notify member
          await this.createNotificationHelper(
            gymId,
            String(member._id),
            "MEMBER",
            `Trainer "${trn.fullName}" has been assigned to you.`,
            "TRAINER"
          );
        }
      } else {
        member.assignedTrainer = "";
      }
    } else if (updateData.assignedTrainer !== undefined) {
      member.assignedTrainer = updateData.assignedTrainer;
    }

    await member.save();

    let details = `Admin updated member profile.`;
    if (updateData.planId && String(updateData.planId) !== oldPlan) {
      details += ` Plan updated.`;
    }
    if (updateData.assignedTrainerId && String(updateData.assignedTrainerId) !== oldTrainer) {
      details += ` Trainer reassigned.`;
    }
    if (updateData.status && updateData.status !== oldStatus) {
      details += ` Status modified to "${updateData.status}".`;
    }

    await ActivityLog.create({
      memberId,
      gymId,
      action: "PROFILE_UPDATED",
      triggeredBy: "ADMIN",
      details,
    });

    return await Member.findOne({ _id: memberId, gymId }).populate("planId");
  }

  // Notification helper
  async createNotificationHelper(gymId: string, recipientId: string, recipientType: "MEMBER" | "ADMIN", message: string, type: "INFO" | "ALERT" | "BOOKING" | "PAYMENT" | "TRAINER" | "ANNOUNCEMENT", triggeredBy?: string) {
    const notificationId = "NOT-" + Math.floor(100000 + Math.random() * 900000);
    return await Notification.create({
      notificationId,
      recipientId,
      recipientType,
      message,
      type,
      triggeredBy: triggeredBy ?? undefined,
      gymId,
      isRead: false
    });
  }

  // Trainer management
  async getTrainers(gymId: string) {
    return await Trainer.find({ gymId }).sort({ createdAt: -1 });
  }

  async createTrainer(gymId: string, trainerData: any) {
    const trainerId = "TRN-" + Math.floor(100000 + Math.random() * 900000);
    const trainerEmail = trainerData.email.toLowerCase();
    
    const trainer = await Trainer.create({
      trainerId,
      fullName: trainerData.fullName,
      email: trainerEmail,
      phone: trainerData.phone,
      photo: trainerData.photo || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(trainerData.fullName)}`,
      specialization: trainerData.specialization,
      schedule: trainerData.schedule || {},
      gymId,
      assignedMembers: [],
    });

    // Note: Assuming trainers use a default password or you have a different mechanism to generate their passwords,
    // if there is a password field we should send it. We'll send a generic welcome email.
    // Send welcome email
    sendWelcomeEmail({
      email: trainerEmail,
      name: trainerData.fullName,
      role: "TRAINER"
    });

    return trainer;
  }

  async updateTrainer(trainerId: string, gymId: string, updateData: any) {
    const trainer = await Trainer.findOne({ _id: trainerId, gymId });
    if (!trainer) {
      throw new ApiError(404, "Trainer not found");
    }
    if (updateData.fullName) trainer.fullName = updateData.fullName;
    if (updateData.email) trainer.email = updateData.email.toLowerCase();
    if (updateData.phone) trainer.phone = updateData.phone;
    if (updateData.photo) trainer.photo = updateData.photo;
    if (updateData.specialization) trainer.specialization = updateData.specialization;
    if (updateData.schedule) trainer.schedule = { ...trainer.schedule, ...updateData.schedule };
    await trainer.save();
    return trainer;
  }

  async deleteTrainer(trainerId: string, gymId: string) {
    const trainer = await Trainer.findOne({ _id: trainerId, gymId });
    if (!trainer) {
      throw new ApiError(404, "Trainer not found");
    }
    // Remove trainer reference from all members
    await Member.updateMany({ assignedTrainerId: trainer._id }, { $unset: { assignedTrainerId: 1, assignedTrainer: 1 } });
    await Trainer.deleteOne({ _id: trainerId, gymId });
    return { success: true };
  }

  async getMyTrainer(memberId: string, gymId: string) {
    const member = await Member.findOne({ _id: memberId, gymId });
    if (!member || !member.assignedTrainerId) {
      return null;
    }
    return await Trainer.findOne({ _id: member.assignedTrainerId, gymId });
  }

  async requestTrainerChange(memberId: string, gymId: string, changeData: any) {
    const requestId = "REQ-" + Math.floor(100000 + Math.random() * 900000);
    const member = await Member.findOne({ _id: memberId, gymId });
    if (!member) {
      throw new ApiError(404, "Member not found");
    }
    const request = await TrainerChangeRequest.create({
      requestId,
      memberId,
      currentTrainerId: member.assignedTrainerId,
      requestedTrainerId: changeData.requestedTrainerId,
      reason: changeData.reason,
      status: "PENDING",
      gymId,
    });

    // Notify admins
    const admins = await User.find({ gymId, role: { $in: ["GYM_OWNER", "GYM_ADMIN"] } });
    for (const admin of admins) {
      await this.createNotificationHelper(
        gymId,
        String(admin._id),
        "ADMIN",
        `Member ${member.fullName} requested a trainer reassignment.`,
        "TRAINER"
      );
    }

    await ActivityLog.create({
      memberId,
      gymId,
      action: "TRAINER_REQUESTED",
      triggeredBy: "MEMBER",
      details: `Requested trainer transition to trainer id "${changeData.requestedTrainerId}"`,
    });

    return request;
  }

  async getTrainerChangeRequests(gymId: string) {
    return await TrainerChangeRequest.find({ gymId })
      .populate("memberId", "fullName email memberId profilePhoto")
      .populate("currentTrainerId", "fullName specialization")
      .populate("requestedTrainerId", "fullName specialization")
      .sort({ createdAt: -1 });
  }

  async updateTrainerChangeRequest(requestId: string, gymId: string, updateData: any) {
    const request = await TrainerChangeRequest.findOne({ _id: requestId, gymId });
    if (!request) {
      throw new ApiError(404, "Trainer change request not found");
    }
    request.status = updateData.status;
    await request.save();

    const member = await Member.findOne({ _id: request.memberId, gymId });
    if (member && request.status === "APPROVED") {
      const targetTrainer = await Trainer.findOne({ _id: request.requestedTrainerId, gymId });
      if (targetTrainer) {
        // Remove member from old trainer if present
        if (member.assignedTrainerId) {
          await Trainer.findByIdAndUpdate(member.assignedTrainerId, { $pull: { assignedMembers: member._id } });
        }
        // Add member to target trainer
        targetTrainer.assignedMembers.push(member._id);
        await targetTrainer.save();

        member.assignedTrainerId = targetTrainer._id as unknown as typeof member.assignedTrainerId;
        member.assignedTrainer = targetTrainer.fullName;
        await member.save();

        // Notify member
        await this.createNotificationHelper(
          gymId,
          String(member._id),
          "MEMBER",
          `Your request to change trainer has been APPROVED. Assigned trainer: ${targetTrainer.fullName}`,
          "TRAINER"
        );
      }
    } else if (member && request.status === "REJECTED") {
      // Notify member
      await this.createNotificationHelper(
        gymId,
        String(member._id),
        "MEMBER",
        `Your request to change trainer has been REJECTED.`,
        "TRAINER"
      );
    }

    await ActivityLog.create({
      memberId: request.memberId,
      gymId,
      action: "TRAINER_ASSIGNED",
      triggeredBy: "ADMIN",
      details: `Trainer change request status updated to "${request.status}"`,
    });

    return request;
  }

  // Attendance management
  async getMyAttendance(memberId: string, gymId: string) {
    return await Attendance.find({ memberId, gymId }).populate("classId").sort({ date: -1 });
  }

  async getMemberAttendance(memberId: string, gymId: string) {
    return await Attendance.find({ memberId, gymId }).populate("classId").sort({ date: -1 });
  }

  async markAttendance(gymId: string, attendanceData: any, adminId: string) {
    const attendanceId = "ATT-" + Math.floor(100000 + Math.random() * 900000);
    const existing = await Attendance.findOne({
      memberId: attendanceData.memberId,
      classId: attendanceData.classId || null,
      gymId,
      date: {
        $gte: new Date(new Date(attendanceData.date || Date.now()).setHours(0,0,0,0)),
        $lte: new Date(new Date(attendanceData.date || Date.now()).setHours(23,59,59,999))
      }
    });

    if (existing) {
      existing.status = attendanceData.status;
      existing.markedBy = adminId as unknown as typeof existing.markedBy;
      await existing.save();

      // Log & Notify
      const member = await Member.findById(attendanceData.memberId);
      if (member) {
        await ActivityLog.create({
          memberId: member._id,
          gymId,
          action: "ATTENDANCE_MARKED",
          triggeredBy: "ADMIN",
          details: `Attendance updated to ${attendanceData.status}`,
        });

        await this.createNotificationHelper(
          gymId,
          String(member._id),
          "MEMBER",
          `Your attendance status for today has been updated to "${attendanceData.status}".`,
          "INFO"
        );
      }
      return existing;
    }

    const attendance = await Attendance.create({
      attendanceId,
      memberId: attendanceData.memberId,
      classId: attendanceData.classId || undefined,
      date: attendanceData.date || new Date(),
      status: attendanceData.status || "PRESENT",
      markedBy: adminId,
      gymId,
    });

    // Increment member check-in count
    if (attendance.status === "PRESENT" || attendance.status === "LATE") {
      await Member.findByIdAndUpdate(attendanceData.memberId, { $inc: { attendanceCount: 1 } });
    }

    const member = await Member.findById(attendanceData.memberId);
    if (member) {
      await ActivityLog.create({
        memberId: member._id,
        gymId,
        action: "ATTENDANCE_MARKED",
        triggeredBy: "ADMIN",
        details: `Attendance marked as ${attendance.status}`,
      });

      await this.createNotificationHelper(
        gymId,
        String(member._id),
        "MEMBER",
        `Your attendance has been marked: "${attendance.status}".`,
        "INFO"
      );
    }

    return attendance;
  }

  // Notifications inbox
  async getMyNotifications(recipientId: string, recipientType: "MEMBER" | "ADMIN", gymId: string) {
    return await Notification.find({ recipientId, recipientType, gymId }).sort({ createdAt: -1 }).limit(100);
  }

  async markNotificationRead(notificationId: string, recipientId: string, gymId: string) {
    const notif = await Notification.findOne({ _id: notificationId, recipientId, gymId });
    if (!notif) {
      throw new ApiError(404, "Notification not found");
    }
    notif.isRead = true;
    await notif.save();
    return notif;
  }

  async createAnnouncement(gymId: string, announcementData: any, adminId: string) {
    const members = await Member.find({ gymId }, { _id: 1 }).lean();
    const docs = members.map((m) => ({
      notificationId: "NOT-" + Math.floor(100000 + Math.random() * 900000),
      recipientId: String(m._id),
      recipientType: "MEMBER",
      message: announcementData.message,
      type: "ANNOUNCEMENT",
      triggeredBy: adminId,
      gymId,
      isRead: false,
    }));
    await Notification.insertMany(docs);
    return { success: true, count: docs.length };
  }

  // Secure Password Change
  async changeMyPassword(memberId: string, gymId: string, oldPassword: string, newPassword: string) {
    const member = await Member.findOne({ _id: memberId, gymId });
    if (!member) {
      throw new ApiError(404, "Member not found");
    }
    const isMatch = await member.comparePassword(oldPassword);
    if (!isMatch) {
      throw new ApiError(400, "Incorrect current password");
    }
    member.password = newPassword;
    await member.save();

    await ActivityLog.create({
      memberId,
      gymId,
      action: "PROFILE_UPDATED",
      triggeredBy: "MEMBER",
      details: "Changed their account password.",
    });

    return { success: true };
  }

  // Summary statistics for members
  async getStatsSummary(gymId: string) {
    const total = await Member.countDocuments({ gymId });
    const active = await Member.countDocuments({ gymId, status: MembershipStatus.ACTIVE });
    const expired = await Member.countDocuments({ gymId, status: MembershipStatus.EXPIRED });

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const newThisMonth = await Member.countDocuments({
      gymId,
      createdAt: { $gte: startOfMonth },
    });

    return {
      total,
      active,
      expired,
      newThisMonth,
    };
  }

  // History for single member
  async getMemberPayments(memberId: string, gymId: string) {
    return await Payment.find({ memberId, gymId }).sort({ date: -1 });
  }

  async getMemberBookings(memberId: string, gymId: string) {
    return await Booking.find({ memberId, gymId }).sort({ date: -1 });
  }

  async getMemberAttendanceRecords(memberId: string, gymId: string) {
    return await Attendance.find({ memberId, gymId }).sort({ date: -1 });
  }

  // Add note to member
  async addMemberNote(memberId: string, gymId: string, noteContent: string, author: string = "Admin") {
    const member = await Member.findOne({ _id: memberId, gymId });
    if (!member) {
      throw new ApiError(404, "Member not found");
    }

    if (!member.notes) {
      member.notes = [];
    }

    member.notes.push({
      content: noteContent,
      createdAt: new Date(),
      author,
    });

    await member.save();
    return member.notes;
  }
}
