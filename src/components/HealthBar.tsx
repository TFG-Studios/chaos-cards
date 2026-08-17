import { motion } from "framer-motion";

export default function HealthBar({ health, shield, hidden, align = "left" }: { health: number; shield: number; hidden?: boolean; align?: "left" | "right" }) {
  return <div className={`w-full max-w-md ${align === "right" ? "ml-auto" : ""}`}>
    <div className={`mb-2 flex items-end justify-between text-[10px] font-bold uppercase tracking-[.2em] ${hidden ? "text-slate-600" : "text-slate-500"}`}>
      <span>Vitality</span><span className="font-mono">{hidden ? "??" : `${Math.ceil(health)} HP`}{shield > 0 ? ` + ${shield} SH` : ""}</span>
    </div>
    <div className="h-3 overflow-hidden rounded-full bg-white/[.06] ring-1 ring-inset ring-white/10">
      <motion.div animate={{ width: `${Math.max(0, Math.min(100, health))}%` }} transition={{ type: "spring", stiffness: 120, damping: 20 }} className="h-full rounded-full bg-gradient-to-r from-cyan-300 via-cyan-200 to-white" />
    </div>
    {shield > 0 && <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-white/[.04]"><div style={{ width: `${Math.min(100, shield)}%` }} className="h-full rounded-full bg-violet-300" /></div>}
  </div>;
}
