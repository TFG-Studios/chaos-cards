import type { ActiveModifier, BoardHazard, CardInstance, PlayerSnapshot, Vec2 } from "./types";
import { CARD_LIBRARY, MODIFIER_LIBRARY, createCard, MAX_HAND_SIZE, MAX_HEALTH, STARTING_HAND_SIZE } from "./cards";

export function randomItem<T>(items: readonly T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

export function uid(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}_${Date.now().toString(36)}`;
}

export function makeStarterHand(): CardInstance[] {
  return Array.from({ length: STARTING_HAND_SIZE }, (_, i) => {
    const card = randomItem(CARD_LIBRARY);
    return createCard(card, uid(`card${i}`));
  });
}

export function drawCard(hand: CardInstance[]): CardInstance[] {
  if (hand.length >= MAX_HAND_SIZE) return hand;
  const card = randomItem(CARD_LIBRARY);
  return [...hand, createCard(card, uid("draw"))];
}

export function makePlayerSnapshot(id: string, name: string, color: string): PlayerSnapshot {
  return {
    id,
    name,
    color,
    health: MAX_HEALTH,
    shield: 0,
    actions: 0,
    position: { x: id.endsWith("0") ? -22 : 22, y: 0 },
    lastImpulse: { x: 0, y: 0 },
    connected: true,
    ready: false,
  };
}

export function getModifier(players: ActiveModifier[], effect: ActiveModifier["effect"]): ActiveModifier | undefined {
  return players.find((m) => m.effect === effect);
}

export function makeModifier(round: number, kind?: "buff" | "debuff"): ActiveModifier {
  const pool = kind ? MODIFIER_LIBRARY.filter((m) => m.kind === kind) : MODIFIER_LIBRARY;
  const modifier = randomItem(pool);
  return { ...modifier, uid: uid("mod"), round };
}

export function damageWithModifiers(
  baseDamage: number,
  attackerMods: ActiveModifier[],
  defenderMods: ActiveModifier[],
): number {
  let damage = baseDamage;
  if (getModifier(attackerMods, "double_damage")) damage *= 2;
  if (getModifier(defenderMods, "fragile")) damage *= 1.2;
  return Math.max(1, Math.round(damage));
}

export function knockAwayFrom(
  center: Vec2,
  target: Vec2,
  strength: number,
): Vec2 {
  const dx = target.x - center.x;
  const dy = target.y - center.y;
  const magnitude = Math.hypot(dx, dy);
  if (magnitude < 0.001) return { x: strength, y: 0 };

  return {
    x: (dx / magnitude) * strength,
    y: (dy / magnitude) * strength,
  };
}

export function clampPosition(position: Vec2): Vec2 {
  return {
    x: Math.max(-42, Math.min(42, position.x)),
    y: Math.max(-28, Math.min(28, position.y)),
  };
}

export function applyImpulse(position: Vec2, impulse: Vec2): Vec2 {
  return clampPosition({
    x: position.x + impulse.x,
    y: position.y + impulse.y,
  });
}

export function nextPlayerHealth(current: number, damage: number, shield: number) {
  const absorbed = Math.min(shield, damage);
  return {
    health: Math.max(0, current - (damage - absorbed)),
    shield: shield - absorbed,
  };
}

export function makeInitialPublicState(): import("./types").PublicGameState {
  return {
    version: 1,
    phase: "waiting",
    round: 1,
    maxActionsPerRound: 4,
    actionSerial: 0,
    winnerId: null,
    message: "Waiting for a second player…",
    players: {},
    boardHazards: [] as BoardHazard[],
    modifiers: {},
    dealtMarker: "",
  };
}
