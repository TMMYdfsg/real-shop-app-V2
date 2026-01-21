import React from "react";

interface ShellTopbarProps {
  title: string;
  actions?: React.ReactNode;
}

export const ShellTopbar: React.FC<ShellTopbarProps> = ({ title, actions }) => (
  <header className="shell__topbar">
    <div>
      <div className="ui-subtitle">{title}</div>
      <div className="ui-muted">経済 × ライフの今日の進行状況</div>
    </div>
    <div className="ui-inline">{actions}</div>
  </header>
);
