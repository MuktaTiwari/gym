import React from "react";
import { useAuthStore } from "../../store/authStore";
import { motion } from "framer-motion";
import {
  Users,
  Activity,
  Calendar,
  DollarSign,
  TrendingUp,
  Award,
  Zap,
  ArrowUpRight,
  Plus,
  Dumbbell
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
  const { user } = useAuthStore();
  const isOwner = user?.role === "GYM_OWNER";
  const isAdmin = user?.role === "GYM_ADMIN";
  const isTrainer = user?.role === "TRAINER";
  const isMember = user?.role === "MEMBER";

  // Dummy mock data for premium UI
  const stats = [
    {
      label: "Total Members",
      value: "1,248",
      change: "+12.4% this month",
      icon: Users,
      color: "text-primary bg-primary/10 border-primary/20",
      roles: ["GYM_OWNER", "GYM_ADMIN"]
    },
    {
      label: "Active Subscriptions",
      value: "1,104",
      change: "92% active rate",
      icon: Award,
      color: "text-accent bg-accent/10 border-accent/20",
      roles: ["GYM_OWNER", "GYM_ADMIN"]
    },
    {
      label: "Today's Attendance",
      value: "184",
      change: "84% avg daily rate",
      icon: Activity,
      color: "text-indigo-500 bg-indigo-500/10 border-indigo-500/20",
      roles: ["GYM_OWNER", "GYM_ADMIN", "TRAINER"]
    },
    {
      label: "Monthly Revenue",
      value: "$14,820",
      change: "+8.2% from last month",
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
    },
    // Member stats
    {
      label: "Days Attended",
      value: "18",
      change: "Active streak: 5 days",
      icon: Zap,
      color: "text-amber-500 bg-amber-500/10 border-amber-500/20",
      roles: ["MEMBER"]
    },
    {
      label: "Next Booking",
      value: "Yoga (6:00 PM)",
      change: "Instructor: Sarah Connor",
      icon: Calendar,
      color: "text-primary bg-primary/10 border-primary/20",
      roles: ["MEMBER"]
    }
  ];

  const recentActivities = [
    { name: "John Doe", type: "Check-in", time: "5 mins ago", plan: "Annual Plan" },
    { name: "Sarah Miller", type: "New Member Signup", time: "18 mins ago", plan: "Monthly Plan" },
    { name: "Michael Chang", type: "Payment Received", time: "1 hr ago", plan: "$99.00 Comp." },
    { name: "Jessica Taylor", type: "Booking Yoga Class", time: "2 hrs ago", plan: "Sarah C. at 6PM" },
  ];

  const revenueChartData = [45, 62, 53, 78, 88, 94, 110]; // last 7 months relative scale

  // Filter stats by user role
  const visibleStats = stats.filter(stat => stat.roles.includes(user?.role || ""));

  return (
    <div className="flex flex-col gap-8">
      {/* Top Banner Greeting */}
      <motion.div
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
            {isMember && "Track your workout consistency, book new classes, and stay on top of your subscriptions."}
          </p>
        </div>
      </motion.div>

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
                    data={[
                      { month: "Jun 25", revenue: 8400, activeMembers: 780 },
                      { month: "Jul 25", revenue: 9200, activeMembers: 840 },
                      { month: "Aug 25", revenue: 9900, activeMembers: 890 },
                      { month: "Sep 25", revenue: 10400, activeMembers: 930 },
                      { month: "Oct 25", revenue: 11100, activeMembers: 970 },
                      { month: "Nov 25", revenue: 11800, activeMembers: 1010 },
                      { month: "Dec 25", revenue: 12500, activeMembers: 1040 },
                      { month: "Jan 26", revenue: 12900, activeMembers: 1070 },
                      { month: "Feb 26", revenue: 13400, activeMembers: 1100 },
                      { month: "Mar 26", revenue: 14100, activeMembers: 1150 },
                      { month: "Apr 26", revenue: 14500, activeMembers: 1200 },
                      { month: "May 26", revenue: 14820, activeMembers: 1248 },
                    ]}
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
              className="p-5 rounded-2xl bg-gradient-primary text-white flex flex-col justify-between h-36 cursor-pointer shadow-md"
            >
              <Plus className="h-6 w-6" />
              <div>
                <h4 className="font-extrabold text-base">New Entry</h4>
                <p className="text-xs text-white/80 mt-1 font-medium">Register a newcomer</p>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.01 }}
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
          className="p-6 rounded-2xl bg-surface border border-border flex flex-col gap-6 shadow-sm"
        >
          <div>
            <h3 className="font-extrabold text-lg">Realtime Check-ins</h3>
            <p className="text-xs text-muted font-medium">Live logs for today's visits</p>
          </div>

          <div className="flex flex-col gap-4">
            {recentActivities.map((act, idx) => (
              <div key={idx} className="flex justify-between items-center p-3 rounded-xl hover:bg-surface-hover transition-colors border border-transparent hover:border-border">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                    {act.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold text-xs">{act.name}</h4>
                    <p className="text-[10px] text-muted font-semibold mt-0.5">{act.plan}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-accent/10 text-accent border border-accent/10 uppercase">
                    {act.type}
                  </span>
                  <p className="text-[9px] text-muted mt-1 font-semibold">{act.time}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};
