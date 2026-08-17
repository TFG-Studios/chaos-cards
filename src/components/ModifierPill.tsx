import { motion } from "framer-motion";
import type { ActiveModifier } from "../game/types";

export default function ModifierPill({ modifier, dramatic = false }: { modifier: ActiveModifier; dramatic?: boolean }) {
  return <motion.div initial={{ opacity: 0, y: dramatic ? -26 : 0, scale: dramatic ? .78 : .95, rotate: dramatic ? -4 : 0 }} animate={{ opacity: 1, y: 0, scale: 1, rotate: 0 }} transition={{ type: "spring", stiffness: 190, damping: 16 }} className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-[10px] font-bold ${modifier.kind === "buff" ? "border-cyan-200/20 bg-cyan-200/8 text-cyan-100" : "border-rose-200/20 bg-rose-200/8 text-rose-100"} ${dramatic ? "shadow-[0_0_30px_rgba(255,255,255,.10)]" : ""}`} title={modifier.description}><span>{modifier.icon}</span><span>{modifier.name}</span></motion.div>;
}
