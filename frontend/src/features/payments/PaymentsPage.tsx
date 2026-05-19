import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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
  FileText
} from "lucide-react";

// Types & Schemas
interface Payment {
  id: string;
  member: string;
  plan: string;
  amount: number;
  status: "COMPLETED" | "PENDING" | "FAILED" | "OVERDUE" | "REFUNDED";
  date: string;
  method: "CREDIT_CARD" | "BANK_TRANSFER" | "CASH" | "STRIPE";
}

const paymentSchema = z.object({
  member: z.string().min(2, "Please search or specify a valid member name"),
  plan: z.string().min(1, "Please select the associated membership plan"),
  amount: z.number().min(1, "Amount must be greater than zero"),
  method: z.enum(["CREDIT_CARD", "BANK_TRANSFER", "CASH", "STRIPE"]),
  status: z.enum(["COMPLETED", "PENDING", "FAILED", "OVERDUE", "REFUNDED"]),
});

type PaymentFormValues = z.infer<typeof paymentSchema>;

const INITIAL_PAYMENTS: Payment[] = [
  {
    id: "TXN-7782",
    member: "Dwayne Johnson",
    plan: "V.I.P. Platinum Elite",
    amount: 799,
    status: "COMPLETED",
    date: "2026-05-14",
    method: "STRIPE",
  },
  {
    id: "TXN-7783",
    member: "Sarah Connor",
    plan: "Combat Conditioning",
    amount: 79,
    status: "COMPLETED",
    date: "2026-05-12",
    method: "CREDIT_CARD",
  },
  {
    id: "TXN-7784",
    member: "Peter Parker",
    plan: "Agility & Core Basics",
    amount: 19,
    status: "FAILED",
    date: "2026-05-10",
    method: "CREDIT_CARD",
  },
  {
    id: "TXN-7785",
    member: "Bruce Wayne",
    plan: "Night Warrior Spec",
    amount: 159,
    status: "PENDING",
    date: "2026-05-09",
    method: "BANK_TRANSFER",
  },
  {
    id: "TXN-7786",
    member: "Tony Stark",
    plan: "Combat Conditioning",
    amount: 79,
    status: "OVERDUE",
    date: "2026-05-05",
    method: "STRIPE",
  },
  {
    id: "TXN-7787",
    member: "Diana Prince",
    plan: "V.I.P. Platinum Elite",
    amount: 799,
    status: "REFUNDED",
    date: "2026-04-20",
    method: "STRIPE",
  }
];

