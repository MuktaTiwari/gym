import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  CheckCircle,
  Clock,
  Search,
  User,
  Plus,
  TrendingUp,
  AlertTriangle,
  LogOut,
  UserCheck
} from "lucide-react";

// Types & Enums matching attendanceStatus.enum
interface AttendanceRecord {
  id: string;
  memberId: string;
  name: string;
  status: "PRESENT" | "ABSENT" | "LATE" | "EXCUSED";
  checkInTime: string;
  checkOutTime?: string;
  avatar?: string;
}

const MOCK_MEMBERS_SUGGESTION = [
  { id: "MEM-001", name: "Dwayne Johnson", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150" },
  { id: "MEM-002", name: "Sarah Connor", avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150" },
  { id: "MEM-003", name: "Bruce Wayne", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150" },
  { id: "MEM-004", name: "Peter Parker", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150" },
  { id: "MEM-005", name: "Diana Prince", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150" },
];

const INITIAL_LOGS: AttendanceRecord[] = [
  {
    id: "ATT-101",
    memberId: "MEM-001",
    name: "Dwayne Johnson",
    status: "PRESENT",
    checkInTime: "06:15 AM",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
  },
  {
    id: "ATT-102",
    memberId: "MEM-002",
    name: "Sarah Connor",
    status: "PRESENT",
    checkInTime: "07:30 AM",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150",
  },
  {
    id: "ATT-103",
    memberId: "MEM-003",
    name: "Bruce Wayne",
    status: "LATE",
    checkInTime: "09:45 AM",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
  },
  {
    id: "ATT-104",
    memberId: "MEM-005",
    name: "Diana Prince",
    status: "PRESENT",
    checkInTime: "08:00 AM",
    checkOutTime: "10:15 AM",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
  }
];

export const AttendancePage: React.FC = () => {
  const [logs, setLogs] = useState<AttendanceRecord[]>(INITIAL_LOGS);
  const [search, setSearch] = useState("");
  const [selectedMember, setSelectedMember] = useState<typeof MOCK_MEMBERS_SUGGESTION[0] | null>(null);
  const [checkInStatus, setCheckInStatus] = useState<"PRESENT" | "LATE">("PRESENT");

  // Filtering suggestions
  const suggestions = MOCK_MEMBERS_SUGGESTION.filter(
    (m) =>
      m.name.toLowerCase().includes(search.toLowerCase()) &&
      !logs.some((l) => l.memberId === m.id && !l.checkOutTime)
  );

  const handleQuickCheckIn = () => {
    if (!selectedMember) return;

    const formatTime = (date: Date) => {
      let hours = date.getHours();
      const minutes = date.getMinutes();
      const ampm = hours >= 12 ? "PM" : "AM";
      hours = hours % 12;
      hours = hours ? hours : 12; // structural 12 AM/PM
      const minStr = minutes < 10 ? "0" + minutes : minutes;
      return `${hours}:${minStr} ${ampm}`;
    };

    const newRecord: AttendanceRecord = {
      id: `ATT-${Math.floor(100 + Math.random() * 900)}`,
      memberId: selectedMember.id,
      name: selectedMember.name,
      status: checkInStatus,
      checkInTime: formatTime(new Date()),
      avatar: selectedMember.avatar,
    };

    setLogs([newRecord, ...logs]);
    setSelectedMember(null);
    setSearch("");
  };

  const handleCheckOut = (recordId: string) => {
    const formatTime = (date: Date) => {
      let hours = date.getHours();
      const minutes = date.getMinutes();
      const ampm = hours >= 12 ? "PM" : "AM";
      hours = hours % 12;
      hours = hours ? hours : 12;
      const minStr = minutes < 10 ? "0" + minutes : minutes;
      return `${hours}:${minStr} ${ampm}`;
    };

    setLogs(
      logs.map((l) =>
        l.id === recordId ? { ...l, checkOutTime: formatTime(new Date()) } : l
      )
    );
  };

  // Stats calculation
  const totalPresentCount = logs.filter((l) => !l.checkOutTime).length;
  const lateCount = logs.filter((l) => l.status === "LATE").length;
  const attendanceRate = Math.round(
    ((logs.filter((l) => l.status === "PRESENT").length + lateCount) /
      MOCK_MEMBERS_SUGGESTION.length) *
      100
  );

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h2 className="text-3xl font-extrabold tracking-tight font-sans">Front-Desk Check-In</h2>
        <p className="text-muted text-sm mt-1">
          Monitor real-time access gates, mark trainer log times, and analyze peak attendance intervals.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-surface border border-border p-5 rounded-2xl flex items-center justify-between shadow-sm">
          <div>
            <span className="text-[10px] font-bold text-muted block uppercase tracking-wider">Gym Capacity Active</span>
            <h3 className="text-2xl font-extrabold mt-1 text-foreground">{totalPresentCount} in gym</h3>
            <span className="text-xs text-emerald-500 font-bold flex items-center gap-1 mt-2">
              <TrendingUp className="h-3.5 w-3.5" /> High volume zone
            </span>
          </div>
          <div className="h-11 w-11 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center justify-center">
            <UserCheck className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-surface border border-border p-5 rounded-2xl flex items-center justify-between shadow-sm">
          <div>
            <span className="text-[10px] font-bold text-muted block uppercase tracking-wider">Daily Late Arrivals</span>
            <h3 className="text-2xl font-extrabold mt-1 text-foreground">{lateCount} count</h3>
            <span className="text-xs text-muted font-bold flex items-center gap-1 mt-2">
              Grace duration elapsed
            </span>
          </div>
          <div className="h-11 w-11 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center justify-center">
            <Clock className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-surface border border-border p-5 rounded-2xl flex items-center justify-between shadow-sm">
          <div>
            <span className="text-[10px] font-bold text-muted block uppercase tracking-wider">Attendance Rate</span>
            <h3 className="text-2xl font-extrabold mt-1 text-foreground">{attendanceRate}% ratio</h3>
            <span className="text-xs text-muted font-bold flex items-center gap-1 mt-2">
              Active member base ratio
            </span>
          </div>
          <div className="h-11 w-11 rounded-xl bg-surface-hover border border-border flex items-center justify-center">
            <Calendar className="h-5 w-5 text-muted" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Quick Check-in panel */}
        <div className="bg-surface border border-border p-5 rounded-2xl shadow-sm space-y-4">
          <h3 className="text-lg font-extrabold tracking-tight">Front-Desk Gate Check-In</h3>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
            <input
              type="text"
              placeholder="Search active member name..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                if (selectedMember && selectedMember.name !== e.target.value) {
                  setSelectedMember(null);
                }
              }}
              className="w-full bg-background border border-border rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:border-primary transition-all duration-200"
            />

            {/* Suggestions list */}
            {search && suggestions.length > 0 && !selectedMember && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-surface border border-border rounded-xl shadow-xl max-h-48 overflow-y-auto z-10 divide-y divide-border">
                {suggestions.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => {
                      setSelectedMember(m);
                      setSearch(m.name);
                    }}
                    className="w-full text-left px-4 py-2.5 hover:bg-surface-hover transition-colors flex items-center gap-3 text-xs font-bold"
                  >
                    <div className="h-6 w-6 rounded-full overflow-hidden bg-background">
                      {m.avatar ? <img src={m.avatar} className="h-full w-full object-cover" /> : <User className="h-3 w-3 text-muted" />}
                    </div>
                    <span>{m.name}</span>
                    <span className="text-[10px] text-muted font-normal ml-auto">{m.id}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => setCheckInStatus("PRESENT")}
              className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${
                checkInStatus === "PRESENT"
                  ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/30"
                  : "bg-background text-muted border-border hover:bg-surface-hover"
              }`}
            >
              On-Time (Present)
            </button>
            <button
              onClick={() => setCheckInStatus("LATE")}
              className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${
                checkInStatus === "LATE"
                  ? "bg-amber-500/10 text-amber-500 border-amber-500/30"
                  : "bg-background text-muted border-border hover:bg-surface-hover"
              }`}
            >
              Late Arrival
            </button>
          </div>

          <button
            onClick={handleQuickCheckIn}
            disabled={!selectedMember}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm text-white bg-gradient-primary hover:opacity-95 disabled:opacity-40 transition-all shadow-md shadow-primary/10"
          >
            <Plus className="h-4 w-4" />
            <span>Approve Gate Check-In</span>
          </button>
        </div>

        {/* Live log ledger table */}
        <div className="lg:col-span-2 bg-surface border border-border rounded-2xl shadow-sm overflow-hidden">
          <div className="p-5 border-b border-border flex items-center justify-between bg-surface-hover/10">
            <h3 className="font-extrabold text-base">Gate Attendance Roster</h3>
            <span className="text-[10px] font-bold bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded-full uppercase">
              Live Feed
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border bg-surface-hover/30 text-xs font-bold text-muted uppercase tracking-wider">
                  <th className="px-6 py-4">Member Name</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Check-In</th>
                  <th className="px-6 py-4">Check-Out</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-sm font-medium">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-surface-hover/20 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full overflow-hidden bg-background shrink-0">
                          {log.avatar ? <img src={log.avatar} className="h-full w-full object-cover" /> : <User className="h-4 w-4 text-muted" />}
                        </div>
                        <h4 className="font-extrabold text-foreground">{log.name}</h4>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase ${
                          log.status === "PRESENT"
                            ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                            : "bg-amber-500/10 text-amber-500 border-amber-500/20"
                        }`}
                      >
                        {log.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-muted text-xs font-mono">{log.checkInTime}</td>
                    <td className="px-6 py-4 text-muted text-xs font-mono">
                      {log.checkOutTime ? (
                        log.checkOutTime
                      ) : (
                        <span className="text-amber-500 font-bold text-[10px] uppercase">Inside Gym</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {!log.checkOutTime ? (
                        <button
                          onClick={() => handleCheckOut(log.id)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 hover:bg-destructive/10 text-muted hover:text-destructive border border-transparent hover:border-destructive/20 rounded-xl text-xs font-bold transition-all duration-200"
                        >
                          <LogOut className="h-3.5 w-3.5" />
                          <span>Check Out</span>
                        </button>
                      ) : (
                        <span className="text-xs text-muted font-bold">Logged Out</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
