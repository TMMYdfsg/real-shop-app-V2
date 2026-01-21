import React from "react";
import { ShellSidebar } from "./Sidebar";
import { ShellTopbar } from "./Topbar";
import { ShellBottomTabs } from "./BottomTabs";

export interface ShellNavItem {
  label: string;
  href: string;
  icon?: string;
  active?: boolean;
}

interface AppShellProps {
  title: string;
  navItems: ShellNavItem[];
  children: React.ReactNode;
  actions?: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ title, navItems, children, actions }) => (
  <div className="shell">
    <ShellSidebar title={title} navItems={navItems} />
    <div className="shell__content">
      <ShellTopbar title={title} actions={actions} />
      <main className="shell__main">{children}</main>
    </div>
    <ShellBottomTabs navItems={navItems} />
  </div>
);
