import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import {
  Activity,
  AlertCircle,
  ArrowLeft,
  CalendarCheck, CheckCircle2,
  Clock,
  CreditCard,
  DollarSign,
  Edit2,
  FileText,
  Mail,
  Phone,
  Send,
  User
} from "lucide-react";
import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { axiosInstance } from "../../lib/axios";

type TabType = "overview" | "payments" | "bookings" | "attendance" | "notes";

export const MemberProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [noteContent, setNoteContent] = useState("");
  const [isSubmittingNote, setIsSubmittingNote] = useState(false);

  // Fetch Member
  const { data: memberData, isLoading: isLoadingMember } = useQuery({
    queryKey: ["member", id],
    queryFn: async () => {
      const response = await axiosInstance.get(`/members/${id}`);
      return response.data.data;
    },
    enabled: !!id,
  });
  const member = memberData || null;

  // Fetch payments
  const { data: payments = [], isLoading: isLoadingPayments } = useQuery({
    queryKey: ["memberPayments", id],
    queryFn: async () => {
      const response = await axiosInstance.get(`/members/${id}/payments`);
      return response.data.data || [];
    },
    enabled: !!id,
  });

  // Fetch bookings
  const { data: bookings = [], isLoading: isLoadingBookings } = useQuery({
    queryKey: ["memberBookings", id],
    queryFn: async () => {
      const response = await axiosInstance.get(`/members/${id}/bookings`);
      return response.data.data || [];
    },
    enabled: !!id,
  });

  // Fetch attendance
  const { data: attendanceList = [], isLoading: isLoadingAttendance } = useQuery({
    queryKey: ["memberAttendance", id],
    queryFn: async () => {
      const response = await axiosInstance.get(`/members/${id}/attendance`);
      return response.data.data || [];
    },
    enabled: !!id,
  });

  if (isLoadingMember) {
    return (
      <div className="flex justify-center items-center h-full min-h-[500px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!member) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-black mb-4">Member not found</h2>
        <Button onClick={() => navigate("/dashboard/members")}>Back to Directory</Button>
      </div>
    );
  }

  const name = member.fullName || member.name || "Unknown Member";
  const role = member.role || "MEMBER";
  const email = member.email || "No Email";
  const phone = member.phone || "N/A";
  const joinDate = member.membershipStartDate || member.joinDate || member.createdAt;
  const status = member.status || member.memberProfile?.status || "ACTIVE";
  const age = member.age || member.memberProfile?.age;
  const gender = member.gender || member.memberProfile?.gender;
  const weight = member.weight || member.memberProfile?.weight;
  const height = member.height || member.memberProfile?.height;
  const emergencyContact = member.emergencyContact || member.memberProfile?.emergencyContact;
  const plan = member.planId || member.memberProfile?.planId;
  const notesList = member.notes || [];

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteContent.trim()) return;

    setIsSubmittingNote(true);
    try {
      await axiosInstance.post(`/members/${member._id}/notes`, {
        note: noteContent.trim()
      });
      setNoteContent("");
      queryClient.invalidateQueries({ queryKey: ["member", id] });
    } catch (err) {
      console.error("Failed to add note", err);
      alert("Failed to add private note");
    } finally {
      setIsSubmittingNote(false);
    }
  };

  const totalAttendance = attendanceList.length;
  const presentCount = attendanceList.filter((a: any) => a.status === "PRESENT").length;
  const lateCount = attendanceList.filter((a: any) => a.status === "LATE").length;
  const absentCount = attendanceList.filter((a: any) => a.status === "ABSENT").length;
  const attendanceRate = totalAttendance > 0 ? Math.round(((presentCount + lateCount) / totalAttendance) * 100) : 0;

  const totalPaid = payments
    .filter((p: any) => p.status === "COMPLETED")
    .reduce((sum: number, p: any) => sum + p.amount, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-7xl mx-auto space-y-8"
    >
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/dashboard/members")}
          className="h-10 w-10 rounded-full border border-border bg-surface hover:bg-surface-hover"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-2xl bg-gradient-primary flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-primary/20">
              {name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tight text-foreground flex items-center gap-3">
                {name}
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/20 capitalize tracking-wider">
                  {status}
                </span>
              </h1>
              <div className="flex items-center gap-4 mt-1.5 text-sm font-semibold text-muted">
                <span className="flex items-center gap-1.5"><Mail className="h-4 w-4" /> {email}</span>
                {phone !== "N/A" && <span className="flex items-center gap-1.5"><Phone className="h-4 w-4" /> {phone}</span>}
              </div>
            </div>
          </div>
          <Button variant="outline" className="gap-2 font-bold hidden sm:flex" onClick={() => navigate(`/dashboard/members/${id}/edit`)}>
            <Edit2 className="h-4 w-4" /> Edit Profile
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">

        {/* Left Sidebar Menu */}
        <div className="xl:col-span-1">
          <Card className="border-border/50 shadow-sm overflow-hidden sticky top-24">
            <div className="flex flex-col p-2 space-y-1">
              {(["overview", "payments", "bookings", "attendance", "notes"] as TabType[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold capitalize transition-all ${activeTab === tab
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                    : "text-muted hover:bg-surface-hover hover:text-foreground"
                    }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </Card>
        </div>

        {/* Right Content Area */}
        <div className="xl:col-span-3">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === "overview" && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Physical Profile */}
                    <Card className="border-border/50 shadow-sm overflow-hidden">
                      <div className="px-6 py-4 border-b border-border/50 bg-surface-hover/30 flex items-center gap-2">
                        <Activity className="h-5 w-5 text-primary" />
                        <h3 className="font-bold text-foreground">Physical Attributes</h3>
                      </div>
                      <CardContent className="p-6 grid grid-cols-2 gap-6">
                        <div>
                          <p className="text-xs font-bold text-muted uppercase tracking-wider mb-1">Age</p>
                          <p className="text-2xl font-black text-foreground">{age ? `${age} yrs` : "-"}</p>
                        </div>
                        <div>
                          <p className="text-xs font-bold text-muted uppercase tracking-wider mb-1">Gender</p>
                          <p className="text-2xl font-black text-foreground capitalize">{gender || "-"}</p>
                        </div>
                        <div>
                          <p className="text-xs font-bold text-muted uppercase tracking-wider mb-1">Weight</p>
                          <p className="text-2xl font-black text-foreground">{weight ? `${weight} kg` : "-"}</p>
                        </div>
                        <div>
                          <p className="text-xs font-bold text-muted uppercase tracking-wider mb-1">Height</p>
                          <p className="text-2xl font-black text-foreground">{height ? `${height} cm` : "-"}</p>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Emergency Contact */}
                    <Card className="border-border/50 shadow-sm overflow-hidden">
                      <div className="px-6 py-4 border-b border-border/50 bg-surface-hover/30 flex items-center gap-2">
                        <Phone className="h-5 w-5 text-primary" />
                        <h3 className="font-bold text-foreground">Emergency Contact</h3>
                      </div>
                      <CardContent className="p-6 space-y-4">
                        {emergencyContact?.name ? (
                          <>
                            <div className="flex justify-between items-center pb-4 border-b border-border/50">
                              <span className="text-sm font-bold text-muted">Name</span>
                              <span className="text-sm font-black text-foreground">{emergencyContact.name}</span>
                            </div>
                            <div className="flex justify-between items-center pb-4 border-b border-border/50">
                              <span className="text-sm font-bold text-muted">Relationship</span>
                              <span className="text-sm font-black text-foreground capitalize">{emergencyContact.relation || "-"}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm font-bold text-muted">Phone</span>
                              <span className="text-sm font-black text-foreground">{emergencyContact.phone || "-"}</span>
                            </div>
                          </>
                        ) : (
                          <div className="text-center py-6">
                            <p className="text-sm font-semibold text-muted">No emergency contact registered.</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>

                  {/* Membership Info */}
                  <Card className="border-border/50 shadow-sm overflow-hidden bg-gradient-to-br from-primary/5 to-transparent">
                    <div className="px-6 py-4 border-b border-primary/10 flex items-center gap-2">
                      <CreditCard className="h-5 w-5 text-primary" />
                      <h3 className="font-bold text-foreground">Membership Details</h3>
                    </div>
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div>
                          <p className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Active Plan</p>
                          <p className="text-2xl font-black text-foreground mb-2">{plan?.name || "No Plan Tier Assigned"}</p>
                          <div className="flex gap-4 text-sm font-semibold text-muted">
                            {plan && <span>${plan.price}</span>}
                            {plan && <span>• {plan.durationInMonths} Month(s)</span>}
                            <span>• Joined {new Date(joinDate).toLocaleDateString()}</span>
                          </div>
                        </div>
                        {member.membershipEndDate && (
                          <div className="bg-surface border border-border/50 rounded-2xl p-4 text-center min-w-[160px]">
                            <p className="text-xs font-bold text-muted uppercase tracking-wider mb-1">Renews On</p>
                            <p className="text-lg font-black text-foreground">
                              {new Date(member.membershipEndDate).toLocaleDateString()}
                            </p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {activeTab === "payments" && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="md:col-span-1 border-border/50 shadow-sm overflow-hidden flex flex-col justify-center items-center p-8 text-center bg-surface-hover/30">
                      <DollarSign className="h-10 w-10 text-primary mb-3" />
                      <p className="text-sm font-bold text-muted uppercase tracking-wider mb-1">Total Lifetime Value</p>
                      <p className="text-4xl font-black text-foreground">${totalPaid.toFixed(2)}</p>
                    </Card>
                    <Card className="md:col-span-2 border-border/50 shadow-sm overflow-hidden">
                      <div className="px-6 py-4 border-b border-border/50 bg-surface-hover/30 flex items-center justify-between">
                        <h3 className="font-bold text-foreground">Payment History</h3>
                      </div>
                      <CardContent className="p-0">
                        {isLoadingPayments ? (
                          <div className="p-8 text-center text-sm font-semibold text-muted">Loading payments...</div>
                        ) : payments.length === 0 ? (
                          <div className="p-8 text-center text-sm font-semibold text-muted">No transactions found.</div>
                        ) : (
                          <div className="divide-y divide-border/50">
                            {payments.map((p: any) => (
                              <div key={p._id} className="p-4 px-6 flex justify-between items-center hover:bg-surface-hover/50 transition-colors">
                                <div>
                                  <p className="font-bold text-foreground">{p.planName || "Plan Payment"}</p>
                                  <p className="text-xs font-semibold text-muted mt-1 uppercase">
                                    {new Date(p.date || p.createdAt).toLocaleDateString()} • {p.method}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <p className="font-black text-foreground">${p.amount}</p>
                                  <span className={`inline-block mt-1 px-2 py-0.5 rounded-md text-[10px] font-bold border ${p.status === "COMPLETED" ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" :
                                    p.status === "FAILED" ? "bg-destructive/10 text-destructive border-destructive/20" :
                                      "bg-amber-500/10 text-amber-500 border-amber-500/20"
                                    }`}>
                                    {p.status}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}

              {activeTab === "attendance" && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="border-border/50 shadow-sm overflow-hidden flex flex-col justify-center items-center p-6 text-center">
                      <p className="text-4xl font-black text-foreground mb-1">{attendanceRate}%</p>
                      <p className="text-xs font-bold text-muted uppercase tracking-wider mb-4">Attendance Rate</p>
                      <div className="w-full bg-border rounded-full h-2 overflow-hidden">
                        <div className="bg-primary h-full rounded-full transition-all duration-500" style={{ width: `${attendanceRate}%` }} />
                      </div>
                    </Card>
                    <Card className="border-border/50 shadow-sm overflow-hidden flex flex-col justify-center items-center p-6 text-center">
                      <p className="text-4xl font-black text-foreground mb-1">{totalAttendance}</p>
                      <p className="text-xs font-bold text-muted uppercase tracking-wider">Total Check-ins</p>
                    </Card>
                    <Card className="border-border/50 shadow-sm overflow-hidden p-4 grid grid-cols-1 divide-y divide-border/50">
                      <div className="flex justify-between items-center py-2">
                        <span className="text-xs font-bold text-muted uppercase">Present</span>
                        <span className="font-black text-emerald-500">{presentCount}</span>
                      </div>
                      <div className="flex justify-between items-center py-2">
                        <span className="text-xs font-bold text-muted uppercase">Late</span>
                        <span className="font-black text-amber-500">{lateCount}</span>
                      </div>
                      <div className="flex justify-between items-center py-2">
                        <span className="text-xs font-bold text-muted uppercase">Absent</span>
                        <span className="font-black text-destructive">{absentCount}</span>
                      </div>
                    </Card>
                  </div>

                  <Card className="border-border/50 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-border/50 bg-surface-hover/30">
                      <h3 className="font-bold text-foreground">Attendance Log</h3>
                    </div>
                    <CardContent className="p-0">
                      {isLoadingAttendance ? (
                        <div className="p-8 text-center text-sm font-semibold text-muted">Loading logs...</div>
                      ) : attendanceList.length === 0 ? (
                        <div className="p-8 text-center text-sm font-semibold text-muted">No attendance records found.</div>
                      ) : (
                        <div className="divide-y divide-border/50 max-h-[400px] overflow-y-auto">
                          {attendanceList.map((a: any) => (
                            <div key={a._id} className="p-4 px-6 flex justify-between items-center">
                              <div className="flex items-center gap-3">
                                <Clock className="h-5 w-5 text-muted" />
                                <span className="font-bold text-sm text-foreground">
                                  {new Date(a.date).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric", year: "numeric" })}
                                </span>
                              </div>
                              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-[11px] font-bold border ${a.status === "PRESENT" ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" :
                                a.status === "LATE" ? "bg-amber-500/10 text-amber-500 border-amber-500/20" :
                                  "bg-destructive/10 text-destructive border-destructive/20"
                                }`}>
                                {a.status === "PRESENT" ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
                                {a.status}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              )}

              {activeTab === "bookings" && (
                <Card className="border-border/50 shadow-sm overflow-hidden">
                  <div className="px-6 py-4 border-b border-border/50 bg-surface-hover/30">
                    <h3 className="font-bold text-foreground">Class Bookings</h3>
                  </div>
                  <CardContent className="p-0">
                    {isLoadingBookings ? (
                      <div className="p-8 text-center text-sm font-semibold text-muted">Loading bookings...</div>
                    ) : bookings.length === 0 ? (
                      <div className="p-8 text-center text-sm font-semibold text-muted">No classes booked.</div>
                    ) : (
                      <div className="divide-y divide-border/50">
                        {bookings.map((b: any) => (
                          <div key={b._id} className="p-4 px-6 flex justify-between items-center hover:bg-surface-hover/50 transition-colors">
                            <div>
                              <p className="font-bold text-foreground flex items-center gap-2">
                                <CalendarCheck className="h-4 w-4 text-primary" /> {b.className}
                              </p>
                              <p className="text-xs font-semibold text-muted mt-1 uppercase">
                                {new Date(b.date).toLocaleDateString()} @ {b.time} • Trainer: {b.trainerName}
                              </p>
                            </div>
                            <span className={`inline-block px-3 py-1 rounded-md text-[11px] font-bold border ${b.status === "ATTENDED" ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" :
                              b.status === "CANCELLED" ? "bg-destructive/10 text-destructive border-destructive/20" :
                                "bg-primary/10 text-primary border-primary/20"
                              }`}>
                              {b.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {activeTab === "notes" && (
                <div className="space-y-6">
                  <Card className="border-border/50 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-border/50 bg-surface-hover/30">
                      <h3 className="font-bold text-foreground">Add Private Note</h3>
                    </div>
                    <CardContent className="p-6">
                      <form onSubmit={handleAddNote} className="space-y-4">
                        <textarea
                          value={noteContent}
                          onChange={(e) => setNoteContent(e.target.value)}
                          placeholder="Type a private admin note about this athlete..."
                          rows={4}
                          className="w-full text-sm bg-surface-hover border-2 border-border/50 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none text-foreground font-semibold placeholder:text-muted/60"
                        />
                        <div className="flex justify-end">
                          <Button
                            type="submit"
                            disabled={isSubmittingNote || !noteContent.trim()}
                            className="font-bold gap-2 px-6"
                          >
                            <Send className="h-4 w-4" /> Save Note
                          </Button>
                        </div>
                      </form>
                    </CardContent>
                  </Card>

                  <Card className="border-border/50 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-border/50 bg-surface-hover/30 flex items-center justify-between">
                      <h3 className="font-bold text-foreground">Note History</h3>
                      <Badge variant="secondary">{notesList.length}</Badge>
                    </div>
                    <CardContent className="p-0">
                      {notesList.length === 0 ? (
                        <div className="p-12 text-center flex flex-col items-center">
                          <FileText className="h-12 w-12 text-muted/30 mb-3" />
                          <p className="text-sm font-semibold text-muted">No private notes recorded yet.</p>
                        </div>
                      ) : (
                        <div className="divide-y divide-border/50 max-h-[500px] overflow-y-auto p-6 space-y-6 bg-surface-hover/10">
                          {notesList.map((note: any, index: number) => (
                            <div key={index} className="bg-surface border border-border/50 rounded-2xl p-5 shadow-sm relative pt-4 mt-2">
                              <div className="flex justify-between items-center mb-3">
                                <span className="flex items-center gap-1.5 text-xs font-bold uppercase text-primary">
                                  <User className="h-3.5 w-3.5" /> {note.author || "Admin"}
                                </span>
                                <span className="text-[10px] font-bold text-muted uppercase">
                                  {new Date(note.createdAt).toLocaleString()}
                                </span>
                              </div>
                              <p className="text-sm font-medium text-foreground leading-relaxed whitespace-pre-wrap">{note.content}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};
