import { Response } from "express";
import { MembersService } from "./members.service";
import { asyncHandler } from "../../utils/asyncHandler";
import { ApiResponse } from "../../utils/ApiResponse";
import { ApiError } from "../../utils/ApiError";
import { AuthRequest } from "../../middleware/auth.middleware";
import { Role } from "../../enums/roles.enum";

export class MembersController {
  private readonly membersService: MembersService;

  constructor() {
    this.membersService = new MembersService();
  }

  getMembers = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.user?.gymId) {
      throw new ApiError(403, "Forbidden: Only Gym staff can view members");
    }
    
    // Only GYM_OWNER, GYM_ADMIN, TRAINER can view members for this gym
    const allowedRoles = [Role.GYM_OWNER, Role.GYM_ADMIN, Role.TRAINER];
    if (!allowedRoles.includes(req.user.role as Role)) {
      throw new ApiError(403, "Forbidden: Insufficient privileges");
    }

    const page = req.query.page ? parseInt(req.query.page as string) : undefined;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;

    const result = await this.membersService.getMembers(req.user.gymId, page, limit);
    return res.status(200).json(new ApiResponse(200, result, "Members retrieved successfully"));
  });

  getMember = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.user?.gymId) {
      throw new ApiError(403, "Forbidden");
    }

    const member = await this.membersService.getMember(req.params.id, req.user.gymId);
    if (!member) {
      throw new ApiError(404, "Member not found");
    }

    return res.status(200).json(new ApiResponse(200, member, "Member retrieved successfully"));
  });

  createMember = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.user?.gymId) {
      throw new ApiError(403, "Forbidden: Only Gym staff can create members");
    }

    const allowedRoles = [Role.GYM_OWNER, Role.GYM_ADMIN];
    if (!allowedRoles.includes(req.user.role as Role)) {
      throw new ApiError(403, "Forbidden: Only admins can create members");
    }

    const { name, email } = req.body;
    if (!name || !email) {
      throw new ApiError(400, "Name and Email are required");
    }

    const newMember = await this.membersService.createMember(req.body, req.user.gymId);

    return res.status(201).json(new ApiResponse(201, newMember, "Member created successfully"));
  });

  // Real Member Dashboard updates
  updateMyProfile = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.user?._id || !req.user?.gymId) {
      throw new ApiError(401, "Unauthorized");
    }
    const updated = await this.membersService.updateMemberProfile(req.user._id, req.user.gymId, req.body);
    return res.status(200).json(new ApiResponse(200, updated, "Profile updated successfully"));
  });

  getMyWorkouts = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.user?._id || !req.user?.gymId) {
      throw new ApiError(401, "Unauthorized");
    }
    const workouts = await this.membersService.getWorkouts(req.user._id, req.user.gymId);
    return res.status(200).json(new ApiResponse(200, workouts, "Workouts retrieved successfully"));
  });

  logMyWorkout = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.user?._id || !req.user?.gymId) {
      throw new ApiError(401, "Unauthorized");
    }
    const newWorkout = await this.membersService.logWorkout(req.user._id, req.user.gymId, req.body);
    return res.status(201).json(new ApiResponse(201, newWorkout, "Workout logged successfully"));
  });

  getMyBookings = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.user?._id || !req.user?.gymId) {
      throw new ApiError(401, "Unauthorized");
    }
    const bookings = await this.membersService.getBookings(req.user._id, req.user.gymId);
    return res.status(200).json(new ApiResponse(200, bookings, "Bookings retrieved successfully"));
  });

  bookMyClass = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.user?._id || !req.user?.gymId) {
      throw new ApiError(401, "Unauthorized");
    }
    const booking = await this.membersService.bookClass(req.user._id, req.user.gymId, req.body);
    return res.status(201).json(new ApiResponse(201, booking, "Class booked successfully"));
  });

  getMyPayments = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.user?._id || !req.user?.gymId) {
      throw new ApiError(401, "Unauthorized");
    }
    const payments = await this.membersService.getPayments(req.user._id, req.user.gymId);
    return res.status(200).json(new ApiResponse(200, payments, "Payments retrieved successfully"));
  });

  recordMyPayment = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.user?._id || !req.user?.gymId) {
      throw new ApiError(401, "Unauthorized");
    }
    const payment = await this.membersService.recordPayment(req.user._id, req.user.gymId, req.body);
    return res.status(201).json(new ApiResponse(201, payment, "Payment recorded successfully"));
  });

  // Dynamic Class Schedules
  getClassSchedules = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.user?.gymId) {
      throw new ApiError(401, "Unauthorized");
    }
    const classes = await this.membersService.getClassSchedules(req.user.gymId);
    return res.status(200).json(new ApiResponse(200, classes, "Classes retrieved successfully"));
  });

  createClassSchedule = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.user?.gymId) {
      throw new ApiError(401, "Unauthorized");
    }
    const allowedRoles = [Role.GYM_OWNER, Role.GYM_ADMIN, Role.TRAINER];
    if (!allowedRoles.includes(req.user.role as Role)) {
      throw new ApiError(403, "Forbidden: Only staff can create classes");
    }
    const newClass = await this.membersService.createClassSchedule(req.user.gymId, req.body);
    return res.status(201).json(new ApiResponse(201, newClass, "Class created successfully"));
  });

  updateClassSchedule = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.user?.gymId) {
      throw new ApiError(401, "Unauthorized");
    }
    const allowedRoles = [Role.GYM_OWNER, Role.GYM_ADMIN, Role.TRAINER];
    if (!allowedRoles.includes(req.user.role as Role)) {
      throw new ApiError(403, "Forbidden: Only staff can update classes");
    }
    const updated = await this.membersService.updateClassSchedule(req.params.id, req.user.gymId, req.body);
    return res.status(200).json(new ApiResponse(200, updated, "Class updated successfully"));
  });

  deleteClassSchedule = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.user?.gymId) {
      throw new ApiError(401, "Unauthorized");
    }
    const allowedRoles = [Role.GYM_OWNER, Role.GYM_ADMIN, Role.TRAINER];
    if (!allowedRoles.includes(req.user.role as Role)) {
      throw new ApiError(403, "Forbidden: Only staff can delete classes");
    }
    const result = await this.membersService.deleteClassSchedule(req.params.id, req.user.gymId);
    return res.status(200).json(new ApiResponse(200, result, "Class deleted successfully"));
  });

  // Booking actions
  cancelBooking = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.user?._id || !req.user?.gymId) {
      throw new ApiError(401, "Unauthorized");
    }
    const booking = await this.membersService.cancelBooking(req.params.id, req.user._id, req.user.role, req.user.gymId);
    return res.status(200).json(new ApiResponse(200, booking, "Booking cancelled successfully"));
  });

  getAllBookings = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.user?.gymId) {
      throw new ApiError(401, "Unauthorized");
    }
    const allowedRoles = [Role.GYM_OWNER, Role.GYM_ADMIN, Role.TRAINER];
    if (!allowedRoles.includes(req.user.role as Role)) {
      throw new ApiError(403, "Forbidden: Only staff can view bookings");
    }
    const bookings = await this.membersService.getAllBookings(req.user.gymId);
    return res.status(200).json(new ApiResponse(200, bookings, "Bookings retrieved successfully"));
  });

  // Global Transactions for admins
  getAllPayments = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.user?.gymId) {
      throw new ApiError(401, "Unauthorized");
    }
    const allowedRoles = [Role.GYM_OWNER, Role.GYM_ADMIN];
    if (!allowedRoles.includes(req.user.role as Role)) {
      throw new ApiError(403, "Forbidden: Only admins can view all transactions");
    }
    const payments = await this.membersService.getAllPayments(req.user.gymId);
    return res.status(200).json(new ApiResponse(200, payments, "Transactions retrieved successfully"));
  });

  updatePaymentStatus = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.user?.gymId) {
      throw new ApiError(401, "Unauthorized");
    }
    const allowedRoles = [Role.GYM_OWNER, Role.GYM_ADMIN];
    if (!allowedRoles.includes(req.user.role as Role)) {
      throw new ApiError(403, "Forbidden: Only admins can edit payment statuses");
    }
    const updated = await this.membersService.updatePaymentStatus(req.params.id, req.user.gymId, req.body);
    return res.status(200).json(new ApiResponse(200, updated, "Payment status updated successfully"));
  });

  // Live Activity Feed
  getActivityLogs = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.user?.gymId) {
      throw new ApiError(401, "Unauthorized");
    }
    const limit = req.query.limit ? Math.min(parseInt(req.query.limit as string), 200) : 50;
    const skip = req.query.skip ? parseInt(req.query.skip as string) : 0;
    const logs = await this.membersService.getActivityLogs(req.user.gymId, limit, skip);
    return res.status(200).json(new ApiResponse(200, logs, "Activity logs retrieved successfully"));
  });

  // Admin updates member profile
  updateMember = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.user?.gymId) {
      throw new ApiError(401, "Unauthorized");
    }
    const allowedRoles = [Role.GYM_OWNER, Role.GYM_ADMIN, Role.TRAINER];
    if (!allowedRoles.includes(req.user.role as Role)) {
      throw new ApiError(403, "Forbidden: Only staff can update member profiles");
    }
    const updated = await this.membersService.adminUpdateMember(req.params.id, req.user.gymId, req.body);
    return res.status(200).json(new ApiResponse(200, updated, "Member updated successfully"));
  });

  // Trainer management
  getTrainers = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.user?.gymId) {
      throw new ApiError(401, "Unauthorized");
    }
    const trainers = await this.membersService.getTrainers(req.user.gymId);
    return res.status(200).json(new ApiResponse(200, trainers, "Trainers retrieved successfully"));
  });

  createTrainer = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.user?.gymId) {
      throw new ApiError(401, "Unauthorized");
    }
    const allowedRoles = [Role.GYM_OWNER, Role.GYM_ADMIN];
    if (!allowedRoles.includes(req.user.role as Role)) {
      throw new ApiError(403, "Forbidden: Only admins can manage trainers");
    }
    const trainer = await this.membersService.createTrainer(req.user.gymId, req.body);
    return res.status(201).json(new ApiResponse(201, trainer, "Trainer created successfully"));
  });

  updateTrainer = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.user?.gymId) {
      throw new ApiError(401, "Unauthorized");
    }
    const allowedRoles = [Role.GYM_OWNER, Role.GYM_ADMIN];
    if (!allowedRoles.includes(req.user.role as Role)) {
      throw new ApiError(403, "Forbidden: Only admins can manage trainers");
    }
    const updated = await this.membersService.updateTrainer(req.params.id, req.user.gymId, req.body);
    return res.status(200).json(new ApiResponse(200, updated, "Trainer updated successfully"));
  });

  deleteTrainer = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.user?.gymId) {
      throw new ApiError(401, "Unauthorized");
    }
    const allowedRoles = [Role.GYM_OWNER, Role.GYM_ADMIN];
    if (!allowedRoles.includes(req.user.role as Role)) {
      throw new ApiError(403, "Forbidden: Only admins can manage trainers");
    }
    const result = await this.membersService.deleteTrainer(req.params.id, req.user.gymId);
    return res.status(200).json(new ApiResponse(200, result, "Trainer deleted successfully"));
  });

  getMyTrainer = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.user?._id || !req.user?.gymId) {
      throw new ApiError(401, "Unauthorized");
    }
    const trainer = await this.membersService.getMyTrainer(req.user._id, req.user.gymId);
    return res.status(200).json(new ApiResponse(200, trainer, "Assigned trainer retrieved successfully"));
  });

  requestTrainerChange = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.user?._id || !req.user?.gymId) {
      throw new ApiError(401, "Unauthorized");
    }
    const request = await this.membersService.requestTrainerChange(req.user._id, req.user.gymId, req.body);
    return res.status(201).json(new ApiResponse(201, request, "Trainer change requested successfully"));
  });

  getTrainerChangeRequests = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.user?.gymId) {
      throw new ApiError(401, "Unauthorized");
    }
    const allowedRoles = [Role.GYM_OWNER, Role.GYM_ADMIN];
    if (!allowedRoles.includes(req.user.role as Role)) {
      throw new ApiError(403, "Forbidden: Only admins can view requests");
    }
    const requests = await this.membersService.getTrainerChangeRequests(req.user.gymId);
    return res.status(200).json(new ApiResponse(200, requests, "Trainer change requests retrieved successfully"));
  });

  updateTrainerChangeRequest = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.user?.gymId) {
      throw new ApiError(401, "Unauthorized");
    }
    const allowedRoles = [Role.GYM_OWNER, Role.GYM_ADMIN];
    if (!allowedRoles.includes(req.user.role as Role)) {
      throw new ApiError(403, "Forbidden: Only admins can update requests");
    }
    const updated = await this.membersService.updateTrainerChangeRequest(req.params.id, req.user.gymId, req.body);
    return res.status(200).json(new ApiResponse(200, updated, "Trainer request updated successfully"));
  });

  // Attendance management
  getMyAttendance = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.user?._id || !req.user?.gymId) {
      throw new ApiError(401, "Unauthorized");
    }
    const attendance = await this.membersService.getMyAttendance(req.user._id, req.user.gymId);
    return res.status(200).json(new ApiResponse(200, attendance, "Attendance retrieved successfully"));
  });

  getMemberAttendance = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.user?.gymId) {
      throw new ApiError(401, "Unauthorized");
    }
    const allowedRoles = [Role.GYM_OWNER, Role.GYM_ADMIN, Role.TRAINER];
    if (!allowedRoles.includes(req.user.role as Role)) {
      throw new ApiError(403, "Forbidden: Only staff can view member attendance");
    }
    const attendance = await this.membersService.getMemberAttendance(req.params.id, req.user.gymId);
    return res.status(200).json(new ApiResponse(200, attendance, "Attendance retrieved successfully"));
  });

  markAttendance = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.user?.gymId) {
      throw new ApiError(401, "Unauthorized");
    }
    const allowedRoles = [Role.GYM_OWNER, Role.GYM_ADMIN, Role.TRAINER];
    if (!allowedRoles.includes(req.user.role as Role)) {
      throw new ApiError(403, "Forbidden: Only staff can mark attendance");
    }
    const attendance = await this.membersService.markAttendance(req.user.gymId, req.body, req.user._id);
    return res.status(201).json(new ApiResponse(201, attendance, "Attendance marked successfully"));
  });

  // Notifications inbox
  getMyNotifications = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.user?._id || !req.user?.gymId) {
      throw new ApiError(401, "Unauthorized");
    }
    const recipientType = req.user.role === "MEMBER" ? "MEMBER" : "ADMIN";
    const notifications = await this.membersService.getMyNotifications(req.user._id, recipientType, req.user.gymId);
    return res.status(200).json(new ApiResponse(200, notifications, "Notifications retrieved successfully"));
  });

  markNotificationRead = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.user?._id || !req.user?.gymId) {
      throw new ApiError(401, "Unauthorized");
    }
    const updated = await this.membersService.markNotificationRead(req.params.id, req.user._id, req.user.gymId);
    return res.status(200).json(new ApiResponse(200, updated, "Notification marked as read"));
  });

  createAnnouncement = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.user?.gymId) {
      throw new ApiError(401, "Unauthorized");
    }
    const allowedRoles = [Role.GYM_OWNER, Role.GYM_ADMIN];
    if (!allowedRoles.includes(req.user.role as Role)) {
      throw new ApiError(403, "Forbidden: Only admins can broadcast announcements");
    }
    const result = await this.membersService.createAnnouncement(req.user.gymId, req.body, req.user._id);
    return res.status(201).json(new ApiResponse(201, result, "Announcement broadcasted successfully"));
  });

  // Secure Password change
  changeMyPassword = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.user?._id || !req.user?.gymId) {
      throw new ApiError(401, "Unauthorized");
    }
    const result = await this.membersService.changeMyPassword(req.user._id, req.user.gymId, req.body.oldPassword, req.body.newPassword);
    return res.status(200).json(new ApiResponse(200, result, "Password changed successfully"));
  });

  getStatsSummary = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.user?.gymId) {
      throw new ApiError(403, "Forbidden");
    }
    const summary = await this.membersService.getStatsSummary(req.user.gymId);
    return res.status(200).json(new ApiResponse(200, summary, "Member stats summary retrieved successfully"));
  });

  getMemberPayments = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.user?.gymId) {
      throw new ApiError(403, "Forbidden");
    }
    const payments = await this.membersService.getMemberPayments(req.params.id, req.user.gymId);
    return res.status(200).json(new ApiResponse(200, payments, "Member payment history retrieved successfully"));
  });

  getMemberBookings = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.user?.gymId) {
      throw new ApiError(403, "Forbidden");
    }
    const bookings = await this.membersService.getMemberBookings(req.params.id, req.user.gymId);
    return res.status(200).json(new ApiResponse(200, bookings, "Member booking history retrieved successfully"));
  });

  addMemberNote = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.user?.gymId) {
      throw new ApiError(403, "Forbidden");
    }
    const { note } = req.body;
    if (!note) {
      throw new ApiError(400, "Note content is required");
    }
    const notes = await this.membersService.addMemberNote(
      req.params.id,
      req.user.gymId,
      note,
      req.user.role || "Admin"
    );
    return res.status(200).json(new ApiResponse(200, notes, "Note added successfully"));
  });
}
