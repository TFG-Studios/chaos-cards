import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { getRoomCode, isHost } from "playroomkit";
import { useGameSync } from "../game/useGameSync";
import Board from "./Board";
import CardView from "./CardView";
import HealthBar from "./HealthBar";
import ModifierPill from "./ModifierPill";

export default function GameScreen() {
  const game = useGameSync();
  const [copied, setCopied] = useState(false);
  const [showRules, setShowRules] = useState(false);
  const [flash, setFlash] = useState(false);

  useEffect(() => {
    if (!game.shake) return;
    setFlash(true);
    const t = window.setTimeout(() => setFlash(false), 350);
    return () => window.clearTimeout(t);
  }, [game.shake]);

  const myMods = game.game.modifiers[game.me.id] ?? [];
  const enemyMods = game.opponent ? (game.game.modifiers[game.opponent.id] ?? []) : [];
  const enemyHidden = enemyMods.some((m) => m.effect === "hidden_health");

  const room = getRoomCode();
  const shareUrl = useMemo(() => {
    if (!room) return window.location.href;
    return `${window.location.origin}${window.location.pathname}#r=${room}`;
  }, [room]);

  async function copyInvite() {
    await navigator.clipboard?.writeText(shareUrl);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  return <main className={`min-h-screen bg-[#080b12] p-3 text-white sm:p-5 ${flash ? "animate-shake" : ""}`}>
    <div className="mx-auto flex max-w-[1500px] flex-col gap-3">
      <header className="glass flex flex-wrap items-center justify-between gap-3 rounded-[24px] px-4 py-3 sm:px-5">
        <div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[.05] text-xs font-black">CC</div><div><div className="text-[10px] font-bold uppercase tracking-[.22em] text-slate-500">CHAOS CARDS</div><div className="text-sm font-black">Round {game.game.round}</div></div></div>
        <div className="flex items-center gap-2"><span className="rounded-full border border-white/10 bg-black/15 px-3 py-2 font-mono text-xs tracking-[.25em] text-slate-300">{room || "----"}</span><button onClick={copyInvite} className="rounded-full border border-white/10 bg-white/[.06] px-4 py-2 text-xs font-bold hover:bg-white/[.10]">{copied ? "Copied" : "Invite"}</button><button onClick={() => setShowRules((v) => !v)} className="rounded-full border border-white/10 bg-white/[.06] px-4 py-2 text-xs font-bold hover:bg-white/[.10]">Rules</button></div>
      </header>

      <section className="grid gap-3 lg:grid-cols-[1fr_minmax(520px,1.8fr)_1fr] lg:items-stretch">
        <div className="glass order-1 rounded-[26px] p-5 lg:order-1">
          <div className="flex items-center justify-between gap-3"><div><div className="text-[10px] font-black uppercase tracking-[.22em] text-cyan-200/70">You</div><div className="mt-1 text-xl font-black">{game.meSnapshot?.name ?? "Player"}</div></div><div className="flex h-12 w-12 items-center justify-center rounded-full border text-sm font-black" style={{ color: game.meSnapshot?.color, borderColor: `${game.meSnapshot?.color}55`, background: `${game.meSnapshot?.color}12` }}>{game.meSnapshot?.name?.slice(0,1) ?? "P"}</div></div>
          <div className="mt-5"><HealthBar health={game.meSnapshot?.health ?? 100} shield={game.meSnapshot?.shield ?? 0} /></div>
          <div className="mt-4 flex flex-wrap gap-2">{myMods.map((m) => <ModifierPill key={m.uid} modifier={m} dramatic={game.game.phase === "modifier_drop"} />)}</div>
          <div className="mt-5 rounded-2xl border border-white/8 bg-black/10 p-4"><div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-[.2em] text-slate-600"><span>Actions</span><span>{game.meSnapshot?.actions ?? 0}/{game.game.maxActionsPerRound}</span></div><div className="mt-2 flex gap-1">{Array.from({ length: game.game.maxActionsPerRound }).map((_, i) => <div key={i} className={`h-2 flex-1 rounded-full ${i < (game.meSnapshot?.actions ?? 0) ? "bg-cyan-200" : "bg-white/8"}`} />)}</div></div>
        </div>

        <div className="order-3 lg:order-2"><Board me={game.meSnapshot} opponent={game.opponentSnapshot} hazards={game.game.boardHazards} phase={game.game.phase} onScreenShake={game.shake} /></div>

        <div className="glass order-2 rounded-[26px] p-5 lg:order-3 lg:text-right">
          <div className="flex items-center justify-between gap-3 lg:flex-row-reverse"><div><div className="text-[10px] font-black uppercase tracking-[.22em] text-rose-200/70">Opponent</div><div className="mt-1 text-xl font-black">{game.opponentSnapshot?.name ?? "Waiting"}</div></div><div className="flex h-12 w-12 items-center justify-center rounded-full border text-sm font-black" style={{ color: game.opponentSnapshot?.color ?? "#fb7185", borderColor: `${game.opponentSnapshot?.color ?? "#fb7185"}55`, background: `${game.opponentSnapshot?.color ?? "#fb7185"}12` }}>{game.opponentSnapshot?.name?.slice(0,1) ?? "?"}</div></div>
          <div className="mt-5"><HealthBar align="right" health={game.opponentSnapshot?.health ?? 100} shield={game.opponentSnapshot?.shield ?? 0} hidden={enemyHidden} /></div>
          <div className="mt-4 flex flex-wrap justify-end gap-2">{enemyMods.map((m) => <ModifierPill key={m.uid} modifier={m} dramatic={game.game.phase === "modifier_drop"} />)}</div>
          <div className="mt-5 rounded-2xl border border-white/8 bg-black/10 p-4"><div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-[.2em] text-slate-600"><span>Actions</span><span>{game.opponentSnapshot?.actions ?? 0}/{game.game.maxActionsPerRound}</span></div><div className="mt-2 flex gap-1">{Array.from({ length: game.game.maxActionsPerRound }).map((_, i) => <div key={i} className={`h-2 flex-1 rounded-full ${i < (game.opponentSnapshot?.actions ?? 0) ? "bg-rose-200" : "bg-white/8"}`} />)}</div></div>
        </div>
      </section>

      <section className="glass rounded-[28px] p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3"><div><div className="text-[10px] font-black uppercase tracking-[.24em] text-slate-600">Combat feed</div><motion.div key={game.game.actionSerial} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="mt-1 text-sm font-semibold text-slate-200">{game.game.message}</motion.div></div><div className="rounded-full border border-white/8 bg-black/10 px-3 py-2 text-[10px] font-bold uppercase tracking-[.2em] text-slate-600">{game.game.phase.replace("_", " ")}</div></div>

        <div className="mt-5 overflow-x-auto pb-2"><div className="flex min-w-max justify-center gap-3">
          <AnimatePresence>{game.privateState.hand.map((card, i) => <CardView key={card.uid} card={card} index={i} disabled={game.game.phase !== "combat" || !!game.game.winnerId || game.submitting || (game.meSnapshot?.actions ?? 0) >= game.game.maxActionsPerRound} onPlay={() => game.playCard(card)} />)}</AnimatePresence>
        </div></div>
      </section>

      <AnimatePresence>
        {game.game.phase === "modifier_drop" && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-5 backdrop-blur-md"><motion.div initial={{ y: 30, scale: .86, rotate: -2 }} animate={{ y: 0, scale: 1, rotate: 0 }} className="glass w-full max-w-3xl rounded-[34px] p-7 text-center shadow-[0_30px_120px_rgba(0,0,0,.55)]"><div className="text-[10px] font-black uppercase tracking-[.35em] text-cyan-200">Fate has decided</div><h2 className="mt-2 text-4xl font-black tracking-tight">New rules. No refunds.</h2><p className="mx-auto mt-3 max-w-xl text-sm text-slate-400">Two modifiers are forced onto every player for the next round: one buff and one debuff.</p><div className="mt-7 grid gap-3 sm:grid-cols-2">{myMods.map((m) => <div key={m.uid} className={`rounded-[24px] border p-5 text-left ${m.kind === "buff" ? "border-cyan-200/15 bg-cyan-200/[.05]" : "border-rose-200/15 bg-rose-200/[.05]"}`}><div className="text-3xl">{m.icon}</div><div className="mt-2 text-lg font-black">{m.name}</div><p className="mt-1 text-xs leading-5 text-slate-400">{m.description}</p></div>)}</div><p className="mt-6 text-[10px] font-bold uppercase tracking-[.25em] text-slate-600">Round {game.game.round + 1} starts automatically</p></motion.div></motion.div>}
      </AnimatePresence>

      <AnimatePresence>
        {game.game.phase === "game_over" && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-5 backdrop-blur-md"><motion.div initial={{ scale: .8, y: 20 }} animate={{ scale: 1, y: 0 }} className="glass w-full max-w-md rounded-[34px] p-8 text-center"><div className="text-[10px] font-black uppercase tracking-[.3em] text-slate-500">Match complete</div><h2 className="mt-3 text-5xl font-black">{game.game.winnerId === game.me.id ? "You win." : "You got cooked."}</h2><p className="mt-3 text-sm text-slate-400">{game.game.message}</p>{isHost() ? <button onClick={game.rematch} className="mt-7 w-full rounded-full bg-white px-6 py-4 font-bold text-black hover:bg-slate-200">Rematch</button> : <div className="mt-7 rounded-full border border-white/10 bg-white/[.04] px-5 py-4 text-xs font-bold text-slate-500">Waiting for the host to start a rematch…</div>}</motion.div></motion.div>}
      </AnimatePresence>

      <AnimatePresence>{showRules && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 p-5 backdrop-blur-sm" onClick={() => setShowRules(false)}><motion.div onClick={(e) => e.stopPropagation()} initial={{ y: 20 }} animate={{ y: 0 }} className="glass max-w-lg rounded-[30px] p-7"><div className="text-[10px] font-black uppercase tracking-[.25em] text-slate-600">Rules</div><h3 className="mt-2 text-2xl font-black">How to cause problems</h3><div className="mt-5 space-y-3 text-sm leading-6 text-slate-400"><p>• Each player gets 4 actions per round.</p><p>• Attack cards damage the opponent. Defense cards create shield.</p><p>• Spike Hazard immediately hits and pushes the opponent away from the hazard center using a normalized direction vector.</p><p>• When both players spend their actions, fate deals one random buff and one random debuff to each player.</p><p>• Reach 0 HP to lose.</p></div></motion.div></motion.div>}</AnimatePresence>
    </div>
  </main>;
}
