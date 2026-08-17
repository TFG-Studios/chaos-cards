import { motion } from "framer-motion";
import type { BoardHazard, PlayerSnapshot } from "../game/types";

function avatarStyle(color: string) { return { boxShadow: `0 0 0 6px ${color}10, 0 0 34px ${color}28`, borderColor: `${color}66` }; }

export default function Board({ me, opponent, hazards, phase, onScreenShake }: { me?: PlayerSnapshot; opponent?: PlayerSnapshot; hazards: BoardHazard[]; phase: string; onScreenShake: number }) {
  return <motion.section key={onScreenShake} animate={phase === "modifier_drop" ? { x: [0,-4,5,-3,0] } : undefined} transition={{ duration: .35 }} className="board-grid scanline relative min-h-[420px] overflow-hidden rounded-[36px] border border-white/10 bg-[#0c111b] shadow-[inset_0_0_100px_rgba(255,255,255,.025),0_30px_90px_rgba(0,0,0,.30)]">
    <div className="absolute left-1/2 top-1/2 h-44 w-44 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/8 bg-white/[.015]" />
    <div className="absolute left-1/2 top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/20 bg-white/5" />
    <div className="absolute left-1/2 top-1/2 h-px w-[72%] -translate-x-1/2 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
    <div className="absolute left-1/2 top-1/2 w-[72%] -translate-x-1/2 -translate-y-1/2 text-center text-[10px] font-bold uppercase tracking-[.35em] text-white/15">Central Arena</div>

    {hazards.map((hazard) => <motion.div key={hazard.uid} initial={{ scale: .1, opacity: 0, rotate: -25 }} animate={{ scale: 1, opacity: 1, rotate: 0 }} className="absolute z-20 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-amber-200/30 bg-amber-200/10 shadow-[0_0_35px_rgba(251,191,36,.18)]" style={{ left: `${50 + hazard.x}%`, top: `${50 + hazard.y}%` }}><span className="text-2xl">⚠</span><span className="absolute -bottom-5 text-[8px] font-bold uppercase tracking-[.18em] text-amber-200/60">{hazard.cardId}</span></motion.div>)}

    {me && <motion.div animate={{ left: `${50 + me.position.x}%`, top: `${50 + me.position.y}%` }} transition={{ type: "spring", stiffness: 170, damping: 16 }} className="absolute z-30 -ml-9 -mt-9 h-18 w-18">
      <div className="flex h-[72px] w-[72px] items-center justify-center rounded-full border bg-slate-950" style={avatarStyle(me.color)}><div className="flex h-12 w-12 items-center justify-center rounded-full text-lg font-black" style={{ backgroundColor: `${me.color}22`, color: me.color }}>{me.name.slice(0,1).toUpperCase()}</div></div>
    </motion.div>}
    {opponent && <motion.div animate={{ left: `${50 + opponent.position.x}%`, top: `${50 + opponent.position.y}%` }} transition={{ type: "spring", stiffness: 170, damping: 16 }} className="absolute z-30 -ml-9 -mt-9 h-18 w-18">
      <div className="flex h-[72px] w-[72px] items-center justify-center rounded-full border bg-slate-950" style={avatarStyle(opponent.color)}><div className="flex h-12 w-12 items-center justify-center rounded-full text-lg font-black" style={{ backgroundColor: `${opponent.color}22`, color: opponent.color }}>{opponent.name.slice(0,1).toUpperCase()}</div></div>
    </motion.div>}
  </motion.section>;
}
