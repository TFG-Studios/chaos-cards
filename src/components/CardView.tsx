import { motion } from "framer-motion";
import type { CardInstance } from "../game/types";

function tone(type: CardInstance["type"]) {
  if (type === "attack") return "from-rose-300/20 to-rose-500/5 border-rose-200/20";
  if (type === "defense") return "from-cyan-300/20 to-cyan-500/5 border-cyan-200/20";
  if (type === "hazard") return "from-amber-300/20 to-amber-500/5 border-amber-200/20";
  return "from-violet-300/20 to-violet-500/5 border-violet-200/20";
}

export default function CardView({ card, index, disabled, onPlay }: { card: CardInstance; index: number; disabled?: boolean; onPlay?: () => void }) {
  return <motion.button layout initial={{ opacity: 0, y: 40, scale: .88, rotate: (index % 2 ? 2 : -2) }} animate={{ opacity: 1, y: 0, scale: 1, rotate: 0 }} whileHover={!disabled ? { y: -18, scale: 1.04, rotate: 0 } : undefined} whileTap={!disabled ? { scale: .96 } : undefined} transition={{ type: "spring", stiffness: 210, damping: 18 }} onClick={onPlay} disabled={disabled} className={`relative aspect-[.72] w-[112px] shrink-0 overflow-hidden rounded-[24px] border bg-gradient-to-b p-4 text-left shadow-2xl transition ${tone(card.type)} ${disabled ? "cursor-not-allowed opacity-45" : "hover:brightness-125"}`}>
    <div className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full bg-black/20 text-sm font-black">{card.icon}</div>
    <div className="absolute bottom-0 left-0 h-20 w-20 rounded-full bg-white/5 blur-2xl" />
    <div className="relative flex h-full flex-col">
      <span className="text-[9px] font-black uppercase tracking-[.2em] text-slate-400">{card.type}</span>
      <h3 className="mt-2 text-lg font-black leading-5">{card.name}</h3>
      <div className="mt-auto">
        <div className="text-3xl font-black tracking-tight">{card.value}</div>
        <p className="mt-1 text-[9px] leading-4 text-slate-400">{card.description}</p>
      </div>
    </div>
  </motion.button>;
}
