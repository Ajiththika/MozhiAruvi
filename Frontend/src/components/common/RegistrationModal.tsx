"use client";

import React, { useState } from "react";
import { User, Phone, Globe, Hash, CheckCircle2 } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
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
    gender: "male" as any,
    message: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (e: any) => {
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
      setTimeout(() => {
        setSuccess(false);
        onClose();
        setFormData({
          fullName: "",
          phoneNumber: "",
          country: "",
          age: 18,
          gender: "male" as any,
          message: "",
        });
      }, 2000);
    } catch (err: any) {
      setError(err?.response?.data?.error?.message || "Failed to submit registration.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={eventTitle}
      description="Administrative Verification Required"
      size="md"
    >
      {success ? (
        <div className="flex flex-col items-center justify-center py-20 text-center animate-in zoom-in duration-500">
          <div className="w-24 h-24 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mb-8 border border-emerald-100 shadow-xl shadow-emerald-500/5">
            <CheckCircle2 className="w-12 h-12" />
          </div>
          <h3 className="text-3xl font-black text-text-primary mb-4 tracking-tight uppercase">RSVP Secured!</h3>
          <p className="text-text-secondary font-medium text-lg italic">The elders have received your request. Prepare for the gathering.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-8 py-4">
          <div className="space-y-6">
            <Input
              required
              label="Full Name"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="e.g. John Doe"
              icon={<User size={14} />}
              error={error && formData.fullName === "" ? error : undefined}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              <Input
                required
                label="Country"
                name="country"
                value={formData.country}
                onChange={handleChange}
                placeholder="e.g. India"
                icon={<Globe size={14} />}
              />
              <Input
                required
                label="Phone Number"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                placeholder="e.g. +91 98765 43210"
                icon={<Phone size={14} />}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              <Input
                required
                label="Age"
                type="number"
                name="age"
                value={formData.age}
                onChange={handleChange}
                icon={<Hash size={14} />}
              />
              <Input
                required
                label="Gender Identity"
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                icon={<User size={14} />}
                options={[
                  { label: "Male", value: "male" },
                  { label: "Female", value: "female" },
                  { label: "Other", value: "other" },
                  { label: "Prefer not to say", value: "prefer_not_to_say" },
                ]}
              />
            </div>

            <Input
              label="Additional Insights"
              name="message"
              multiline
              rows={3}
              value={formData.message}
              onChange={handleChange}
              placeholder="Any specific requests or context for the host?"
            />
          </div>

          <div className="pt-8 border-t border-border/40 flex flex-col-reverse sm:flex-row items-center justify-end gap-5">
            <Button
              variant="ghost"
              onClick={onClose}
              className="w-full sm:w-auto text-[10px] font-black tracking-widest uppercase hover:bg-error/5 hover:text-error"
            >
              Abort RSVP
            </Button>
            <Button
              type="submit"
              isLoading={loading}
              size="lg"
              className="w-full sm:w-auto px-12 shadow-2xl shadow-primary/20"
            >
              Confirm Registration
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
