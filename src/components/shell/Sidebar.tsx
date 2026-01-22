import React from "react";
import Link from "next/link";
import { X } from "lucide-react";
import { ShellNavItem } from "./AppShell";

interface ShellSidebarProps {
  title: string;
  navItems: ShellNavItem[];
  isOpen?: boolean;
  onClose?: () => void;
}

export const ShellSidebar: React.FC<ShellSidebarProps> = ({ title, navItems, isOpen, onClose }) => (
  <aside className={`shell__sidebar ${isOpen ? 'shell__sidebar--open' : ''}`}>
    <div className="ui-stack">
      <div className="flex items-center justify-between">
        <div className="ui-title">{title}</div>
        <button className="shell__sidebar-close" onClick={onClose}>
          <X className="w-6 h-6" />
        </button>
      </div>
      <nav className="shell__nav">
        {navItems.map((item) => (
          <Link key={item.href} href={item.href} className="shell__nav-item" data-active={item.active} onClick={onClose}>
            <span aria-hidden>{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
    </div>
    {isOpen && <div className="shell__sidebar-overlay" onClick={onClose} />}
  </aside>
);
