"use client";

import React from "react";
import { TaskListView } from "./TaskListView";
import { TaskKanbanView } from "./TaskKanbanView";
import { TaskCalendarView } from "./TaskCalendarView";
import { TaskGalleryView } from "./TaskGalleryView";
import { TaskGanttView } from "./TaskGanttView";
import { TaskTimelineView } from "./TaskTimelineView";
import { TaskDatabaseView } from "./TaskDatabaseView";
import { Task } from "@/types";
import { ViewType } from "@/types";

interface TaskViewFactoryProps {
  view: ViewType;
  tasks: Task[];
  onComplete: (id: string) => void;
  onTally: (id: string) => void;
  onPomodoro: (id: string) => void;
  onTimer: (id: string) => void;
  onStatusChange: (taskId: string, status: Task["status"]) => void;
  onClick: (task: Task) => void;
}

export function TaskViewFactory({
  view,
  tasks,
  onComplete,
  onTally,
  onPomodoro,
  onTimer,
  onStatusChange,
  onClick,
}: TaskViewFactoryProps) {
  switch (view) {
    case "list":
      return (
        <TaskListView
          tasks={tasks}
          onComplete={onComplete}
          onTally={onTally}
          onPomodoro={onPomodoro}
          onTimer={onTimer}
          onClick={onClick}
        />
      );

    case "kanban":
      return (
        <TaskKanbanView
          tasks={tasks}
          onComplete={onComplete}
          onTally={onTally}
          onPomodoro={onPomodoro}
          onTimer={onTimer}
          onStatusChange={onStatusChange}
          onClick={onClick}
        />
      );

    case "calendar":
      return (
        <TaskCalendarView
          tasks={tasks}
          onClick={onClick}
        />
      );

    case "gallery":
      return (
        <TaskGalleryView
          tasks={tasks}
          onComplete={onComplete}
          onTally={onTally}
          onPomodoro={onPomodoro}
          onTimer={onTimer}
          onClick={onClick}
        />
      );

    case "gantt":
      return (
        <TaskGanttView
          tasks={tasks}
          onClick={onClick}
        />
      );

    case "timeline":
      return (
        <TaskTimelineView
          tasks={tasks}
          onClick={onClick}
        />
      );

    case "database":
      return (
        <TaskDatabaseView
          tasks={tasks}
          onClick={onClick}
        />
      );

    case "main":
    default:
      return (
        <TaskListView
          tasks={tasks}
          onComplete={onComplete}
          onTally={onTally}
          onPomodoro={onPomodoro}
          onTimer={onTimer}
          onClick={onClick}
        />
      );
  }
}
