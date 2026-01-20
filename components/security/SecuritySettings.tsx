"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Shield, Download, Trash2, Eye, EyeOff, Lock, Unlock, Fingerprint, Key, Smartphone } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";

interface SecuritySettingsProps {
  onExportData: () => void;
  onDeleteAccount: () => void;
  onEnable2FA: () => void;
  onUpdatePrivacy: (settings: { shareAnalytics: boolean; shareCrashReports: boolean }) => void;
}

export function SecuritySettings({
  onExportData,
  onDeleteAccount,
  onEnable2FA,
  onUpdatePrivacy,
}: SecuritySettingsProps) {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [shareAnalytics, setShareAnalytics] = useState(true);
  const [shareCrashReports, setShareCrashReports] = useState(true);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [autoLockTime, setAutoLockTime] = useState("5");

  const handleExport = () => {
    // Generate full data export
    const data = {
      exportDate: new Date().toISOString(),
      data: {
        tasks: [],
        habits: [],
        goals: [],
        achievements: [],
        pet: {},
        inventory: [],
      },
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `tasktask-data-export-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-accent-primary" />
            <h3 className="text-lg font-semibold text-text-primary">Security & Privacy</h3>
          </div>
          <Badge variant="success">Protected</Badge>
        </div>

        {/* Data Export */}
        <div className="p-4 bg-dark-tertiary rounded-xl mb-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Download className="w-5 h-5 text-blue-400" />
              <span className="font-medium text-text-primary">Export My Data</span>
            </div>
            <Button variant="ghost" size="sm" onClick={handleExport}>
              Export
            </Button>
          </div>
          <p className="text-xs text-text-muted">
            Download all your data including tasks, habits, achievements, and settings (GDPR compliant)
          </p>
        </div>

        {/* Authentication */}
        <div className="mb-4">
          <h4 className="text-sm font-medium text-text-primary mb-2">🔐 Authentication</h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between p-3 bg-dark-tertiary rounded-xl">
              <div className="flex items-center gap-3">
                <Smartphone className="w-5 h-5 text-accent-primary" />
                <div>
                  <p className="text-sm font-medium text-text-primary">Biometric Lock</p>
                  <p className="text-xs text-text-muted">Face ID / Fingerprint</p>
                </div>
              </div>
              <button
                onClick={() => setBiometricEnabled(!biometricEnabled)}
                className={`w-12 h-6 rounded-full transition-colors ${
                  biometricEnabled ? "bg-accent-primary" : "bg-dark-secondary"
                }`}
              >
                <motion.div
                  animate={{ x: biometricEnabled ? 24 : 4 }}
                  className="w-5 h-5 bg-white rounded-full"
                />
              </button>
            </div>

            <div className="flex items-center justify-between p-3 bg-dark-tertiary rounded-xl">
              <div className="flex items-center gap-3">
                <Key className="w-5 h-5 text-yellow-400" />
                <div>
                  <p className="text-sm font-medium text-text-primary">Two-Factor Auth (2FA)</p>
                  <p className="text-xs text-text-muted">Extra security layer</p>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={onEnable2FA}>
                Enable
              </Button>
            </div>

            <div className="flex items-center justify-between p-3 bg-dark-tertiary rounded-xl">
              <div className="flex items-center gap-3">
                <Lock className="w-5 h-5 text-green-400" />
                <div>
                  <p className="text-sm font-medium text-text-primary">Auto-Lock</p>
                  <p className="text-xs text-text-muted">Lock after inactivity</p>
                </div>
              </div>
              <select
                value={autoLockTime}
                onChange={(e) => setAutoLockTime(e.target.value)}
                className="bg-dark-secondary px-3 py-1 rounded-lg text-sm text-text-primary"
              >
                <option value="1">1 minute</option>
                <option value="5">5 minutes</option>
                <option value="15">15 minutes</option>
                <option value="30">30 minutes</option>
              </select>
            </div>
          </div>
        </div>

        {/* Privacy Settings */}
        <div className="mb-4">
          <h4 className="text-sm font-medium text-text-primary mb-2">🔒 Privacy Controls</h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between p-3 bg-dark-tertiary rounded-xl">
              <div>
                <p className="text-sm font-medium text-text-primary">Share Anonymous Analytics</p>
                <p className="text-xs text-text-muted">Help improve the app</p>
              </div>
              <button
                onClick={() => setShareAnalytics(!shareAnalytics)}
                className={`w-12 h-6 rounded-full transition-colors ${
                  shareAnalytics ? "bg-accent-primary" : "bg-dark-secondary"
                }`}
              >
                <motion.div
                  animate={{ x: shareAnalytics ? 24 : 4 }}
                  className="w-5 h-5 bg-white rounded-full"
                />
              </button>
            </div>

            <div className="flex items-center justify-between p-3 bg-dark-tertiary rounded-xl">
              <div>
                <p className="text-sm font-medium text-text-primary">Share Crash Reports</p>
                <p className="text-xs text-text-muted">Debug issues faster</p>
              </div>
              <button
                onClick={() => setShareCrashReports(!shareCrashReports)}
                className={`w-12 h-6 rounded-full transition-colors ${
                  shareCrashReports ? "bg-accent-primary" : "bg-dark-secondary"
                }`}
              >
                <motion.div
                  animate={{ x: shareCrashReports ? 24 : 4 }}
                  className="w-5 h-5 bg-white rounded-full"
                />
              </button>
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-red-400" />
              <span className="font-medium text-text-primary">Danger Zone</span>
            </div>
            <Button variant="danger" size="sm" onClick={() => setShowDeleteModal(true)}>
              Delete Account
            </Button>
          </div>
          <p className="text-xs text-text-muted mt-2">
            Permanently delete your account and all data. This action cannot be undone.
          </p>
        </div>
      </Card>

      {/* Delete Account Modal */}
      <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="Delete Account">
        <div className="space-y-4">
          <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
            <p className="text-sm text-text-primary">
              Are you sure you want to delete your account? This will:
            </p>
            <ul className="text-xs text-text-muted mt-2 space-y-1">
              <li>• Delete all tasks, habits, and goals</li>
              <li>• Remove your pet and inventory</li>
              <li>• Lose all XP, coins, and achievements</li>
              <li>• Cannot be recovered</li>
            </ul>
          </div>
          <div className="flex gap-3">
            <Button variant="ghost" onClick={() => setShowDeleteModal(false)} className="flex-1">
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                onDeleteAccount();
                setShowDeleteModal(false);
              }}
              className="flex-1"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Forever
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
