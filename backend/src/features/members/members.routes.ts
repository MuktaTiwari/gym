import { Router } from "express";
import { MembersController } from "./members.controller";
import { verifyJWT } from "../../middleware/auth.middleware";

const router = Router();
const membersController = new MembersController();

router.use(verifyJWT);

// Scoped athlete routes (must be placed before /:id parameter matching)
router.put("/me/profile", membersController.updateMyProfile);
router.get("/me/workouts", membersController.getMyWorkouts);
router.post("/me/workouts", membersController.logMyWorkout);
router.get("/me/bookings", membersController.getMyBookings);
router.post("/me/bookings", membersController.bookMyClass);
router.get("/me/payments", membersController.getMyPayments);
router.post("/me/payments", membersController.recordMyPayment);
router.get("/me/trainer", membersController.getMyTrainer);
router.post("/me/trainer/request", membersController.requestTrainerChange);
router.get("/me/attendance", membersController.getMyAttendance);
router.get("/me/notifications", membersController.getMyNotifications);
router.put("/me/notifications/:id/read", membersController.markNotificationRead);
router.put("/me/change-password", membersController.changeMyPassword);

// Dynamic Class Schedules
router.get("/classes", membersController.getClassSchedules);
router.post("/classes", membersController.createClassSchedule);
router.put("/classes/:id", membersController.updateClassSchedule);
router.delete("/classes/:id", membersController.deleteClassSchedule);

// Booking actions
router.get("/bookings", membersController.getAllBookings);
router.post("/bookings/:id/cancel", membersController.cancelBooking);

// Global Transactions for admins
router.get("/payments", membersController.getAllPayments);
router.put("/payments/:id", membersController.updatePaymentStatus);

// Trainers management (staff/admin)
router.get("/trainers", membersController.getTrainers);
router.post("/trainers", membersController.createTrainer);
router.put("/trainers/:id", membersController.updateTrainer);
router.delete("/trainers/:id", membersController.deleteTrainer);

// Trainer requests (admin)
router.get("/trainer-requests", membersController.getTrainerChangeRequests);
router.put("/trainer-requests/:id", membersController.updateTrainerChangeRequest);

// Attendance tracking
router.post("/attendance", membersController.markAttendance);
router.get("/:id/attendance", membersController.getMemberAttendance);

// Announcements & Broadcasts
router.post("/announcements", membersController.createAnnouncement);

// Live Activity Feed
router.get("/activity/logs", membersController.getActivityLogs);

// Member statistics summary
router.get("/stats/summary", membersController.getStatsSummary);

// General member operations (for staff/admins)
router.get("/", membersController.getMembers);
router.post("/", membersController.createMember);
router.get("/:id", membersController.getMember);
router.put("/:id", membersController.updateMember);
router.get("/:id/payments", membersController.getMemberPayments);
router.get("/:id/bookings", membersController.getMemberBookings);
router.post("/:id/notes", membersController.addMemberNote);

export default router;
