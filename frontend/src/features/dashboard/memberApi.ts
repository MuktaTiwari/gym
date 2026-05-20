import { axiosInstance } from "../../lib/axios";

export interface Exercise {
  name: string;
  sets: number;
  reps: number;
  weight?: number;
}

export interface Workout {
  _id?: string;
  title: string;
  duration: number;
  exercises: Exercise[];
  notes?: string;
  date: string;
}

export interface Booking {
  _id?: string;
  classId?: string;
  className: string;
  trainerName: string;
  time: string;
  date: string;
  status?: "BOOKED" | "ATTENDED" | "CANCELLED";
}

export interface PaymentRecord {
  _id?: string;
  memberId?: {
    _id: string;
    fullName: string;
    email: string;
    memberId: string;
  };
  planName: string;
  amount: number;
  method: "CREDIT_CARD" | "BANK_TRANSFER" | "CASH" | "STRIPE";
  status: "COMPLETED" | "PENDING" | "FAILED" | "OVERDUE" | "REFUNDED";
  date: string;
}

export interface MemberProfile {
  _id: string;
  fullName: string;
  email: string;
  phone?: string;
  age?: number;
  weight?: number;
  height?: number;
  gender?: string;
  status?: string;
  assignedTrainer?: string;
  membershipEndDate?: string;
  emergencyContact?: {
    name: string;
    relation: string;
    phone: string;
  };
  planId?: {
    _id: string;
    name: string;
    price: number;
    durationDays: number;
  };
  membershipCardId?: string;
}

export interface ClassSchedule {
  _id?: string;
  className: string;
  trainerName: string;
  time: string;
  capacity: number;
  bookedCount: number;
  status?: "ACTIVE" | "CANCELLED" | "CLOSED";
}

export interface ActivityLog {
  _id: string;
  memberId: {
    _id: string;
    fullName: string;
    email: string;
    memberId: string;
    profilePhoto?: string;
  };
  action: string;
  timestamp: string;
  triggeredBy: "MEMBER" | "ADMIN";
  details?: string;
}

