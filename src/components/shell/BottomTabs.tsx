import React from "react";
import Link from "next/link";
import { ShellNavItem } from "./AppShell";

interface ShellBottomTabsProps {
  navItems: ShellNavItem[];
}

export const ShellBottomTabs: React.FC<ShellBottomTabsProps> = ({ navItems }) => (
  <nav className="shell__bottom-tabs">
    {navItems.slice(0, 5).map((item) => (
      <Link key={item.href} href={item.href} className="shell__tab" data-active={item.active}>
        <div aria-hidden>{item.icon}</div>
        <div>{item.label}</div>
      </Link>
    ))}
  </nav>
);
