import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Calendar, Activity, CreditCard, Mail, Clock } from "lucide-react";
import { Button } from "../../components/ui/button";

interface MemberDrawerProps {
  member: any | null;
  isOpen: boolean;
  onClose: () => void;
}

export const MemberDrawer: React.FC<MemberDrawerProps> = ({ member, isOpen, onClose }) => {
  if (!member) return null;

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
            <div className="flex items-center justify-between p-6 border-b border-border bg-surface/50 backdrop-blur-md sticky top-0">
              <h3 className="text-xl font-bold flex items-center gap-3">
                Member Profile
              </h3>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-surface-hover text-muted hover:text-foreground transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 space-y-8">
              {/* Header Info */}
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-2xl bg-gradient-primary flex items-center justify-center text-white font-extrabold text-2xl shadow-md">
                  {member.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-2xl font-extrabold">{member.name}</h2>
                  <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/20">
                    {member.role.replace("_", " ")}
                  </span>
                </div>
              </div>

              {/* Quick Contact */}
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-muted uppercase tracking-wider">Contact & Info</h4>
                <div className="bg-surface-hover rounded-xl p-4 space-y-4">
                  <div className="flex items-center gap-3 text-sm">
                    <Mail className="h-4 w-4 text-primary" />
                    <span className="text-foreground">{member.email}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Calendar className="h-4 w-4 text-primary" />
                    <span className="text-foreground">Joined {new Date(member.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              {/* Stats / Tracking */}
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-muted uppercase tracking-wider">Activity Tracking</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-surface-hover rounded-xl p-4 border border-border/50 text-center">
                    <Activity className="h-5 w-5 text-emerald-500 mx-auto mb-2" />
                    <div className="text-xl font-extrabold">{member.memberProfile?.attendanceCount || 0}</div>
                    <div className="text-xs text-muted font-medium">Classes Attended</div>
                  </div>
                  <div className="bg-surface-hover rounded-xl p-4 border border-border/50 text-center">
                    <Clock className="h-5 w-5 text-amber-500 mx-auto mb-2" />
                    <div className="text-xl font-extrabold">-</div>
                    <div className="text-xs text-muted font-medium">Next Session</div>
                  </div>
                </div>
              </div>

              {/* Physical Profile Details */}
              {(member.memberProfile?.age || member.memberProfile?.gender || member.memberProfile?.weight || member.memberProfile?.height) && (
                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-muted uppercase tracking-wider">Physical Attributes</h4>
                  <div className="bg-surface-hover rounded-xl p-4 grid grid-cols-2 gap-4 text-xs font-semibold">
                    {member.memberProfile?.age && (
                      <div>
                        <span className="text-muted block">Age</span>
                        <span className="text-foreground text-sm font-extrabold">{member.memberProfile.age} yrs</span>
                      </div>
                    )}
                    {member.memberProfile?.gender && (
                      <div>
                        <span className="text-muted block">Gender</span>
                        <span className="text-foreground text-sm font-extrabold">{member.memberProfile.gender}</span>
                      </div>
                    )}
                    {member.memberProfile?.weight && (
                      <div>
                        <span className="text-muted block">Weight</span>
                        <span className="text-foreground text-sm font-extrabold">{member.memberProfile.weight} kg</span>
                      </div>
                    )}
                    {member.memberProfile?.height && (
                      <div>
                        <span className="text-muted block">Height</span>
                        <span className="text-foreground text-sm font-extrabold">{member.memberProfile.height} cm</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Emergency Contact */}
              {member.memberProfile?.emergencyContact?.name && (
                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-muted uppercase tracking-wider">Emergency Contact</h4>
                  <div className="bg-surface-hover rounded-xl p-4 space-y-2 text-xs font-semibold">
                    <div className="flex justify-between">
                      <span className="text-muted">Contact Name:</span>
                      <span className="text-foreground font-extrabold">{member.memberProfile.emergencyContact.name}</span>
                    </div>
                    {member.memberProfile.emergencyContact.relation && (
                      <div className="flex justify-between">
                        <span className="text-muted">Relationship:</span>
                        <span className="text-foreground font-extrabold">{member.memberProfile.emergencyContact.relation}</span>
                      </div>
                    )}
                    {member.memberProfile.emergencyContact.phone && (
                      <div className="flex justify-between">
                        <span className="text-muted">Phone Number:</span>
                        <span className="text-foreground font-extrabold">{member.memberProfile.emergencyContact.phone}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Payment / Membership Plan Info */}
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-muted uppercase tracking-wider">Membership Plan</h4>
                <div className="bg-gradient-to-br from-primary/10 to-transparent border border-primary/20 rounded-xl p-5">
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-bold text-primary flex items-center gap-2">
                      <CreditCard className="h-4 w-4" />
                      {member.memberProfile?.planId?.name || "No Plan Tier Assigned"}
                    </div>
                    {member.memberProfile?.planId && (
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500">
                        {member.memberProfile?.status || "ACTIVE"}
                      </span>
                    )}
                  </div>
                  {member.memberProfile?.planId ? (
                    <div className="text-xs space-y-1">
                      <p className="text-muted">
                        Price: <span className="font-bold text-foreground">${member.memberProfile.planId.price}</span>
                      </p>
                      <p className="text-muted">
                        Duration: <span className="font-bold text-foreground">{member.memberProfile.planId.durationInMonths} month(s)</span>
                      </p>
                    </div>
                  ) : (
                    <p className="text-sm text-muted">Pay-as-you-go / drop-in membership tier rates apply.</p>
                  )}
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-border bg-surface">
              <Button className="w-full" variant="secondary" onClick={onClose}>
                Close Profile
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
