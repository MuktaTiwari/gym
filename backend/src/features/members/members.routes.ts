import { Router } from "express";
import { MembersController } from "./members.controller";
import { verifyJWT } from "../../middleware/auth.middleware";

const router = Router();
const membersController = new MembersController();

// All member routes are protected
router.use(verifyJWT as any);

// Scoped athlete routes (must be placed before /:id parameter matching)
router.put("/me/profile", membersController.updateMyProfile as any);
router.get("/me/workouts", membersController.getMyWorkouts as any);
router.post("/me/workouts", membersController.logMyWorkout as any);
router.get("/me/bookings", membersController.getMyBookings as any);
router.post("/me/bookings", membersController.bookMyClass as any);
router.get("/me/payments", membersController.getMyPayments as any);
router.post("/me/payments", membersController.recordMyPayment as any);
router.get("/me/trainer", membersController.getMyTrainer as any);
router.post("/me/trainer/request", membersController.requestTrainerChange as any);
router.get("/me/attendance", membersController.getMyAttendance as any);
router.get("/me/notifications", membersController.getMyNotifications as any);
router.put("/me/notifications/:id/read", membersController.markNotificationRead as any);
router.put("/me/change-password", membersController.changeMyPassword as any);

// Dynamic Class Schedules
router.get("/classes", membersController.getClassSchedules as any);
router.post("/classes", membersController.createClassSchedule as any);
router.put("/classes/:id", membersController.updateClassSchedule as any);
router.delete("/classes/:id", membersController.deleteClassSchedule as any);

// Booking actions
router.get("/bookings", membersController.getAllBookings as any);
router.post("/bookings/:id/cancel", membersController.cancelBooking as any);

// Global Transactions for admins
router.get("/payments", membersController.getAllPayments as any);
router.put("/payments/:id", membersController.updatePaymentStatus as any);

// Trainers management (staff/admin)
router.get("/trainers", membersController.getTrainers as any);
router.post("/trainers", membersController.createTrainer as any);
router.put("/trainers/:id", membersController.updateTrainer as any);
router.delete("/trainers/:id", membersController.deleteTrainer as any);

// Trainer requests (admin)
router.get("/trainer-requests", membersController.getTrainerChangeRequests as any);
router.put("/trainer-requests/:id", membersController.updateTrainerChangeRequest as any);

// Attendance tracking
router.post("/attendance", membersController.markAttendance as any);
router.get("/:id/attendance", membersController.getMemberAttendance as any);

// Announcements & Broadcasts
router.post("/announcements", membersController.createAnnouncement as any);

// Live Activity Feed
router.get("/activity/logs", membersController.getActivityLogs as any);

// Member statistics summary (placed before general /:id routes)
router.get("/stats/summary", membersController.getStatsSummary as any);

// General member operations (for staff/admins)
router.get("/", membersController.getMembers as any);
router.post("/", membersController.createMember as any);
router.get("/:id", membersController.getMember as any);
router.put("/:id", membersController.updateMember as any);
router.get("/:id/payments", membersController.getMemberPayments as any);
router.get("/:id/bookings", membersController.getMemberBookings as any);
router.post("/:id/notes", membersController.addMemberNote as any);

export default router;
