"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { submitTutorApplication } from "@/services/tutorApplicationService";
// import { toast } from "react-hot-toast"; // Dependency removed to fix build error

export default function TutorApplicationPage() {
  const { user, setUser } = useAuth() as any;
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    languages: "", // handled as comma separated and converted
    experience: "",
    bio: "",
    availability: "",
    certifications: "",
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        name: user.name || "",
        email: user.email || "",
      }));

      // If they already have a tutor status, redirect them away
      if (user.tutorStatus === "pending" || user.tutorStatus === "approved" || user.tutorStatus === "rejected") {
        router.push("/tutor/apply/status");
      }
    }
  }, [user, router]);

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const languagesArray = formData.languages
        .split(",")
        .map((lang) => lang.trim())
        .filter((lang) => lang !== "");

      const submissionData = {
        ...formData,
        languages: languagesArray,
      };

      await submitTutorApplication(submissionData);
      
      // Update user state locally if possible
      if (user) {
        setUser({ 
            ...user, 
            tutorStatus: "pending" 
        });
      }

      alert("Application submitted successfully!");
      router.push("/tutor/apply/status");
    } catch (err: any) {
      const message = err.response?.data?.error?.message || "Failed to submit application. Please try again.";
      alert(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans">
      <Navbar />

      <main className="flex-1 w-full max-w-4xl mx-auto px-4 md:px-8 py-16">
        <div className="bg-white border border-slate-100 rounded-3xl shadow-sm p-8 md:p-12 transition-all">
          <div className="mb-10">
            <h1 className="text-3xl font-black text-slate-800 tracking-tight uppercase mb-2">Join as a Tutor</h1>
            <p className="text-slate-500 font-medium">Become a part of our heritage learning community and share your expertise.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Input
                label="Full Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your full name"
                required
              />
              <Input
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="email@example.com"
                required
                disabled // Auto-filled from user account
              />
              <Input
                label="Phone Number"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+123 456 7890"
                required
              />
              <Input
                label="Languages Spoken"
                name="languages"
                value={formData.languages}
                onChange={handleChange}
                placeholder="e.g. Tamil, English, French (comma separated)"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-primary/60 uppercase tracking-widest px-1">Short Bio</label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                placeholder="Tell us about yourself and your passion for teaching..."
                className="w-full min-h-[120px] rounded-2xl border border-slate-100 bg-white p-4 text-sm font-semibold text-slate-700 outline-none transition-all placeholder:text-primary/30 focus:border-primary focus:ring-4 focus:ring-primary/5"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-primary/60 uppercase tracking-widest px-1">Teaching Experience</label>
              <textarea
                name="experience"
                value={formData.experience}
                onChange={handleChange}
                placeholder="Summarize your teaching history and relevant expertise..."
                className="w-full min-h-[120px] rounded-2xl border border-slate-100 bg-white p-4 text-sm font-semibold text-slate-700 outline-none transition-all placeholder:text-primary/30 focus:border-primary focus:ring-4 focus:ring-primary/5"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Input
                label="Availability"
                name="availability"
                value={formData.availability}
                onChange={handleChange}
                placeholder="e.g. Weeknights after 6 PM, Weekends"
                required
              />
              <Input
                label="Certifications / Documents (Optional)"
                name="certifications"
                value={formData.certifications}
                onChange={handleChange}
                placeholder="Links to certificates or list your credentials"
              />
            </div>

            <div className="pt-6">
              <Button
                type="submit"
                isLoading={loading}
                className="w-full bg-primary text-white py-4 rounded-xl shadow-lg hover:scale-105 transition active:scale-95"
              >
                Submit Application
              </Button>
            </div>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
}