export const PaymentsPage: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>(INITIAL_PAYMENTS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      status: "COMPLETED",
      method: "CREDIT_CARD",
    },
  });

  const onRecordPayment = (data: PaymentFormValues) => {
    const newTx: Payment = {
      id: `TXN-${Math.floor(1000 + Math.random() * 9000)}`,
      member: data.member,
      plan: data.plan,
      amount: Number(data.amount),
      status: data.status,
      date: new Date().toISOString().split("T")[0],
      method: data.method,
    };
    setPayments([newTx, ...payments]);
    setIsModalOpen(false);
    reset();
  };

  // Status indicators formatting
  const getStatusBadge = (status: Payment["status"]) => {
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
          class: "bg-destructive/10 text-destructive border-destructive/20",
          icon: AlertCircle
        };
      case "REFUNDED":
        return {
          class: "bg-indigo-500/10 text-indigo-500 border-indigo-500/20",
          icon: RefreshCcw
        };
      case "OVERDUE":
      default:
        // Pulsing animation for Overdue payments
        return {
          class: "bg-destructive/10 text-destructive border-destructive/20 animate-pulse border-red-500/40 font-black",
          icon: XCircle
        };
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
    const matchesSearch =
      p.member.toLowerCase().includes(search.toLowerCase()) ||
      p.plan.toLowerCase().includes(search.toLowerCase()) ||
      p.id.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === "ALL" || p.status === statusFilter;

    const matchesDate =
      (!startDate || p.date >= startDate) && (!endDate || p.date <= endDate);

    return matchesSearch && matchesStatus && matchesDate;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight">Financial Ledger</h2>
          <p className="text-muted text-sm mt-1">
            Track daily subscriptions billing, monitor failed card payouts, and verify cash flows.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm text-white bg-gradient-primary hover:opacity-95 shadow-md shadow-primary/10 transition-all duration-200"
        >
          <Plus className="h-4 w-4" />
          <span>Record Payout</span>
        </button>
      </div>

      {/* Financial Summary cards */}
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
            <span className="text-[10px] font-bold text-muted block uppercase tracking-wider">Pending Invoice Receivables</span>
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
            <h3 className="text-2xl font-extrabold mt-1 text-destructive animate-pulse">${totalOverdue}</h3>
            <span className="text-xs text-destructive font-bold flex items-center gap-1 mt-2">
              Requires member notices
            </span>
          </div>
          <div className="h-11 w-11 rounded-xl bg-destructive/10 text-destructive border border-destructive/20 flex items-center justify-center">
            <AlertCircle className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-surface border border-border p-5 rounded-2xl flex items-center justify-between shadow-sm">
          <div>
            <span className="text-[10px] font-bold text-muted block uppercase tracking-wider">Failed Transactions</span>
            <h3 className="text-2xl font-extrabold mt-1 text-foreground">{failedCount} counts</h3>
            <span className="text-xs text-muted font-bold flex items-center gap-1 mt-2">
              Stripe card attempts
            </span>
          </div>
          <div className="h-11 w-11 rounded-xl bg-surface-hover border border-border flex items-center justify-center">
            <XCircle className="h-5 w-5 text-muted" />
          </div>
        </div>
      </div>

      {/* Filters ledger pane */}
      <div className="bg-surface/50 backdrop-blur-md border border-border p-5 rounded-2xl flex flex-col lg:flex-row lg:items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
          <input
            type="text"
            placeholder="Search member, plan, or invoice ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-background border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-primary transition-all duration-200"
          />
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          {/* Status selector */}
          <div className="flex items-center gap-2 bg-background border border-border rounded-xl px-3 py-1.5">
            <Filter className="h-4 w-4 text-muted" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent text-sm focus:outline-none cursor-pointer font-semibold"
            >
              <option value="ALL">All Payment Statuses</option>
              <option value="COMPLETED">Completed</option>
              <option value="PENDING">Pending</option>
              <option value="FAILED">Failed</option>
              <option value="OVERDUE">Overdue</option>
              <option value="REFUNDED">Refunded</option>
            </select>
          </div>

          {/* Date pickers */}
          <div className="flex items-center gap-2 bg-background border border-border rounded-xl px-3 py-1.5 text-xs font-semibold text-muted">
            <Calendar className="h-4 w-4" />
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-transparent text-foreground focus:outline-none cursor-pointer font-medium"
            />
            <span>to</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-transparent text-foreground focus:outline-none cursor-pointer font-medium"
            />
          </div>
        </div>
      </div>

      {/* Ledger DataTable */}
      <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-surface-hover/30 text-xs font-bold text-muted uppercase tracking-wider">
                <th className="px-6 py-4">Transaction ID</th>
                <th className="px-6 py-4">Member</th>
                <th className="px-6 py-4">Invoice Plan Details</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Date Logged</th>
                <th className="px-6 py-4">Payout Method</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-sm font-medium">
              {filteredPayments.length > 0 ? (
                filteredPayments.map((tx) => {
                  const badge = getStatusBadge(tx.status);
                  return (
                    <tr key={tx.id} className="hover:bg-surface-hover/30 transition-colors">
                      <td className="px-6 py-4 font-mono text-xs text-muted">{tx.id}</td>
                      <td className="px-6 py-4 font-extrabold text-foreground">{tx.member}</td>
                      <td className="px-6 py-4 text-muted">{tx.plan}</td>
                      <td className="px-6 py-4 text-foreground font-extrabold">${tx.amount}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border uppercase ${badge.class}`}>
                          <badge.icon className="h-3.5 w-3.5" />
                          <span>{tx.status}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 text-muted">{tx.date}</td>
                      <td className="px-6 py-4">
                        <span className="bg-background border border-border font-bold px-2 py-0.5 rounded-full uppercase text-[9px]">
                          {tx.method.replace("_", " ")}
                        </span>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-muted font-bold">
                    No transactions match the selected filter conditions.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Payment Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="fixed inset-0 bg-black"
            />
            <motion.div
              initial={{ scale: 0.95, y: 15, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 15, opacity: 0 }}
              className="bg-surface border border-border rounded-2xl w-full max-w-md p-6 relative z-10"
            >
              <div className="flex items-center justify-between border-b border-border pb-4 mb-4">
                <h3 className="text-xl font-extrabold tracking-tight">Record Payout Invoice</h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1 hover:bg-surface-hover rounded-lg text-muted hover:text-foreground transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit(onRecordPayment)} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-muted block mb-1">Gym Member Name</label>
                  <input
                    type="text"
                    {...register("member")}
                    placeholder="Search or enter name..."
                    className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-primary transition-all duration-200"
                  />
                  {errors.member && <p className="text-destructive text-xs mt-1 font-semibold">{errors.member.message}</p>}
                </div>

                <div>
                  <label className="text-xs font-bold text-muted block mb-1">Membership Plan Package</label>
                  <select
                    {...register("plan")}
                    className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-primary transition-all duration-200 font-semibold"
                  >
                    <option value="">Select plan...</option>
                    <option value="Basic Access Plan">Basic Access Plan</option>
                    <option value="Combat Conditioning">Combat Conditioning</option>
                    <option value="V.I.P. Platinum Elite">V.I.P. Platinum Elite</option>
                  </select>
                  {errors.plan && <p className="text-destructive text-xs mt-1 font-semibold">{errors.plan.message}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-muted block mb-1">Amount Due ($)</label>
                    <input
                      type="number"
                      {...register("amount", { valueAsNumber: true })}
                      placeholder="e.g. 79"
                      className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-primary transition-all duration-200"
                    />
                    {errors.amount && <p className="text-destructive text-xs mt-1 font-semibold">{errors.amount.message}</p>}
                  </div>

                  <div>
                    <label className="text-xs font-bold text-muted block mb-1">Payment Method</label>
                    <select
                      {...register("method")}
                      className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-primary transition-all duration-200 font-semibold"
                    >
                      <option value="STRIPE">Stripe Gateway</option>
                      <option value="CREDIT_CARD">Credit Card Swipe</option>
                      <option value="CASH">Cash Drawer</option>
                      <option value="BANK_TRANSFER">Bank Wire</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-muted block mb-1">Initial Status</label>
                  <select
                    {...register("status")}
                    className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-primary transition-all duration-200 font-semibold"
                  >
                    <option value="COMPLETED">Completed (Paid)</option>
                    <option value="PENDING">Pending Approval</option>
                    <option value="FAILED">Failed</option>
                    <option value="OVERDUE">Overdue</option>
                  </select>
                </div>

                <div className="flex items-center justify-end gap-3 border-t border-border pt-4 mt-6">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl font-bold text-sm bg-surface hover:bg-surface-hover border border-border transition-all duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2.5 rounded-xl font-bold text-sm text-white bg-gradient-primary hover:opacity-95 shadow-md shadow-primary/10 transition-all duration-200"
                  >
                    Record Invoice
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
