import React from "react";
import { motion } from "framer-motion";
import { MoreHorizontal, ShieldCheck } from "lucide-react";

interface MemberTableProps {
  members: any[];
  onRowClick: (member: any) => void;
}

export const MemberTable: React.FC<MemberTableProps> = ({ members, onRowClick }) => {
  return (
    <div className="bg-surface border border-border rounded-xl overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-surface-hover border-b border-border text-[11px] uppercase text-muted font-extrabold tracking-wider">
            <tr>
              <th className="px-6 py-4">Member Info</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Role</th>
              <th className="px-6 py-4">Joined</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {members.map((member, idx) => (
              <motion.tr
                key={member._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                onClick={() => onRowClick(member)}
                className="hover:bg-surface-hover/60 transition-colors cursor-pointer group"
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 text-primary flex items-center justify-center font-bold">
                      {member.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-bold text-foreground">{member.name}</div>
                      <div className="text-xs text-muted font-medium">{member.email}</div>
                    </div>
                  </div>
                </td>
                 <td className="px-6 py-4">
                  {(() => {
                    const status = member.memberProfile?.status || "ACTIVE";
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
                <td className="px-6 py-4">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-muted">
                    {member.role === "GYM_OWNER" && <ShieldCheck className="h-3.5 w-3.5 text-primary" />}
                    {member.role.replace("_", " ")}
                  </div>
                </td>
                <td className="px-6 py-4 text-xs font-medium text-muted">
                  {new Date(member.createdAt).toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="p-2 rounded-lg text-muted hover:text-foreground hover:bg-surface transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100">
                    <MoreHorizontal className="h-4 w-4" />
                  </button>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
