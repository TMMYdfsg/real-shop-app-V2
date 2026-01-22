import React from "react";
import { Menu } from "lucide-react";
import { PlayerIcon } from "@/components/ui/PlayerIcon";

interface ShellTopbarProps {
  title: string;
  titleIcon?: string;
  actions?: React.ReactNode;
  onMenuToggle?: () => void;
}

export const ShellTopbar: React.FC<ShellTopbarProps> = ({ title, titleIcon, actions, onMenuToggle }) => (
  <header className="shell__topbar glass sticky top-0 z-50 border-b border-white/20">
    <div className="shell__topbar-brand">
      <div className="ui-subtitle font-bold text-indigo-950 dark:text-indigo-50 flex items-center gap-2">
        {titleIcon ? (
          <PlayerIcon
            playerIcon={titleIcon}
            playerName={title}
            size={28}
            className="ring-2 ring-white/60 shadow-sm"
          />
        ) : null}
        <span>{title}</span>
      </div>
      <div className="ui-muted text-xs opacity-70">経済 × ライフの今日の進行状況</div>
    </div>
    <div className="shell__topbar-actions">
      <div className="ui-inline">{actions}</div>
      <button className="shell__menu-toggle lg:hidden p-2 rounded-xl bg-white/40 hover:bg-white/60 transition-all border border-white/40" onClick={onMenuToggle} aria-label="Menu">
        <Menu className="w-5 h-5 text-indigo-900" />
      </button>
    </div>
  </header>
);
