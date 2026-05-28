import { useState } from "react";
import { createPortal } from "react-dom";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { ScoreBreakdownItem } from "../types/resultTypes";
import { PHILOSOPHY_DEFINITIONS } from "./philosophyDefinitions";
import { Card } from "../../../shared/components/Card";

const CustomTick = (props: any) => {
  const { x, y, payload, onMouseEnter, onMouseLeave } = props;

  return (
    <g transform={`translate(${x},${y})`}>
      <text
        x={0}
        y={0}
        dy={16}
        textAnchor="end"
        fill="#666"
        transform="rotate(-35)"
        fontSize={12}
        className="cursor-help"
        onMouseEnter={(e) => onMouseEnter(payload.value, e)}
        onMouseLeave={onMouseLeave}
      >
        {payload.value}
      </text>
    </g>
  );
};

export function ScoreBarChart({ data }: { data: ScoreBreakdownItem[] }) {
  const [hoveredDef, setHoveredDef] = useState<{ x: number, y: number, name: string, def: any } | null>(null);

  const handleMouseEnter = (nameVi: string, e: React.MouseEvent) => {
    const item = data.find((d) => d.nameVi === nameVi);
    const def = item ? PHILOSOPHY_DEFINITIONS[item.key] : null;
    if (def) {
      const rect = (e.currentTarget as Element).getBoundingClientRect();
      setHoveredDef({
        x: rect.left + rect.width / 2,
        y: rect.top,
        name: nameVi,
        def,
      });
    }
  };

  const handleMouseLeave = () => {
    setHoveredDef(null);
  };

  return (
    <>
      <div className="h-80 rounded-lg border border-ink/10 bg-white p-4 shadow-soft">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 12, bottom: 62, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis 
              dataKey="nameVi" 
              interval={0} 
              tick={<CustomTick onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} />} 
            />
            <YAxis domain={[0, 100]} tickFormatter={(value) => `${value}%`} />
            <Tooltip formatter={(value) => [`${Math.round(Number(value))}%`, "Điểm"]} />
            <Bar dataKey="percentage" fill="#2EC4B6" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {hoveredDef && createPortal(
        <div 
          className="pointer-events-none fixed z-50 w-72 -translate-x-1/2 -translate-y-full pb-3"
          style={{ left: hoveredDef.x, top: hoveredDef.y }}
        >
          <Card className="shadow-xl">
            <h4 className="font-bold text-ink">{hoveredDef.name}</h4>
            <p className="mt-2 text-sm leading-relaxed text-ink/80">{hoveredDef.def.witty}</p>
          </Card>
        </div>,
        document.body
      )}
    </>
  );
}
