import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, Calendar, Activity, CreditCard, Mail, Clock, Phone, User, 
  Heart, FileText, Send, DollarSign, CalendarCheck, CheckCircle2,
  AlertCircle, ShieldAlert
} from "lucide-react";
import { Button } from "../../components/ui/button";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "../../lib/axios";

interface MemberDrawerProps {
  member: any | null;
  isOpen: boolean;
  onClose: () => void;
}

type TabType = "overview" | "payments" | "bookings" | "attendance" | "notes";

export const MemberDrawer: React.FC<MemberDrawerProps> = ({ member, isOpen, onClose }) => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [noteContent, setNoteContent] = useState("");
  const [notesList, setNotesList] = useState<any[]>([]);
  const [isSubmittingNote, setIsSubmittingNote] = useState(false);

  // Sync notes when member changes
  useEffect(() => {
    if (member) {
      setNotesList(member.notes || []);
      setActiveTab("overview"); // Reset active tab when opening different member
    }
  }, [member]);

  // Fetch payments
  const { data: payments = [], isLoading: isLoadingPayments } = useQuery({
    queryKey: ["memberPayments", member?._id],
    queryFn: async () => {
      const response = await axiosInstance.get(`/members/${member._id}/payments`);
      return response.data.data || [];
    },
    enabled: isOpen && !!member?._id,
  });

  // Fetch bookings
  const { data: bookings = [], isLoading: isLoadingBookings } = useQuery({
    queryKey: ["memberBookings", member?._id],
    queryFn: async () => {
      const response = await axiosInstance.get(`/members/${member._id}/bookings`);
      return response.data.data || [];
    },
    enabled: isOpen && !!member?._id,
  });

  // Fetch attendance
  const { data: attendanceList = [], isLoading: isLoadingAttendance } = useQuery({
    queryKey: ["memberAttendance", member?._id],
    queryFn: async () => {
      const response = await axiosInstance.get(`/members/${member._id}/attendance`);
      return response.data.data || [];
    },
    enabled: isOpen && !!member?._id,
  });

  if (!member) return null;

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

  // Add a private note
  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteContent.trim()) return;

    setIsSubmittingNote(true);
    try {
      const response = await axiosInstance.post(`/members/${member._id}/notes`, {
        note: noteContent.trim()
      });
      setNotesList(response.data.data || []);
      setNoteContent("");
      // Refetch the full member list in background to keep data in sync
      queryClient.invalidateQueries({ queryKey: ["members"] });
    } catch (err) {
      console.error("Failed to add note", err);
      alert("Failed to add private note");
    } finally {
      setIsSubmittingNote(false);
    }
  };

  // Calculations for Attendance
  const totalAttendance = attendanceList.length;
  const presentCount = attendanceList.filter((a: any) => a.status === "PRESENT").length;
  const lateCount = attendanceList.filter((a: any) => a.status === "LATE").length;
  const absentCount = attendanceList.filter((a: any) => a.status === "ABSENT").length;
  const attendanceRate = totalAttendance > 0 ? Math.round(((presentCount + lateCount) / totalAttendance) * 100) : 0;

  // Calculations for Payments
  const totalPaid = payments
    .filter((p: any) => p.status === "COMPLETED")
    .reduce((sum: number, p: any) => sum + p.amount, 0);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.3 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black z-40 pointer-events-auto"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", bounce: 0, duration: 0.4 }}
            className="fixed inset-y-0 right-0 w-full max-w-md bg-surface border-l border-border shadow-2xl z-50 flex flex-col pointer-events-auto"
          >
            {/* Header Info */}
            <div className="flex items-center justify-between p-6 border-b border-border bg-surface/50 backdrop-blur-md sticky top-0 z-10">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-gradient-primary flex items-center justify-center text-white font-extrabold text-xl shadow-md">
                  {name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-lg font-black text-foreground line-clamp-1">{name}</h3>
                  <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary/10 text-primary border border-primary/20">
                    {role.replace("_", " ")}
                  </span>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-surface-hover text-muted hover:text-foreground transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Custom Premium Tabs Navigation */}
            <div className="flex border-b border-border bg-surface-hover/30 px-4 overflow-x-auto gap-1">
              {(["overview", "payments", "bookings", "attendance", "notes"] as TabType[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-3.5 text-xs font-bold capitalize whitespace-nowrap border-b-2 transition-all relative ${
                    activeTab === tab 
                      ? "border-primary text-primary" 
                      : "border-transparent text-muted hover:text-foreground"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Scrollable Tab Content Container */}
            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              {activeTab === "overview" && (
                <div className="space-y-6">
                  {/* Contact Detail Card */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-muted uppercase tracking-wider pl-1">Contact Details</h4>
                    <div className="bg-surface-hover border border-border/50 rounded-xl p-4 space-y-3 text-sm font-semibold">
                      <div className="flex items-center gap-3">
                        <Mail className="h-4 w-4 text-primary" />
                        <span className="text-foreground">{email}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Phone className="h-4 w-4 text-primary" />
                        <span className="text-foreground">{phone}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Calendar className="h-4 w-4 text-primary" />
                        <span className="text-foreground">Joined {new Date(joinDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Physical Profiler */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-muted uppercase tracking-wider pl-1">Physical Attributes</h4>
                    <div className="bg-surface-hover border border-border/50 rounded-xl p-4 grid grid-cols-2 gap-4 text-xs font-semibold">
                      <div>
                        <span className="text-muted block">Age</span>
                        <span className="text-foreground text-sm font-extrabold">{age ? `${age} yrs` : "N/A"}</span>
                      </div>
                      <div>
                        <span className="text-muted block">Gender</span>
                        <span className="text-foreground text-sm font-extrabold capitalize">{gender || "N/A"}</span>
                      </div>
                      <div>
                        <span className="text-muted block">Weight</span>
                        <span className="text-foreground text-sm font-extrabold">{weight ? `${weight} kg` : "N/A"}</span>
                      </div>
                      <div>
                        <span className="text-muted block">Height</span>
                        <span className="text-foreground text-sm font-extrabold">{height ? `${height} cm` : "N/A"}</span>
                      </div>
                    </div>
                  </div>

                  {/* Emergency Cards */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-muted uppercase tracking-wider pl-1">Emergency Contact</h4>
                    <div className="bg-surface-hover border border-border/50 rounded-xl p-4 space-y-2 text-xs font-semibold">
                      {emergencyContact?.name ? (
                        <>
                          <div className="flex justify-between">
                            <span className="text-muted">Contact Name:</span>
                            <span className="text-foreground font-extrabold">{emergencyContact.name}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted">Relationship:</span>
                            <span className="text-foreground font-extrabold capitalize">{emergencyContact.relation || "N/A"}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted">Phone Number:</span>
                            <span className="text-foreground font-extrabold">{emergencyContact.phone || "N/A"}</span>
                          </div>
                        </>
                      ) : (
                        <p className="text-xs text-muted py-1">No emergency contact information registered.</p>
                      )}
                    </div>
                  </div>

                  {/* Membership Info Tier */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-muted uppercase tracking-wider pl-1">Current Membership</h4>
                    <div className="bg-gradient-to-br from-primary/10 to-transparent border border-primary/20 rounded-xl p-5">
                      <div className="flex items-center justify-between mb-3">
                        <div className="font-bold text-primary flex items-center gap-2 text-sm">
                          <CreditCard className="h-4.5 w-4.5" />
                          {plan?.name || "No Plan Tier Assigned"}
                        </div>
                        <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 capitalize">
                          {status}
                        </span>
                      </div>
                      {plan ? (
                        <div className="text-xs space-y-1.5 text-muted font-medium">
                          <p>
                            Plan Price: <span className="font-bold text-foreground">${plan.price}</span>
                          </p>
                          <p>
                            Plan Duration: <span className="font-bold text-foreground">{plan.durationInMonths} Month(s)</span>
                          </p>
                          {member.membershipEndDate && (
                            <p>
                              Expiry Date: <span className="font-bold text-foreground">{new Date(member.membershipEndDate).toLocaleDateString()}</span>
                            </p>
                          )}
                        </div>
                      ) : (
                        <p className="text-xs text-muted">No active recurring plan tier rates apply to this member.</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "payments" && (
                <div className="space-y-6">
                  {/* Revenue Summary */}
                  <div className="bg-surface-hover border border-border/50 rounded-xl p-5 text-center flex flex-col items-center justify-center">
                    <DollarSign className="h-8 w-8 text-primary mb-2" />
                    <div className="text-xs font-bold text-muted uppercase tracking-wider">Total Value Paid</div>
                    <div className="text-3xl font-black text-foreground mt-1">${totalPaid.toFixed(2)}</div>
                  </div>

                  {/* Transactions List */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-muted uppercase tracking-wider pl-1">Payment History</h4>
                    {isLoadingPayments ? (
                      <p className="text-xs text-muted">Loading payments...</p>
                    ) : payments.length === 0 ? (
                      <p className="text-xs text-muted py-4 pl-1">No payment transactions recorded.</p>
                    ) : (
                      <div className="space-y-3">
                        {payments.map((p: any) => {
                          const isCompleted = p.status === "COMPLETED";
                          const isFailed = p.status === "FAILED";
                          return (
                            <div key={p._id} className="bg-surface border border-border rounded-xl p-4 flex justify-between items-center shadow-sm">
                              <div>
                                <div className="font-bold text-sm text-foreground">{p.planName || "Gym Plan Payment"}</div>
                                <div className="text-xs text-muted font-semibold mt-1 flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  {new Date(p.date || p.createdAt).toLocaleDateString(undefined, {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric"
                                  })}
                                  <span className="mx-1">•</span>
                                  <span className="uppercase text-[9px] bg-surface-hover px-1.5 py-0.5 rounded">{p.method}</span>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="font-black text-sm text-foreground">${p.amount}</div>
                                <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[9px] font-bold border ${
                                  isCompleted 
                                    ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" 
                                    : isFailed 
                                      ? "bg-destructive/10 text-destructive border-destructive/20" 
                                      : "bg-amber-500/10 text-amber-500 border-amber-500/20"
                                }`}>
                                  {p.status}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === "bookings" && (
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-muted uppercase tracking-wider pl-1">Class Bookings</h4>
                  {isLoadingBookings ? (
                    <p className="text-xs text-muted">Loading bookings...</p>
                  ) : bookings.length === 0 ? (
                    <p className="text-xs text-muted py-4 pl-1">No class bookings found for this member.</p>
                  ) : (
                    <div className="space-y-3">
                      {bookings.map((b: any) => {
                        const isAttended = b.status === "ATTENDED";
                        const isCancelled = b.status === "CANCELLED";
                        return (
                          <div key={b._id} className="bg-surface border border-border rounded-xl p-4 flex justify-between items-center shadow-sm">
                            <div>
                              <div className="font-bold text-sm text-foreground flex items-center gap-1.5">
                                <CalendarCheck className="h-4 w-4 text-primary" />
                                {b.className}
                              </div>
                              <div className="text-xs text-muted font-semibold mt-1">
                                {new Date(b.date).toLocaleDateString(undefined, {
                                  month: "short",
                                  day: "numeric"
                                })}
                                {" @ "}{b.time}
                              </div>
                              <div className="text-[10px] text-muted font-bold mt-1 uppercase">Trainer: {b.trainerName}</div>
                            </div>
                            <div>
                              <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-bold border ${
                                isAttended 
                                  ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" 
                                  : isCancelled 
                                    ? "bg-destructive/10 text-destructive border-destructive/20" 
                                    : "bg-primary/10 text-primary border-primary/20"
                              }`}>
                                {b.status}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {activeTab === "attendance" && (
                <div className="space-y-6">
                  {/* Attendance Stats Cards */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-surface-hover border border-border/50 rounded-xl p-4 text-center">
                      <div className="text-3xl font-black text-foreground">{attendanceRate}%</div>
                      <div className="text-[10px] font-bold text-muted uppercase tracking-wider mt-1">Attendance Rate</div>
                      <div className="w-full bg-border rounded-full h-1.5 mt-3 overflow-hidden">
                        <div 
                          className="bg-primary h-full rounded-full transition-all duration-500" 
                          style={{ width: `${attendanceRate}%` }}
                        />
                      </div>
                    </div>
                    <div className="bg-surface-hover border border-border/50 rounded-xl p-4 text-center flex flex-col justify-center">
                      <div className="text-3xl font-black text-foreground">{totalAttendance}</div>
                      <div className="text-[10px] font-bold text-muted uppercase tracking-wider mt-1">Sessions Checked-in</div>
                    </div>
                  </div>

                  {/* Attendance Details Grid */}
                  <div className="bg-surface-hover border border-border/50 rounded-xl p-4 grid grid-cols-3 gap-2 text-center text-xs font-bold">
                    <div className="bg-surface rounded-lg p-2">
                      <span className="text-emerald-500 block text-lg">{presentCount}</span>
                      <span className="text-[9px] text-muted uppercase">Present</span>
                    </div>
                    <div className="bg-surface rounded-lg p-2">
                      <span className="text-amber-500 block text-lg">{lateCount}</span>
                      <span className="text-[9px] text-muted uppercase">Late</span>
                    </div>
                    <div className="bg-surface rounded-lg p-2">
                      <span className="text-destructive block text-lg">{absentCount}</span>
                      <span className="text-[9px] text-muted uppercase">Absent</span>
                    </div>
                  </div>

                  {/* Logs */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-muted uppercase tracking-wider pl-1">Attendance Records</h4>
                    {isLoadingAttendance ? (
                      <p className="text-xs text-muted">Loading attendance...</p>
                    ) : attendanceList.length === 0 ? (
                      <p className="text-xs text-muted py-4 pl-1">No attendance records found.</p>
                    ) : (
                      <div className="space-y-2">
                        {attendanceList.map((a: any) => {
                          const isPresent = a.status === "PRESENT";
                          const isLate = a.status === "LATE";
                          return (
                            <div key={a._id} className="bg-surface border border-border rounded-xl p-3.5 flex justify-between items-center shadow-sm text-xs font-semibold">
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-primary" />
                                {new Date(a.date).toLocaleDateString(undefined, {
                                  weekday: "short",
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric"
                                })}
                              </div>
                              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-bold border ${
                                isPresent 
                                  ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" 
                                  : isLate 
                                    ? "bg-amber-500/10 text-amber-500 border-amber-500/20" 
                                    : "bg-destructive/10 text-destructive border-destructive/20"
                              }`}>
                                {isPresent ? <CheckCircle2 size={10} /> : <AlertCircle size={10} />}
                                {a.status}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === "notes" && (
                <div className="space-y-6">
                  {/* Note Creator Form */}
                  <form onSubmit={handleAddNote} className="space-y-3">
                    <h4 className="text-xs font-bold text-muted uppercase tracking-wider pl-1">Add Private Note</h4>
                    <textarea
                      value={noteContent}
                      onChange={(e) => setNoteContent(e.target.value)}
                      placeholder="Type a private admin note about this athlete..."
                      rows={3}
                      className="w-full text-sm bg-surface border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none text-foreground font-semibold placeholder:text-muted/60 placeholder:font-medium"
                    />
                    <Button 
                      type="submit" 
                      disabled={isSubmittingNote || !noteContent.trim()}
                      className="w-full flex items-center justify-center gap-2 text-xs font-extrabold uppercase py-2.5"
                    >
                      <Send className="h-3 w-3" />
                      Save Private Note
                    </Button>
                  </form>

                  {/* Previous Notes History */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-muted uppercase tracking-wider pl-1">Notes Logs ({notesList.length})</h4>
                    {notesList.length === 0 ? (
                      <div className="text-center py-6 bg-surface-hover/30 border border-dashed border-border rounded-xl">
                        <FileText className="h-6 w-6 text-muted mx-auto mb-2 opacity-30" />
                        <p className="text-xs text-muted">No private notes recorded for this member yet.</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {notesList.map((note: any, index: number) => (
                          <div key={index} className="bg-surface-hover border border-border/50 rounded-xl p-4 space-y-2 relative">
                            <div className="flex justify-between items-center text-[10px] text-muted font-bold uppercase">
                              <span className="flex items-center gap-1">
                                <User className="h-3 w-3 text-primary" />
                                {note.author || "Admin"}
                              </span>
                              <span>
                                {new Date(note.createdAt).toLocaleDateString(undefined, {
                                  month: "short",
                                  day: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit"
                                })}
                              </span>
                            </div>
                            <p className="text-xs font-semibold text-foreground leading-relaxed whitespace-pre-wrap">{note.content}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Actions Bar Footer */}
            <div className="p-6 border-t border-border bg-surface flex gap-3">
              <Button className="w-full text-xs font-extrabold uppercase" variant="secondary" onClick={onClose}>
                Close Profile
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
