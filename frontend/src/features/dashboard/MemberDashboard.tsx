import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity,
  Calendar,
  CreditCard,
  Plus,
  Dumbbell,
  User as UserIcon,
  Trash2,
  RefreshCcw,
  Sparkles,
  QrCode,
  Heart,
  Save,
  Bell,
  AlertTriangle,
  UserCheck,
  CheckCircle,
  Download,
  BookOpen,
  Award,
  Key,
  ShieldAlert,
  Sliders,
  Check,
  X,
  FileText,
  UserPlus
} from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import { memberApi } from "./memberApi";
import type {
  Workout,
  Booking,
  PaymentRecord,
  MemberProfile,
  Exercise,
  ClassSchedule,
  Trainer,
  TrainerChangeRequest,
  AttendanceRecord,
  NotificationRecord
} from "./memberApi";

export const MemberDashboard: React.FC = () => {
  const { user, isAuthenticated } = useAuthStore();
  const [activeTab, setActiveTab] = useState<
    "overview" | "workouts" | "classes" | "attendance" | "trainer" | "payments" | "notifications" | "profile"
  >("overview");

  // Real API state
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [classes, setClasses] = useState<ClassSchedule[]>([]);
  const [profile, setProfile] = useState<Partial<MemberProfile>>({});
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [assignedTrainer, setAssignedTrainer] = useState<Trainer | null>(null);
  const [changeRequests, setChangeRequests] = useState<TrainerChangeRequest[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [notifications, setNotifications] = useState<NotificationRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Forms state
  const [isWorkoutModalOpen, setIsWorkoutModalOpen] = useState(false);
  const [workoutTitle, setWorkoutTitle] = useState("");
  const [workoutDuration, setWorkoutDuration] = useState<number>(45);
  const [workoutNotes, setWorkoutNotes] = useState("");
  const [exercises, setExercises] = useState<Exercise[]>([{ name: "", sets: 3, reps: 10 }]);

  // Profile Form state
  const [profileName, setProfileName] = useState("");
  const [profilePhone, setProfilePhone] = useState("");
  const [profileAge, setProfileAge] = useState<number>(25);
  const [profileWeight, setProfileWeight] = useState<number>(70);
  const [profileHeight, setProfileHeight] = useState<number>(175);
  const [profileGender, setProfileGender] = useState("Unspecified");
  const [emergencyName, setEmergencyName] = useState("");
  const [emergencyRelation, setEmergencyRelation] = useState("");
  const [emergencyPhone, setEmergencyPhone] = useState("");
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Trainer Change form state
  const [requestedTrainerId, setRequestedTrainerId] = useState("");
  const [requestReason, setRequestReason] = useState("");
  const [isSubmittingChange, setIsSubmittingChange] = useState(false);

  // Password Form state
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordMessage, setPasswordMessage] = useState({ text: "", type: "" });
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  // Load all user data from backend
  const loadData = async (showLoader = false) => {
    if (!isAuthenticated || !user) return;
    try {
      if (showLoader) setIsLoading(true);
      const [
        fetchedWorkouts,
        fetchedBookings,
        fetchedPayments,
        fetchedClasses,
        fetchedMyTrainer,
        fetchedAllTrainers,
        fetchedChangeRequests,
        fetchedAttendance,
        fetchedNotifications
      ] = await Promise.all([
        memberApi.getWorkouts(),
        memberApi.getBookings(),
        memberApi.getPayments(),
        memberApi.getClassSchedules(),
        memberApi.getMyTrainer(),
        memberApi.getTrainers(),
        memberApi.getTrainerChangeRequests(),
        memberApi.getMyAttendance(),
        memberApi.getMyNotifications()
      ]);

      setWorkouts(fetchedWorkouts);
      setBookings(fetchedBookings);
      setPayments(fetchedPayments);
      setClasses(fetchedClasses);
      setAssignedTrainer(fetchedMyTrainer);
      setTrainers(fetchedAllTrainers);
      setChangeRequests(fetchedChangeRequests);
      setAttendance(fetchedAttendance);
      setNotifications(fetchedNotifications);

      // Initialize profile state from user store
      if (user?.memberProfile) {
        const mp = user.memberProfile;
        setProfile(mp);
        setProfileName(mp.fullName || user.name || "");
        setProfilePhone(mp.phone || "");
        setProfileAge(mp.age || 25);
        setProfileWeight(mp.weight || 70);
        setProfileHeight(mp.height || 175);
        setProfileGender(mp.gender || "Unspecified");
        setEmergencyName(mp.emergencyContact?.name || "");
        setEmergencyRelation(mp.emergencyContact?.relation || "");
        setEmergencyPhone(mp.emergencyContact?.phone || "");
      }
    } catch (err) {
      console.error("Error loading dashboard data", err);
    } finally {
      if (showLoader) setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && user) {
      loadData(true);
      const interval = setInterval(() => loadData(false), 3000);
      return () => clearInterval(interval);
    }
  }, [user, isAuthenticated]);

  // Handle Log Workout
  const handleAddExerciseRow = () => {
    setExercises([...exercises, { name: "", sets: 3, reps: 12 }]);
  };

  const handleRemoveExerciseRow = (idx: number) => {
    setExercises(exercises.filter((_, i) => i !== idx));
  };

  const handleExerciseChange = (idx: number, field: keyof Exercise, value: any) => {
    const updated = [...exercises];
    updated[idx] = {
      ...updated[idx],
      [field]: field === "sets" || field === "reps" || field === "weight" ? Number(value) : value
    };
    setExercises(updated);
  };

  const handleSaveWorkout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!workoutTitle.trim()) return;

    try {
      const validExercises = exercises.filter(ex => ex.name.trim() !== "");
      await memberApi.logWorkout({
        title: workoutTitle,
        duration: workoutDuration,
        notes: workoutNotes,
        exercises: validExercises,
        date: new Date().toISOString()
      });
      setIsWorkoutModalOpen(false);
      setWorkoutTitle("");
      setWorkoutDuration(45);
      setWorkoutNotes("");
      setExercises([{ name: "", sets: 3, reps: 10 }]);
      await loadData();
    } catch (err) {
      console.error("Error saving workout", err);
    }
  };

  // Handle Book Class
  const handleBookClass = async (classId: string, className: string, trainerName: string, time: string) => {
    try {
      await memberApi.bookClass({
        classId,
        className,
        trainerName,
        time,
        date: new Date().toISOString()
      });
      await loadData();
    } catch (err) {
      alert("Error booking class: " + ((err as any).response?.data?.message || (err as any).message));
    }
  };

  // Handle Cancel Booking
  const handleCancelBooking = async (bookingId: string) => {
    if (!confirm("Are you sure you want to cancel this class booking?")) return;
    try {
      await memberApi.cancelBooking(bookingId);
      await loadData();
    } catch (err) {
      console.error("Error cancelling booking", err);
    }
  };

  // Handle Renew Payment Simulation
  const handleRenewPayment = async () => {
    try {
      await memberApi.recordPayment({
        planName: profile.planId?.name || "Premium Full Access",
        amount: profile.planId?.price || 79,
        method: "STRIPE",
        status: "COMPLETED",
        date: new Date().toISOString()
      });
      alert("Simulated Stripe transaction was successful!");
      await loadData();
    } catch (err) {
      console.error("Error renewing membership", err);
    }
  };

  // Handle Save Profile updates
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSavingProfile(true);
      const updatedProfile = await memberApi.updateProfile({
        fullName: profileName,
        phone: profilePhone,
        age: Number(profileAge),
        weight: Number(profileWeight),
        height: Number(profileHeight),
        gender: profileGender,
        emergencyContact: {
          name: emergencyName,
          relation: emergencyRelation,
          phone: emergencyPhone
        }
      });
      setProfile(updatedProfile);
      if (user) {
        user.memberProfile = updatedProfile;
      }
      alert("Profile updated successfully!");
      await loadData();
    } catch (err) {
      console.error("Error saving profile", err);
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Handle Request Trainer Change
  const handleRequestTrainerChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestedTrainerId) return;

    try {
      setIsSubmittingChange(true);
      await memberApi.requestTrainerChange({
        requestedTrainerId,
        reason: requestReason
      });
      alert("Trainer reassignment request submitted to administrators!");
      setRequestReason("");
      setRequestedTrainerId("");
      await loadData();
    } catch (err) {
      console.error("Error requesting trainer change", err);
    } finally {
      setIsSubmittingChange(false);
    }
  };

  // Handle Notification Read
  const handleMarkNotificationRead = async (notifId: string) => {
    try {
      await memberApi.markNotificationRead(notifId);
      await loadData();
    } catch (err) {
      console.error("Error marking notification read", err);
    }
  };

  // Handle Password change
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setPasswordMessage({ text: "Passwords do not match", type: "error" });
      return;
    }
    if (newPassword.length < 6) {
      setPasswordMessage({ text: "New password must be at least 6 characters long", type: "error" });
      return;
    }

    try {
      setIsUpdatingPassword(true);
      await memberApi.changeMyPassword({ oldPassword, newPassword });
      setPasswordMessage({ text: "Password updated successfully!", type: "success" });
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setPasswordMessage({
        text: (err as any).response?.data?.message || "Failed to update password",
        type: "error"
      });
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  // Download Simulated Gym ID Pass
  const downloadSimulatedGymPass = () => {
    const cardData = `
---------------------------------------------
          FITCORE GYM MEMBERSHIP PASS
---------------------------------------------
MEMBER ID : ${profile.membershipCardId || profile._id || "MEM-ATHLETE"}
FULL NAME : ${profile.fullName || user?.name}
PLAN TYPE : ${profile.planId?.name || "Full Access Premium"}
STATUS    : ${profile.status || "ACTIVE"}
EXPIRES   : ${profile.membershipEndDate ? new Date(profile.membershipEndDate).toLocaleDateString() : "Unlimited"}
---------------------------------------------
         SCAN QR CODE AT DOOR TO ENTER
---------------------------------------------
`;
    const element = document.createElement("a");
    const file = new Blob([cardData], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = `GymPass_${user?.name?.replace(/\s+/g, "_")}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  // Download Simulated Receipt Invoice
  const downloadSimulatedReceipt = (tx: PaymentRecord) => {
    const receiptText = `
=============================================
             FITCORE FITNESS INVOICE
=============================================
TRANSACTION ID : TXN-${tx._id?.substring(0, 12).toUpperCase()}
INVOICE DATE   : ${new Date(tx.date).toLocaleString()}
BILLING TO     : ${profile.fullName || user?.name}
MEMBER EMAIL   : ${user?.email}
PLAN DETAILS   : ${tx.planName}
PAYMENT METHOD : ${tx.method}
PAID AMOUNT    : $${tx.amount}.00 USD
STATUS         : ${tx.status}

---------------------------------------------
Thank you for your business and staying fit!
=============================================
`;
    const element = document.createElement("a");
    const file = new Blob([receiptText], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = `Receipt_${tx._id?.substring(0, 8)}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  // Membership Expiry Calculation
  const getDaysRemaining = () => {
    if (!profile.membershipEndDate) return 999;
    const end = new Date(profile.membershipEndDate).getTime();
    const now = new Date().getTime();
    const diff = end - now;
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const daysRemaining = getDaysRemaining();
  const showExpiryAlert = daysRemaining >= 0 && daysRemaining <= 7;
  const isExpired = daysRemaining < 0;

  // Unread Notifications Count
  const unreadNotificationsCount = notifications.filter(n => !n.isRead).length;

  // Attendance calculations
  const totalChecked = attendance.length;
  const presentCount = attendance.filter(a => a.status === "PRESENT" || a.status === "LATE").length;
  const attendanceRate = totalChecked > 0 ? Math.round((presentCount / totalChecked) * 100) : 100;

  return (
    <div className="space-y-6">
      {/* 7-DAY EXPIRATION OR EXPIRED WARNING BANNER */}
      {showExpiryAlert && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center gap-3 text-amber-500"
        >
          <AlertTriangle className="h-5 w-5 shrink-0" />
          <div className="text-sm font-semibold flex-1">
            <span className="font-extrabold block">Membership Expiring Soon!</span>
            Your subscription will expire in <span className="font-black text-amber-400">{daysRemaining} days</span> (on {new Date(profile.membershipEndDate!).toLocaleDateString()}). Please renew your membership.
          </div>
          <button
            onClick={() => setActiveTab("payments")}
            className="px-3.5 py-1.5 rounded-lg bg-amber-500 text-white font-extrabold text-xs hover:bg-amber-600 transition-colors shadow-sm"
          >
            Renew Now
          </button>
        </motion.div>
      )}

      {isExpired && profile.membershipEndDate && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-xl bg-destructive/10 border border-destructive/30 flex items-center gap-3 text-destructive"
        >
          <ShieldAlert className="h-5 w-5 shrink-0" />
          <div className="text-sm font-semibold flex-1">
            <span className="font-extrabold block">Membership Expired!</span>
            Your subscription expired on <span className="font-black">{new Date(profile.membershipEndDate!).toLocaleDateString()}</span>. Access will be limited until renewed.
          </div>
          <button
            onClick={() => setActiveTab("payments")}
            className="px-3.5 py-1.5 rounded-lg bg-destructive text-white font-extrabold text-xs hover:bg-destructive/90 transition-colors shadow-sm"
          >
            Renew Now
          </button>
        </motion.div>
      )}

      {/* Navigation Tabs */}
      <div className="flex border-b border-border overflow-x-auto pb-1 scrollbar-none gap-1 bg-surface-hover/10 p-1.5 rounded-2xl">
        {[
          { id: "overview", label: "My Hub", icon: Sparkles },
          { id: "classes", label: "Class Bookings", icon: Calendar },
          { id: "workouts", label: "Workout Log", icon: Dumbbell },
          { id: "payments", label: "Billing & Ledger", icon: CreditCard },
          { id: "profile", label: "My Profile & Pass", icon: UserIcon }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all duration-200 shrink-0 relative ${
              activeTab === tab.id
                ? "bg-surface border border-border text-primary shadow-sm"
                : "text-muted hover:text-foreground hover:bg-surface-hover/20"
            }`}
          >
            <tab.icon className="h-4 w-4" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="h-64 flex flex-col items-center justify-center gap-3">
          <RefreshCcw className="h-8 w-8 text-primary animate-spin" />
          <span className="text-sm text-muted font-bold">Synchronizing fitness statistics...</span>
        </div>
      ) : (
        <AnimatePresence mode="wait">
          {/* TAB 1: OVERVIEW HUB */}
          {activeTab === "overview" && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-6"
            >
              <div className="lg:col-span-2 space-y-6">
                {/* Welcome Card */}
                <div className="p-6 rounded-2xl bg-gradient-hero text-white relative overflow-hidden shadow-lg">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_120%,rgba(255,255,255,0.15)_0%,transparent_50%)]" />
                  <div className="relative z-10 flex flex-col justify-between h-full">
                    <div>
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-black uppercase tracking-widest text-primary-light bg-white/10 px-2.5 py-1 rounded-full">
                          Athlete Portal
                        </span>
                        <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full ${
                          profile.status === "ACTIVE" ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" : "bg-destructive/20 text-destructive-foreground border border-destructive/30"
                        }`}>
                          {profile.status || "ACTIVE"}
                        </span>
                      </div>
                      <h2 className="text-3xl font-black tracking-tight mt-3">
                        Welcome back, {profileName || user?.name}!
                      </h2>
                      <p className="mt-1 text-white/80 text-sm font-semibold max-w-lg">
                        Consistency forms habits. Track your workouts, plan your week, and record your weight gains to smash your metrics.
                      </p>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mt-6 pt-4 border-t border-white/10">
                      <div>
                        <span className="text-[10px] text-white/60 block font-bold uppercase tracking-wider">Level Tier</span>
                        <span className="text-xs font-black text-white">{profile.planId?.name || "Full Access Plan"}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-white/60 block font-bold uppercase tracking-wider">Attendance Rate</span>
                        <span className="text-xs font-black text-white">{attendanceRate}% ({presentCount}/{totalChecked})</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-white/60 block font-bold uppercase tracking-wider">Weight Target</span>
                        <span className="text-xs font-black text-white">{profile.weight || 70} kg</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Dashboard Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-surface border border-border p-5 rounded-2xl flex flex-col justify-between h-32 shadow-sm">
                    <div className="flex justify-between items-start">
                      <span className="text-xs font-bold text-muted uppercase">Monthly checkins</span>
                      <Activity className="h-4 w-4 text-emerald-500" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-black">{presentCount}</h3>
                      <p className="text-[10px] text-muted font-bold mt-1">Logged checking in history</p>
                    </div>
                  </div>

                  <div className="bg-surface border border-border p-5 rounded-2xl flex flex-col justify-between h-32 shadow-sm">
                    <div className="flex justify-between items-start">
                      <span className="text-xs font-bold text-muted uppercase">Active Trainer</span>
                      <UserIcon className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-black truncate">{assignedTrainer ? assignedTrainer.fullName : "None"}</h3>
                      <p className="text-[10px] text-muted font-bold mt-1">{assignedTrainer ? assignedTrainer.specialization : "No assignments"}</p>
                    </div>
                  </div>

                  <div className="bg-surface border border-border p-5 rounded-2xl flex flex-col justify-between h-32 shadow-sm">
                    <div className="flex justify-between items-start">
                      <span className="text-xs font-bold text-muted uppercase">Booked Classes</span>
                      <Calendar className="h-4 w-4 text-accent" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-black">{bookings.filter(b => b.status === "BOOKED").length}</h3>
                      <p className="text-[10px] text-muted font-bold mt-1">Active class slots reserved</p>
                    </div>
                  </div>
                </div>

                {/* Upcoming Classes schedule list */}
                <div className="bg-surface border border-border p-6 rounded-2xl shadow-sm">
                  <div className="flex justify-between items-center">
                    <h3 className="font-extrabold text-sm flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-primary" />
                      <span>My Upcoming Schedule</span>
                    </h3>
                    <button
                      onClick={() => setActiveTab("classes")}
                      className="text-xs font-extrabold text-primary hover:underline"
                    >
                      Browse Classes
                    </button>
                  </div>
                  <div className="mt-4 divide-y divide-border">
                    {bookings.filter(b => b.status === "BOOKED").length > 0 ? (
                      bookings.filter(b => b.status === "BOOKED").slice(0, 4).map((booking) => (
                        <div key={booking._id} className="py-3 flex justify-between items-center">
                          <div>
                            <h4 className="font-extrabold text-sm text-foreground">{booking.className}</h4>
                            <p className="text-xs text-muted font-semibold mt-0.5">Instructor: {booking.trainerName}</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="text-right">
                              <span className="text-xs font-bold bg-background border border-border px-3 py-1 rounded-full">
                                {booking.time}
                              </span>
                              <p className="text-[10px] text-muted mt-1 font-bold">
                                {new Date(booking.date).toLocaleDateString()}
                              </p>
                            </div>
                            <button
                              onClick={() => handleCancelBooking(booking._id!)}
                              className="p-2 hover:bg-destructive/10 text-muted hover:text-destructive rounded-lg transition-all"
                              title="Cancel Booking"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="py-8 text-center text-xs text-muted font-bold">
                        No upcoming bookings. Go to the "Class Bookings" tab to reserve a session!
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Sidebar Hub: Gym Pass Card & Recent Activities */}
              <div className="space-y-6">
                {/* Gym Scan Pass */}
                <div className="bg-surface border border-border p-6 rounded-2xl flex flex-col items-center justify-center text-center shadow-md relative overflow-hidden">
                  <div className="absolute top-0 right-0 bg-primary/10 h-16 w-16 rounded-full blur-2xl pointer-events-none" />
                  <QrCode className="h-28 w-28 text-foreground stroke-1 mb-4" />
                  <h3 className="font-black text-lg">My Gym Scanner Pass</h3>
                  <p className="text-xs text-muted font-semibold mt-1 max-w-[200px]">
                    Place this code near the reader box at the door to quickly record a check-in.
                  </p>
                  <button
                    onClick={downloadSimulatedGymPass}
                    className="mt-4 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 text-[10px] font-black uppercase tracking-wider transition-all"
                  >
                    <Download className="h-3 w-3" />
                    <span>Download Pass</span>
                  </button>
                </div>

                {/* Athlete recent activity feed */}
                <div className="bg-surface border border-border p-5 rounded-2xl shadow-sm space-y-4">
                  <h3 className="font-extrabold text-sm text-foreground uppercase tracking-widest">
                    Recent Activity
                  </h3>
                  <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
                    {workouts.slice(0, 3).map((w, idx) => (
                      <div key={idx} className="text-xs font-semibold flex items-center gap-2 border-b border-border/40 pb-2">
                        <Dumbbell className="h-3.5 w-3.5 text-primary shrink-0 animate-pulse" />
                        <div className="flex-1 truncate">
                          <span className="text-foreground block truncate">{w.title}</span>
                          <span className="text-[10px] text-muted">{new Date(w.date).toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))}
                    {bookings.filter(b => b.status === "BOOKED").slice(0, 2).map((b, idx) => (
                      <div key={idx} className="text-xs font-semibold flex items-center gap-2 border-b border-border/40 pb-2">
                        <Calendar className="h-3.5 w-3.5 text-accent shrink-0" />
                        <div className="flex-1 truncate">
                          <span className="text-foreground block truncate">Booked class: {b.className}</span>
                          <span className="text-[10px] text-muted">{new Date(b.date).toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))}
                    {workouts.length === 0 && bookings.length === 0 && (
                      <p className="text-xs text-muted font-bold text-center py-4">No recent athlete activity logged.</p>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 2: WORKOUT LOGS */}
          {activeTab === "workouts" && (
            <motion.div
              key="workouts"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-black">My Training Ledger</h2>
                  <p className="text-xs text-muted font-semibold mt-1">
                    Maintain consistency by tracking sets, repetitions, and heavy lifting progress.
                  </p>
                </div>
                <button
                  onClick={() => setIsWorkoutModalOpen(true)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white bg-gradient-primary hover:opacity-95 shadow-md shadow-primary/10 transition-all font-bold text-sm"
                >
                  <Plus className="h-4 w-4" />
                  <span>Log New Workout</span>
                </button>
              </div>

              {/* Workouts History List */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {workouts.length > 0 ? (
                  workouts.map((workout) => (
                    <div
                      key={workout._id}
                      className="p-5 rounded-2xl bg-surface border border-border flex flex-col justify-between shadow-sm hover:border-primary/30 transition-all"
                    >
                      <div>
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-[9px] font-black text-primary bg-primary/10 px-2 py-0.5 rounded-full uppercase tracking-wider">
                              {workout.duration} Mins Session
                            </span>
                            <h3 className="font-extrabold text-base mt-2">{workout.title}</h3>
                          </div>
                          <span className="text-xs text-muted font-bold">
                            {new Date(workout.date).toLocaleDateString()}
                          </span>
                        </div>

                        {workout.exercises && workout.exercises.length > 0 && (
                          <div className="mt-4 space-y-2 border-t border-border pt-4">
                            <h4 className="text-xs font-black text-muted uppercase tracking-wider">Exercises Logged</h4>
                            <div className="grid grid-cols-1 gap-2 mt-2">
                              {workout.exercises.map((ex, exIdx) => (
                                <div key={exIdx} className="flex justify-between items-center text-xs font-semibold bg-background/50 border border-border p-2 rounded-xl">
                                  <span>{ex.name}</span>
                                  <span className="text-muted">
                                    {ex.sets} sets × {ex.reps} reps {ex.weight ? `@ ${ex.weight} kg` : ""}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {workout.notes && (
                          <p className="mt-4 text-xs text-muted bg-surface-hover/30 border border-border/40 p-3 rounded-xl italic font-medium">
                            Notes: {workout.notes}
                          </p>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="md:col-span-2 bg-surface border border-border p-12 text-center rounded-2xl shadow-sm">
                    <Dumbbell className="h-10 w-10 text-muted mx-auto stroke-1" />
                    <h3 className="font-extrabold text-base mt-3">Start your lifting journal</h3>
                    <p className="text-xs text-muted font-bold mt-1 max-w-sm mx-auto">
                      Log your exercises, target weights, sets, and rep counts to visualize physical progression.
                    </p>
                    <button
                      onClick={() => setIsWorkoutModalOpen(true)}
                      className="mt-4 px-4 py-2 rounded-xl text-white bg-gradient-primary font-bold text-xs"
                    >
                      Record First Session
                    </button>
                  </div>
                )}
              </div>

              {/* Workout Modal */}
              <AnimatePresence>
                {isWorkoutModalOpen && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <motion.div
                      initial={{ scale: 0.95, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.95, opacity: 0 }}
                      className="bg-surface border border-border rounded-2xl w-full max-w-xl p-6 relative shadow-lg"
                    >
                      <h3 className="text-xl font-extrabold pb-3 border-b border-border">Log Today's Workout</h3>
                      <form onSubmit={handleSaveWorkout} className="space-y-4 mt-4 max-h-[75vh] overflow-y-auto pr-1">
                        <div>
                          <label className="text-xs font-bold text-muted block mb-1">Workout Title</label>
                          <input
                            type="text"
                            placeholder="e.g. Legs & Core Focus"
                            value={workoutTitle}
                            onChange={(e) => setWorkoutTitle(e.target.value)}
                            className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-primary transition-all duration-200"
                            required
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-xs font-bold text-muted block mb-1">Duration (minutes)</label>
                            <input
                              type="number"
                              value={workoutDuration}
                              onChange={(e) => setWorkoutDuration(Number(e.target.value))}
                              className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-sm focus:outline-none"
                              required
                            />
                          </div>
                        </div>

                        <div className="space-y-3">
                          <label className="text-xs font-black text-muted block uppercase tracking-wider">Exercises & Sets</label>
                          {exercises.map((row, rowIdx) => (
                            <div key={rowIdx} className="grid grid-cols-12 gap-2 items-center">
                              <div className="col-span-5">
                                <input
                                  type="text"
                                  placeholder="Exercise name"
                                  value={row.name}
                                  onChange={(e) => handleExerciseChange(rowIdx, "name", e.target.value)}
                                  className="w-full bg-background border border-border rounded-xl px-3 py-2 text-xs focus:outline-none"
                                  required
                                />
                              </div>
                              <div className="col-span-2">
                                <input
                                  type="number"
                                  placeholder="Sets"
                                  value={row.sets}
                                  onChange={(e) => handleExerciseChange(rowIdx, "sets", e.target.value)}
                                  className="w-full bg-background border border-border rounded-xl px-2 py-2 text-xs text-center focus:outline-none"
                                  required
                                />
                              </div>
                              <div className="col-span-2">
                                <input
                                  type="number"
                                  placeholder="Reps"
                                  value={row.reps}
                                  onChange={(e) => handleExerciseChange(rowIdx, "reps", e.target.value)}
                                  className="w-full bg-background border border-border rounded-xl px-2 py-2 text-xs text-center focus:outline-none"
                                  required
                                />
                              </div>
                              <div className="col-span-2">
                                <input
                                  type="number"
                                  placeholder="Weight (kg)"
                                  value={row.weight || ""}
                                  onChange={(e) => handleExerciseChange(rowIdx, "weight", e.target.value)}
                                  className="w-full bg-background border border-border rounded-xl px-2 py-2 text-xs text-center focus:outline-none"
                                />
                              </div>
                              <div className="col-span-1 text-center">
                                <button
                                  type="button"
                                  onClick={() => handleRemoveExerciseRow(rowIdx)}
                                  className="p-2 hover:bg-destructive/10 text-muted hover:text-destructive rounded-lg transition-colors"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                          ))}
                          <button
                            type="button"
                            onClick={handleAddExerciseRow}
                            className="text-xs font-bold text-primary flex items-center gap-1.5 hover:underline"
                          >
                            <Plus className="h-3.5 w-3.5" />
                            <span>Add Another Exercise</span>
                          </button>
                        </div>

                        <div>
                          <label className="text-xs font-bold text-muted block mb-1">Workout Notes</label>
                          <textarea
                            placeholder="Add feelings, energy levels, or trainers' guidance..."
                            value={workoutNotes}
                            onChange={(e) => setWorkoutNotes(e.target.value)}
                            className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-xs focus:outline-none h-20"
                          />
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t border-border mt-4">
                          <button
                            type="button"
                            onClick={() => setIsWorkoutModalOpen(false)}
                            className="px-4 py-2.5 rounded-xl font-bold text-xs bg-surface border border-border hover:bg-surface-hover transition-all"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-gradient-primary hover:opacity-95 shadow-md shadow-primary/10 transition-all"
                          >
                            Record Workout
                          </button>
                        </div>
                      </form>
                    </motion.div>
                  </div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {/* TAB 3: CLASS SCHEDULING */}
          {activeTab === "classes" && (
            <motion.div
              key="classes"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-2xl font-black">Class Calendars & Bookings</h2>
                <p className="text-xs text-muted font-semibold mt-1">
                  Reserve a slot for HIIT circuits, vinyasa sessions, or cardio conditioning with premium coaches.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Available Classes column */}
                <div className="lg:col-span-2 space-y-4">
                  <h3 className="font-extrabold text-sm text-foreground uppercase tracking-widest">
                    Available Fitness Classes
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {classes.map((item, idx) => {
                      const isAlreadyBooked = bookings.some(b => b.className === item.className && b.status === "BOOKED");
                      const isCancelled = item.status === "CANCELLED";
                      const isFull = item.bookedCount >= item.capacity;
                      const isClosed = item.status === "CLOSED";
                      return (
                        <div
                          key={item._id || idx}
                          className={`bg-surface border p-5 rounded-2xl flex flex-col justify-between h-48 shadow-sm hover:border-primary/20 transition-all ${
                            isCancelled ? "border-dashed border-destructive/30 opacity-70" : "border-border"
                          }`}
                        >
                          <div>
                            <div className="flex justify-between items-start">
                              <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider ${
                                isCancelled ? "bg-destructive/10 text-destructive" : "bg-accent/10 text-accent"
                              }`}>
                                {isCancelled ? "Cancelled" : "Group Session"}
                              </span>
                              <span className="text-[10px] font-bold text-muted">
                                {item.bookedCount}/{item.capacity} Spots Booked
                              </span>
                            </div>
                            <h4 className="font-extrabold text-base mt-2.5">{item.className}</h4>
                            <p className="text-xs text-muted font-semibold mt-0.5">Instructor: {item.trainerName}</p>
                          </div>

                          <div className="flex justify-between items-center border-t border-border pt-4">
                            <span className="text-xs font-bold text-foreground">{item.time}</span>
                            <button
                              disabled={isAlreadyBooked || isFull || isClosed || isCancelled}
                              onClick={() => handleBookClass(item._id || "", item.className, item.trainerName, item.time)}
                              className={`px-4 py-2 rounded-xl font-bold text-xs transition-all ${
                                isAlreadyBooked
                                  ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 cursor-default"
                                  : isFull
                                  ? "bg-destructive/10 text-destructive border border-destructive/20 cursor-default"
                                  : isClosed || isCancelled
                                  ? "bg-muted text-muted border border-border cursor-default"
                                  : "text-white bg-gradient-primary hover:opacity-95 shadow-md shadow-primary/10"
                              }`}
                            >
                              {isAlreadyBooked ? "Reserved ✔" : isFull ? "Class Full" : isClosed ? "Closed" : isCancelled ? "Cancelled" : "Book Spot"}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                    {classes.length === 0 && (
                      <div className="col-span-2 text-center py-12 text-muted font-bold text-sm bg-background border border-dashed border-border rounded-2xl">
                        No active classes scheduled at this moment. Please check back later!
                      </div>
                    )}
                  </div>
                </div>

                {/* Booked Classes Column */}
                <div className="space-y-4">
                  <h3 className="font-extrabold text-sm text-foreground uppercase tracking-widest">
                    My Active Reservations
                  </h3>
                  <div className="bg-surface border border-border p-5 rounded-2xl shadow-sm divide-y divide-border">
                    {bookings.filter(b => b.status === "BOOKED").length > 0 ? (
                      bookings.filter(b => b.status === "BOOKED").map((booking) => (
                        <div key={booking._id} className="py-3 flex justify-between items-center">
                          <div>
                            <h4 className="font-bold text-xs">{booking.className}</h4>
                            <p className="text-[10px] text-muted font-bold mt-0.5">{booking.time}</p>
                          </div>
                          <button
                            onClick={() => handleCancelBooking(booking._id!)}
                            className="text-[9px] font-black text-destructive bg-destructive/10 hover:bg-destructive/20 border border-destructive/20 px-2.5 py-1 rounded-full uppercase tracking-wider transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      ))
                    ) : (
                      <p className="py-12 text-center text-xs text-muted font-bold">
                        No upcoming bookings reserved. Select a class to add.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 4: ATTENDANCE LEDGER */}
          {activeTab === "attendance" && (
            <motion.div
              key="attendance"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-2xl font-black">My Check-In History</h2>
                <p className="text-xs text-muted font-semibold mt-1">
                  Keep tabs on your monthly attendance ratios and verification stamps mapped instantly by the gym desk.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="p-5 rounded-2xl bg-surface border border-border flex items-center gap-4 shadow-sm">
                  <div className="h-12 w-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                    <UserCheck className="h-6 w-6" />
                  </div>
                  <div>
                    <span className="text-xs text-muted font-bold uppercase block">Present Index</span>
                    <h4 className="text-2xl font-black">{presentCount} Days</h4>
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-surface border border-border flex items-center gap-4 shadow-sm">
                  <div className="h-12 w-12 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent">
                    <Activity className="h-6 w-6" />
                  </div>
                  <div>
                    <span className="text-xs text-muted font-bold uppercase block">Total Stamped</span>
                    <h4 className="text-2xl font-black">{totalChecked} Sessions</h4>
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-surface border border-border flex items-center gap-4 shadow-sm">
                  <div className="h-12 w-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500">
                    <Award className="h-6 w-6" />
                  </div>
                  <div>
                    <span className="text-xs text-muted font-bold uppercase block">Consistency Rate</span>
                    <h4 className="text-2xl font-black">{attendanceRate}%</h4>
                  </div>
                </div>
              </div>

              {/* Attendance Log Table */}
              <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-border bg-surface-hover/30 text-xs font-bold text-muted uppercase tracking-wider">
                        <th className="px-6 py-4">Verification Stamp ID</th>
                        <th className="px-6 py-4">Logged Date</th>
                        <th className="px-6 py-4">Session Context</th>
                        <th className="px-6 py-4">Marked Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border text-sm font-medium">
                      {attendance.length > 0 ? (
                        attendance.map((att) => (
                          <tr key={att._id} className="hover:bg-surface-hover/30 transition-colors">
                            <td className="px-6 py-4 font-mono text-xs text-muted">
                              {att.attendanceId}
                            </td>
                            <td className="px-6 py-4 text-muted">
                              {new Date(att.date).toLocaleDateString()} {new Date(att.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </td>
                            <td className="px-6 py-4 text-foreground font-bold">
                              {att.classId ? (att.classId as any).className : "General Open Gym Check-in"}
                            </td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black border uppercase ${
                                att.status === "PRESENT"
                                  ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                                  : att.status === "LATE"
                                  ? "bg-amber-500/10 text-amber-500 border-amber-500/20"
                                  : "bg-destructive/10 text-destructive border-destructive/20"
                              }`}>
                                {att.status}
                              </span>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={4} className="px-6 py-12 text-center text-muted font-bold">
                            No attendance history logged. SCAN your ID QR Pass at the front door to check in!
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 5: TRAINER DESK */}
          {activeTab === "trainer" && (
            <motion.div
              key="trainer"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-2xl font-black">Trainer Desk</h2>
                <p className="text-xs text-muted font-semibold mt-1">
                  Connect with your assigned personal coach, review their schedule, or submit reassignment requests to the admin desk.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Trainer card */}
                <div className="lg:col-span-2 space-y-4">
                  <h3 className="font-extrabold text-sm text-foreground uppercase tracking-widest">
                    My Assigned Coach
                  </h3>
                  {assignedTrainer ? (
                    <div className="bg-surface border border-border p-6 rounded-2xl flex flex-col md:flex-row gap-6 shadow-sm">
                      <img
                        src={assignedTrainer.photo}
                        alt={assignedTrainer.fullName}
                        className="h-28 w-28 rounded-xl object-cover border border-border shrink-0 bg-background"
                      />
                      <div className="space-y-3 flex-1">
                        <div>
                          <span className="text-[10px] font-black text-primary bg-primary/10 px-2 py-0.5 rounded-full uppercase tracking-wider">
                            {assignedTrainer.specialization} Specialization
                          </span>
                          <h3 className="text-xl font-black mt-2">{assignedTrainer.fullName}</h3>
                          <p className="text-xs text-muted font-semibold">Email: {assignedTrainer.email} | Phone: {assignedTrainer.phone}</p>
                        </div>
                        <div className="border-t border-border pt-3">
                          <h4 className="text-xs font-bold text-muted uppercase">Coaching Schedule Grid</h4>
                          <div className="grid grid-cols-2 gap-2 mt-2 text-xs font-semibold text-foreground">
                            {Object.entries(assignedTrainer.schedule || {}).map(([day, hrs]) => (
                              <div key={day} className="flex justify-between p-2 bg-background border border-border rounded-xl">
                                <span className="text-muted capitalize">{day}</span>
                                <span>{hrs as string}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-surface border border-border p-12 text-center rounded-2xl shadow-sm">
                      <UserIcon className="h-10 w-10 text-muted mx-auto stroke-1" />
                      <h3 className="font-extrabold text-base mt-3">No Coach Assigned</h3>
                      <p className="text-xs text-muted font-bold mt-1 max-w-sm mx-auto">
                        Personal coaching helps perfect form and speed up athletic metrics.
                      </p>
                    </div>
                  )}

                  {/* Request change form */}
                  <div className="bg-surface border border-border p-6 rounded-2xl shadow-sm">
                    <h3 className="font-extrabold text-base flex items-center gap-2 mb-4">
                      <Sliders className="h-5 w-5 text-primary" />
                      <span>Submit Trainer Change Request</span>
                    </h3>
                    <form onSubmit={handleRequestTrainerChange} className="space-y-4">
                      <div>
                        <label className="text-xs font-bold text-muted block mb-1">Select Desired Trainer</label>
                        <select
                          value={requestedTrainerId}
                          onChange={(e) => setRequestedTrainerId(e.target.value)}
                          className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-sm focus:outline-none font-semibold"
                          required
                        >
                          <option value="">-- Choose Coach --</option>
                          {trainers.map((t) => (
                            <option key={t._id} value={t._id}>
                              {t.fullName} ({t.specialization})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="text-xs font-bold text-muted block mb-1">Reason for Reassignment</label>
                        <textarea
                          placeholder="Please describe why you would like to request this transition..."
                          value={requestReason}
                          onChange={(e) => setRequestReason(e.target.value)}
                          className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-xs focus:outline-none h-20"
                          required
                        />
                      </div>

                      <div className="flex justify-end">
                        <button
                          type="submit"
                          disabled={isSubmittingChange || !requestedTrainerId}
                          className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm text-white bg-gradient-primary hover:opacity-95 shadow-md shadow-primary/10 transition-all duration-200"
                        >
                          {isSubmittingChange ? (
                            <RefreshCcw className="h-4 w-4 animate-spin" />
                          ) : (
                            <UserPlus className="h-4 w-4" />
                          )}
                          <span>Request Transition</span>
                        </button>
                      </div>
                    </form>
                  </div>
                </div>

                {/* Trainer request updates ledger */}
                <div className="space-y-4">
                  <h3 className="font-extrabold text-sm text-foreground uppercase tracking-widest">
                    Request Log Ledger
                  </h3>
                  <div className="bg-surface border border-border p-5 rounded-2xl shadow-sm divide-y divide-border">
                    {changeRequests.length > 0 ? (
                      changeRequests.map((req) => (
                        <div key={req._id} className="py-3.5 space-y-2">
                          <div className="flex justify-between items-center text-xs font-semibold">
                            <span className="font-mono text-muted">{req.requestId}</span>
                            <span className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-black border uppercase ${
                              req.status === "APPROVED"
                                ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                                : req.status === "PENDING"
                                ? "bg-amber-500/10 text-amber-500 border-amber-500/20"
                                : "bg-destructive/10 text-destructive border-destructive/20"
                            }`}>
                              {req.status}
                            </span>
                          </div>
                          <p className="text-xs text-foreground font-bold">
                            Transition to: {req.requestedTrainerId?.fullName || "Coach"}
                          </p>
                          <p className="text-[10px] text-muted italic">Reason: {req.reason}</p>
                          <p className="text-[9px] text-muted font-bold">
                            Requested: {new Date(req.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      ))
                    ) : (
                      <p className="py-12 text-center text-xs text-muted font-bold">
                        No reassignment requests submitted yet.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 6: BILLING & LEDGER */}
          {activeTab === "payments" && (
            <motion.div
              key="payments"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-black">Financial Invoices & Ledger</h2>
                  <p className="text-xs text-muted font-semibold mt-1">
                    Review subscription renewals, payment method records, and checkouts.
                  </p>
                </div>
                <button
                  onClick={handleRenewPayment}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm text-white bg-gradient-primary hover:opacity-95 shadow-md shadow-primary/10 transition-all duration-200"
                >
                  <Plus className="h-4 w-4" />
                  <span>Renew Plan (Stripe Demo)</span>
                </button>
              </div>

              {/* Transactions Ledger DataTable */}
              <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-border bg-surface-hover/30 text-xs font-bold text-muted uppercase tracking-wider">
                        <th className="px-6 py-4">Transaction ID</th>
                        <th className="px-6 py-4">Membership Package</th>
                        <th className="px-6 py-4">Amount</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4">Date Logged</th>
                        <th className="px-6 py-4">Method</th>
                        <th className="px-6 py-4">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border text-sm font-medium">
                      {payments.length > 0 ? (
                        payments.map((tx) => (
                          <tr key={tx._id} className="hover:bg-surface-hover/30 transition-colors">
                            <td className="px-6 py-4 font-mono text-xs text-muted">
                              TXN-{tx._id?.substring(0, 12).toUpperCase() || "MANUAL"}
                            </td>
                            <td className="px-6 py-4 font-extrabold text-foreground">{tx.planName}</td>
                            <td className="px-6 py-4 text-foreground font-extrabold">${tx.amount}</td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black border uppercase ${
                                tx.status === "COMPLETED"
                                  ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                                  : "bg-amber-500/10 text-amber-500 border-amber-500/20"
                              }`}>
                                {tx.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-muted">
                              {new Date(tx.date).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4">
                              <span className="bg-background border border-border font-bold px-2 py-0.5 rounded-full uppercase text-[9px]">
                                {tx.method}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <button
                                onClick={() => downloadSimulatedReceipt(tx)}
                                className="p-1.5 hover:bg-primary/10 text-muted hover:text-primary rounded-lg transition-all"
                                title="Download Simulated Invoice"
                              >
                                <Download className="h-4 w-4" />
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={7} className="px-6 py-12 text-center text-muted font-bold">
                            No billing invoice items matching your ledger. Click Renew above to record one.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 7: NOTIFICATIONS INBOX */}
          {activeTab === "notifications" && (
            <motion.div
              key="notifications"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-2xl font-black">My Notifications Inbox</h2>
                <p className="text-xs text-muted font-semibold mt-1">
                  Stay updated on schedule changes, payments confirmations, training announcements, and coach transitions.
                </p>
              </div>

              <div className="bg-surface border border-border rounded-2xl shadow-sm divide-y divide-border">
                {notifications.length > 0 ? (
                  notifications.map((notif) => (
                    <div
                      key={notif._id}
                      className={`p-5 flex justify-between items-start gap-4 transition-colors ${
                        notif.isRead ? "opacity-60 bg-transparent" : "bg-primary/5 hover:bg-primary/10"
                      }`}
                    >
                      <div className="flex gap-3">
                        <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 border mt-0.5 ${
                          notif.type === "ALERT"
                            ? "bg-destructive/10 text-destructive border-destructive/20"
                            : notif.type === "PAYMENT"
                            ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                            : notif.type === "BOOKING"
                            ? "bg-accent/10 text-accent border-accent/20"
                            : notif.type === "TRAINER"
                            ? "bg-amber-500/10 text-amber-500 border-amber-500/20"
                            : "bg-primary/10 text-primary border-primary/20"
                        }`}>
                          {notif.type === "ALERT" ? (
                            <AlertTriangle className="h-4.5 w-4.5" />
                          ) : notif.type === "PAYMENT" ? (
                            <CreditCard className="h-4.5 w-4.5" />
                          ) : notif.type === "BOOKING" ? (
                            <Calendar className="h-4.5 w-4.5" />
                          ) : notif.type === "TRAINER" ? (
                            <UserIcon className="h-4.5 w-4.5" />
                          ) : (
                            <Bell className="h-4.5 w-4.5" />
                          )}
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-black text-foreground uppercase tracking-widest">{notif.type}</span>
                            <span className="text-[10px] text-muted">{new Date(notif.createdAt).toLocaleDateString()} {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                          <p className="text-xs text-foreground font-bold leading-relaxed">{notif.message}</p>
                        </div>
                      </div>

                      {!notif.isRead && (
                        <button
                          onClick={() => handleMarkNotificationRead(notif._id)}
                          className="flex items-center gap-1 px-2.5 py-1 text-[10px] font-black text-primary bg-primary/10 hover:bg-primary/20 rounded-lg border border-primary/20 uppercase transition-all"
                        >
                          <Check className="h-3.5 w-3.5" />
                          <span>Mark Read</span>
                        </button>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="py-12 text-center text-xs text-muted font-bold">
                    Your inbox is completely clear! Check back later.
                  </p>
                )}
              </div>
            </motion.div>
          )}

          {/* TAB 8: PROFILE / STATS / PASS */}
          {activeTab === "profile" && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6 max-w-4xl mx-auto"
            >
              <div className="flex flex-col md:flex-row gap-6">
                {/* PASS PREVIEW COLUMN */}
                <div className="md:w-1/3 space-y-6">
                  <h3 className="font-extrabold text-sm text-foreground uppercase tracking-widest">
                    Digital Member Card
                  </h3>
                  <div className="bg-gradient-to-br from-indigo-900 to-slate-900 border border-white/10 p-6 rounded-2xl text-white shadow-xl flex flex-col justify-between h-96 relative overflow-hidden">
                    <div className="absolute top-[-10%] right-[-10%] h-44 w-44 rounded-full bg-primary/20 blur-3xl pointer-events-none" />
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        <Dumbbell className="h-5 w-5 text-primary" />
                        <span className="font-black text-sm tracking-widest text-primary-light">FITCORE</span>
                      </div>
                      <span className="text-[9px] font-black px-2.5 py-0.5 rounded-full border border-white/10 bg-white/5 uppercase">
                        {profile.status || "ACTIVE"}
                      </span>
                    </div>

                    <div className="flex flex-col items-center justify-center py-4">
                      <QrCode className="h-28 w-28 text-white stroke-1 mb-2 bg-white/5 p-2 rounded-xl border border-white/10" />
                      <span className="text-[10px] font-black text-muted-foreground tracking-widest mt-1">
                        #{profile.membershipCardId || "MEM-CARD-ID"}
                      </span>
                    </div>

                    <div className="border-t border-white/10 pt-4 flex justify-between items-end text-xs font-semibold">
                      <div>
                        <span className="text-[9px] text-white/40 block font-bold uppercase tracking-wider">Cardholder</span>
                        <span className="font-black text-sm text-white">{profile.fullName || user?.name}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[9px] text-white/40 block font-bold uppercase tracking-wider">Expiration Date</span>
                        <span className="font-black text-white">
                          {profile.membershipEndDate ? new Date(profile.membershipEndDate).toLocaleDateString() : "Unlimited"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={downloadSimulatedGymPass}
                    className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-bold text-sm text-white bg-gradient-primary hover:opacity-95 shadow-md shadow-primary/10 transition-all duration-200"
                  >
                    <Download className="h-4 w-4" />
                    <span>Download Member Card</span>
                  </button>
                </div>

                {/* EDIT FORM COLUMN */}
                <div className="md:w-2/3 space-y-6">
                  {/* Physical parameters */}
                  <div className="bg-surface border border-border p-6 rounded-2xl shadow-sm space-y-4">
                    <h3 className="font-extrabold text-sm text-foreground uppercase tracking-widest">
                      Physical Metrics & Biometrics
                    </h3>
                    <form onSubmit={handleSaveProfile} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs font-bold text-muted block mb-1">Full Athlete Name</label>
                          <input
                            type="text"
                            value={profileName}
                            onChange={(e) => setProfileName(e.target.value)}
                            className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-sm focus:outline-none"
                            required
                          />
                        </div>
                        <div>
                          <label className="text-xs font-bold text-muted block mb-1">Phone Number</label>
                          <input
                            type="text"
                            value={profilePhone}
                            onChange={(e) => setProfilePhone(e.target.value)}
                            className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-sm focus:outline-none"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs font-bold text-muted block mb-1">Age (Years)</label>
                          <input
                            type="number"
                            value={profileAge}
                            onChange={(e) => setProfileAge(Number(e.target.value))}
                            className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-sm focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="text-xs font-bold text-muted block mb-1">Gender</label>
                          <select
                            value={profileGender}
                            onChange={(e) => setProfileGender(e.target.value)}
                            className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-sm focus:outline-none font-semibold"
                          >
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Non-Binary">Non-Binary</option>
                            <option value="Unspecified">Unspecified</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs font-bold text-muted block mb-1">Weight (kg)</label>
                          <input
                            type="number"
                            value={profileWeight}
                            onChange={(e) => setProfileWeight(Number(e.target.value))}
                            className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-sm focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="text-xs font-bold text-muted block mb-1">Height (cm)</label>
                          <input
                            type="number"
                            value={profileHeight}
                            onChange={(e) => setProfileHeight(Number(e.target.value))}
                            className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-sm focus:outline-none"
                          />
                        </div>
                      </div>

                      {/* Emergency Contact */}
                      <div className="border-t border-border pt-4 space-y-4">
                        <h4 className="font-extrabold text-xs text-muted uppercase tracking-wider">
                          Emergency Contacts settings
                        </h4>

                        <div>
                          <label className="text-xs font-bold text-muted block mb-1">Contact Full Name</label>
                          <input
                            type="text"
                            placeholder="e.g. John Miller"
                            value={emergencyName}
                            onChange={(e) => setEmergencyName(e.target.value)}
                            className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-sm focus:outline-none"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-xs font-bold text-muted block mb-1">Relation</label>
                            <input
                              type="text"
                              placeholder="e.g. Spouse / Brother"
                              value={emergencyRelation}
                              onChange={(e) => setEmergencyRelation(e.target.value)}
                              className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-sm focus:outline-none"
                            />
                          </div>

                          <div>
                            <label className="text-xs font-bold text-muted block mb-1">Emergency Phone</label>
                            <input
                              type="text"
                              placeholder="e.g. +1 555-0199"
                              value={emergencyPhone}
                              onChange={(e) => setEmergencyPhone(e.target.value)}
                              className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-sm focus:outline-none"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-end pt-3">
                        <button
                          type="submit"
                          disabled={isSavingProfile}
                          className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-gradient-primary hover:opacity-95 shadow-md shadow-primary/10 transition-all duration-200"
                        >
                          {isSavingProfile ? (
                            <RefreshCcw className="h-4 w-4 animate-spin" />
                          ) : (
                            <Save className="h-4 w-4" />
                          )}
                          <span>Save Metrics</span>
                        </button>
                      </div>
                    </form>
                  </div>

                  {/* SECURITY / CHANGE PASSWORD */}
                  <div className="bg-surface border border-border p-6 rounded-2xl shadow-sm space-y-4">
                    <h3 className="font-extrabold text-sm text-foreground uppercase tracking-widest flex items-center gap-2">
                      <Key className="h-4 w-4 text-primary" />
                      <span>Security Settings</span>
                    </h3>
                    <form onSubmit={handleChangePassword} className="space-y-4">
                      {passwordMessage.text && (
                        <div className={`p-3 rounded-lg text-xs font-bold ${
                          passwordMessage.type === "success" ? "bg-emerald-500/10 text-emerald-500" : "bg-destructive/10 text-destructive"
                        }`}>
                          {passwordMessage.text}
                        </div>
                      )}

                      <div>
                        <label className="text-xs font-bold text-muted block mb-1">Current Password</label>
                        <input
                          type="password"
                          value={oldPassword}
                          onChange={(e) => setOldPassword(e.target.value)}
                          className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-sm focus:outline-none"
                          required
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs font-bold text-muted block mb-1">New Password</label>
                          <input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-sm focus:outline-none"
                            required
                        />
                        </div>

                        <div>
                          <label className="text-xs font-bold text-muted block mb-1">Confirm New Password</label>
                          <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-sm focus:outline-none"
                            required
                          />
                        </div>
                      </div>

                      <div className="flex justify-end pt-3">
                        <button
                          type="submit"
                          disabled={isUpdatingPassword}
                          className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-gradient-primary hover:opacity-95 shadow-md shadow-primary/10 transition-all duration-200"
                        >
                          {isUpdatingPassword ? (
                            <RefreshCcw className="h-4 w-4 animate-spin" />
                          ) : (
                            <Key className="h-4 w-4" />
                          )}
                          <span>Change Password</span>
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
};
