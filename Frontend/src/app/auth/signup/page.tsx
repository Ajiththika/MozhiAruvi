import { Metadata } from "next";
import { Suspense } from "react";
import SignUpForm from "./SignUpForm";

export const metadata: Metadata = {
  title: "Sign Up - MozhiAruvi",
  description: "Create your account to start your Tamil learning journey and master the heritage language.",
};

export default function SignUpPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center p-6 bg-slate-50">Loading...</div>}>
      <SignUpForm />
    </Suspense>
  );
}

















