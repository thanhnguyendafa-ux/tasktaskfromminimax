"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Users, UserPlus, MessageSquare, Trophy, Crown, Eye, Edit, Plus } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { Avatar } from "@/components/ui/Avatar";

interface TeamMember {
  id: string;
  name: string;
  avatar?: string;
  role: "admin" | "editor" | "viewer";
  xp: number;
  tasksCompleted: number;
  isOnline: boolean;
}

interface SharedTask {
  id: string;
  title: string;
  assignedTo: string[];
  status: "pending" | "in_progress" | "completed";
  dueDate: string;
}

interface TeamWorkspaceProps {
  teamName: string;
  members: TeamMember[];
  tasks: SharedTask[];
  currentUserId: string;
  onInviteMember: (email: string) => void;
  onAssignTask: (taskId: string, userId: string) => void;
  onCreateTask: (task: Partial<SharedTask>) => void;
}

export function TeamWorkspace({
  teamName,
  members,
  tasks,
  currentUserId,
  onInviteMember,
  onAssignTask,
  onCreateTask,
}: TeamWorkspaceProps) {
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showCreateTaskModal, setShowCreateTaskModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);

  const currentUser = members.find((m) => m.id === currentUserId);
  const totalTeamXP = members.reduce((acc, m) => acc + m.xp, 0);

  const handleInvite = () => {
    if (inviteEmail.trim()) {
      onInviteMember(inviteEmail);
      setInviteEmail("");
      setShowInviteModal(false);
    }
  };

  const handleCreateTask = () => {
    if (newTaskTitle.trim()) {
      onCreateTask({
        title: newTaskTitle,
        assignedTo: selectedMembers,
        status: "pending",
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      });
      setNewTaskTitle("");
      setSelectedMembers([]);
      setShowCreateTaskModal(false);
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "admin":
        return <Crown className="w-4 h-4 text-yellow-400" />;
      case "editor":
        return <Edit className="w-4 h-4 text-blue-400" />;
      case "viewer":
        return <Eye className="w-4 h-4 text-gray-400" />;
      default:
        return null;
    }
  };

  return (
    <>
      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-accent-primary" />
            <h3 className="text-lg font-semibold text-text-primary">{teamName}</h3>
          </div>
          <Badge variant="success">
            <Users className="w-3 h-3 mr-1" />
            {members.length} members
          </Badge>
        </div>

        {/* Team Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
          <div className="p-3 bg-dark-tertiary rounded-xl text-center">
            <p className="text-xl font-bold text-accent-primary">{totalTeamXP.toLocaleString()}</p>
            <p className="text-xs text-text-muted">Team XP</p>
          </div>
          <div className="p-3 bg-dark-tertiary rounded-xl text-center">
            <p className="text-xl font-bold text-green-400">
              {members.reduce((acc, m) => acc + m.tasksCompleted, 0)}
            </p>
            <p className="text-xs text-text-muted">Tasks Done</p>
          </div>
          <div className="p-3 bg-dark-tertiary rounded-xl text-center">
            <p className="text-xl font-bold text-yellow-400">
              {members.filter((m) => m.isOnline).length}
            </p>
            <p className="text-xs text-text-muted">Online</p>
          </div>
        </div>

        {/* Members List */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-text-primary">👥 Members</span>
            <Button variant="ghost" size="sm" onClick={() => setShowInviteModal(true)}>
              <UserPlus className="w-4 h-4" />
              Invite
            </Button>
          </div>
          <div className="space-y-2">
            {members.map((member) => (
              <motion.div
                key={member.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-3 p-3 bg-dark-tertiary rounded-xl"
              >
                <div className="relative">
                  <Avatar name={member.name} size="sm" />
                  {member.isOnline && (
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-dark-secondary" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-text-primary">{member.name}</span>
                    {getRoleIcon(member.role)}
                  </div>
                  <p className="text-xs text-text-muted">
                    {member.xp.toLocaleString()} XP • {member.tasksCompleted} tasks
                  </p>
                </div>
                <Trophy className="w-4 h-4 text-accent-gold" />
              </motion.div>
            ))}
          </div>
        </div>

        {/* Team Tasks */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-text-primary">📋 Team Tasks</span>
            <Button variant="ghost" size="sm" onClick={() => setShowCreateTaskModal(true)}>
              <Plus className="w-4 h-4" />
              Create
            </Button>
          </div>
          <div className="space-y-2">
            {tasks.map((task) => (
              <div
                key={task.id}
                className="p-3 bg-dark-tertiary rounded-xl flex items-center gap-3"
              >
                <div className="flex-1">
                  <p className="font-medium text-text-primary">{task.title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge
                      variant={
                        task.status === "completed"
                          ? "success"
                          : task.status === "in_progress"
                          ? "warning"
                          : "default"
                      }
                    >
                      {task.status}
                    </Badge>
                    <span className="text-xs text-text-muted">
                      Due: {new Date(task.dueDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="flex -space-x-2">
                  {task.assignedTo.slice(0, 3).map((userId) => {
                    const user = members.find((m) => m.id === userId);
                    return user ? (
                      <Avatar key={userId} name={user.name} size="sm" />
                    ) : null;
                  })}
                  {task.assignedTo.length > 3 && (
                    <div className="w-8 h-8 rounded-full bg-dark-secondary flex items-center justify-center text-xs text-text-muted">
                      +{task.assignedTo.length - 3}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Team Chat */}
        <div className="p-3 bg-dark-tertiary rounded-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-text-primary">💬 Team Chat</span>
            <Badge variant="default">3 unread</Badge>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex gap-2">
              <span className="text-accent-primary font-medium">John:</span>
              <span className="text-text-secondary">Task updated!</span>
            </div>
            <div className="flex gap-2">
              <span className="text-green-400 font-medium">Sarah:</span>
              <span className="text-text-secondary">Great work team! 🎉</span>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="w-full mt-2">
            Open Chat
          </Button>
        </div>
      </Card>

      {/* Invite Modal */}
      <Modal isOpen={showInviteModal} onClose={() => setShowInviteModal(false)} title="Invite Team Member">
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-text-secondary mb-2">Email Address</label>
            <input
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="colleague@company.com"
              className="w-full px-4 py-2 bg-dark-tertiary rounded-lg text-text-primary placeholder-text-muted"
            />
          </div>
          <div className="flex gap-3">
            <Button variant="ghost" onClick={() => setShowInviteModal(false)} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleInvite} className="flex-1">
              <UserPlus className="w-4 h-4 mr-2" />
              Send Invite
            </Button>
          </div>
        </div>
      </Modal>

      {/* Create Task Modal */}
      <Modal isOpen={showCreateTaskModal} onClose={() => setShowCreateTaskModal(false)} title="Create Team Task">
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-text-secondary mb-2">Task Title</label>
            <input
              type="text"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              placeholder="e.g., Q1 Planning"
              className="w-full px-4 py-2 bg-dark-tertiary rounded-lg text-text-primary placeholder-text-muted"
            />
          </div>
          <div>
            <label className="block text-sm text-text-secondary mb-2">Assign To</label>
            <div className="flex flex-wrap gap-2">
              {members.map((member) => (
                <motion.button
                  key={member.id}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setSelectedMembers((prev) =>
                      prev.includes(member.id)
                        ? prev.filter((id) => id !== member.id)
                        : [...prev, member.id]
                    );
                  }}
                  className={`px-3 py-1 rounded-full text-sm ${
                    selectedMembers.includes(member.id)
                      ? "bg-accent-primary text-white"
                      : "bg-dark-tertiary text-text-secondary"
                  }`}
                >
                  {member.name}
                </motion.button>
              ))}
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="ghost" onClick={() => setShowCreateTaskModal(false)} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleCreateTask} className="flex-1">
              <Plus className="w-4 h-4 mr-2" />
              Create Task
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
