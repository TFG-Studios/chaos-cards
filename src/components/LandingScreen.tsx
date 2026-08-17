import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { createRoom, joinRoom } from "../game/playroom";

interface LandingScreenProps { onConnected: (roomCode: string) => void; }

export default function LandingScreen({ onConnected }: LandingScreenProps) {
  const [roomCode, setRoomCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const match = window.location.hash.match(/(?:^|&)r=([^&]+)/i);
    if (match?.[1]) setRoomCode(decodeURIComponent(match[1]).toUpperCase());
  }, []);

  async function connect(kind: "create" | "join") {
    setBusy(true); setError("");
    try {
      const code = kind === "create" ? await createRoom() : await joinRoom(roomCode);
      onConnected(code);
    } catch (err) {
      console.error(err);
      setError("Could not connect to that room. Check the code and try again.");
    } finally { setBusy(false); }
  }

  return (
    <main className="min-h-screen bg-[#080b12] px-5 py-8 text-white">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-5xl items-center justify-center">
        <div className="grid w-full gap-8 lg:grid-cols-[1.05fr_.95fr]">
          <section className="flex flex-col justify-center px-2 py-8 lg:px-10">
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full border border-cyan-300/20 bg-cyan-300/10 text-sm font-black text-cyan-200">CC</div>
                <div><div className="text-xs font-semibold uppercase tracking-[.28em] text-slate-500">PvP Card Brawl</div><div className="text-sm font-semibold text-white/80">CHAOS CARDS</div></div>
              </div>
              <h1 className="max-w-xl text-5xl font-black leading-[.95] tracking-[-.05em] sm:text-7xl">Normal rules.<br /><span className="text-cyan-200">Absolutely not.</span></h1>
              <p className="mt-6 max-w-xl text-base leading-7 text-slate-400 sm:text-lg">A fast 1v1 card battler where every round ends with fate rewriting the rules.</p>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .1 }} className="mt-9 flex max-w-xl flex-wrap gap-3 text-xs text-slate-300">
              {['7-card max hand','4 actions / round','Hazard knockback','Forced buffs + debuffs'].map((x) => <span key={x} className="rounded-full border border-white/10 bg-white/[.04] px-4 py-2">{x}</span>)}
            </motion.div>
          </section>

          <motion.section initial={{ opacity: 0, scale: .97 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: "spring", stiffness: 180, damping: 18 }} className="glass relative overflow-hidden rounded-[32px] p-7 sm:p-9">
            <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-cyan-300/10 blur-3xl" />
            <div className="relative">
              <h2 className="text-2xl font-black">Enter the arena</h2>
              <p className="mt-2 text-sm text-slate-500">Create a room, then share the 4-letter code.</p>

              <button onClick={() => connect("create")} disabled={busy} className="mt-8 flex w-full items-center justify-between rounded-full bg-white px-6 py-4 font-bold text-black transition hover:bg-slate-200 disabled:opacity-50">
                <span>{busy ? "Connecting…" : "Create Room"}</span><span>↗</span>
              </button>

              <div className="my-6 flex items-center gap-4"><div className="h-px flex-1 bg-white/10" /><span className="text-[10px] font-bold uppercase tracking-[.25em] text-slate-600">or join</span><div className="h-px flex-1 bg-white/10" /></div>

              <div className="flex gap-3">
                <input value={roomCode} onChange={(e) => setRoomCode(e.target.value.replace(/[^a-z0-9]/gi, "").slice(0,4).toUpperCase())} placeholder="ABCD" className="min-w-0 flex-1 rounded-full border border-white/10 bg-white/[.04] px-5 py-4 font-mono font-bold tracking-[.25em] outline-none placeholder:text-slate-700 focus:border-cyan-300/50" />
                <button onClick={() => connect("join")} disabled={busy || roomCode.length < 4} className="rounded-full border border-white/10 bg-white/[.08] px-6 font-bold transition hover:bg-white/[.12] disabled:cursor-not-allowed disabled:opacity-30">Join</button>
              </div>

              {error && <p className="mt-4 text-sm text-rose-300">{error}</p>}
              <div className="mt-7 rounded-2xl border border-white/8 bg-black/10 p-4 text-xs leading-5 text-slate-500">Playroom handles the room connection and real-time synchronization; the game itself runs entirely in the browser.</div>
            </div>
          </motion.section>
        </div>
      </div>
    </main>
  );
}
