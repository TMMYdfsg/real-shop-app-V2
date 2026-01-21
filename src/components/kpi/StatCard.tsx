import React from "react";
import { Card, CardContent } from "@/components/ui/Card";

interface StatCardProps {
  label: string;
  value: string;
  delta?: string;
  trend?: "up" | "down" | "flat";
  icon?: string;
}

export const StatCard: React.FC<StatCardProps> = ({ label, value, delta, trend = "flat", icon }) => (
  <Card>
    <CardContent>
      <div className="ui-stat">
        <div className="ui-inline">
          {icon ? <span aria-hidden>{icon}</span> : null}
          <span className="ui-stat__label">{label}</span>
        </div>
        <div className="ui-stat__value">{value}</div>
        {delta ? (
          <span className="ui-stat__delta" data-trend={trend}>
            {delta}
          </span>
        ) : null}
      </div>
    </CardContent>
  </Card>
);
