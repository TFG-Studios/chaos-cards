import { useEffect, useMemo, useRef, useState } from "react";
import {
  isHost,
  myPlayer,
  useMultiplayerState,
  usePlayerState,
  usePlayersList,
} from "playroomkit";
import type { CardInstance, PlayerAction, PublicGameState, PlayerPrivateState } from "./types";
import { makeInitialPublicState, makePlayerSnapshot, makeStarterHand, drawCard, uid, damageWithModifiers, getModifier, knockAwayFrom, applyImpulse, nextPlayerHealth, makeModifier } from "./utils";
import { CARD_LIBRARY, MAX_HAND_SIZE } from "./cards";

const EMPTY_PRIVATE: PlayerPrivateState = { hand: [], selectedCardUid: null };

export function useGameSync() {
  const players = usePlayersList(true);
  const me = myPlayer();

  const [game, setGame] = useMultiplayerState<PublicGameState>(
    "chaos.game",
    makeInitialPublicState(),
  );

  const [privateState, setPrivateState] = usePlayerState<PlayerPrivateState>(
    me,
    "chaos.private",
    EMPTY_PRIVATE,
  );

  const [shake, setShake] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const hostTimer = useRef<number | null>(null);
  const lastInit = useRef("");

  const opponent = useMemo(
    () => players.find((player) => player.id !== me.id),
    [players, me.id],
  );

  const opponentSnapshot = opponent ? game.players[opponent.id] : undefined;
  const meSnapshot = game.players[me.id];

  useEffect(() => {
    if (!isHost()) return;
    if (players.length < 2) return;

    const key = players.map((p) => p.id).sort().join("|");
    if (lastInit.current === key && Object.keys(game.players).length === players.length) return;

    const nextPlayers = { ...game.players };
    for (const player of players.slice(0, 2)) {
      if (!nextPlayers[player.id]) {
        const profile = player.getProfile?.();
        nextPlayers[player.id] = makePlayerSnapshot(
          player.id,
          profile?.name || `Player ${Object.keys(nextPlayers).length + 1}`,
          String(
            profile?.color?.hex ??
              (Object.keys(nextPlayers).length === 0
                ? "#67e8f9"
                : "#fb7185")
          ),
        );
        player.setState("chaos.private", {
          hand: makeStarterHand(),
          selectedCardUid: null,
        } satisfies PlayerPrivateState);
        player.setState("chaos.pending", null);
      }
    }

    lastInit.current = key;
    setGame({
      ...game,
      phase: "combat",
      message: "Fight! Play a card. Four actions each ends the round.",
      players: nextPlayers,
    });
  }, [players, game, setGame]);

  useEffect(() => {
    const id = window.setInterval(() => {
      if (!isHost()) return;
      if (players.length < 2) return;
      if (game.phase !== "combat") return;

      const activePlayers = players.slice(0, 2);
      for (const actor of activePlayers) {
        const pending = actor.getState("chaos.pending") as PlayerAction | null | undefined;
        if (!pending) continue;
        actor.setState("chaos.pending", null);
        resolveAction(actor.id, pending.cardUid);
        break;
      }
    }, 80);

    hostTimer.current = id;
    return () => window.clearInterval(id);
    // The resolver intentionally closes over the latest state in the dependency list.
  }, [players, game]);

  function resolveAction(actorId: string, cardUid: string) {
    const actor = players.find((p) => p.id === actorId);
    const target = players.find((p) => p.id !== actorId);
    if (!actor || !target) return;

    const actorSnapshot = game.players[actorId];
    const targetSnapshot = game.players[target.id];
    if (!actorSnapshot || !targetSnapshot) return;
    if (actorSnapshot.actions >= game.maxActionsPerRound) return;

    const actorPrivate = (actor.getState("chaos.private") as PlayerPrivateState | null) ?? EMPTY_PRIVATE;
    const card = actorPrivate.hand.find((c) => c.uid === cardUid);
    if (!card) return;

    const nextHand = actorPrivate.hand.filter((c) => c.uid !== cardUid);
    const updatedHand = nextHand.length < MAX_HAND_SIZE ? drawCard(nextHand) : nextHand;
    actor.setState("chaos.private", { hand: updatedHand, selectedCardUid: null } satisfies PlayerPrivateState);

    const attackerMods = game.modifiers[actorId] ?? [];
    const defenderMods = game.modifiers[target.id] ?? [];
    let nextGame = structuredClone(game);
    nextGame.actionSerial += 1;

    const bumpAction = () => {
      nextGame.players[actorId] = {
        ...nextGame.players[actorId],
        actions: nextGame.players[actorId].actions + 1,
        lastImpulse: { x: 0, y: 0 },
      };
    };

    if (card.id === "bonk" || card.id === "haymaker") {
      const damage = damageWithModifiers(card.value, attackerMods, defenderMods);
      const hp = nextPlayerHealth(targetSnapshot.health, damage, targetSnapshot.shield);
      nextGame.players[target.id] = {
        ...targetSnapshot,
        health: hp.health,
        shield: hp.shield,
      };
      nextGame.message = `${actorSnapshot.name} landed ${card.name} for ${damage}!`;
      bumpAction();
    } else if (card.id === "guard" || card.id === "counter") {
      const boost = getModifier(attackerMods, "shield_boost") ? 1.5 : 1;
      const gain = Math.round(card.value * boost);
      nextGame.players[actorId] = {
        ...actorSnapshot,
        shield: Math.min(50, actorSnapshot.shield + gain),
        actions: actorSnapshot.actions + 1,
        lastImpulse: { x: 0, y: 0 },
      };
      nextGame.message = `${actorSnapshot.name} raised ${gain} shield.`;
    } else if (card.id === "medkit") {
      const tax = getModifier(attackerMods, "heal_tax") ? 0.5 : 1;
      const heal = Math.round(card.value * tax);
      nextGame.players[actorId] = {
        ...actorSnapshot,
        health: Math.min(100, actorSnapshot.health + heal),
        actions: actorSnapshot.actions + 1,
        lastImpulse: { x: 0, y: 0 },
      };
      nextGame.message = `${actorSnapshot.name} restored ${heal} HP.`;
    } else if (card.id === "spike" || card.id === "mine") {
      const hazardMultiplier = getModifier(attackerMods, "hazard_amplified") ? 1.5 : 1;
      const damage = damageWithModifiers(Math.round(card.value * hazardMultiplier), attackerMods.filter((m) => m.effect !== "double_damage"), defenderMods);
      const hp = nextPlayerHealth(targetSnapshot.health, damage, targetSnapshot.shield);
      const spikeCenter = {
        x: Math.max(-26, Math.min(26, targetSnapshot.position.x - (targetSnapshot.position.x >= 0 ? 10 : -10))),
        y: Math.max(-16, Math.min(16, targetSnapshot.position.y)),
      };
      const impulse = knockAwayFrom(spikeCenter, targetSnapshot.position, getModifier(attackerMods, "hazard_amplified") ? 14 : 9);
      nextGame.players[target.id] = {
        ...targetSnapshot,
        health: hp.health,
        shield: hp.shield,
        position: applyImpulse(targetSnapshot.position, impulse),
        lastImpulse: impulse,
      };
      nextGame.boardHazards = [...nextGame.boardHazards.slice(-5), {
        uid: uid("hazard"),
        cardId: card.id,
        x: spikeCenter.x,
        y: spikeCenter.y,
        damage,
        createdBy: actorId,
      }];
      nextGame.message = `${actorSnapshot.name} triggered ${card.name}! Knockback: ${Math.round(impulse.x)}, ${Math.round(impulse.y)}`;
      bumpAction();
    }

    nextGame.version += 1;

    const loser = Object.values(nextGame.players).find((p) => p.health <= 0);
    if (loser) {
      const winner = Object.values(nextGame.players).find((p) => p.id !== loser.id);
      nextGame.phase = "game_over";
      nextGame.winnerId = winner?.id ?? null;
      nextGame.message = `${winner?.name ?? "Opponent"} wins the match!`;
    } else {
      const bothSpent = Object.values(nextGame.players).slice(0, 2).every(
        (p) => p.actions >= nextGame.maxActionsPerRound,
      );
      if (bothSpent) {
        nextGame = startModifierDrop(nextGame);
      }
    }

    setGame(nextGame);
    setShake((value) => value + 1);
  }

  function startModifierDrop(state: PublicGameState): PublicGameState {
    const modifiers = { ...state.modifiers };
    for (const player of players.slice(0, 2)) {
      modifiers[player.id] = [makeModifier(state.round, "buff"), makeModifier(state.round, "debuff")];
    }

    return {
      ...state,
      phase: "modifier_drop",
      modifiers,
      dealtMarker: uid("deal"),
      message: "ROUND OVER — Fate deals new rules!",
    };
  }

  useEffect(() => {
    if (!isHost() || game.phase !== "modifier_drop") return;
    const timeout = window.setTimeout(() => {
      const next = structuredClone(game);
      next.round += 1;
      next.phase = "combat";
      next.boardHazards = [];
      next.message = `Round ${next.round}: new modifiers active.`;
      for (const player of players.slice(0, 2)) {
        const snap = next.players[player.id];
        if (!snap) continue;
        next.players[player.id] = {
          ...snap,
          actions: 0,
          position: { x: player.id === players[0].id ? -22 : 22, y: 0 },
          lastImpulse: { x: 0, y: 0 },
        };
      }
      setGame(next);
    }, 2300);

    return () => window.clearTimeout(timeout);
  }, [game.phase, game, players, setGame]);

  useEffect(() => {
    if (game.dealtMarker) setShake((value) => value + 1);
  }, [game.dealtMarker]);

  function playCard(card: CardInstance) {
    if (game.phase !== "combat") return;
    if (!opponent) return;
    if ((meSnapshot?.actions ?? 0) >= game.maxActionsPerRound) return;
    if (submitting) return;

    setSubmitting(true);
    const action: PlayerAction = {
      serial: game.actionSerial + 1,
      playerId: me.id,
      cardUid: card.uid,
      clientNonce: uid("action"),
    };
    me.setState("chaos.pending", action);

    window.setTimeout(() => setSubmitting(false), 300);
  }

  function rematch() {
    if (!isHost()) return;
    const next = makeInitialPublicState();
    const nextPlayers = { ...game.players };
    for (const player of players.slice(0, 2)) {
      nextPlayers[player.id] = {
        ...nextPlayers[player.id],
        actions: 0,
        health: 100,
        shield: 0,
        position: { x: player.id === players[0].id ? -22 : 22, y: 0 },
        lastImpulse: { x: 0, y: 0 },
      };
      player.setState("chaos.private", { hand: makeStarterHand(), selectedCardUid: null });
      player.setState("chaos.pending", null);
    }
    next.phase = "combat";
    next.message = "Rematch! Fight!";
    next.players = nextPlayers;
    setGame(next);
  }

  return {
    players,
    me,
    opponent,
    game,
    privateState: privateState ?? EMPTY_PRIVATE,
    meSnapshot,
    opponentSnapshot,
    playCard,
    rematch,
    roomCodeReady: players.length >= 1,
    shake,
    submitting,
  };
}
