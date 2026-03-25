"use client";

import React, { useState } from "react";
import { X, Loader2, Globe, User, Phone, Hash, MessageSquare, CheckCircle2, AlertCircle } from "lucide-react";
import Button from "@/components/common/Button";
import { JoinRequestPayload } from "@/services/eventService";

interface RegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventTitle: string;
  eventId: string;
  onSubmit: (data: JoinRequestPayload) => Promise<void>;
}

export default function RegistrationModal({
  isOpen,
  onClose,
  eventTitle,
  eventId,
  onSubmit,
}: RegistrationModalProps) {
  const [formData, setFormData] = useState<JoinRequestPayload>({
    fullName: "",
    phoneNumber: "",
    country: "",
    age: 18,
    gender: "male",
    message: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "age" ? parseInt(value) || 0 : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await onSubmit(formData);
      setSuccess(true);
      // Wait a bit then close
      setTimeout(() => {
        setSuccess(false);
        onClose();
        // Reset form
        setFormData({
            fullName: "",
            phoneNumber: "",
            country: "",
            age: 18,
            gender: "male",
            message: "",
        });
      }, 2000);
    } catch (err: any) {
      setError(err?.response?.data?.error?.message || "Failed to submit registration. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-white/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl relative animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-soft/20 p-8 text-gray-800 relative border-b border-gray-100">
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 p-2 rounded-full bg-primary/10 hover:bg-primary/20 text-primary transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="inline-flex items-center justify-center px-4 py-1.5 rounded-full bg-primary/10 text-primary text-[10px] uppercase font-black tracking-widest mb-4">
            Event registration
          </div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight leading-tight text-gray-800">{eventTitle}</h2>
          <p className="text-gray-600 text-base mt-2 font-medium leading-relaxed">Please fill in your details to secure your spot at this event.</p>
        </div>

        {/* Form Body */}
        <div className="p-8">
          {success ? (
            <div className="flex flex-col items-center justify-center py-10 text-center scale-up-center">
              <div className="w-20 h-20 bg-success/10 text-success rounded-full flex items-center justify-center mb-6">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h3 className="text-xl md:text-2xl font-bold text-gray-800 mb-2">Registration Successful!</h3>
              <p className="text-gray-500">We've received your request. See you at the event!</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              
              {error && (
                <div className="p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 text-red-600 text-sm font-medium animate-in slide-in-from-top-2">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 gap-5">
                {/* Full Name */}
                <div className="space-y-1.5">
                  <label htmlFor="fullName" className="text-xs font-bold text-gray-600 tracking-tight flex items-center gap-2">
                    <User className="w-3.5 h-3.5 text-primary" /> Full name
                  </label>
                  <input
                    required
                    type="text"
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    className="w-full px-4 py-3 rounded-xl border border-gray-100 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none font-medium placeholder:text-gray-400"
                  />
                </div>

                {/* Country & Phone */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label htmlFor="country" className="text-xs font-bold text-gray-600 tracking-tight flex items-center gap-2">
                      <Globe className="w-3.5 h-3.5 text-primary" /> Country
                    </label>
                    <input
                      required
                      type="text"
                      id="country"
                      name="country"
                      value={formData.country}
                      onChange={handleChange}
                      placeholder="e.g. India, USA"
                      className="w-full px-4 py-3 rounded-xl border border-gray-100 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none font-medium placeholder:text-gray-400"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="phoneNumber" className="text-xs font-bold text-gray-600 tracking-tight flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-primary" /> Phone number
                    </label>
                    <input
                      required
                      type="tel"
                      id="phoneNumber"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleChange}
                      placeholder="e.g. +91 9876543210"
                      className="w-full px-4 py-3 rounded-xl border border-gray-100 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none font-medium placeholder:text-gray-400"
                    />
                  </div>
                </div>

                {/* Age & Gender */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label htmlFor="age" className="text-xs font-bold text-gray-600 tracking-tight flex items-center gap-2">
                      <Hash className="w-3.5 h-3.5 text-primary" /> Age
                    </label>
                    <input
                      required
                      type="number"
                      id="age"
                      name="age"
                      min="1"
                      max="120"
                      value={formData.age}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl border border-gray-100 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none font-medium"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="gender" className="text-xs font-bold text-gray-600 tracking-tight flex items-center gap-2">
                      <User className="w-3.5 h-3.5 text-primary" /> Gender
                    </label>
                    <select
                      required
                      id="gender"
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl border border-gray-100 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none font-medium appearance-none bg-white"
                    >
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                      <option value="prefer_not_to_say">Prefer not to say</option>
                    </select>
                  </div>
                </div>

                {/* Message */}
                <div className="space-y-1.5">
                  <label htmlFor="message" className="text-xs font-bold text-gray-600 tracking-tight flex items-center gap-2">
                    <MessageSquare className="w-3.5 h-3.5 text-primary" /> Message (optional)
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={2}
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Any special requests or questions?"
                    className="w-full px-4 py-3 rounded-xl border border-gray-100 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none font-medium placeholder:text-gray-400 resize-none"
                  />
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <Button
                  type="button"
                  onClick={onClose}
                  variant="ghost"
                  size="md"
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  isLoading={loading}
                  variant="primary"
                  size="md"
                  className="flex-[2]"
                >
                  Confirm Registration
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
