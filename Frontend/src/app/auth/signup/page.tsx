import { Metadata } from "next";
import SignUpForm from "./SignUpForm";

export const metadata: Metadata = {
  title: "Sign Up - Mozhi Aruvi",
  description: "Create your account to start your Tamil learning journey with 50 free credits.",
};

export default function SignUpPage() {
  return <SignUpForm />;
}