export const memberApi = {
  updateProfile: async (data: Partial<MemberProfile>) => {
    const res = await axiosInstance.put("/members/me/profile", data);
    return res.data.data;
  },

  getWorkouts: async (): Promise<Workout[]> => {
    const res = await axiosInstance.get("/members/me/workouts");
    return res.data.data;
  },

  logWorkout: async (data: Omit<Workout, "_id">): Promise<Workout> => {
    const res = await axiosInstance.post("/members/me/workouts", data);
    return res.data.data;
  },

  getBookings: async (): Promise<Booking[]> => {
    const res = await axiosInstance.get("/members/me/bookings");
    return res.data.data;
  },

  bookClass: async (data: { classId?: string; className: string; trainerName: string; time: string; date: string }): Promise<Booking> => {
    const res = await axiosInstance.post("/members/me/bookings", data);
    return res.data.data;
  },

  getPayments: async (): Promise<PaymentRecord[]> => {
    const res = await axiosInstance.get("/members/me/payments");
    return res.data.data;
  },

  recordPayment: async (data: { planName: string; amount: number; method: string; status?: string; durationMonths?: number; date?: string }): Promise<PaymentRecord> => {
    const res = await axiosInstance.post("/members/me/payments", data);
    return res.data.data;
  },

  // Dynamic Class Schedules
  getClassSchedules: async (): Promise<ClassSchedule[]> => {
    const res = await axiosInstance.get("/members/classes");
    return res.data.data;
  },

  createClassSchedule: async (data: Omit<ClassSchedule, "_id" | "bookedCount">): Promise<ClassSchedule> => {
    const res = await axiosInstance.post("/members/classes", data);
    return res.data.data;
  },

  updateClassSchedule: async (id: string, data: Partial<ClassSchedule>): Promise<ClassSchedule> => {
    const res = await axiosInstance.put(`/members/classes/${id}`, data);
    return res.data.data;
  },

  deleteClassSchedule: async (id: string): Promise<{ success: boolean }> => {
    const res = await axiosInstance.delete(`/members/classes/${id}`);
    return res.data;
  },

  // Booking actions
  cancelBooking: async (id: string): Promise<Booking> => {
    const res = await axiosInstance.post(`/members/bookings/${id}/cancel`);
    return res.data.data;
  },

  getAllBookings: async (): Promise<any[]> => {
    const res = await axiosInstance.get("/members/bookings");
    return res.data.data;
  },

  // Global Transactions for admins
  getAllPayments: async (): Promise<PaymentRecord[]> => {
    const res = await axiosInstance.get("/members/payments");
    return res.data.data;
  },

  updatePaymentStatus: async (id: string, data: { status: string; amount?: number; method?: string }): Promise<PaymentRecord> => {
    const res = await axiosInstance.put(`/members/payments/${id}`, data);
    return res.data.data;
  },

  // Live Activity Feed
  getActivityLogs: async (): Promise<ActivityLog[]> => {
    const res = await axiosInstance.get("/members/activity/logs");
    return res.data.data;
  },

  // Admin update member profiles
  adminUpdateMember: async (id: string, data: Partial<MemberProfile> & { assignedTrainerId?: string }): Promise<MemberProfile> => {
    const res = await axiosInstance.put(`/members/${id}`, data);
    return res.data.data;
  },

  // Trainers Management
  getTrainers: async (): Promise<Trainer[]> => {
    const res = await axiosInstance.get("/members/trainers");
    return res.data.data;
  },

  createTrainer: async (data: Omit<Trainer, "_id" | "trainerId" | "assignedMembers">): Promise<Trainer> => {
    const res = await axiosInstance.post("/members/trainers", data);
    return res.data.data;
  },

  updateTrainer: async (id: string, data: Partial<Trainer>): Promise<Trainer> => {
    const res = await axiosInstance.put(`/members/trainers/${id}`, data);
    return res.data.data;
  },

  deleteTrainer: async (id: string): Promise<{ success: boolean }> => {
    const res = await axiosInstance.delete(`/members/trainers/${id}`);
    return res.data;
  },

  getMyTrainer: async (): Promise<Trainer | null> => {
    const res = await axiosInstance.get("/members/me/trainer");
    return res.data.data;
  },

  requestTrainerChange: async (data: { requestedTrainerId: string; reason: string }): Promise<TrainerChangeRequest> => {
    const res = await axiosInstance.post("/members/me/trainer/request", data);
    return res.data.data;
  },

  getTrainerChangeRequests: async (): Promise<TrainerChangeRequest[]> => {
    const res = await axiosInstance.get("/members/trainer-requests");
    return res.data.data;
  },

  updateTrainerChangeRequest: async (id: string, data: { status: "APPROVED" | "REJECTED" }): Promise<TrainerChangeRequest> => {
    const res = await axiosInstance.put(`/members/trainer-requests/${id}`, data);
    return res.data.data;
  },

  // Attendance Management
  getMyAttendance: async (): Promise<AttendanceRecord[]> => {
    const res = await axiosInstance.get("/members/me/attendance");
    return res.data.data;
  },

  getMemberAttendance: async (memberId: string): Promise<AttendanceRecord[]> => {
    const res = await axiosInstance.get(`/members/${memberId}/attendance`);
    return res.data.data;
  },

  markAttendance: async (data: { memberId: string; classId?: string; status: "PRESENT" | "ABSENT" | "LATE"; date?: string }): Promise<AttendanceRecord> => {
    const res = await axiosInstance.post("/members/attendance", data);
    return res.data.data;
  },

  // Notifications Inbox
  getMyNotifications: async (): Promise<NotificationRecord[]> => {
    const res = await axiosInstance.get("/members/me/notifications");
    return res.data.data;
  },

  markNotificationRead: async (id: string): Promise<NotificationRecord> => {
    const res = await axiosInstance.put(`/members/me/notifications/${id}/read`);
    return res.data.data;
  },

  // Announcements
  createAnnouncement: async (data: { message: string }): Promise<{ success: boolean; count: number }> => {
    const res = await axiosInstance.post("/members/announcements", data);
    return res.data.data;
  },

  // Password Security
  changeMyPassword: async (data: { oldPassword: string; newPassword: string }): Promise<{ success: boolean }> => {
    const res = await axiosInstance.put("/members/me/change-password", data);
    return res.data;
  },
};

export interface Trainer {
  _id: string;
  trainerId: string;
  fullName: string;
  email: string;
  phone?: string;
  photo?: string;
  specialization?: string;
  schedule: Record<string, string>;
  assignedMembers: string[];
}

export interface TrainerChangeRequest {
  _id: string;
  requestId: string;
  memberId: {
    _id: string;
    fullName: string;
    email: string;
    memberId: string;
    profilePhoto?: string;
  };
  currentTrainerId?: {
    _id: string;
    fullName: string;
    specialization: string;
  };
  requestedTrainerId: {
    _id: string;
    fullName: string;
    specialization: string;
  };
  reason: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
}

export interface AttendanceRecord {
  _id: string;
  attendanceId: string;
  memberId: string;
  classId?: {
    _id: string;
    className: string;
    trainerName: string;
    time: string;
  };
  date: string;
  status: "PRESENT" | "ABSENT" | "LATE";
}

export interface NotificationRecord {
  _id: string;
  notificationId: string;
  recipientId: string;
  recipientType: "MEMBER" | "ADMIN";
  message: string;
  type: "INFO" | "ALERT" | "BOOKING" | "PAYMENT" | "TRAINER" | "ANNOUNCEMENT";
  isRead: boolean;
  createdAt: string;
}
