import React, { useState } from "react";
import { useAuthStore } from "../../store/authStore";
import { Users, Loader2, UserPlus } from "lucide-react";
import { axiosInstance } from "../../lib/axios";
import { useQuery } from "@tanstack/react-query";
import { Button } from "../../components/ui/button";
import { AddMemberModal } from "./AddMemberModal";
import { MemberTable } from "./MemberTable";
import { MemberDrawer } from "./MemberDrawer";

export const MembersPage: React.FC = () => {
  const { user } = useAuthStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<any | null>(null);

  const isAuthorized = user?.role === "GYM_OWNER" || user?.role === "GYM_ADMIN" || user?.role === "TRAINER";

  const { data: members = [], isLoading, isError } = useQuery({
    queryKey: ["members"],
    queryFn: async () => {
      const response = await axiosInstance.get("/members");
      return response.data.data || [];
    },
    enabled: isAuthorized,
  });

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
        <MemberTable 
          members={members} 
          onRowClick={(member) => setSelectedMember(member)} 
        />
      )}

      <AddMemberModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />

      <MemberDrawer
        member={selectedMember}
        isOpen={!!selectedMember}
        onClose={() => setSelectedMember(null)}
      />
    </div>
  );
};
