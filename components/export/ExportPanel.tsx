"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Download, FileJson, FileSpreadsheet, FileText, Calendar, Check, X } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { Task } from "@/types";

interface ExportPanelProps {
  tasks: Task[];
  profile: {
    id: string;
    display_name: string;
    email: string;
  };
}

export function ExportPanel({ tasks, profile }: ExportPanelProps) {
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportFormat, setExportFormat] = useState<"json" | "csv" | "ical">("json");
  const [exporting, setExporting] = useState(false);
  const [exported, setExported] = useState(false);

  const handleExport = async () => {
    setExporting(true);

    // Simulate export process
    await new Promise((resolve) => setTimeout(resolve, 1000));

    let content: string;
    let filename: string;
    let mimeType: string;

    switch (exportFormat) {
      case "json":
        content = JSON.stringify(
          {
            exportDate: new Date().toISOString(),
            user: {
              id: profile.id,
              name: profile.display_name,
              email: profile.email,
            },
            tasks: tasks.map((task) => ({
              id: task.id,
              title: task.title,
              description: task.description,
              status: task.status,
              priority: task.priority,
              dueDate: task.due_date,
              tallyCount: task.tally_count,
              pomodoroCount: task.pomodoro_count,
              totalTimeSeconds: task.total_time_seconds,
              createdAt: task.created_at,
              updatedAt: task.updated_at,
              tags: task.tags?.map((t) => t.name) || [],
            })),
          },
          null,
          2
        );
        filename = `tasktask-backup-${new Date().toISOString().split("T")[0]}.json`;
        mimeType = "application/json";
        break;

      case "csv":
        const headers = ["ID", "Title", "Description", "Status", "Priority", "Due Date", "Tally", "Pomodoro", "Time (s)", "Created At"];
        const rows = tasks.map((task) => [
          task.id,
          `"${task.title}"`,
          `"${task.description || ""}"`,
          task.status,
          task.priority,
          task.due_date || "",
          task.tally_count,
          task.pomodoro_count,
          task.total_time_seconds,
          task.created_at,
        ]);
        content = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
        filename = `tasktask-tasks-${new Date().toISOString().split("T")[0]}.csv`;
        mimeType = "text/csv";
        break;

      case "ical":
        let icalContent = "BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//TaskTask//EN\n";
        tasks
          .filter((t) => t.due_date)
          .forEach((task) => {
            icalContent += "BEGIN:VEVENT\n";
            icalContent += `UID:${task.id}\n`;
            icalContent += `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, "").split(".")[0]}Z\n`;
            icalContent += `SUMMARY:${task.title}\n`;
            icalContent += `DESCRIPTION:${task.description || ""}\n`;
            icalContent += `DTSTART:${task.due_date?.replace(/[-:]/g, "").slice(0, 8)}\n`;
            icalContent += `DTEND:${task.due_date?.replace(/[-:]/g, "").slice(0, 8)}\n`;
            icalContent += "END:VEVENT\n";
          });
        icalContent += "END:VCALENDAR";
        content = icalContent;
        filename = `tasktask-calendar-${new Date().toISOString().split("T")[0]}.ics`;
        mimeType = "text/calendar";
        break;
    }

    // Download file
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setExporting(false);
    setExported(true);
    setTimeout(() => setExported(false), 2000);
  };

  const formatCounts = {
    json: `${tasks.length} tasks`,
    csv: `${tasks.length} tasks`,
    ical: `${tasks.filter((t) => t.due_date).length} events`,
  };

  return (
    <>
      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Download className="w-5 h-5 text-accent-primary" />
            <h3 className="text-lg font-semibold text-text-primary">Export & Backup</h3>
          </div>
          <Badge variant="default">{tasks.length} items</Badge>
        </div>

        {/* Quick Export */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => { setExportFormat("json"); setShowExportModal(true); }}
            className="p-4 bg-dark-tertiary rounded-xl text-center hover:bg-opacity-80"
          >
            <FileJson className="w-8 h-8 text-blue-400 mx-auto mb-2" />
            <p className="text-sm font-medium text-text-primary">JSON</p>
            <p className="text-xs text-text-muted">Full backup</p>
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => { setExportFormat("csv"); setShowExportModal(true); }}
            className="p-4 bg-dark-tertiary rounded-xl text-center hover:bg-opacity-80"
          >
            <FileSpreadsheet className="w-8 h-8 text-green-400 mx-auto mb-2" />
            <p className="text-sm font-medium text-text-primary">CSV</p>
            <p className="text-xs text-text-muted">Spreadsheet</p>
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => { setExportFormat("ical"); setShowExportModal(true); }}
            className="p-4 bg-dark-tertiary rounded-xl text-center hover:bg-opacity-80"
          >
            <Calendar className="w-8 h-8 text-orange-400 mx-auto mb-2" />
            <p className="text-sm font-medium text-text-primary">iCal</p>
            <p className="text-xs text-text-muted">Calendar</p>
          </motion.button>
        </div>

        {/* Auto Backup Info */}
        <div className="p-3 bg-dark-tertiary rounded-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-text-primary">💾 Auto Backup</span>
            <Badge variant="success">Active</Badge>
          </div>
          <div className="space-y-1 text-xs text-text-muted">
            <p>• Daily: Incremental backup</p>
            <p>• Weekly: Full backup (Sunday)</p>
            <p>• Monthly: Archive (1st of month)</p>
          </div>
        </div>

        {/* Last Export */}
        <div className="mt-4 pt-4 border-t border-dark-tertiary">
          <div className="flex items-center justify-between">
            <span className="text-sm text-text-muted">Last export: Never</span>
            <Button variant="ghost" size="sm" onClick={() => setShowExportModal(true)}>
              Export Now
            </Button>
          </div>
        </div>
      </Card>

      {/* Export Modal */}
      <Modal isOpen={showExportModal} onClose={() => setShowExportModal(false)} title="Export Data">
        <div className="space-y-4">
          <div className="p-4 bg-dark-tertiary rounded-xl">
            <div className="flex items-center gap-3 mb-3">
              {exportFormat === "json" && <FileJson className="w-8 h-8 text-blue-400" />}
              {exportFormat === "csv" && <FileSpreadsheet className="w-8 h-8 text-green-400" />}
              {exportFormat === "ical" && <Calendar className="w-8 h-8 text-orange-400" />}
              <div>
                <p className="font-medium text-text-primary">
                  {exportFormat === "json" && "JSON Format"}
                  {exportFormat === "csv" && "CSV Format"}
                  {exportFormat === "ical" && "iCal Format"}
                </p>
                <p className="text-sm text-text-muted">{formatCounts[exportFormat]}</p>
              </div>
            </div>
            <p className="text-xs text-text-muted">
              {exportFormat === "json" && "Complete backup including all task data, tags, and timestamps."}
              {exportFormat === "csv" && "Spreadsheet-compatible format for Excel, Google Sheets."}
              {exportFormat === "ical" && "Calendar events for Google Calendar, Apple Calendar, Outlook."}
            </p>
          </div>

          <div className="flex gap-2">
            {(["json", "csv", "ical"] as const).map((fmt) => (
              <Button
                key={fmt}
                variant={exportFormat === fmt ? "primary" : "ghost"}
                size="sm"
                onClick={() => setExportFormat(fmt)}
                className="flex-1"
              >
                {fmt.toUpperCase()}
              </Button>
            ))}
          </div>

          <div className="flex gap-3 pt-4">
            <Button variant="ghost" onClick={() => setShowExportModal(false)} className="flex-1">
              Cancel
            </Button>
            <Button
              onClick={handleExport}
              disabled={exporting}
              className="flex-1"
            >
              {exporting ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1 }}
                    className="w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2 inline-block"
                  />
                  Exporting...
                </>
              ) : exported ? (
                <>
                  <Check className="w-4 h-4 mr-2 inline-block" />
                  Exported!
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2 inline-block" />
                  Export
                </>
              )}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
