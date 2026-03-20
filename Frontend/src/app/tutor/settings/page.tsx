"use client";

import React, { useEffect, useState } from "react";
import {
  getProfile, updateProfile, UserProfile, UpdateProfilePayload,
} from "@/services/userService";
import {
  updateTutorProfile, updateTutorAvailability, TutorProfilePayload,
} from "@/services/tutorService";
import { logout } from "@/services/authService";
import { useRouter } from "next/navigation";
import {
  UserCircle, Mail, Globe, MapPin, Banknote, Save, Loader2,
  AlertCircle, CheckCircle2, LogOut, ToggleLeft, ToggleRight,
} from "lucide-react";

export default function TutorSettingsPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toggling, setToggling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState<UpdateProfilePayload & TutorProfilePayload>({
    name: "",
    bio: "",
    experience: "",
    specialization: "",
    hourlyRate: 0,
    languages: [],
    teachingMode: "online",
  });

  useEffect(() => {
    getProfile()
      .then((p) => {
        setProfile(p);
        setForm({
          name: p.name,
          bio: p.bio ?? "",
          experience: p.experience ?? "",
          specialization: p.specialization ?? "",
        });
      })
      .catch(() => setError("Could not load profile."))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);
    try {
      const { name, bio, experience, specialization, ...tutorFields } = form;
      await Promise.all([
        updateProfile({ name, bio, experience, specialization }),
        updateTutorProfile(tutorFields),
      ]);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch {
      setError("Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleAvailabilityToggle = async () => {
    if (!profile) return;
    setToggling(true);
    try {
      const updated = await updateTutorAvailability(!profile.isTutorAvailable);
      setProfile((p) => p ? { ...p, isTutorAvailable: updated.isTutorAvailable } : p);
    } catch {
      setError("Could not update availability.");
    } finally {
      setToggling(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push("/auth/signin");
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-mozhi-primary" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8 py-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-600 dark:text-slate-600">
            Tutor Settings ⚙️
          </h2>
          <p className="mt-1 text-slate-600 dark:text-slate-600">Manage your public profile and availability.</p>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 dark:border-slate-200 dark:text-slate-600 dark:hover:border-red-900/50 dark:hover:bg-red-950/20 dark:hover:text-red-400"
        >
          <LogOut className="h-4 w-4" /> Sign Out
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-400">
          <AlertCircle className="h-5 w-5 shrink-0" /> {error}
        </div>
      )}
      {success && (
        <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/20 dark:text-emerald-400">
          <CheckCircle2 className="h-5 w-5 shrink-0" /> Profile saved!
        </div>
      )}

      {/* Availability Toggle */}
      <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-200 dark:bg-slate-50">
        <div>
          <p className="font-bold text-slate-600 dark:text-slate-600">Accepting Students</p>
          <p className="text-sm text-slate-600 dark:text-slate-600">
            {profile?.isTutorAvailable ? "You are visible in the Tutors directory." : "You are hidden from the Tutors directory."}
          </p>
        </div>
        <button
          onClick={handleAvailabilityToggle}
          disabled={toggling}
          className="transition-transform hover:scale-105 active:scale-95 disabled:opacity-50"
        >
          {profile?.isTutorAvailable ? (
            <ToggleRight className="h-10 w-10 text-emerald-500" />
          ) : (
            <ToggleLeft className="h-10 w-10 text-slate-600 dark:text-slate-600" />
          )}
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-6 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-200 dark:bg-slate-50">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-600 dark:text-slate-600 flex items-center gap-2">
            <UserCircle className="h-4 w-4" /> Display Name
          </label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm focus:border-mozhi-primary focus:bg-white focus:outline-none focus:ring-1 focus:ring-mozhi-primary dark:border-slate-200 dark:bg-slate-50 dark:text-slate-600"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-600 dark:text-slate-600 flex items-center gap-2">
            <Mail className="h-4 w-4" /> Email (read-only)
          </label>
          <input
            type="email"
            value={profile?.email ?? ""}
            disabled
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-600 cursor-not-allowed dark:border-slate-200 dark:bg-slate-900/50"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-600 dark:text-slate-600">Bio</label>
          <textarea
            rows={3}
            value={form.bio}
            onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
            placeholder="Tell students about yourself..."
            className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm focus:border-mozhi-primary focus:bg-white focus:outline-none focus:ring-1 focus:ring-mozhi-primary dark:border-slate-200 dark:bg-slate-50 dark:text-slate-600"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-600 dark:text-slate-600 flex items-center gap-2">
              <Globe className="h-4 w-4" /> Specialization
            </label>
            <input
              type="text"
              value={form.specialization}
              onChange={(e) => setForm((f) => ({ ...f, specialization: e.target.value }))}
              placeholder="e.g. Conversational Tamil"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm focus:border-mozhi-primary focus:bg-white focus:outline-none focus:ring-1 focus:ring-mozhi-primary dark:border-slate-200 dark:bg-slate-50 dark:text-slate-600"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-600 dark:text-slate-600 flex items-center gap-2">
              <Banknote className="h-4 w-4" /> Hourly Rate (XP)
            </label>
            <input
              type="number"
              value={form.hourlyRate ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, hourlyRate: Number(e.target.value) }))}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm focus:border-mozhi-primary focus:bg-white focus:outline-none focus:ring-1 focus:ring-mozhi-primary dark:border-slate-200 dark:bg-slate-50 dark:text-slate-600"
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 rounded-xl bg-mozhi-primary px-6 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-mozhi-primary disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}