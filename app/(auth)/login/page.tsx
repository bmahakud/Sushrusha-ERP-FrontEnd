import type { Metadata } from "next";
import LoginForm from "./LoginForm";

export const metadata: Metadata = {
  title: "Log In",
  description: "Log in to your Sushrusha pharmacy management account.",
};

export default function LoginPage() {
  return <LoginForm />;
}
