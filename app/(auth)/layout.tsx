import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    template: "%s | Sushrusha",
    default: "Authentication | Sushrusha",
  },
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
