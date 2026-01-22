import React from "react";
import { Menu } from "lucide-react";

interface ShellTopbarProps {
  title: string;
  actions?: React.ReactNode;
  onMenuToggle?: () => void;
}

export const ShellTopbar: React.FC<ShellTopbarProps> = ({ title, actions, onMenuToggle }) => (
  <header className="shell__topbar">
    <div className="shell__topbar-brand">
      <div className="ui-subtitle">{title}</div>
      <div className="ui-muted">経済 × ライフの今日の進行状況</div>
    </div>
    <div className="shell__topbar-actions">
      <div className="ui-inline">{actions}</div>
      <button className="shell__menu-toggle" onClick={onMenuToggle} aria-label="Menu">
        <Menu className="w-6 h-6" />
      </button>
    </div>
  </header>
);
