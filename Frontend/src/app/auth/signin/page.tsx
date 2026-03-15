import { Metadata } from "next";
import SignInForm from "./SignInForm";

export const metadata: Metadata = {
  title: "Sign In - Mozhi Aruvi",
  description: "Sign in to continue your Tamil learning journey.",
};

export default function SignInPage() {
  return <SignInForm />;
}
