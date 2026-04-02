import { Metadata } from "next";
import SignInForm from "./SignInForm";

export const metadata: Metadata = {
  title: "Sign In - MozhiAruvi",
  description: "Sign in to continue your Tamil learning journey.",
};

import { Suspense } from "react";

export default function SignInPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <SignInForm />
    </Suspense>
  );
}

















