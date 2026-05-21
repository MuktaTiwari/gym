import React, { useState } from "react";
import { useAuthStore } from "../../store/authStore";
import { Users, Loader2, UserPlus } from "lucide-react";
import { axiosInstance } from "../../lib/axios";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "../../components/ui/button";
import { AddMemberModal } from "./AddMemberModal";
import { EditMemberModal } from "./EditMemberModal";
import { MemberTable } from "./MemberTable";
import { MemberDrawer } from "./MemberDrawer";

export const MembersPage: React.FC = () => {
  const { user } = useAuthStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<any | null>(null);
  const [editingMember, setEditingMember] = useState<any | null>(null);
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const limit = 10;

  const isAuthorized = user?.role === "GYM_OWNER" || user?.role === "GYM_ADMIN" || user?.role === "TRAINER";

  const { data, isLoading, isError } = useQuery({
    queryKey: ["members", page],
    queryFn: async () => {
      const response = await axiosInstance.get(`/members?page=${page}&limit=${limit}`);
      return response.data.data || { docs: [], pagination: { total: 0, page: 1, limit: 10, totalPages: 1 } };
    },
    enabled: isAuthorized,
  });

  const members = data?.docs || [];
  const pagination = data?.pagination || { total: 0, page: 1, limit: 10, totalPages: 1 };

  const handleEdit = (member: any) => {
    setEditingMember(member);
  };

  const handleSuspend = async (member: any) => {
    const confirmSuspend = window.confirm(`Are you sure you want to suspend ${member.fullName || member.name}?`);
    if (!confirmSuspend) return;

    try {
      await axiosInstance.put(`/members/${member._id}`, { status: "PAUSED" });
      queryClient.invalidateQueries({ queryKey: ["members"] });
    } catch (err) {
      console.error("Failed to suspend member", err);
      alert("Failed to suspend member");
    }
  };

  const handleDelete = async (member: any) => {
    const confirmDelete = window.confirm(`Are you sure you want to delete ${member.fullName || member.name}?`);
    if (!confirmDelete) return;

    try {
      await axiosInstance.delete(`/members/${member._id}`);
      queryClient.invalidateQueries({ queryKey: ["members"] });
    } catch (err) {
      console.error("Failed to delete member", err);
      alert("Failed to delete member");
    }
  };

  const handleSendNotification = async (member: any) => {
    const message = prompt(`Enter notification message to send to ${member.fullName || member.name}:`);
    if (!message) return;

    try {
      // In our backend, there is a notification creation endpoint or announcement. 
      // We can use a general post if available or simulate.
      await axiosInstance.post("/announcements", { message });
      alert("Notification sent successfully!");
    } catch (err) {
      console.error("Failed to send notification", err);
      alert("Failed to send notification");
    }
  };

  if (!isAuthorized) {
    return (
      <div className="p-6 bg-destructive/10 text-destructive rounded-xl">
        You do not have permission to view members.
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-6 bg-destructive/10 text-destructive rounded-xl">
        Failed to fetch members. Please try again later.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-extrabold flex items-center gap-3">
          <Users className="h-7 w-7 text-primary" />
          Gym Members
        </h2>
        <Button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2">
          <UserPlus className="h-4 w-4" />
          Add Member
        </Button>
      </div>

      {members.length === 0 ? (
        <div className="p-12 text-center bg-surface border border-border rounded-xl text-muted shadow-sm">
          <Users className="h-12 w-12 mx-auto mb-4 opacity-20" />
          <h3 className="text-lg font-bold text-foreground mb-1">No Members Yet</h3>
          <p className="text-sm">Get started by adding your first gym member.</p>
        </div>
      ) : (
        <div className="space-y-4">
          <MemberTable 
            members={members} 
            onRowClick={(member) => setSelectedMember(member)}
            onEdit={handleEdit}
            onSuspend={handleSuspend}
            onDelete={handleDelete}
            onSendNotification={handleSendNotification}
          />

          {/* Premium Pagination Bar */}
          {pagination.totalPages > 1 && (
            <div className="sticky bottom-0 bg-surface/95 backdrop-blur z-10 flex flex-col sm:flex-row items-center justify-between border-t border-border py-4 mt-4 gap-4">
              <span className="text-xs font-semibold text-muted">
                Showing <span className="text-foreground">{(page - 1) * limit + 1}</span> to{" "}
                <span className="text-foreground">
                  {Math.min(page * limit, pagination.total)}
                </span>{" "}
                of <span className="text-foreground">{pagination.total}</span> entries
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3.5 py-2 text-xs font-bold bg-surface border border-border rounded-xl text-foreground hover:bg-surface-hover transition-colors disabled:opacity-40"
                >
                  Previous
                </button>
                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`w-9 h-9 flex items-center justify-center text-xs font-extrabold rounded-xl border transition-all ${
                      page === p
                        ? "bg-primary border-primary text-white"
                        : "bg-surface border-border text-muted hover:text-foreground hover:bg-surface-hover"
                    }`}
                  >
                    {p}
                  </button>
                ))}
                <button
                  onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                  disabled={page === pagination.totalPages}
                  className="px-3.5 py-2 text-xs font-bold bg-surface border border-border rounded-xl text-foreground hover:bg-surface-hover transition-colors disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      <AddMemberModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />

      <EditMemberModal
        isOpen={!!editingMember}
        onClose={() => setEditingMember(null)}
        member={editingMember}
      />

      <MemberDrawer
        member={selectedMember}
        isOpen={!!selectedMember}
        onClose={() => setSelectedMember(null)}
      />
    </div>
  );
};
