import type { Metadata } from "next";
import SignupForm from "./SignupForm";

export const metadata: Metadata = {
  title: "Start Free Trial",
  description: "Create your Sushrusha account and start managing your pharmacy smarter. 14-day free trial, no credit card required.",
};

export default function SignupPage() {
  return <SignupForm />;
}
