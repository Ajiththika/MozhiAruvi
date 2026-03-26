"use client";

import React, { useState, useEffect, useRef } from "react";
import { UserCircle, Mail, MapPin, Phone, Hash, Save, AlertCircle, CheckCircle, Globe, Sparkles, Camera, Trash2, GraduationCap, Clock, ChevronDown, ChevronUp } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import Button from "@/components/common/Button";
import { getMyApplication, submitApplication, TeacherApplication, ApplicationPayload } from "@/services/teacherApplicationService";

function TutorApplicationSection() {
  const [application, setApplication] = useState<TeacherApplication | null>(null);
  const [appLoading, setAppLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const defaultForm: ApplicationPayload = {
    fullName: "", bio: "", experience: "", specialization: "",
    languages: [], hourlyRate: 0, schedule: "",
    teachingMode: "online", motivation: "",
  };
  const [form, setForm] = useState<ApplicationPayload>(defaultForm);

  useEffect(() => {
    getMyApplication()
      .then(setApplication)
      .catch(() => setApplication(null))
      .finally(() => setAppLoading(false));
  }, []);

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: name === "hourlyRate" ? parseFloat(value) || 0 : value,
    }));
  };

  const handleLanguagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, languages: e.target.value.split(",").map(l => l.trim()).filter(Boolean) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError(null);
    try {
      const result = await submitApplication(form);
      setApplication(result);
      setShowForm(false);
      setSubmitSuccess(true);
    } catch (err: any) {
      setSubmitError(err.response?.data?.error?.message || err.response?.data?.message || "Failed to submit application.");
    } finally {
      setSubmitting(false);
    }
  };

  const statusConfig = {
    pending: { bg: "bg-amber-50 border-amber-200", icon: <Clock className="h-5 w-5 text-amber-500" />, title: "Application Pending", desc: "Your application is under review. We'll notify you once a decision has been made.", badge: "bg-amber-100 text-amber-700" },
    approved: { bg: "bg-emerald-50 border-emerald-200", icon: <CheckCircle className="h-5 w-5 text-emerald-500" />, title: "Application Approved!", desc: "Congratulations! Your teacher role has been activated.", badge: "bg-emerald-100 text-emerald-700" },
    rejected: { bg: "bg-red-50 border-red-200", icon: <AlertCircle className="h-5 w-5 text-red-500" />, title: "Application Rejected", desc: "Unfortunately your application was not approved at this time.", badge: "bg-red-100 text-red-700" },
    needs_revision: { bg: "bg-orange-50 border-orange-200", icon: <AlertCircle className="h-5 w-5 text-orange-500" />, title: "Revision Required", desc: "The admin has requested changes to your application.", badge: "bg-orange-100 text-orange-700" },
  };

  const inputClass = "w-full rounded-xl border border-gray-100 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all  dark:bg-gray-800 dark:text-gray-200";
  const labelClass = "text-xs font-bold text-gray-500 tracking-tight ml-1";

  return (
    <div className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm  dark:bg-white/50">
      <div className="border-b border-gray-100 px-8 py-5  flex items-center justify-between">
        <h3 className="flex items-center gap-2.5 text-lg font-bold text-gray-800 dark:text-white">
          <GraduationCap className="h-5 w-5 text-secondary" />
          Become a Tutor
        </h3>
        {!application && !appLoading && (
          <button
            onClick={() => setShowForm(v => !v)}
            className="flex items-center gap-1.5 text-xs font-bold text-primary hover:underline"
          >
            {showForm ? <><ChevronUp size={14} /> Hide Form</> : <><ChevronDown size={14} /> Apply Now</>}
          </button>
        )}
      </div>

      <div className="p-6">
        {appLoading ? (
          <div className="flex items-center gap-3 text-gray-500 text-sm font-medium">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            Checking application status...
          </div>
        ) : application ? (
          <div className={`rounded-2xl border p-5 ${statusConfig[application.status]?.bg}`}>
            <div className="flex items-start gap-3">
              {statusConfig[application.status]?.icon}
              <div className="flex-1">
                <div className="flex items-center gap-3 flex-wrap">
                  <p className="font-bold text-gray-800">{statusConfig[application.status]?.title}</p>
                  <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${statusConfig[application.status]?.badge}`}>
                    {application.status.replace("_", " ")}
                  </span>
                </div>
                <p className="mt-1 text-sm text-gray-600">{statusConfig[application.status]?.desc}</p>
                {application.adminNotes && (
                  <div className="mt-3 rounded-xl bg-white/60 border border-white px-4 py-3 text-sm">
                    <p className="text-[10px] font-black uppercase tracking-wider text-gray-400 mb-1">Admin Notes</p>
                    <p className="text-gray-700 font-medium">{application.adminNotes}</p>
                  </div>
                )}
                {application.rejectionReason && (
                  <div className="mt-3 rounded-xl bg-white/60 border border-white px-4 py-3 text-sm">
                    <p className="text-[10px] font-black uppercase tracking-wider text-gray-400 mb-1">Rejection Reason</p>
                    <p className="text-gray-700 font-medium">{application.rejectionReason}</p>
                  </div>
                )}
                <p className="mt-3 text-[11px] text-gray-400 font-semibold">
                  Submitted: {new Date(application.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
                </p>
              </div>
            </div>
          </div>
        ) : submitSuccess ? (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-emerald-500 mt-0.5 shrink-0" />
            <div>
              <p className="font-bold text-emerald-800">Application submitted!</p>
              <p className="text-sm text-emerald-700 mt-1">Your application is now under review. We'll update you with the decision.</p>
            </div>
          </div>
        ) : !showForm ? (
          <div className="flex flex-col items-start gap-4">
            <p className="text-sm text-gray-600 font-medium max-w-lg">
              Share your knowledge of Tamil language and culture. Apply to become a verified tutor and connect with learners.
            </p>
            <Button variant="primary" size="md" onClick={() => setShowForm(true)}>
              Apply to Become a Tutor
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {submitError && (
              <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 font-semibold">
                <AlertCircle size={16} className="shrink-0" /> {submitError}
              </div>
            )}

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className={labelClass}>Full Name *</label>
                <input name="fullName" value={form.fullName} onChange={handleFormChange} required placeholder="Your display name" className={inputClass} />
              </div>
              <div className="space-y-1.5">
                <label className={labelClass}>Specialization *</label>
                <input name="specialization" value={form.specialization} onChange={handleFormChange} required placeholder="e.g. Tamil Grammar, Literature" className={inputClass} />
              </div>
              <div className="space-y-1.5">
                <label className={labelClass}>Experience *</label>
                <input name="experience" value={form.experience} onChange={handleFormChange} required placeholder="e.g. 5 years teaching Tamil" className={inputClass} />
              </div>
              <div className="space-y-1.5">
                <label className={labelClass}>Hourly Rate (USD) *</label>
                <input type="number" name="hourlyRate" min={0} value={form.hourlyRate || ""} onChange={handleFormChange} required placeholder="e.g. 25" className={inputClass} />
              </div>
              <div className="space-y-1.5">
                <label className={labelClass}>Languages (comma-separated) *</label>
                <input name="languages" value={form.languages.join(", ")} onChange={handleLanguagesChange} required placeholder="Tamil, English" className={inputClass} />
              </div>
              <div className="space-y-1.5">
                <label className={labelClass}>Teaching Mode *</label>
                <select name="teachingMode" value={form.teachingMode} onChange={handleFormChange} required className={inputClass}>
                  <option value="online">Online</option>
                  <option value="offline">Offline / In-person</option>
                  <option value="both">Both</option>
                </select>
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <label className={labelClass}>Availability / Schedule *</label>
                <input name="schedule" value={form.schedule} onChange={handleFormChange} required placeholder="e.g. Weekday evenings, Weekend mornings" className={inputClass} />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className={labelClass}>Short Bio *</label>
              <textarea name="bio" rows={3} value={form.bio} onChange={handleFormChange} required placeholder="Tell students about your teaching style and background..." className={`${inputClass} resize-none`} />
            </div>

            <div className="space-y-1.5">
              <label className={labelClass}>Motivation *</label>
              <textarea name="motivation" rows={3} value={form.motivation} onChange={handleFormChange} required placeholder="Why do you want to teach Tamil on this platform?" className={`${inputClass} resize-none`} />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <Button type="submit" isLoading={submitting} variant="primary" size="md">
                Submit Application
              </Button>
              <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default function StudentProfile() {
  const { user, setUser, isLoading: authLoading } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    phoneNumber: "",
    country: "",
    age: "",
    gender: "",
    bio: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        phoneNumber: user.phoneNumber || "",
        country: user.country || "",
        age: user.age ? String(user.age) : "",
        gender: user.gender || "",
        bio: user.bio || "",
      });
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("Image must be smaller than 2MB");
        return;
      }
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const removeSelectedFile = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const fd = new FormData();
      fd.append("name", formData.name);
      fd.append("phoneNumber", formData.phoneNumber);
      fd.append("country", formData.country);
      fd.append("age", formData.age);
      fd.append("gender", formData.gender);
      fd.append("bio", formData.bio);
      
      if (selectedFile) {
        fd.append("profilePhoto", selectedFile);
      }

      const res = await api.patch("/users/me", fd, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      
      setUser(res.data.user);
      setSelectedFile(null);
      setPreviewUrl(null);
      setMessage({ type: "success", text: "Profile updated successfully!" });
    } catch (error: any) {
      setMessage({ type: "error", text: error.response?.data?.message || "Failed to update profile." });
    } finally {
      setLoading(false);
    }
  };

  const handleDeactivate = async () => {
    if (window.confirm("Are you sure you want to deactivate your profile? This action will log you out.")) {
      try {
        await api.patch("/users/me/deactivate");
        window.location.href = "/";
      } catch (error) {
        alert("Failed to deactivate account.");
      }
    }
  };

  if (authLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        <p className="text-gray-500 font-medium font-sans">Fetching your profile details...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-8 text-center flex flex-col items-center gap-4">
        <AlertCircle className="h-12 w-12 text-red-400" />
        <p className="text-gray-600 font-medium">Session expired or unavailable. Please try signing in again.</p>
        <button 
          onClick={() => window.location.href = "/auth/signin"}
          className="bg-primary text-white px-6 py-2 rounded-lg font-bold"
        >
          Go to Sign In
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8 py-8 px-4 sm:px-6 lg:px-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header section with glassmorphism */}
      <div className="relative overflow-hidden rounded-3xl bg-white p-8 shadow-xl border border-gray-100 dark:bg-gray-800 ">
        <div className="absolute top-0 right-0 -m-8 h-64 w-64 rounded-full bg-primary/5 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -m-8 h-64 w-64 rounded-full bg-secondary/5 blur-3xl"></div>
        
        <div className="relative flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="group relative">
               <div 
                 onClick={triggerFileInput}
                 className="flex h-32 w-32 cursor-pointer items-center justify-center overflow-hidden rounded-2xl bg-gray-100 shadow-inner group-hover:shadow-md transition-all duration-300 relative border-2 border-transparent group-hover:border-primary/20"
               >
                  {(previewUrl || user.profilePhoto) ? (
                    <img src={previewUrl || user.profilePhoto || ""} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <UserCircle className="h-20 w-20 text-gray-300 group-hover:scale-110 transition-transform duration-500" />
                  )}
                  {/* Overlay on hover */}
                  <div className="absolute inset-0 bg-white/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera className="h-8 w-8 text-white" />
                  </div>
               </div>
               <input 
                 type="file" 
                 ref={fileInputRef} 
                 onChange={handleFileChange} 
                 accept="image/*" 
                 className="hidden" 
               />
               <div className="absolute -bottom-2 -right-2 rounded-xl bg-white p-1.5 shadow-lg border border-gray-100 dark:bg-slate-700 dark:border-slate-600">
                  <div className="h-4 w-4 rounded-full bg-emerald-500 ring-4 ring-emerald-50"></div>
               </div>
               
               {selectedFile && (
                  <button 
                    type="button"
                    onClick={removeSelectedFile}
                    className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full shadow-lg hover:bg-red-600 transition-colors"
                    title="Cancel selection"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
               )}
            </div>
            <div className="text-center md:text-left">
              <h2 className="text-3xl font-bold tracking-tight text-gray-800 dark:text-white">{user.name}</h2>
              <div className="mt-2 flex flex-wrap justify-center md:justify-start items-center gap-3">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary tracking-tight">
                  Student portal
                </span>
                <span className="flex items-center gap-1 text-sm font-medium text-gray-500">
                  <Mail className="h-3.5 w-3.5" /> {user.email}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block mr-2">
              <p className="text-[10px] font-bold text-gray-400 tracking-tight">Progress level</p>
              <p className="text-sm font-bold text-gray-700 dark:text-gray-200">{user?.level || 'Beginner'}</p>
            </div>
            <button 
              onClick={handleDeactivate}
              className="text-xs font-bold text-red-500 hover:text-red-700 px-4 py-2 hover:bg-red-50 rounded-xl transition-all border border-transparent hover:border-red-100 whitespace-nowrap"
            >
              Deactivate
            </button>
          </div>
        </div>
      </div>

      {message.text && (
        <div className={`p-4 rounded-2xl flex items-center gap-3 animate-in zoom-in-95 duration-300 ${message.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-100' : 'bg-red-50 text-red-800 border border-red-100'}`}>
          {message.type === 'success' ? <CheckCircle className="h-5 w-5 text-emerald-500" /> : <AlertCircle className="h-5 w-5 text-red-500" />}
          <p className="font-semibold text-sm">{message.text}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-8 lg:grid-cols-12">
         {/* Main content Area */}
         <div className="lg:col-span-8 space-y-8">
            <div className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm transition-all hover:shadow-md  dark:bg-white/50">
               <div className="border-b border-gray-100 px-8 py-5 ">
                  <h3 className="flex items-center gap-2.5 text-lg font-bold text-gray-800 dark:text-white">
                     <UserCircle className="h-5 w-5 text-secondary" /> 
                     Profile Information
                  </h3>
               </div>
               
               <div className="p-8 space-y-6">
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                     <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-500 tracking-tight ml-1">Full name</label>
                        <input 
                          type="text" 
                          name="name" 
                          value={formData.name} 
                          onChange={handleChange} 
                          required 
                          placeholder="Your display name"
                          className="w-full rounded-xl border border-gray-100 bg-white px-4 py-3 text-sm font-medium text-gray-700 outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all  dark:bg-gray-800 dark:text-gray-200" 
                        />
                     </div>
                     <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-500 tracking-tight ml-1">Account created</label>
                        <div className="w-full rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 text-sm font-bold text-gray-400  dark:bg-gray-800/50">
                          {new Date(user?.createdAt || "").toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </div>
                     </div>
                  </div>

                  <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-500 tracking-tight ml-1">Bio / About you</label>
                      <textarea 
                        name="bio" 
                        rows={5} 
                        value={formData.bio} 
                        onChange={handleChange} 
                        placeholder="Tell the community about your learning journey..."
                        className="w-full resize-none rounded-xl border border-gray-100 bg-white px-4 py-3 text-sm font-medium text-gray-700 outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all  dark:bg-gray-800 dark:text-gray-200"
                      ></textarea>
                  </div>
               </div>
            </div>

            <div className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm transition-all hover:shadow-md  dark:bg-white/50">
               <div className="border-b border-gray-100 px-8 py-5 ">
                  <h3 className="flex items-center gap-2.5 text-lg font-bold text-gray-800 dark:text-white">
                     <MapPin className="h-5 w-5 text-secondary" /> 
                     Contact & Location
                  </h3>
               </div>
               
               <div className="p-8 space-y-6">
                 <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div className="space-y-1.5">
                       <label className="text-xs font-bold text-gray-500 tracking-tight ml-1">Phone number</label>
                       <div className="relative group">
                          <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-primary transition-colors" />
                          <input type="tel" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} placeholder="+1 (555) 000-0000" className="w-full rounded-xl border border-gray-100 bg-white pl-12 pr-4 py-3 text-sm font-medium text-gray-700 outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all  dark:bg-gray-800 dark:text-gray-200" />
                       </div>
                    </div>
                    <div className="space-y-1.5">
                       <label className="text-xs font-bold text-gray-500 tracking-tight ml-1">Country</label>
                       <div className="relative group">
                          <Globe className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-primary transition-colors" />
                          <input type="text" name="country" value={formData.country} onChange={handleChange} placeholder="e.g. Canada" className="w-full rounded-xl border border-gray-100 bg-white pl-12 pr-4 py-3 text-sm font-medium text-gray-700 outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all  dark:bg-gray-800 dark:text-gray-200" />
                       </div>
                    </div>
                 </div>
               </div>
            </div>
         </div>

         {/* Sidebar Area */}
         <div className="lg:col-span-4 space-y-8">
            <div className="overflow-hidden rounded-3xl border border-gray-100 bg-white p-8 shadow-sm  dark:bg-white/50">
               <h4 className="text-xs font-bold text-gray-500 tracking-tight mb-6">Personal details</h4>
               
               <div className="space-y-6">
                  <div className="space-y-2">
                     <label className="text-xs font-bold text-gray-600 dark:text-gray-400">Age</label>
                     <div className="relative group">
                        <Hash className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input type="number" name="age" min="5" max="120" value={formData.age} onChange={handleChange} className="w-full rounded-xl border border-gray-100 bg-white pl-12 pr-4 py-3 text-sm font-bold text-gray-700 outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all  dark:bg-gray-800" />
                     </div>
                  </div>

                  <div className="space-y-2">
                     <label className="text-xs font-bold text-gray-600 dark:text-gray-400">Gender</label>
                     <select name="gender" value={formData.gender} onChange={handleChange} className="w-full rounded-xl border border-gray-100 bg-white px-4 py-3 text-sm font-bold text-gray-700 outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all  dark:bg-gray-800">
                        <option value="">Select Gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                        <option value="prefer_not_to_say">Prefer not to say</option>
                     </select>
                  </div>
               </div>
            </div>

            <div className="rounded-3xl bg-gradient-to-br from-primary to-primary-dark p-8 text-white shadow-xl shadow-primary/20">
               <div className="flex items-center gap-3 mb-4">
                  <div className="rounded-xl bg-white/20 p-2 backdrop-blur-md">
                     <Sparkles className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="font-bold">Student Stats</h4>
                    <p className="text-[10px] tracking-tight text-white/70">Performance summary</p>
                  </div>
               </div>
               
               <div className="grid grid-cols-2 gap-4 mt-6">
                  <div className="rounded-2xl bg-white/10 p-4 backdrop-blur-sm border border-white/10">
                    <p className="text-xs text-white/70 mb-1">XP Points</p>
                    <p className="text-2xl font-bold">{user?.xp || 0}</p>
                  </div>
                  <div className="rounded-2xl bg-white/10 p-4 backdrop-blur-sm border border-white/10">
                    <p className="text-xs text-white/70 mb-1">Credits</p>
                    <p className="text-2xl font-bold">{user?.credits || 0}</p>
                  </div>
               </div>

               <Button 
                 type="submit" 
                 isLoading={loading}
                 variant="outline"
                 size="xl"
                 className="mt-8 w-full bg-white text-primary border-none hover:bg-white/10 hover:text-white"
               >
                  {!loading && <Save className="h-5 w-5 mr-3" />}
                  {loading ? "Saving Changes..." : "Save My Profile"}
               </Button>
            </div>
         </div>
      </form>

      {/* Become a Tutor — only for role=user */}
      {user.role === "user" && <TutorApplicationSection />}
    </div>
  );
}

