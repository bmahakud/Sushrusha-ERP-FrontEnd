import type { Metadata } from "next";
import "./workspace.css";

export const metadata: Metadata = {
  title: {
    template: "%s | Sushrusa",
    default: "Workspace | Sushrusa",
  },
  robots: { index: false, follow: false },
};

export default function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
