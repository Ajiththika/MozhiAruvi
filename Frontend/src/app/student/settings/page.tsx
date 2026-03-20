"use client";

import React, { useEffect, useState } from "react";
import { getProfile, updateProfile, UserProfile, UpdateProfilePayload } from "@/services/userService";
import { logout } from "@/services/authService";
import { useRouter } from "next/navigation";
import { UserCircle, Mail, Save, Loader2, AlertCircle, CheckCircle2, LogOut } from "lucide-react";

export default function StudentSettingsPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState<UpdateProfilePayload>({ name: "", bio: "" });

  useEffect(() => {
    getProfile()
      .then((p) => {
        setProfile(p);
        setForm({ name: p.name, bio: p.bio ?? "" });
      })
      .catch(() => setError("Could not load profile."))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);
    try {
      const updated = await updateProfile(form);
      setProfile(updated);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch {
      setError("Failed to save profile. Please try again.");
    } finally {
      setSaving(false);
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
    <div className="mx-auto max-w-2xl space-y-10 py-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-600 dark:text-slate-600">
            Account Settings ⚙️
          </h2>
          <p className="mt-1 text-slate-600 dark:text-slate-600">Manage your profile information.</p>
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
          <CheckCircle2 className="h-5 w-5 shrink-0" /> Profile saved successfully!
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-200 dark:bg-slate-50">
        {/* Avatar */}
        <div className="flex items-center gap-4 pb-6 border-b border-slate-200 dark:border-slate-200">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-mozhi-light text-xl font-bold text-mozhi-primary dark:bg-mozhi-primary/20 dark:text-mozhi-secondary">
            {profile?.name?.charAt(0) ?? "?"}
          </div>
          <div>
            <p className="font-bold text-slate-600 dark:text-slate-600">{profile?.name}</p>
            <p className="text-sm text-slate-600 capitalize">{profile?.role === "user" ? "Student" : profile?.role}</p>
          </div>
        </div>

        {/* Name */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-600 dark:text-slate-600 flex items-center gap-2">
            <UserCircle className="h-4 w-4" /> Display Name
          </label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-600 focus:border-mozhi-primary focus:bg-white focus:outline-none focus:ring-1 focus:ring-mozhi-primary dark:border-slate-200 dark:bg-slate-50 dark:text-slate-600"
          />
        </div>

        {/* Email (read-only) */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-600 dark:text-slate-600 flex items-center gap-2">
            <Mail className="h-4 w-4" /> Email
          </label>
          <input
            type="email"
            value={profile?.email ?? ""}
            disabled
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-600 cursor-not-allowed dark:border-slate-200 dark:bg-slate-900/50"
          />
          <p className="text-xs text-slate-600">Email cannot be changed here.</p>
        </div>

        {/* Bio */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-600 dark:text-slate-600">Short Bio</label>
          <textarea
            rows={3}
            value={form.bio}
            onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
            placeholder="Tell the community a bit about yourself..."
            className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-600 focus:border-mozhi-primary focus:bg-white focus:outline-none focus:ring-1 focus:ring-mozhi-primary dark:border-slate-200 dark:bg-slate-50 dark:text-slate-600"
          />
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