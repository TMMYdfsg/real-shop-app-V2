import React from "react";
import Link from "next/link";
import { ShellNavItem } from "./AppShell";

interface ShellSidebarProps {
  title: string;
  navItems: ShellNavItem[];
}

export const ShellSidebar: React.FC<ShellSidebarProps> = ({ title, navItems }) => (
  <aside className="shell__sidebar">
    <div className="ui-stack">
      <div className="ui-title">{title}</div>
      <nav className="shell__nav">
        {navItems.map((item) => (
          <Link key={item.href} href={item.href} className="shell__nav-item" data-active={item.active}>
            <span aria-hidden>{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  </aside>
);
