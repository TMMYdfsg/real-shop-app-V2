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
  <aside className={`shell__sidebar glass-dark ${isOpen ? 'shell__sidebar--open' : ''} border-r border-white/10`}>
    <div className="ui-stack h-full">
      <div className="flex items-center justify-between mb-8">
        <div className="ui-title text-white tracking-tight">{title}</div>
        <button className="lg:hidden p-2 text-white/60 hover:text-white" onClick={onClose}>
          <X className="w-6 h-6" />
        </button>
      </div>
      <nav className="shell__nav overflow-y-auto pr-2 custom-scrollbar">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="shell__nav-item group"
            data-active={item.active}
            onClick={onClose}
          >
            <span className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 group-hover:bg-primary/20 transition-colors" aria-hidden>{item.icon}</span>
            <span className="font-medium">{item.label}</span>
          </Link>
        ))}
      </nav>
    </div>
    {isOpen && <div className="shell__sidebar-overlay" onClick={onClose} />}
  </aside>
);
