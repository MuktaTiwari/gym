import React, { useState } from "react";
import { motion } from "framer-motion";
import { 
  MoreHorizontal, 
  ShieldCheck, 
  Eye, 
  Edit, 
  UserMinus, 
  Trash2, 
  Send 
} from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface MemberTableProps {
  members: any[];
  onRowClick: (member: any) => void;
  onEdit: (member: any) => void;
  onSuspend: (member: any) => void;
  onDelete: (member: any) => void;
  onSendNotification: (member: any) => void;
}

export const MemberTable: React.FC<MemberTableProps> = ({ 
  members, 
  onRowClick,
  onEdit,
  onSuspend,
  onDelete,
  onSendNotification
}) => {
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

  return (
    <div className="bg-surface border border-border rounded-xl overflow-visible shadow-sm">
      <div className="overflow-x-auto overflow-y-visible">
        <table className="w-full text-left min-w-[1000px]">
          <thead className="bg-surface-hover border-b border-border text-[11px] uppercase text-muted font-extrabold tracking-wider">
            <tr>
              <th className="px-6 py-4">Member Info</th>
              <th className="px-6 py-4">Phone</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Membership Plan</th>
              <th className="px-6 py-4">Expiry Date</th>
              <th className="px-6 py-4">Assigned Trainer</th>
              <th className="px-6 py-4">Joined</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50 overflow-visible">
            {members.map((member, idx) => {
              const name = member.fullName || member.name || "Unknown Member";
              const email = member.email || "No Email";
              const phone = member.phone || "N/A";
              const status = member.status || member.memberProfile?.status || "ACTIVE";
              const planName = member.planId?.name || member.membershipPlan || "No Plan";
              const trainerName = member.assignedTrainerId?.fullName || member.assignedTrainerId?.name || member.assignedTrainer || "Unassigned";
              const joinDate = member.membershipStartDate || member.joinDate || member.createdAt;
              const endDateStr = member.membershipEndDate;

              // Calculate Expiry Date Highlight
              let expiryColor = "text-muted font-medium";
              let expiryStatusText = "";
              if (endDateStr) {
                const endDate = new Date(endDateStr);
                const today = new Date();
                const diffTime = endDate.getTime() - today.getTime();
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                if (diffDays < 0 || status === "EXPIRED") {
                  expiryColor = "text-destructive font-bold";
                  expiryStatusText = " (Expired)";
                } else if (diffDays <= 7) {
                  expiryColor = "text-amber-500 font-bold";
                  expiryStatusText = ` (${diffDays}d left)`;
                }
              }

              const isLastRows = idx >= members.length - 2 && members.length >= 3;

              return (
                <motion.tr
                  key={member._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  onClick={() => onRowClick(member)}
                  className="hover:bg-surface-hover/60 transition-colors cursor-pointer group overflow-visible"
                >
                  {/* Info */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 text-primary flex items-center justify-center font-bold">
                        {name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-bold text-foreground">{name}</div>
                        <div className="text-xs text-muted font-medium">{email}</div>
                      </div>
                    </div>
                  </td>

                  {/* Phone */}
                  <td className="px-6 py-4 text-xs font-semibold text-foreground">
                    {phone}
                  </td>

                  {/* Status */}
                  <td className="px-6 py-4">
                    {(() => {
                      let badgeClass = "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
                      let dotClass = "bg-emerald-500";
                      
                      if (status === "PAUSED") {
                        badgeClass = "bg-amber-500/10 text-amber-500 border-amber-500/20";
                        dotClass = "bg-amber-500";
                      } else if (status === "EXPIRED" || status === "CANCELLED" || status === "INACTIVE") {
                        badgeClass = "bg-destructive/10 text-destructive border-destructive/20";
                        dotClass = "bg-destructive";
                      }
                      
                      return (
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border ${badgeClass}`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${dotClass} animate-pulse`} />
                          {status}
                        </span>
                      );
                    })()}
                  </td>

                  {/* Plan Badge */}
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-primary/10 text-primary border border-primary/20">
                      {planName}
                    </span>
                  </td>

                  {/* Expiry Date */}
                  <td className="px-6 py-4 text-xs">
                    <span className={expiryColor}>
                      {endDateStr ? (
                        <>
                          {new Date(endDateStr).toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                          {expiryStatusText}
                        </>
                      ) : (
                        "Open-ended"
                      )}
                    </span>
                  </td>

                  {/* Trainer */}
                  <td className="px-6 py-4">
                    <span className={`text-xs font-semibold ${trainerName === "Unassigned" ? "text-muted" : "text-foreground"}`}>
                      {trainerName}
                    </span>
                  </td>

                  {/* Joined */}
                  <td className="px-6 py-4 text-xs font-medium text-muted">
                    {new Date(joinDate).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </td>

                  {/* Actions Dropdown */}
                  <td className="px-6 py-4 text-right overflow-visible" onClick={(e) => e.stopPropagation()}>
                    <Popover
                      open={openDropdownId === member._id}
                      onOpenChange={(open) => setOpenDropdownId(open ? member._id : null)}
                    >
                      <PopoverTrigger asChild>
                        <button 
                          className="p-2 rounded-lg text-muted hover:text-foreground hover:bg-surface-hover transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100 bg-surface/50 border border-border"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </button>
                      </PopoverTrigger>
                      <PopoverContent 
                        align="end" 
                        sideOffset={4}
                        className="w-48 bg-surface border border-border rounded-xl shadow-lg z-50 py-1.5 text-left divide-y divide-border/50 animate-in fade-in zoom-in-95 duration-100 p-0 overflow-hidden"
                      >
                        <div className="py-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onRowClick(member);
                              setOpenDropdownId(null);
                            }}
                            className="w-full px-4 py-2 text-xs font-semibold text-foreground hover:bg-surface-hover transition-colors flex items-center gap-2"
                          >
                            <Eye size={14} className="text-muted" />
                            View Profile
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onEdit(member);
                              setOpenDropdownId(null);
                            }}
                            className="w-full px-4 py-2 text-xs font-semibold text-foreground hover:bg-surface-hover transition-colors flex items-center gap-2"
                          >
                            <Edit size={14} className="text-muted" />
                            Edit Member
                          </button>
                        </div>
                        <div className="py-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onSuspend(member);
                              setOpenDropdownId(null);
                            }}
                            className="w-full px-4 py-2 text-xs font-semibold text-amber-500 hover:bg-amber-500/5 transition-colors flex items-center gap-2"
                          >
                            <UserMinus size={14} />
                            Suspend Member
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onDelete(member);
                              setOpenDropdownId(null);
                            }}
                            className="w-full px-4 py-2 text-xs font-semibold text-destructive hover:bg-destructive/5 transition-colors flex items-center gap-2"
                          >
                            <Trash2 size={14} />
                            Delete Member
                          </button>
                        </div>
                        <div className="py-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onSendNotification(member);
                              setOpenDropdownId(null);
                            }}
                            className="w-full px-4 py-2 text-xs font-semibold text-primary hover:bg-primary/5 transition-colors flex items-center gap-2"
                          >
                            <Send size={14} />
                            Send Notification
                          </button>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
