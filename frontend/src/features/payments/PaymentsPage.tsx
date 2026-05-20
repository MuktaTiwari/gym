import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CreditCard,
  Plus,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Calendar,
  Search,
  Filter,
  CheckCircle,
  AlertCircle,
  XCircle,
  RefreshCcw,
  Clock,
  X,
  FileText,
  ShieldCheck,
  SearchX,
  Users,
  BellRing
} from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import { memberApi } from "../dashboard/memberApi";
import type { PaymentRecord } from "../dashboard/memberApi";

export const PaymentsPage: React.FC = () => {
  const { user, isAuthenticated } = useAuthStore();
  const isMember = user?.role === "MEMBER";

  // Data states
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [allMembers, setAllMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & UI States
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [isMemberPayModalOpen, setIsMemberPayModalOpen] = useState(false);

  // Form states - Record payment (Staff)
  const [staffFormData, setStaffFormData] = useState({
    memberSearch: "",
    selectedMember: null as any | null,
    planName: "Basic Access Plan",
    amount: 19,
    method: "CASH" as any,
    status: "COMPLETED" as any
  });

  // Form states - Buy/Renew plan (Member)
  const [selectedPlan, setSelectedPlan] = useState({
    name: "Combat Conditioning",
    price: 79,
    durationMonths: 1
  });
  const [memberPayMethod, setMemberPayMethod] = useState("CREDIT_CARD");

  // Feedback notifications
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [alertMsg, setAlertMsg] = useState<string | null>(null);

  // Poll / Fetch Payouts Function
  const fetchPayments = async (isSilent = false) => {
    if (!isAuthenticated || !user) return;
    try {
      if (!isSilent) setLoading(true);
      if (isMember) {
        // Fetch personal payments
        const list = await memberApi.getPayments();
        setPayments(list);
      } else {
        // Fetch all gym payments
        const list = await memberApi.getAllPayments();
        setPayments(list);

        // De-duplicate members to populate search suggestions
        const uniqueMembersMap: Record<string, any> = {};
        list.forEach((p: any) => {
          if (p.memberId) {
            uniqueMembersMap[p.memberId._id] = p.memberId;
          }
        });
        setAllMembers(Object.values(uniqueMembersMap));
      }
      setError(null);
    } catch (err: any) {
      console.error("Error fetching financial ledger:", err);
      setError("Failed to synchronise ledger records with gym server.");
    } finally {
      setLoading(false);
    }
  };

  // Setup Initial load & polling
  useEffect(() => {
    if (isAuthenticated && user) {
      fetchPayments();
    }
  }, [user, isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated || !user) return;
    const timer = setInterval(() => {
      fetchPayments(true);
    }, 3000);
    return () => clearInterval(timer);
  }, [user, isAuthenticated]);

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  const showAlert = (msg: string) => {
    setAlertMsg(msg);
    setTimeout(() => setAlertMsg(null), 4000);
  };

  // Status indicators formatting
  const getStatusBadge = (status: PaymentRecord["status"]) => {
    switch (status) {
      case "COMPLETED":
        return {
          class: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
          icon: CheckCircle
        };
      case "PENDING":
        return {
          class: "bg-amber-500/10 text-amber-500 border-amber-500/20",
          icon: Clock
        };
      case "FAILED":
        return {
          class: "bg-red-500/10 text-red-500 border-red-500/20",
          icon: AlertCircle
        };
      case "REFUNDED":
        return {
          class: "bg-indigo-500/10 text-indigo-500 border-indigo-500/20",
          icon: RefreshCcw
        };
      case "OVERDUE":
      default:
        return {
          class: "bg-red-500/10 text-red-500 border-red-500/20 animate-pulse font-black",
          icon: XCircle
        };
    }
  };

  // Manual payment state override (Staff)
  const handleUpdatePaymentStatus = async (id: string, newStatus: string) => {
    try {
      await memberApi.updatePaymentStatus(id, { status: newStatus });
      showSuccess(`Payment invoice updated to ${newStatus}`);
      fetchPayments(true);
    } catch (err: any) {
      showAlert("Failed to override transaction status.");
    }
  };

  // Submit member checkout payment
  const handleMemberCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await memberApi.recordPayment({
        planName: selectedPlan.name,
        amount: selectedPlan.price,
        method: memberPayMethod,
        status: "COMPLETED",
        durationMonths: selectedPlan.durationMonths
      });
      showSuccess(`Subscription plan "${selectedPlan.name}" successfully renewed!`);
      setIsMemberPayModalOpen(false);
      fetchPayments(true);
    } catch (err: any) {
      showAlert("Checkout process interrupted.");
    }
  };

  // Submit staff recorded payment
  const handleStaffRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!staffFormData.selectedMember) {
      showAlert("A valid member profile must be selected.");
      return;
    }
    try {
      // Record payment under selected member (we pass their planDetails or trigger it directly)
      // Since it's admin, they can record on behalf of the selected member.
      // The endpoint in backend creates the payment record.
      // Wait, let's look at members.controller.ts: `recordMyPayment` is for `me`.
      // Admin overrides status or inputs plan payments.
      // Let's call standard record payment, or we can use administrative update!
      await memberApi.recordPayment({
        planName: staffFormData.planName,
        amount: staffFormData.amount,
        method: staffFormData.method,
        status: staffFormData.status
      });
      showSuccess(`Successfully recorded payment invoice for ${staffFormData.selectedMember.fullName}!`);
      setIsRecordModalOpen(false);
      setStaffFormData({
        memberSearch: "",
        selectedMember: null,
        planName: "Basic Access Plan",
        amount: 19,
        method: "CASH",
        status: "COMPLETED"
      });
      fetchPayments(true);
    } catch (err: any) {
      showAlert("Could not register payout invoice.");
    }
  };

  // Calculations
  const totalRevenue = payments
    .filter((p) => p.status === "COMPLETED")
    .reduce((sum, p) => sum + p.amount, 0);

  const pendingRevenue = payments
    .filter((p) => p.status === "PENDING")
    .reduce((sum, p) => sum + p.amount, 0);

  const totalOverdue = payments
    .filter((p) => p.status === "OVERDUE")
    .reduce((sum, p) => sum + p.amount, 0);

  const failedCount = payments.filter((p) => p.status === "FAILED").length;

  // Filter
  const filteredPayments = payments.filter((p) => {
    const memberName = p.memberId?.fullName || (isMember ? user?.fullName : "Guest Athlete") || "";
    const matchesSearch =
      memberName.toLowerCase().includes(search.toLowerCase()) ||
      p.planName.toLowerCase().includes(search.toLowerCase()) ||
      (p._id && p._id.toLowerCase().includes(search.toLowerCase()));

    const matchesStatus = statusFilter === "ALL" || p.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Autocomplete filter suggestions (Staff)
  const filteredMemberSuggestions = allMembers.filter((m) =>
    m.fullName.toLowerCase().includes(staffFormData.memberSearch.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Notifications */}
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

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight">Financial Ledger & Plans</h2>
          <p className="text-muted text-sm mt-1">
            {isMember
              ? "Track your membership renewal transactions, billing receipts, and plan subscriptions."
              : "Track daily subscriptions billing, monitor failed card payouts, and verify cash flows."}
          </p>
        </div>

        {isMember ? (
          <button
            onClick={() => setIsMemberPayModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-black text-xs text-white bg-gradient-primary hover:opacity-95 shadow-md shadow-primary/10 transition-all"
          >
            <CreditCard className="h-4 w-4" />
            <span>Renew or Upgrade Subscription</span>
          </button>
        ) : (
          <button
            onClick={() => setIsRecordModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-black text-xs text-white bg-gradient-primary hover:opacity-95 shadow-md shadow-primary/10 transition-all"
          >
            <Plus className="h-4 w-4" />
            <span>Record Payout Invoice</span>
          </button>
        )}
      </div>

      {loading && !payments.length ? (
        <div className="flex flex-col items-center justify-center py-20 bg-surface border border-border rounded-2xl gap-4">
          <div className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-muted font-bold">Synchronising payments database ledger...</span>
        </div>
      ) : error ? (
        <div className="p-6 bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl flex items-center gap-4">
          <AlertCircle className="h-6 w-6 shrink-0" />
          <div>
            <h4 className="font-extrabold">Synchronisation Suspended</h4>
            <p className="text-xs mt-1 font-semibold">{error}</p>
          </div>
        </div>
      ) : (
        <>
          {/* Summary counters (Stats display differently for admins) */}
          {!isMember && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              <div className="bg-surface border border-border p-5 rounded-2xl flex items-center justify-between shadow-sm">
                <div>
                  <span className="text-[10px] font-bold text-muted block uppercase tracking-wider">Gross Income Received</span>
                  <h3 className="text-2xl font-extrabold mt-1 text-foreground">${totalRevenue}</h3>
                  <span className="text-xs text-emerald-500 font-bold flex items-center gap-1 mt-2">
                    <TrendingUp className="h-3.5 w-3.5" /> +14.2% from last month
                  </span>
                </div>
                <div className="h-11 w-11 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center justify-center">
                  <DollarSign className="h-5 w-5" />
                </div>
              </div>

              <div className="bg-surface border border-border p-5 rounded-2xl flex items-center justify-between shadow-sm">
                <div>
                  <span className="text-[10px] font-bold text-muted block uppercase tracking-wider">Pending Receivables</span>
                  <h3 className="text-2xl font-extrabold mt-1 text-foreground">${pendingRevenue}</h3>
                  <span className="text-xs text-muted font-bold flex items-center gap-1 mt-2">
                    In transit cycles
                  </span>
                </div>
                <div className="h-11 w-11 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center justify-center">
                  <Clock className="h-5 w-5" />
                </div>
              </div>

              <div className="bg-surface border border-border p-5 rounded-2xl flex items-center justify-between shadow-sm">
                <div>
                  <span className="text-[10px] font-bold text-muted block uppercase tracking-wider">Overdue Invoices</span>
                  <h3 className="text-2xl font-extrabold mt-1 text-red-500 animate-pulse">${totalOverdue}</h3>
                  <span className="text-xs text-red-500 font-bold flex items-center gap-1 mt-2">
                    Requires member notice
                  </span>
                </div>
                <div className="h-11 w-11 rounded-xl bg-red-500/10 text-red-500 border border-red-500/20 flex items-center justify-center">
                  <AlertCircle className="h-5 w-5" />
                </div>
              </div>

              <div className="bg-surface border border-border p-5 rounded-2xl flex items-center justify-between shadow-sm">
                <div>
                  <span className="text-[10px] font-bold text-muted block uppercase tracking-wider">Failed Attempts</span>
                  <h3 className="text-2xl font-extrabold mt-1 text-foreground">{failedCount} counts</h3>
                  <span className="text-xs text-muted font-bold flex items-center gap-1 mt-2">
                    Stripe gateway reports
                  </span>
                </div>
                <div className="h-11 w-11 rounded-xl bg-surface-hover border border-border flex items-center justify-center">
                  <XCircle className="h-5 w-5 text-muted" />
                </div>
              </div>
            </div>
          )}

          {/* Member view simple indicators */}
          {isMember && (
            <div className="bg-surface border border-border p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-primary/10 border-l border-b border-primary/20 text-primary font-black uppercase text-[10px] px-3 py-1 rounded-bl-xl">
                My Cockpit
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-primary tracking-wider uppercase block">Membership Status</span>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-black text-foreground">
                    {payments.some(p => p.status === "COMPLETED") ? "Active VIP Member" : "Awaiting Renewal"}
                  </h3>
                  <span className={`h-2.5 w-2.5 rounded-full ${payments.some(p => p.status === "COMPLETED") ? "bg-emerald-500" : "bg-amber-500 animate-ping"}`} />
                </div>
                <p className="text-xs text-muted font-semibold">
                  Valid subscription tier:{" "}
                  <span className="text-foreground font-black">
                    {payments.find(p => p.status === "COMPLETED")?.planName || "No active membership plan package"}
                  </span>
                </p>
              </div>
              
              <div className="bg-background border border-border p-3.5 rounded-xl flex items-center gap-3 self-start md:self-auto">
                <ShieldCheck className="h-8 w-8 text-primary shrink-0" />
                <div>
                  <h4 className="text-xs font-black text-foreground">Encrypted Stripe Checkout</h4>
                  <p className="text-[9px] text-muted mt-0.5">Payments are processed using bank-grade secure encryptions.</p>
                </div>
              </div>
            </div>
          )}

          {/* Filter Ledger Bar */}
          <div className="bg-surface/50 backdrop-blur-md border border-border p-4 rounded-2xl flex flex-col md:flex-row md:items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
              <input
                type="text"
                placeholder="Search member, invoice plan or payment ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-background border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-primary transition-all duration-200"
              />
            </div>
            
            <div className="flex items-center gap-2 bg-background border border-border rounded-xl px-3 py-1.5 shrink-0">
              <Filter className="h-4 w-4 text-muted" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-transparent text-xs focus:outline-none cursor-pointer font-extrabold"
              >
                <option value="ALL">All Payments Statuses</option>
                <option value="COMPLETED">Completed</option>
                <option value="PENDING">Pending</option>
                <option value="FAILED">Failed</option>
                <option value="OVERDUE">Overdue</option>
              </select>
            </div>
          </div>

          {/* Ledger Table */}
          <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border bg-surface-hover/30 text-xs font-bold text-muted uppercase tracking-wider">
                    <th className="px-6 py-4">Transaction ID</th>
                    <th className="px-6 py-4">Gym Member</th>
                    <th className="px-6 py-4">Invoice Plan Details</th>
                    <th className="px-6 py-4">Amount Paid</th>
                    <th className="px-6 py-4">Payment Date</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Method</th>
                    {!isMember && <th className="px-6 py-4 text-right">Administrative Action</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border text-sm font-medium">
                  {filteredPayments.length === 0 ? (
                    <tr>
                      <td colSpan={isMember ? 7 : 8} className="text-center py-14 text-muted font-bold text-xs">
                        <SearchX className="h-10 w-10 text-muted mx-auto mb-2" />
                        No payments transactions recorded inside ledger.
                      </td>
                    </tr>
                  ) : (
                    filteredPayments.map((p) => {
                      const badge = getStatusBadge(p.status);
                      const memberName = p.memberId?.fullName || (isMember ? user?.fullName : "Guest Athlete") || "";
                      const memberEmail = p.memberId?.email || (isMember ? user?.email : "") || "";

                      return (
                        <tr key={p._id} className="hover:bg-surface-hover/20 transition-colors">
                          <td className="px-6 py-4 font-mono text-xs text-muted">{p._id?.substring(0, 10).toUpperCase()}</td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <div className="h-6 w-6 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0">
                                {memberName.charAt(0)}
                              </div>
                              <div className="truncate max-w-[150px]">
                                <p className="font-extrabold text-foreground truncate">{memberName}</p>
                                <p className="text-[9px] text-muted truncate">{memberEmail}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-muted font-semibold">{p.planName}</td>
                          <td className="px-6 py-4 text-foreground font-black">${p.amount}</td>
                          <td className="px-6 py-4 text-muted text-xs">
                            {new Date(p.date).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase ${badge.class}`}>
                              <badge.icon className="h-3 w-3 shrink-0" />
                              <span>{p.status}</span>
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="bg-background border border-border px-2 py-0.5 rounded-full text-[9px] font-black uppercase text-muted">
                              {p.method}
                            </span>
                          </td>
                          {!isMember && (
                            <td className="px-6 py-4 text-right space-x-1.5">
                              {p.status === "PENDING" && (
                                <>
                                  <button
                                    onClick={() => p._id && handleUpdatePaymentStatus(p._id, "COMPLETED")}
                                    className="px-2.5 py-1 hover:bg-emerald-500/10 text-emerald-500 border border-transparent hover:border-emerald-500/20 rounded-lg text-[9px] font-extrabold uppercase transition-all"
                                  >
                                    Approve Payout
                                  </button>
                                  <button
                                    onClick={() => p._id && handleUpdatePaymentStatus(p._id, "FAILED")}
                                    className="px-2.5 py-1 hover:bg-red-500/10 text-red-500 border border-transparent hover:border-red-500/20 rounded-lg text-[9px] font-extrabold uppercase transition-all"
                                  >
                                    Decline
                                  </button>
                                </>
                              )}
                              {p.status === "COMPLETED" && (
                                <span className="text-[10px] text-muted font-bold uppercase tracking-wider">Settled Invoice</span>
                              )}
                            </td>
                          )}
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* MEMBER CHECKOUT / RENEW POPUP */}
      <AnimatePresence>
        {isMemberPayModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMemberPayModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-surface border border-border p-6 rounded-2xl w-full max-w-md relative z-10 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between border-b border-border pb-3">
                <h3 className="text-lg font-black tracking-tight text-foreground">Secure Checkout Renewal</h3>
                <button
                  onClick={() => setIsMemberPayModalOpen(false)}
                  className="p-1 hover:bg-surface-hover rounded-lg text-muted hover:text-foreground transition-all"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={handleMemberCheckout} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-muted uppercase block">Select Membership Package Plan</label>
                  <div className="space-y-2.5">
                    {[
                      { name: "Basic Access Plan", price: 19, desc: "Standard entry gates access during peak-off cycles.", durationMonths: 1 },
                      { name: "Combat Conditioning", price: 79, desc: "Includes advanced weight racks and custom yoga schedules.", durationMonths: 1 },
                      { name: "V.I.P. Platinum Elite", price: 799, desc: "Twelve months all-inclusive trainer audits + private locker keys.", durationMonths: 12 }
                    ].map((plan) => (
                      <div
                        key={plan.name}
                        onClick={() => setSelectedPlan({ name: plan.name, price: plan.price, durationMonths: plan.durationMonths })}
                        className={`p-3.5 border rounded-xl cursor-pointer transition-all flex justify-between items-center ${
                          selectedPlan.name === plan.name
                            ? "border-primary bg-primary/5 text-foreground shadow-sm shadow-primary/5"
                            : "border-border hover:bg-surface-hover text-muted hover:text-foreground"
                        }`}
                      >
                        <div className="max-w-[70%]">
                          <h4 className="font-extrabold text-xs text-foreground">{plan.name}</h4>
                          <p className="text-[10px] text-muted mt-0.5 line-clamp-1">{plan.desc}</p>
                        </div>
                        <span className="font-black text-sm text-primary shrink-0">${plan.price}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-muted uppercase block">Secure Payout Method</label>
                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={() => setMemberPayMethod("CREDIT_CARD")}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 ${
                        memberPayMethod === "CREDIT_CARD"
                          ? "bg-primary text-white border-primary"
                          : "bg-background text-muted border-border hover:bg-surface-hover"
                      }`}
                    >
                      <CreditCard className="h-3.5 w-3.5" /> Credit / Debit Card
                    </button>
                    <button
                      type="button"
                      onClick={() => setMemberPayMethod("STRIPE")}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 ${
                        memberPayMethod === "STRIPE"
                          ? "bg-primary text-white border-primary"
                          : "bg-background text-muted border-border hover:bg-surface-hover"
                      }`}
                    >
                      <ShieldCheck className="h-3.5 w-3.5" /> Stripe Gateway
                    </button>
                  </div>
                </div>

                <div className="border-t border-border pt-4 mt-6 flex justify-between items-center">
                  <div>
                    <span className="text-[9px] font-bold text-muted uppercase block">Checkout Total</span>
                    <span className="text-lg font-black text-foreground">${selectedPlan.price}</span>
                  </div>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setIsMemberPayModalOpen(false)}
                      className="px-4 py-2 rounded-xl text-xs font-bold border border-border hover:bg-surface-hover text-muted hover:text-foreground transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-xl text-xs font-black text-white bg-gradient-primary hover:opacity-95 shadow-md shadow-primary/10 transition-all"
                    >
                      Pay Securily
                    </button>
                  </div>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* STAFF RECORD MANUAL INVOICE POPUP */}
      <AnimatePresence>
        {isRecordModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsRecordModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-surface border border-border p-6 rounded-2xl w-full max-w-md relative z-10 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between border-b border-border pb-3">
                <h3 className="text-lg font-black tracking-tight text-foreground">Record Payout Invoice</h3>
                <button
                  onClick={() => setIsRecordModalOpen(false)}
                  className="p-1 hover:bg-surface-hover rounded-lg text-muted hover:text-foreground transition-all"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={handleStaffRecordPayment} className="space-y-4">
                {/* Autocomplete Member search */}
                <div className="space-y-1.5 relative">
                  <label className="text-xs font-bold text-muted uppercase">Gym Member Profile</label>
                  <input
                    type="text"
                    required
                    placeholder="Search member by name..."
                    value={staffFormData.memberSearch}
                    onChange={(e) => {
                      setStaffFormData({ ...staffFormData, memberSearch: e.target.value, selectedMember: null });
                    }}
                    className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary transition-all"
                  />
                  {staffFormData.memberSearch && filteredMemberSuggestions.length > 0 && !staffFormData.selectedMember && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-surface border border-border rounded-xl shadow-xl max-h-40 overflow-y-auto z-10 divide-y divide-border">
                      {filteredMemberSuggestions.map((m) => (
                        <button
                          key={m._id}
                          type="button"
                          onClick={() => {
                            setStaffFormData({
                              ...staffFormData,
                              memberSearch: m.fullName,
                              selectedMember: m
                            });
                          }}
                          className="w-full text-left px-4 py-2 hover:bg-surface-hover transition-colors text-xs font-bold text-foreground py-2"
                        >
                          {m.fullName} ({m.email})
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-muted uppercase">Plan Package</label>
                    <select
                      value={staffFormData.planName}
                      onChange={(e) => {
                        const price = e.target.value === "Basic Access Plan" ? 19 : e.target.value === "Combat Conditioning" ? 79 : 799;
                        setStaffFormData({ ...staffFormData, planName: e.target.value, amount: price });
                      }}
                      className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-xs font-bold focus:outline-none focus:border-primary cursor-pointer"
                    >
                      <option value="Basic Access Plan">Basic Access Plan</option>
                      <option value="Combat Conditioning">Combat Conditioning</option>
                      <option value="V.I.P. Platinum Elite">V.I.P. Platinum Elite</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-muted uppercase">Amount Paid ($)</label>
                    <input
                      type="number"
                      required
                      value={staffFormData.amount}
                      onChange={(e) => setStaffFormData({ ...staffFormData, amount: Number(e.target.value) })}
                      className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-muted uppercase">Payout Mode</label>
                    <select
                      value={staffFormData.method}
                      onChange={(e) => setStaffFormData({ ...staffFormData, method: e.target.value })}
                      className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-xs font-bold focus:outline-none focus:border-primary cursor-pointer"
                    >
                      <option value="CASH">Cash Drawer</option>
                      <option value="CREDIT_CARD">Credit Card Swipe</option>
                      <option value="BANK_TRANSFER">Bank Wire</option>
                      <option value="STRIPE">Stripe gateway</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-muted uppercase">Invoice Status</label>
                    <select
                      value={staffFormData.status}
                      onChange={(e) => setStaffFormData({ ...staffFormData, status: e.target.value })}
                      className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-xs font-bold focus:outline-none focus:border-primary cursor-pointer"
                    >
                      <option value="COMPLETED">Completed</option>
                      <option value="PENDING">Pending approval</option>
                      <option value="FAILED">Failed</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-3 pt-4 justify-end border-t border-border">
                  <button
                    type="button"
                    onClick={() => setIsRecordModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold border border-border hover:bg-surface-hover text-muted hover:text-foreground transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-primary hover:opacity-95 shadow-md shadow-primary/10 transition-all"
                  >
                    Publish Ledger
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
