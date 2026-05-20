import React, { useState, useEffect } from "react";
import { useAuthStore } from "../../store/authStore";
import { MemberDashboard } from "./MemberDashboard";
import { axiosInstance } from "../../lib/axios";
import { memberApi } from "./memberApi";
import type { ClassSchedule, Trainer, TrainerChangeRequest } from "./memberApi";
import { motion } from "framer-motion";
import {
  Users,
  Activity,
  Calendar,
  DollarSign,
  TrendingUp,
  Award,
  Zap,
  Plus,
  Dumbbell,
  Send,
  Check,
  X,
  Megaphone,
  UserPlus,
  Trash,
  PlusCircle,
  CalendarRange,
  Mail,
  Phone,
  Bookmark
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";

export const DashboardPage: React.FC = () => {
  const { user, isAuthenticated } = useAuthStore();
  const isOwner = user?.role === "GYM_OWNER";
  const isAdmin = user?.role === "GYM_ADMIN";
  const isTrainer = user?.role === "TRAINER";
  const isMember = user?.role === "MEMBER";

  // Dashboard state variables
  const [totalMembers, setTotalMembers] = useState(0);
  const [activeSubs, setActiveSubs] = useState(0);
  const [todayAttendance, setTodayAttendance] = useState(0);
  const [monthlyRevenue, setMonthlyRevenue] = useState(0);
  const [activityLogs, setActivityLogs] = useState<any[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Administrative Console States
  const [adminTab, setAdminTab] = useState<"classes" | "requests" | "trainers" | "broadcast">("classes");
  const [classes, setClasses] = useState<ClassSchedule[]>([]);
  const [trainerRequests, setTrainerRequests] = useState<TrainerChangeRequest[]>([]);
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [announcementMsg, setAnnouncementMsg] = useState("");
  const [broadcastSuccess, setBroadcastSuccess] = useState<string | null>(null);

  // Form States - New Class Schedule
  const [newClass, setNewClass] = useState({
    className: "",
    trainerName: "",
    time: "",
    capacity: 20
  });

  // Form States - New Trainer
  const [newTrainer, setNewTrainer] = useState({
    fullName: "",
    email: "",
    phone: "",
    specialization: ""
  });

  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  const loadDashboardData = async () => {
    if (!isAuthenticated || !user) return;
    try {
      if (isMember) return;
      const [membersRes, paymentsRes, logsRes] = await Promise.all([
        axiosInstance.get("/members"),
        memberApi.getAllPayments(),
        memberApi.getActivityLogs()
      ]);

      const membersList = Array.isArray(membersRes.data.data)
        ? membersRes.data.data
        : (membersRes.data.data?.docs || []);
      const paymentsList = paymentsRes || [];
      const logsList = logsRes || [];

      setTotalMembers(membersList.length);
      setActiveSubs(membersList.filter((m: any) => m.status === "ACTIVE").length);

      // Count check-in logs registered today
      const todayStr = new Date().toDateString();
      const todayCheckins = logsList.filter((log: any) => {
        const isCheckin = log.action && log.action.toLowerCase().includes("check");
        const isToday = new Date(log.timestamp).toDateString() === todayStr;
        return isCheckin && isToday;
      }).length;

      // Fallback to absolute count of checkins if none registered today specifically
      setTodayAttendance(
        todayCheckins ||
        logsList.filter((log: any) => log.action && log.action.toLowerCase().includes("check")).length
      );

      // Monthly revenue sum (from completed payments)
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      const currentMonthPayments = paymentsList.filter((p: any) => {
        const pDate = new Date(p.date);
        return p.status === "COMPLETED" && pDate.getMonth() === currentMonth && pDate.getFullYear() === currentYear;
      });
      const revenueSum = currentMonthPayments.reduce((sum: number, p: any) => sum + p.amount, 0);

      // Fallback to all-time revenue if no payments this month
      setMonthlyRevenue(
        revenueSum > 0
          ? revenueSum
          : paymentsList.filter((p: any) => p.status === "COMPLETED").reduce((sum: number, p: any) => sum + p.amount, 0)
      );

      // Generate last 6 months data dynamically
      const monthsData = [];
      const now = new Date();
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthLabel = d.toLocaleString("default", { month: "short", year: "2-digit" });
        const monthVal = d.getMonth();
        const yearVal = d.getFullYear();

        // Filter completed payments for this month
        const monthPayments = paymentsList.filter((p: any) => {
          const pDate = new Date(p.date || p.createdAt || Date.now());
          return p.status === "COMPLETED" && pDate.getMonth() === monthVal && pDate.getFullYear() === yearVal;
        });
        const revenue = monthPayments.reduce((sum: number, p: any) => sum + p.amount, 0);

        // Count members registered before or during this month
        const activeMembersCount = membersList.filter((m: any) => {
          const mDate = new Date(m.createdAt || m.membershipStartDate || Date.now());
          return mDate <= new Date(yearVal, monthVal + 1, 0);
        }).length;

        monthsData.push({
          month: monthLabel,
          revenue: revenue || 0,
          activeMembers: activeMembersCount || 0
        });
      }
      setChartData(monthsData);

      // Set logs
      setActivityLogs(logsList.slice(0, 8));
    } catch (err) {
      console.error("Error loading admin dashboard stats", err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadAdminConsoleData = async () => {
    if (!isAuthenticated || !user) return;
    if (isMember || isTrainer) return;
    try {
      const [classesRes, requestsRes, trainersRes] = await Promise.all([
        memberApi.getClassSchedules(),
        memberApi.getTrainerChangeRequests(),
        memberApi.getTrainers()
      ]);
      setClasses(classesRes || []);
      setTrainerRequests(requestsRes || []);
      setTrainers(trainersRes || []);
    } catch (err) {
      console.error("Error loading admin console lists", err);
    }
  };

  useEffect(() => {
    if (isAuthenticated && user) {
      if (!isMember) {
        loadDashboardData();
        loadAdminConsoleData();
        const interval = setInterval(() => {
          loadDashboardData();
          loadAdminConsoleData();
        }, 5000);
        return () => clearInterval(interval);
      }
    }
  }, [isMember, isAuthenticated, user]);

  // Administrative Action Handlers
  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClass.className || !newClass.trainerName || !newClass.time) {
      showFeedback("Please complete all class fields.");
      return;
    }
    try {
      await memberApi.createClassSchedule({
        className: newClass.className,
        trainerName: newClass.trainerName,
        time: newClass.time,
        capacity: Number(newClass.capacity),
        status: "ACTIVE"
      });
      setNewClass({ className: "", trainerName: "", time: "", capacity: 20 });
      showFeedback("Class schedule successfully created and active!");
      loadAdminConsoleData();
    } catch (err: any) {
      showFeedback("Failed to schedule class. Please try again.");
    }
  };

  const handleToggleClassStatus = async (id: string, currentStatus?: string) => {
    try {
      const nextStatus = currentStatus === "CANCELLED" ? "ACTIVE" : "CANCELLED";
      await memberApi.updateClassSchedule(id, { status: nextStatus });
      showFeedback(`Class marked as ${nextStatus === "CANCELLED" ? "cancelled" : "active"}!`);
      loadAdminConsoleData();
    } catch (err) {
      showFeedback("Failed to update class schedule state.");
    }
  };

  const handleDeleteClass = async (id: string) => {
    if (!window.confirm("Are you sure you want to permanently delete this class schedule?")) return;
    try {
      await memberApi.deleteClassSchedule(id);
      showFeedback("Class schedule successfully removed.");
      loadAdminConsoleData();
    } catch (err) {
      showFeedback("Failed to delete class schedule.");
    }
  };

  const handleResolveTrainerRequest = async (id: string, status: "APPROVED" | "REJECTED") => {
    try {
      await memberApi.updateTrainerChangeRequest(id, { status });
      showFeedback(`Trainer change request has been successfully ${status.toLowerCase()}!`);
      loadAdminConsoleData();
      loadDashboardData();
    } catch (err) {
      showFeedback("Failed to process trainer change request.");
    }
  };

  const handleCreateTrainer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTrainer.fullName || !newTrainer.email || !newTrainer.specialization) {
      showFeedback("Please complete all trainer details.");
      return;
    }
    try {
      await memberApi.createTrainer({
        fullName: newTrainer.fullName,
        email: newTrainer.email,
        phone: newTrainer.phone || "N/A",
        specialization: newTrainer.specialization,
        photo: "",
        schedule: {}
      });
      setNewTrainer({ fullName: "", email: "", phone: "", specialization: "" });
      showFeedback("New trainer successfully onboarded to the roster!");
      loadAdminConsoleData();
    } catch (err) {
      showFeedback("Failed to onboard new trainer.");
    }
  };

  const handleDeleteTrainer = async (id: string) => {
    if (!window.confirm("Remove this trainer from the staff roster? All assigned members will lose their current trainer assignment.")) return;
    try {
      await memberApi.deleteTrainer(id);
      showFeedback("Trainer successfully removed from roster.");
      loadAdminConsoleData();
    } catch (err) {
      showFeedback("Failed to remove trainer.");
    }
  };

  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!announcementMsg.trim()) return;
    try {
      await memberApi.createAnnouncement({ message: announcementMsg });
      setAnnouncementMsg("");
      setBroadcastSuccess("Realtime broadcast announcement successfully pushed to all members!");
      setTimeout(() => setBroadcastSuccess(null), 5000);
      loadDashboardData();
    } catch (err) {
      showFeedback("Failed to publish broadcast announcement.");
    }
  };

  const showFeedback = (msg: string) => {
    setActionFeedback(msg);
    setTimeout(() => setActionFeedback(null), 4000);
  };

  if (isMember) {
    return <MemberDashboard />;
  }

  // Dynamic statistics configuration
  const stats = [
    {
      label: "Total Members",
      value: isLoading ? "..." : totalMembers.toString(),
      change: `+${totalMembers > 0 ? Math.round(totalMembers * 0.1) : 0} this month`,
      icon: Users,
      color: "text-primary bg-primary/10 border-primary/20",
      roles: ["GYM_OWNER", "GYM_ADMIN"]
    },
    {
      label: "Active Subscriptions",
      value: isLoading ? "..." : activeSubs.toString(),
      change: `${totalMembers > 0 ? Math.round((activeSubs / totalMembers) * 100) : 100}% active rate`,
      icon: Award,
      color: "text-accent bg-accent/10 border-accent/20",
      roles: ["GYM_OWNER", "GYM_ADMIN"]
    },
    {
      label: "Today's Attendance",
      value: isLoading ? "..." : todayAttendance.toString(),
      change: "Check-in activity log",
      icon: Activity,
      color: "text-indigo-500 bg-indigo-500/10 border-indigo-500/20",
      roles: ["GYM_OWNER", "GYM_ADMIN", "TRAINER"]
    },
    {
      label: "Monthly Revenue",
      value: isLoading ? "..." : `$${monthlyRevenue.toLocaleString()}`,
      change: "Completed stripe & card ledger",
      icon: DollarSign,
      color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
      roles: ["GYM_OWNER"] // ONLY visible to OWNER
    },
    // Trainer stats
    {
      label: "Assigned Classes",
      value: "8",
      change: "4 types this week",
      icon: Calendar,
      color: "text-primary bg-primary/10 border-primary/20",
      roles: ["TRAINER"]
    },
    {
      label: "My Members",
      value: "42",
      change: "5 newcomers this week",
      icon: Users,
      color: "text-accent bg-accent/10 border-accent/20",
      roles: ["TRAINER"]
    }
  ];

  // Filter stats by user role
  const visibleStats = stats.filter(stat => stat.roles.includes(user?.role || ""));

  return (
    <div className="flex flex-col gap-8 pb-12">
      {/* Top Banner Greeting */}
      {/* <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 md:p-8 rounded-2xl bg-gradient-hero text-white relative overflow-hidden shadow-lg"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_120%,rgba(255,255,255,0.15)_0%,transparent_50%)]" />
        <div className="relative z-10">
          <h2 className="text-2xl md:text-3xl font-black tracking-tight">
            Ready to crush your goals, {user?.name}?
          </h2>
          <p className="mt-2 text-white/80 text-sm md:text-base font-medium max-w-xl">
            {isOwner && "Manage your facility, monitor financial performance, and lead your team to success."}
            {isAdmin && "Keep operations running smoothly: view check-ins, manage members, and organize classes."}
            {isTrainer && "Check your schedule, guide your students, and log attendance details easily."}
          </p>
        </div>
      </motion.div> */}

      {/* Grid: Dynamic Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {visibleStats.map((stat, idx) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            whileHover={{ y: -4 }}
            className="p-5 rounded-2xl bg-surface border border-border flex flex-col justify-between h-40 shadow-sm"
          >
            <div className="flex justify-between items-start">
              <span className="text-xs font-bold text-muted uppercase tracking-wider">{stat.label}</span>
              <div className={`h-10 w-10 rounded-xl flex items-center justify-center border ${stat.color}`}>
                <stat.icon className="h-5 w-5" />
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-black tracking-tight">{stat.value}</h3>
              <p className="text-xs text-muted font-semibold mt-1 flex items-center gap-1">
                <TrendingUp className="h-3 w-3 text-emerald-400 shrink-0" />
                <span>{stat.change}</span>
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Layout Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left/Center Columns: Charts and Actions */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Revenue Chart/Performance Grid */}
          {(isOwner || isAdmin) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="p-6 rounded-2xl bg-surface border border-border flex flex-col gap-6 shadow-sm"
            >
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-extrabold text-lg">Weekly Growth Curve</h3>
                  <p className="text-xs text-muted font-medium">Activity trends over the past week</p>
                </div>
                {isOwner && (
                  <span className="text-xs font-extrabold px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                    +18% Monthly Profit
                  </span>
                )}
              </div>

              {/* Interactive Recharts Area Chart */}
              <div className="h-52 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={chartData}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis
                      dataKey="month"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "hsl(var(--muted))", fontSize: 10, fontWeight: "bold" }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "hsl(var(--muted))", fontSize: 10, fontWeight: "bold" }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--surface))",
                        borderColor: "hsl(var(--border))",
                        borderRadius: "var(--radius)",
                        color: "hsl(var(--foreground))",
                        fontSize: "12px",
                        fontWeight: "bold",
                        boxShadow: "var(--shadow-md)",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      name="Revenue ($)"
                      stroke="hsl(var(--primary))"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#colorRevenue)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          )}

          {/* Quick Shortcuts */}
          <div className="grid grid-cols-2 gap-4">
            <motion.div
              whileHover={{ scale: 1.01 }}
              onClick={() => setAdminTab("trainers")}
              className="p-5 rounded-2xl bg-gradient-primary text-white flex flex-col justify-between h-36 cursor-pointer shadow-md"
            >
              <UserPlus className="h-6 w-6" />
              <div>
                <h4 className="font-extrabold text-base">Trainers Roster</h4>
                <p className="text-xs text-white/80 mt-1 font-medium">Manage professional staff</p>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.01 }}
              onClick={() => setAdminTab("classes")}
              className="p-5 rounded-2xl bg-surface border border-border flex flex-col justify-between h-36 cursor-pointer hover:bg-surface-hover shadow-sm"
            >
              <Dumbbell className="h-6 w-6 text-primary" />
              <div>
                <h4 className="font-extrabold text-base">Schedule Class</h4>
                <p className="text-xs text-muted mt-1 font-medium">Manage yoga or HIIT</p>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Right Column: Activity Feed */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.25 }}
          className="p-6 rounded-2xl bg-surface border border-border flex flex-col gap-6 shadow-sm overflow-hidden h-[450px]"
        >
          <div>
            <h3 className="font-extrabold text-lg">Realtime Activity Feed</h3>
            <p className="text-xs text-muted font-medium">Live logs for gym-wide actions</p>
          </div>

          <div className="flex flex-col gap-4 overflow-y-auto pr-1 flex-1">
            {activityLogs.length > 0 ? (
              activityLogs.map((act, idx) => (
                <div key={act._id || idx} className="flex justify-between items-center p-3 rounded-xl hover:bg-surface-hover transition-colors border border-transparent hover:border-border">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                      {(act.memberId?.fullName || "User").charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-bold text-xs">{act.memberId?.fullName || "Gym Member"}</h4>
                      <p className="text-[10px] text-muted font-semibold mt-0.5">{act.details || "Member action registered"}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-accent/10 text-accent border border-accent/10 uppercase">
                      {act.action}
                    </span>
                    <p className="text-[9px] text-muted mt-1 font-semibold">
                      {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <p className="text-xs text-muted font-semibold">No recent activity logs available.</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Administrative Operations Control Center Console */}
      {(isOwner || isAdmin) && (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="p-6 md:p-8 rounded-2xl bg-surface border border-border shadow-md mt-6"
        >
          {/* Section Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-border">
            <div>
              <h2 className="text-xl md:text-2xl font-black flex items-center gap-2">
                <Zap className="h-6 w-6 text-primary animate-pulse" />
                Admin Operations Console
              </h2>
              <p className="text-xs text-muted font-medium mt-1">Manage class timetables, staff reassignments, broadcasts and security in real time</p>
            </div>

            {/* Custom Tab Switcher */}
            <div className="flex bg-surface-hover p-1 rounded-xl border border-border">
              <button
                onClick={() => setAdminTab("classes")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${adminTab === "classes" ? "bg-primary text-white shadow-sm" : "text-muted hover:text-foreground"}`}
              >
                <CalendarRange className="h-3.5 w-3.5" />
                Class Schedules
              </button>
              <button
                onClick={() => setAdminTab("requests")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 relative ${adminTab === "requests" ? "bg-primary text-white shadow-sm" : "text-muted hover:text-foreground"}`}
              >
                <UserPlus className="h-3.5 w-3.5" />
                Trainer Requests
                {trainerRequests.filter(r => r.status === "PENDING").length > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 bg-rose-500 text-[9px] text-white font-black rounded-full flex items-center justify-center animate-bounce">
                    {trainerRequests.filter(r => r.status === "PENDING").length}
                  </span>
                )}
              </button>
              <button
                onClick={() => setAdminTab("trainers")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${adminTab === "trainers" ? "bg-primary text-white shadow-sm" : "text-muted hover:text-foreground"}`}
              >
                <Users className="h-3.5 w-3.5" />
                Staff roster
              </button>
              <button
                onClick={() => setAdminTab("broadcast")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${adminTab === "broadcast" ? "bg-primary text-white shadow-sm" : "text-muted hover:text-foreground"}`}
              >
                <Megaphone className="h-3.5 w-3.5" />
                Announce
              </button>
            </div>
          </div>

          {/* Action Feedback Alerts */}
          {actionFeedback && (
            <div className="mt-4 p-3 bg-primary/10 border border-primary/20 text-primary text-xs font-bold rounded-xl flex items-center gap-2">
              <Zap className="h-4 w-4 animate-bounce" />
              <span>{actionFeedback}</span>
            </div>
          )}

          {/* Tab Content Display */}
          <div className="pt-6">

            {/* TAB 1: DYNAMIC CLASS SCHEDULER */}
            {adminTab === "classes" && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Create Schedule Form */}
                <div className="p-5 rounded-2xl bg-surface-hover border border-border flex flex-col gap-4">
                  <h3 className="font-extrabold text-sm flex items-center gap-2">
                    <PlusCircle className="h-4 w-4 text-primary" />
                    Schedule New Class
                  </h3>
                  <form onSubmit={handleCreateClass} className="space-y-4">
                    <div>
                      <label className="text-[10px] font-bold text-muted uppercase block mb-1">Class Name</label>
                      <input
                        type="text"
                        placeholder="e.g. HIIT Power Hour, Vinyasa Yoga"
                        value={newClass.className}
                        onChange={(e) => setNewClass({ ...newClass, className: e.target.value })}
                        className="w-full bg-surface border border-border rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:outline-none focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-muted uppercase block mb-1">Trainer Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Coach Samantha, Alex Carter"
                        value={newClass.trainerName}
                        onChange={(e) => setNewClass({ ...newClass, trainerName: e.target.value })}
                        className="w-full bg-surface border border-border rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:outline-none focus:border-primary"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] font-bold text-muted uppercase block mb-1">Time Schedule</label>
                        <input
                          type="text"
                          placeholder="e.g. Mon 6:00 PM"
                          value={newClass.time}
                          onChange={(e) => setNewClass({ ...newClass, time: e.target.value })}
                          className="w-full bg-surface border border-border rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:outline-none focus:border-primary"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-muted uppercase block mb-1">Max Capacity</label>
                        <input
                          type="number"
                          min={1}
                          value={newClass.capacity}
                          onChange={(e) => setNewClass({ ...newClass, capacity: Number(e.target.value) })}
                          className="w-full bg-surface border border-border rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:outline-none focus:border-primary"
                        />
                      </div>
                    </div>
                    <button
                      type="submit"
                      className="w-full py-2.5 bg-primary hover:bg-primary-hover text-white text-xs font-black rounded-xl transition-all shadow-sm flex items-center justify-center gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Add to Timetable
                    </button>
                  </form>
                </div>

                {/* Timetable List Grid */}
                <div className="lg:col-span-2 flex flex-col gap-4">
                  <h3 className="font-extrabold text-sm flex items-center gap-2">
                    <CalendarRange className="h-4 w-4 text-primary" />
                    Current Timetable Schedule
                  </h3>

                  <div className="overflow-y-auto max-h-[360px] pr-1 space-y-3">
                    {classes.length > 0 ? (
                      classes.map((cls) => (
                        <div
                          key={cls._id}
                          className={`p-4 rounded-xl border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 transition-colors ${cls.status === "CANCELLED" ? "bg-red-500/5 border-red-500/10 opacity-70" : "bg-surface-hover border-border hover:bg-surface-hover/80"}`}
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-sm text-foreground">{cls.className}</h4>
                              <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border ${cls.status === "CANCELLED" ? "bg-red-500/10 text-red-500 border-red-500/20" : "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"}`}>
                                {cls.status || "ACTIVE"}
                              </span>
                            </div>
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-[11px] text-muted font-semibold">
                              <span>Trainer: <strong className="text-foreground">{cls.trainerName}</strong></span>
                              <span>•</span>
                              <span>Time: <strong className="text-foreground">{cls.time}</strong></span>
                              <span>•</span>
                              <span>Capacity: <strong className="text-foreground">{cls.bookedCount || 0}/{cls.capacity}</strong></span>
                            </div>
                          </div>

                          <div className="flex gap-2 shrink-0">
                            <button
                              onClick={() => handleToggleClassStatus(cls._id!, cls.status)}
                              className={`px-2.5 py-1 text-[10px] font-black rounded-lg border transition-all ${cls.status === "CANCELLED" ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500 hover:bg-emerald-500/20" : "bg-red-500/10 border-red-500/20 text-red-500 hover:bg-red-500/20"}`}
                            >
                              {cls.status === "CANCELLED" ? "Activate" : "Cancel Class"}
                            </button>
                            <button
                              onClick={() => handleDeleteClass(cls._id!)}
                              className="p-1 text-muted hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors border border-transparent hover:border-red-500/20"
                            >
                              <Trash className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-12 bg-surface-hover border border-border border-dashed rounded-2xl">
                        <p className="text-xs text-muted font-semibold">No active classes scheduled. Click the left form to make one.</p>
                      </div>
                    )}
                  </div>
                </div>

              </div>
            )}

            {/* TAB 2: TRAINER REASSIGNMENT REQUESTS */}
            {adminTab === "requests" && (
              <div className="flex flex-col gap-4">
                <h3 className="font-extrabold text-sm flex items-center gap-2">
                  <UserPlus className="h-4 w-4 text-primary" />
                  Trainer Reassignment Applications
                </h3>

                <div className="space-y-3.5 max-h-[400px] overflow-y-auto pr-1">
                  {trainerRequests.length > 0 ? (
                    trainerRequests.map((req) => (
                      <div
                        key={req._id}
                        className={`p-5 rounded-2xl border flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-all ${req.status === "PENDING" ? "bg-surface-hover border-primary/20 hover:border-primary/40 shadow-sm" : "bg-surface-hover/50 border-border opacity-75"}`}
                      >
                        <div className="space-y-2">
                          <div className="flex flex-wrap items-center gap-3">
                            <h4 className="font-extrabold text-sm">{req.memberId?.fullName || "Gym Member"}</h4>
                            <span className="text-xs text-muted font-bold">ID: {req.memberId?.memberId || "MEMBER"}</span>

                            {/* Request Status Badge */}
                            <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase border ${req.status === "APPROVED" ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" :
                              req.status === "REJECTED" ? "bg-rose-500/10 text-rose-500 border-rose-500/20" :
                                "bg-amber-500/10 text-amber-500 border-amber-500/20 animate-pulse"
                              }`}>
                              {req.status}
                            </span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-1 gap-x-6 text-xs text-muted font-semibold">
                            <p>Current Coach: <strong className="text-foreground">{req.currentTrainerId?.fullName || "Unassigned"}</strong></p>
                            <p>Requested Coach: <strong className="text-primary font-bold">{req.requestedTrainerId?.fullName || "Select Coach"}</strong> <span className="text-[10px] text-muted italic">({req.requestedTrainerId?.specialization})</span></p>
                          </div>

                          <div className="p-3 bg-surface border border-border rounded-xl text-xs text-foreground font-medium max-w-xl">
                            <span className="text-[10px] font-bold text-muted uppercase block mb-1">Reason for Switch:</span>
                            "{req.reason || "No detail provided"}"
                          </div>
                        </div>

                        {req.status === "PENDING" && (
                          <div className="flex gap-2 shrink-0 self-end md:self-center w-full md:w-auto">
                            <button
                              onClick={() => handleResolveTrainerRequest(req._id, "APPROVED")}
                              className="flex-1 md:flex-none px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-black rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5"
                            >
                              <Check className="h-4 w-4" />
                              Approve
                            </button>
                            <button
                              onClick={() => handleResolveTrainerRequest(req._id, "REJECTED")}
                              className="flex-1 md:flex-none px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white text-xs font-black rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5"
                            >
                              <X className="h-4 w-4" />
                              Reject
                            </button>
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12 bg-surface-hover border border-border border-dashed rounded-2xl">
                      <p className="text-xs text-muted font-semibold">No trainer change applications found.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 3: STAFF ROSTER MANAGEMENT */}
            {adminTab === "trainers" && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Onboard Trainer Form */}
                <div className="p-5 rounded-2xl bg-surface-hover border border-border flex flex-col gap-4">
                  <h3 className="font-extrabold text-sm flex items-center gap-2">
                    <UserPlus className="h-4 w-4 text-primary" />
                    Onboard Staff Coach
                  </h3>
                  <form onSubmit={handleCreateTrainer} className="space-y-4">
                    <div>
                      <label className="text-[10px] font-bold text-muted uppercase block mb-1">Full Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Coach Serena Winters"
                        value={newTrainer.fullName}
                        onChange={(e) => setNewTrainer({ ...newTrainer, fullName: e.target.value })}
                        className="w-full bg-surface border border-border rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:outline-none focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-muted uppercase block mb-1">Professional Email</label>
                      <input
                        type="email"
                        placeholder="e.g. serena@fitcore.com"
                        value={newTrainer.email}
                        onChange={(e) => setNewTrainer({ ...newTrainer, email: e.target.value })}
                        className="w-full bg-surface border border-border rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:outline-none focus:border-primary"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] font-bold text-muted uppercase block mb-1">Phone</label>
                        <input
                          type="text"
                          placeholder="e.g. 555-0199"
                          value={newTrainer.phone}
                          onChange={(e) => setNewTrainer({ ...newTrainer, phone: e.target.value })}
                          className="w-full bg-surface border border-border rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:outline-none focus:border-primary"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-muted uppercase block mb-1">Specialization</label>
                        <input
                          type="text"
                          placeholder="e.g. Yoga, HIIT, Strength"
                          value={newTrainer.specialization}
                          onChange={(e) => setNewTrainer({ ...newTrainer, specialization: e.target.value })}
                          className="w-full bg-surface border border-border rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:outline-none focus:border-primary"
                        />
                      </div>
                    </div>
                    <button
                      type="submit"
                      className="w-full py-2.5 bg-primary hover:bg-primary-hover text-white text-xs font-black rounded-xl transition-all shadow-sm flex items-center justify-center gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Register Coach
                    </button>
                  </form>
                </div>

                {/* Trainer Cards Grid */}
                <div className="lg:col-span-2 flex flex-col gap-4">
                  <h3 className="font-extrabold text-sm flex items-center gap-2">
                    <Users className="h-4 w-4 text-primary" />
                    Onboarded Professional Roster
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 overflow-y-auto max-h-[380px] pr-1">
                    {trainers.length > 0 ? (
                      trainers.map((t) => (
                        <div
                          key={t._id}
                          className="p-5 rounded-2xl bg-surface-hover border border-border hover:border-primary/20 flex flex-col justify-between gap-4 transition-all hover:-translate-y-1 shadow-sm"
                        >
                          <div className="space-y-3">
                            <div className="flex justify-between items-start gap-2">
                              <div>
                                <h4 className="font-extrabold text-sm">{t.fullName}</h4>
                                <span className="inline-block mt-0.5 px-2 py-0.5 rounded-full text-[9px] font-black bg-primary/10 text-primary border border-primary/20 uppercase">
                                  {t.specialization}
                                </span>
                              </div>
                              <button
                                onClick={() => handleDeleteTrainer(t._id)}
                                className="p-1 text-muted hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors border border-transparent hover:border-red-500/20"
                              >
                                <Trash className="h-4 w-4" />
                              </button>
                            </div>

                            <div className="space-y-1.5 text-xs font-semibold text-muted">
                              <p className="flex items-center gap-2 text-[11px] truncate">
                                <Mail className="h-3.5 w-3.5 text-primary" />
                                {t.email}
                              </p>
                              <p className="flex items-center gap-2 text-[11px]">
                                <Phone className="h-3.5 w-3.5 text-primary" />
                                {t.phone || "No phone"}
                              </p>
                            </div>
                          </div>

                          <div className="pt-3 border-t border-border flex justify-between items-center text-[10px] font-black uppercase text-muted">
                            <span>Clients assigned</span>
                            <span className="px-2 py-0.5 bg-accent/10 border border-accent/20 text-accent rounded-full text-xs font-extrabold">
                              {t.assignedMembers?.length || 0} members
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="col-span-2 text-center py-12 bg-surface-hover border border-border border-dashed rounded-2xl">
                        <p className="text-xs text-muted font-semibold">No trainer staff registered yet.</p>
                      </div>
                    )}
                  </div>
                </div>

              </div>
            )}

            {/* TAB 4: DISPATCH ANNOUNCEMENTS */}
            {adminTab === "broadcast" && (
              <div className="max-w-2xl mx-auto p-6 rounded-2xl bg-surface-hover border border-border flex flex-col gap-6">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                    <Megaphone className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base">Send Broadcast Announcement</h3>
                    <p className="text-xs text-muted font-medium">Publish live messages to all gym members' dashboards instantly.</p>
                  </div>
                </div>

                {broadcastSuccess && (
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-bold rounded-xl flex items-center gap-2">
                    <Check className="h-4 w-4 animate-bounce" />
                    <span>{broadcastSuccess}</span>
                  </div>
                )}

                <form onSubmit={handleSendBroadcast} className="space-y-4">
                  <div>
                    <label className="text-[10px] font-bold text-muted uppercase block mb-1">Announcement Message</label>
                    <textarea
                      rows={4}
                      placeholder="Type important updates here (e.g. holiday hours, gym maintenance, trainer changes, class cancellations...)"
                      value={announcementMsg}
                      onChange={(e) => setAnnouncementMsg(e.target.value)}
                      className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-xs font-semibold focus:outline-none focus:border-primary resize-none placeholder:text-muted"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={!announcementMsg.trim()}
                    className="w-full py-3 bg-primary hover:bg-primary-hover disabled:opacity-50 text-white text-xs font-black rounded-xl transition-all shadow-sm flex items-center justify-center gap-2"
                  >
                    <Send className="h-4 w-4" />
                    Broadcast Announcement
                  </button>
                </form>
              </div>
            )}

          </div>
        </motion.div>
      )}

    </div>
  );
};
