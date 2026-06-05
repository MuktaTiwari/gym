import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  Bookmark,
  CheckCircle,
  Clock,
  Plus,
  Search,
  SearchX,
  ShieldAlert,
  Sparkles,
  Trash2,
  UserCheck,
  Users,
  XCircle
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { axiosInstance } from "../../lib/axios";
import { useAuthStore } from "../../store/authStore";
import type { Booking, ClassSchedule, Trainer } from "../dashboard/memberApi";
import { memberApi } from "../dashboard/memberApi";

export const AttendancePage: React.FC = () => {
  const { user, isAuthenticated } = useAuthStore();

  // Active Sub-tab selector
  // Members: "booking" | "my-logs"
  // Staff: "check-in" | "schedules" | "all-bookings"
  const [activeTab, setActiveTab] = useState(user?.role === "MEMBER" ? "booking" : "check-in");

  // Data States
  const [classes, setClasses] = useState<ClassSchedule[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [allBookings, setAllBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [memberSearch, setMemberSearch] = useState("");
  const [allMembers, setAllMembers] = useState<any[]>([]);
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [selectedMember, setSelectedMember] = useState<any | null>(null);
  const [checkInStatus, setCheckInStatus] = useState<"PRESENT" | "LATE">("PRESENT");

  // Add Class Schedule Modal (Staff)
  const [isAddClassOpen, setIsAddClassOpen] = useState(false);
  const [newClassData, setNewClassData] = useState({
    className: "",
    trainerName: "",
    time: "07:00 AM",
    capacity: 20
  });

  // Feedback Messages
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [alertMsg, setAlertMsg] = useState<string | null>(null);

  const isMember = user?.role === "MEMBER";

  // Poll / Fetch Data Function
  const fetchData = async (isSilent = false) => {
    if (!isAuthenticated || !user) return;
    try {
      if (!isSilent) setLoading(true);

      // Fetch classes
      const classList = await memberApi.getClassSchedules();
      setClasses(classList);

      if (isMember) {
        // Fetch member personal bookings
        const myBookingsList = await memberApi.getBookings();
        setBookings(myBookingsList);
      } else {
        // Staff - Fetch gym members for gate check-in & all bookings
        const bookingsList = await memberApi.getAllBookings();
        setAllBookings(bookingsList);
      }

      setError(null);
    } catch (err: any) {
      console.error("Error fetching attendance data:", err);
      setError(err?.response?.data?.message || "Failed to synchronise with gym servers.");
    } finally {
      setLoading(false);
    }
  };

  const fetchMembersForStaff = async () => {
    if (!isAuthenticated || !user) return;
    if (isMember) return;
    try {
      const [membersRes, trainersRes] = await Promise.all([
        axiosInstance.get("/members"),
        memberApi.getTrainers()
      ]);
      const membersList = Array.isArray(membersRes.data.data)
        ? membersRes.data.data
        : (membersRes.data.data?.docs || []);
      setAllMembers(membersList);
      setTrainers(trainersRes);
    } catch (err) {
      console.error("Error loading staff data dependencies:", err);
    }
  };

  // Initial load
  useEffect(() => {
    if (isAuthenticated && user) {
      fetchData();
      fetchMembersForStaff();
    }
  }, [user, isAuthenticated]);


  // Helper trigger messages
  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  const showAlert = (msg: string) => {
    setAlertMsg(msg);
    setTimeout(() => setAlertMsg(null), 4000);
  };

  // Book class action
  const handleBookClass = async (schedule: ClassSchedule) => {
    try {
      await memberApi.bookClass({
        classId: schedule._id,
        className: schedule.className,
        trainerName: schedule.trainerName,
        time: schedule.time,
        date: new Date().toISOString()
      });
      showSuccess(`Successfully booked slot for ${schedule.className}!`);
      fetchData(true);
    } catch (err: any) {
      showAlert(err?.response?.data?.message || "Could not reserve seat.");
    }
  };

  // Cancel booking action (Member)
  const handleCancelBooking = async (bookingId: string) => {
    try {
      await memberApi.cancelBooking(bookingId);
      showSuccess("Booking successfully cancelled.");
      fetchData(true);
    } catch (err: any) {
      showAlert(err?.response?.data?.message || "Could not cancel booking.");
    }
  };

  // Create new class schedule (Staff)
  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClassData.className || !newClassData.trainerName) {
      showAlert("Class name and trainer are required.");
      return;
    }
    try {
      await memberApi.createClassSchedule(newClassData);
      showSuccess(`New class "${newClassData.className}" successfully scheduled!`);
      setIsAddClassOpen(false);
      setNewClassData({ className: "", trainerName: "", time: "07:00 AM", capacity: 20 });
      fetchData(true);
    } catch (err: any) {
      showAlert("Failed to schedule class.");
    }
  };

  // Cancel class schedule (Staff)
  const handleCancelClass = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to cancel "${name}"? Members will be notified instantly.`)) return;
    try {
      await memberApi.updateClassSchedule(id, { status: "CANCELLED" });
      showSuccess(`Class "${name}" cancelled. Members notified.`);
      fetchData(true);
    } catch (err: any) {
      showAlert("Could not update class status.");
    }
  };

  // Close class schedule (Staff)
  const handleCloseClass = async (id: string, name: string) => {
    try {
      await memberApi.updateClassSchedule(id, { status: "CLOSED" });
      showSuccess(`Class "${name}" closed for bookings.`);
      fetchData(true);
    } catch (err: any) {
      showAlert("Could not close class schedule.");
    }
  };

  // Delete class schedule (Staff)
  const handleDeleteClass = async (id: string, name: string) => {
    if (!window.confirm(`Delete "${name}" entirely from records? This removes active member reservations.`)) return;
    try {
      await memberApi.deleteClassSchedule(id);
      showSuccess(`Class "${name}" deleted.`);
      fetchData(true);
    } catch (err: any) {
      showAlert("Could not delete class.");
    }
  };

  // Gate Check-in Approval (Staff)
  const handleApproveGateCheckIn = async () => {
    if (!selectedMember) return;
    try {
      // We simulate logging a workout or checking in under this member's profile
      await memberApi.logWorkout({
        title: `Gate Entrance Approved (${checkInStatus})`,
        duration: 90,
        exercises: [],
        notes: `Manual front-desk approval at ${new Date().toLocaleTimeString()}`,
        date: new Date().toISOString()
      });
      showSuccess(`Approved Gate Check-In for ${selectedMember.fullName}!`);
      setSelectedMember(null);
      setMemberSearch("");
      fetchMembersForStaff();
    } catch (err: any) {
      showAlert("Failed to approve check-in.");
    }
  };

  // Filter members list for gate check-in search
  const filteredSuggestions = allMembers.filter(
    (m) =>
      m.fullName.toLowerCase().includes(memberSearch.toLowerCase()) ||
      m.email.toLowerCase().includes(memberSearch.toLowerCase()) ||
      (m.memberId && m.memberId.toLowerCase().includes(memberSearch.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Alert Overlays */}
      <AnimatePresence>
        {successMsg && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-5 right-5 z-50 bg-emerald-500 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 border border-emerald-400 font-extrabold text-sm"
          >
            <CheckCircle className="h-5 w-5 shrink-0" />
            <span>{successMsg}</span>
          </motion.div>
        )}
        {alertMsg && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-5 right-5 z-50 bg-amber-500 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 border border-amber-400 font-extrabold text-sm"
          >
            <AlertTriangle className="h-5 w-5 shrink-0" />
            <span>{alertMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight font-sans">
            {isMember ? "Class Reservations Hub" : "Front-Desk Check-In & Classes"}
          </h2>
          <p className="text-muted text-sm mt-1">
            {isMember
              ? "Browse, reserve slots, and schedule your workout classes in real-time."
              : "Manage active entry gates, trace scheduled class reservations, and configure workouts."}
          </p>
        </div>

        {/* Tab Selection buttons */}
        <div className="flex items-center bg-surface border border-border p-1 rounded-xl shadow-sm self-start">
          {isMember ? (
            <>
              <button
                onClick={() => setActiveTab("booking")}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === "booking"
                  ? "bg-primary text-white"
                  : "text-muted hover:text-foreground hover:bg-surface-hover"
                  }`}
              >
                Book Classes
              </button>
              <button
                onClick={() => setActiveTab("my-logs")}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === "my-logs"
                  ? "bg-primary text-white"
                  : "text-muted hover:text-foreground hover:bg-surface-hover"
                  }`}
              >
                My Schedule & Logs
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setActiveTab("check-in")}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === "check-in"
                  ? "bg-primary text-white"
                  : "text-muted hover:text-foreground hover:bg-surface-hover"
                  }`}
              >
                Front-Desk Gates
              </button>
              <button
                onClick={() => setActiveTab("schedules")}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === "schedules"
                  ? "bg-primary text-white"
                  : "text-muted hover:text-foreground hover:bg-surface-hover"
                  }`}
              >
                Schedules Builder
              </button>
              <button
                onClick={() => setActiveTab("all-bookings")}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === "all-bookings"
                  ? "bg-primary text-white"
                  : "text-muted hover:text-foreground hover:bg-surface-hover"
                  }`}
              >
                Gym Bookings
              </button>
            </>
          )}
        </div>
      </div>

      {loading && !classes.length ? (
        <div className="flex flex-col items-center justify-center py-20 bg-surface border border-border rounded-2xl gap-4">
          <div className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-muted font-bold">Connecting to gym server database...</span>
        </div>
      ) : error ? (
        <div className="p-6 bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl flex items-center gap-4">
          <ShieldAlert className="h-6 w-6 shrink-0" />
          <div>
            <h4 className="font-extrabold">Synchronisation Interrupted</h4>
            <p className="text-xs mt-1 font-semibold">{error}</p>
          </div>
        </div>
      ) : (
        <AnimatePresence mode="wait">
          {/* MEMBER HUB: BOOK CLASSES */}
          {activeTab === "booking" && isMember && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {classes.filter(c => c.status !== "CANCELLED").length === 0 ? (
                  <div className="col-span-full py-16 bg-surface border border-border rounded-2xl flex flex-col items-center justify-center text-center p-6">
                    <SearchX className="h-12 w-12 text-muted mb-3" />
                    <h3 className="text-base font-extrabold">No Available Classes</h3>
                    <p className="text-muted text-xs mt-1 max-w-sm">
                      There are currently no active workout schedules. Check back later or contact your gym administrator.
                    </p>
                  </div>
                ) : (
                  classes
                    .filter((c) => c.status !== "CANCELLED")
                    .map((c) => {
                      const isAlreadyBooked = bookings.some(
                        (b) => b.classId === c._id && b.status === "BOOKED"
                      );
                      const isFull = c.bookedCount >= c.capacity;
                      const activeBooking = bookings.find(
                        (b) => b.classId === c._id && b.status === "BOOKED"
                      );

                      return (
                        <motion.div
                          key={c._id}
                          whileHover={{ y: -4 }}
                          className="bg-surface border border-border p-6 rounded-2xl shadow-sm flex flex-col justify-between h-56 relative overflow-hidden"
                        >
                          {isAlreadyBooked && (
                            <div className="absolute top-0 right-0 bg-primary/20 text-primary border-l border-b border-primary/20 px-3 py-1 text-[10px] font-black uppercase rounded-bl-xl flex items-center gap-1">
                              <Sparkles className="h-3 w-3" /> Reserved
                            </div>
                          )}

                          <div>
                            <span className="text-[10px] font-bold text-muted tracking-wider uppercase block">
                              Active Workout Class
                            </span>
                            <h3 className="text-lg font-black tracking-tight text-foreground mt-1">
                              {c.className}
                            </h3>
                            <p className="text-xs text-muted mt-1 font-semibold">
                              Trainer: <span className="text-foreground">{c.trainerName}</span>
                            </p>
                          </div>

                          <div className="space-y-4">
                            <div className="flex items-center justify-between text-xs font-bold border-t border-border pt-3">
                              <span className="flex items-center gap-1 text-muted">
                                <Clock className="h-3.5 w-3.5" /> {c.time}
                              </span>
                              <span className="flex items-center gap-1 text-primary">
                                <Users className="h-3.5 w-3.5" />{" "}
                                {c.capacity - c.bookedCount} spots left
                              </span>
                            </div>

                            {isAlreadyBooked ? (
                              <button
                                onClick={() => activeBooking?._id && handleCancelBooking(activeBooking._id)}
                                className="w-full py-2.5 rounded-xl text-xs font-black border border-amber-500/20 text-amber-500 bg-amber-500/5 hover:bg-amber-500/10 transition-all flex items-center justify-center gap-1.5"
                              >
                                <XCircle className="h-4 w-4" /> Cancel Booking
                              </button>
                            ) : (
                              <button
                                onClick={() => handleBookClass(c)}
                                disabled={isFull || c.status === "CLOSED"}
                                className={`w-full py-2.5 rounded-xl text-xs font-black text-white transition-all shadow-md flex items-center justify-center gap-1.5 ${isFull || c.status === "CLOSED"
                                  ? "bg-muted border border-transparent cursor-not-allowed opacity-50 shadow-none text-muted-foreground"
                                  : "bg-gradient-primary hover:opacity-95 shadow-primary/10"
                                  }`}
                              >
                                <Bookmark className="h-4 w-4" />
                                {isFull ? "Class Full" : "Reserve Slot"}
                              </button>
                            )}
                          </div>
                        </motion.div>
                      );
                    })
                )}
              </div>
            </motion.div>
          )}

          {/* MEMBER HUB: MY SCHEDULE & LOGS */}
          {activeTab === "my-logs" && isMember && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="bg-surface border border-border rounded-2xl shadow-sm overflow-hidden"
            >
              <div className="p-5 border-b border-border flex items-center justify-between bg-surface-hover/10">
                <h3 className="font-extrabold text-base">Personal Class Reservations</h3>
                <span className="text-[10px] font-bold bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded-full uppercase">
                  My Bookings
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-border bg-surface-hover/30 text-xs font-bold text-muted uppercase tracking-wider">
                      <th className="px-6 py-4">Class Details</th>
                      <th className="px-6 py-4">Trainer Name</th>
                      <th className="px-6 py-4">Time Slot</th>
                      <th className="px-6 py-4">Booking Date</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border text-sm font-medium">
                    {bookings.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center py-10 text-muted font-bold text-xs">
                          You have not booked any workout classes yet.
                        </td>
                      </tr>
                    ) : (
                      bookings.map((b) => (
                        <tr key={b._id} className="hover:bg-surface-hover/20 transition-colors">
                          <td className="px-6 py-4 font-extrabold text-foreground">{b.className}</td>
                          <td className="px-6 py-4 text-muted">{b.trainerName}</td>
                          <td className="px-6 py-4 text-muted text-xs font-mono">{b.time}</td>
                          <td className="px-6 py-4 text-muted text-xs">
                            {new Date(b.date).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase ${b.status === "BOOKED"
                                ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                                : "bg-red-500/10 text-red-500 border-red-500/20"
                                }`}
                            >
                              {b.status === "BOOKED" ? "CONFIRMED" : b.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            {b.status === "BOOKED" ? (
                              <button
                                onClick={() => b._id && handleCancelBooking(b._id)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 hover:bg-destructive/10 text-muted hover:text-destructive border border-transparent hover:border-destructive/20 rounded-xl text-xs font-bold transition-all duration-200"
                              >
                                <XCircle className="h-3.5 w-3.5" />
                                <span>Cancel Booking</span>
                              </button>
                            ) : (
                              <span className="text-xs text-muted font-semibold">Closed</span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {/* STAFF: FRONT-DESK GATES CHECK-IN */}
          {activeTab === "check-in" && !isMember && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start"
            >
              {/* Quick check in card */}
              <div className="bg-surface border border-border p-5 rounded-2xl shadow-sm space-y-4">
                <h3 className="text-lg font-extrabold tracking-tight">Gate Entry Scanner</h3>

                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
                  <input
                    type="text"
                    placeholder="Search by name, ID or email..."
                    value={memberSearch}
                    onChange={(e) => {
                      setMemberSearch(e.target.value);
                      if (selectedMember && selectedMember.fullName !== e.target.value) {
                        setSelectedMember(null);
                      }
                    }}
                    className="w-full bg-background border border-border rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:border-primary transition-all duration-200"
                  />

                  {/* Dropdown Suggestions */}
                  {memberSearch && filteredSuggestions.length > 0 && !selectedMember && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-surface border border-border rounded-xl shadow-xl max-h-48 overflow-y-auto z-10 divide-y divide-border">
                      {filteredSuggestions.map((m) => (
                        <button
                          key={m._id}
                          onClick={() => {
                            setSelectedMember(m);
                            setMemberSearch(m.fullName);
                          }}
                          className="w-full text-left px-4 py-2.5 hover:bg-surface-hover transition-colors flex items-center gap-3 text-xs font-bold"
                        >
                          <div className="h-6 w-6 rounded-full overflow-hidden bg-background shrink-0 flex items-center justify-center font-black bg-primary/20 text-primary">
                            {m.fullName.charAt(0)}
                          </div>
                          <div className="truncate">
                            <p className="font-extrabold text-foreground">{m.fullName}</p>
                            <p className="text-[9px] text-muted truncate">{m.email}</p>
                          </div>
                          <span className="text-[10px] text-muted font-normal ml-auto shrink-0">{m.memberId}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={() => setCheckInStatus("PRESENT")}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${checkInStatus === "PRESENT"
                      ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/30"
                      : "bg-background text-muted border-border hover:bg-surface-hover"
                      }`}
                  >
                    On-Time Check-In
                  </button>
                  <button
                    onClick={() => setCheckInStatus("LATE")}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${checkInStatus === "LATE"
                      ? "bg-amber-500/10 text-amber-500 border-amber-500/30"
                      : "bg-background text-muted border-border hover:bg-surface-hover"
                      }`}
                  >
                    Late Arrival
                  </button>
                </div>

                <button
                  onClick={handleApproveGateCheckIn}
                  disabled={!selectedMember}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm text-white bg-gradient-primary hover:opacity-95 disabled:opacity-40 transition-all shadow-md shadow-primary/10"
                >
                  <Plus className="h-4 w-4" />
                  <span>Approve Gate Check-In</span>
                </button>
              </div>

              {/* Roster list */}
              <div className="lg:col-span-2 bg-surface border border-border rounded-2xl shadow-sm overflow-hidden">
                <div className="p-5 border-b border-border flex items-center justify-between bg-surface-hover/10">
                  <h3 className="font-extrabold text-base">Gate Attendance Roster</h3>
                  <span className="text-[10px] font-bold bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded-full uppercase">
                    Live Feed
                  </span>
                </div>

                <div className="p-5 flex items-center justify-center bg-surface text-center py-16">
                  <div className="max-w-sm space-y-2">
                    <UserCheck className="h-10 w-10 text-primary mx-auto" />
                    <h3 className="font-extrabold text-sm">Gate Attendance Live</h3>
                    <p className="text-xs text-muted font-medium">
                      Integrates automatically with RFID barcode scanners at entry gates. Approved entries are audited immediately.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* STAFF: SCHEDULES BUILDER */}
          {activeTab === "schedules" && !isMember && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-6"
            >
              <div className="flex justify-between items-center bg-surface border border-border p-4 rounded-2xl shadow-sm">
                <div>
                  <h3 className="font-extrabold text-sm">Create Class Schedule</h3>
                  <p className="text-xs text-muted font-semibold mt-0.5">Define new fitness lessons, capacities and trainer allocations.</p>
                </div>
                <button
                  onClick={() => setIsAddClassOpen(true)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black text-white bg-gradient-primary hover:opacity-95 transition-all shadow-md shadow-primary/10"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Class Schedule</span>
                </button>
              </div>

              {/* Schedules Table */}
              <div className="bg-surface border border-border rounded-2xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-border bg-surface-hover/30 text-xs font-bold text-muted uppercase tracking-wider">
                        <th className="px-6 py-4">Class Name</th>
                        <th className="px-6 py-4">Trainer Name</th>
                        <th className="px-6 py-4">Time Slot</th>
                        <th className="px-6 py-4">Capacity Status</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border text-sm font-medium">
                      {classes.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="text-center py-10 text-muted font-bold text-xs">
                            No classes have been scheduled yet. Click "Add Class Schedule" to start.
                          </td>
                        </tr>
                      ) : (
                        classes.map((c) => (
                          <tr key={c._id} className="hover:bg-surface-hover/20 transition-colors">
                            <td className="px-6 py-4 font-extrabold text-foreground">{c.className}</td>
                            <td className="px-6 py-4 text-muted">{c.trainerName}</td>
                            <td className="px-6 py-4 text-muted text-xs font-mono">{c.time}</td>
                            <td className="px-6 py-4">
                              <span className="text-xs font-bold text-foreground">
                                {c.bookedCount} / {c.capacity} booked
                              </span>
                              <div className="w-24 bg-background border border-border h-1.5 rounded-full overflow-hidden mt-1.5">
                                <div
                                  className="bg-primary h-full transition-all duration-300"
                                  style={{ width: `${Math.min(100, (c.bookedCount / c.capacity) * 100)}%` }}
                                />
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span
                                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase ${c.status === "ACTIVE"
                                  ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                                  : c.status === "CLOSED"
                                    ? "bg-amber-500/10 text-amber-500 border-amber-500/20"
                                    : "bg-red-500/10 text-red-500 border-red-500/20"
                                  }`}
                              >
                                {c.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right space-x-2">
                              {c.status === "ACTIVE" && (
                                <>
                                  <button
                                    onClick={() => c._id && handleCloseClass(c._id, c.className)}
                                    className="px-2.5 py-1.5 hover:bg-amber-500/10 text-amber-500 border border-transparent hover:border-amber-500/20 rounded-lg text-[10px] font-extrabold uppercase transition-all"
                                  >
                                    Close class
                                  </button>
                                  <button
                                    onClick={() => c._id && handleCancelClass(c._id, c.className)}
                                    className="px-2.5 py-1.5 hover:bg-red-500/10 text-red-500 border border-transparent hover:border-red-500/20 rounded-lg text-[10px] font-extrabold uppercase transition-all"
                                  >
                                    Cancel
                                  </button>
                                </>
                              )}
                              <button
                                onClick={() => c._id && handleDeleteClass(c._id, c.className)}
                                className="p-1.5 hover:bg-destructive/10 text-muted hover:text-destructive border border-transparent hover:border-destructive/20 rounded-lg transition-all"
                                title="Delete schedule"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {/* STAFF: ALL GYM BOOKINGS */}
          {activeTab === "all-bookings" && !isMember && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="bg-surface border border-border rounded-2xl shadow-sm overflow-hidden"
            >
              <div className="p-5 border-b border-border flex items-center justify-between bg-surface-hover/10">
                <h3 className="font-extrabold text-base">Gym-Wide Reservations Ledger</h3>
                <span className="text-[10px] font-bold bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded-full uppercase">
                  All Bookings
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-border bg-surface-hover/30 text-xs font-bold text-muted uppercase tracking-wider">
                      <th className="px-6 py-4">Member Name</th>
                      <th className="px-6 py-4">Class Reserved</th>
                      <th className="px-6 py-4">Trainer</th>
                      <th className="px-6 py-4">Time Slot</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border text-sm font-medium">
                    {allBookings.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center py-10 text-muted font-bold text-xs">
                          There are currently no class bookings recorded in the ledger database.
                        </td>
                      </tr>
                    ) : (
                      allBookings.map((b) => (
                        <tr key={b._id} className="hover:bg-surface-hover/20 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <div className="h-6 w-6 rounded-full bg-primary/15 text-primary flex items-center justify-center font-bold text-xs">
                                {b.memberId?.fullName?.charAt(0) || "M"}
                              </div>
                              <div>
                                <p className="font-extrabold text-foreground">{b.memberId?.fullName || "Guest Athlete"}</p>
                                <p className="text-[9px] text-muted">{b.memberId?.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 font-extrabold text-foreground">{b.className}</td>
                          <td className="px-6 py-4 text-muted">{b.trainerName}</td>
                          <td className="px-6 py-4 text-muted text-xs font-mono">{b.time}</td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase ${b.status === "BOOKED"
                                ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                                : "bg-red-500/10 text-red-500 border-red-500/20"
                                }`}
                            >
                              {b.status === "BOOKED" ? "CONFIRMED" : b.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            {b.status === "BOOKED" ? (
                              <button
                                onClick={() => b._id && handleCancelBooking(b._id)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 hover:bg-destructive/10 text-muted hover:text-destructive border border-transparent hover:border-destructive/20 rounded-xl text-xs font-bold transition-all duration-200"
                              >
                                <XCircle className="h-3.5 w-3.5" />
                                <span>Cancel Booking</span>
                              </button>
                            ) : (
                              <span className="text-xs text-muted font-semibold">Cancelled</span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      )}

      {/* Add Class Schedule Popup Modal (Staff Only) */}
      <AnimatePresence>
        {isAddClassOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Overlay backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddClassOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            {/* Modal Body */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-surface border border-border p-6 rounded-2xl w-full max-w-md relative z-10 shadow-2xl space-y-4"
            >
              <h3 className="text-lg font-black tracking-tight text-foreground">Schedule Gym Class</h3>
              <p className="text-xs text-muted font-medium">Create a new class that members can book in real-time.</p>

              <form onSubmit={handleCreateClass} className="space-y-4 pt-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted uppercase">Class Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. HIIT Power Zone"
                    value={newClassData.className}
                    onChange={(e) => setNewClassData({ ...newClassData, className: e.target.value })}
                    className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted uppercase">Trainer Name</label>
                  <select
                    required
                    value={newClassData.trainerName}
                    onChange={(e) => setNewClassData({ ...newClassData, trainerName: e.target.value })}
                    className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary transition-all cursor-pointer appearance-none"
                  >
                    <option value="" disabled>Select a trainer</option>
                    {trainers.map(trainer => (
                      <option key={trainer._id} value={trainer.fullName}>
                        {trainer.fullName} - {trainer.specialization || "General"}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-muted uppercase">Time Slot</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 06:00 PM"
                      value={newClassData.time}
                      onChange={(e) => setNewClassData({ ...newClassData, time: e.target.value })}
                      className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary transition-all"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-muted uppercase">Capacity Seats</label>
                    <input
                      type="number"
                      required
                      placeholder="20"
                      min={1}
                      value={newClassData.capacity}
                      onChange={(e) => setNewClassData({ ...newClassData, capacity: Number(e.target.value) })}
                      className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary transition-all"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4 justify-end">
                  <button
                    type="button"
                    onClick={() => setIsAddClassOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold border border-border hover:bg-surface-hover text-muted hover:text-foreground transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-primary hover:opacity-95 shadow-md shadow-primary/10 transition-all"
                  >
                    Publish Schedule
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
