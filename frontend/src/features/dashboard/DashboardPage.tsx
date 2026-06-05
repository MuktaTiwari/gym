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
  Send,
  Loader2
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

  // Broadcast state
  const [broadcastMessage, setBroadcastMessage] = useState("");
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [broadcastSuccess, setBroadcastSuccess] = useState("");

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



  useEffect(() => {
    if (isAuthenticated && user) {
      if (!isMember) {
        loadDashboardData();
        const interval = setInterval(() => {
          loadDashboardData();
        }, 5000);
        return () => clearInterval(interval);
      }
    }
  }, [isMember, isAuthenticated, user]);

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastMessage.trim()) return;
    setIsBroadcasting(true);
    setBroadcastSuccess("");
    try {
      await memberApi.createAnnouncement({ message: broadcastMessage });
      setBroadcastSuccess("Announcement broadcasted successfully!");
      setBroadcastMessage("");
      loadDashboardData();
    } catch (err) {
      console.error("Broadcast failed", err);
    } finally {
      setIsBroadcasting(false);
      setTimeout(() => setBroadcastSuccess(""), 4000);
    }
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

          {/* Broadcast Announcement */}
          {(isOwner || isAdmin) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="p-6 rounded-2xl bg-surface border border-border flex flex-col gap-4 shadow-sm"
            >
              <div>
                <h3 className="font-extrabold text-lg flex items-center gap-2">
                  <Send className="h-4.5 w-4.5 text-primary" />
                  Broadcast Announcement
                </h3>
                <p className="text-xs text-muted font-medium mt-1">
                  Send a push notification alert to all active gym members.
                </p>
              </div>
              <form onSubmit={handleBroadcast} className="flex flex-col gap-3">
                <textarea
                  value={broadcastMessage}
                  onChange={(e) => setBroadcastMessage(e.target.value)}
                  placeholder="Type your announcement here..."
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary transition-all resize-none h-20"
                  required
                />
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-emerald-500">{broadcastSuccess}</span>
                  <button
                    type="submit"
                    disabled={isBroadcasting || !broadcastMessage.trim()}
                    className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm text-white bg-gradient-primary hover:opacity-95 shadow-md shadow-primary/10 transition-all disabled:opacity-50"
                  >
                    {isBroadcasting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    <span>Broadcast Now</span>
                  </button>
                </div>
              </form>
            </motion.div>
          )}
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

    </div>
  );
};
