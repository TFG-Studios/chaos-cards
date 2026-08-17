export type CardType = "attack" | "defense" | "hazard" | "utility";
export type ModifierKind = "buff" | "debuff";
export type ModifierEffect =
  | "double_damage"
  | "fragile"
  | "hidden_health"
  | "shield_boost"
  | "hazard_amplified"
  | "heal_tax";

export interface CardDefinition {
  id: string;
  name: string;
  type: CardType;
  description: string;
  value: number;
  icon: string;
}

export interface CardInstance extends CardDefinition {
  uid: string;
}

export interface ModifierDefinition {
  id: string;
  name: string;
  kind: ModifierKind;
  effect: ModifierEffect;
  description: string;
  icon: string;
}

export interface ActiveModifier extends ModifierDefinition {
  uid: string;
  round: number;
}

export interface Vec2 {
  x: number;
  y: number;
}

export interface BoardHazard {
  uid: string;
  cardId: string;
  x: number;
  y: number;
  damage: number;
  createdBy: string;
}

export interface PlayerSnapshot {
  id: string;
  name: string;
  color: string;
  health: number;
  shield: number;
  actions: number;
  position: Vec2;
  lastImpulse: Vec2;
  connected: boolean;
  ready: boolean;
}

export type GamePhase = "waiting" | "combat" | "modifier_drop" | "game_over";

export interface PublicGameState {
  version: number;
  phase: GamePhase;
  round: number;
  maxActionsPerRound: number;
  actionSerial: number;
  winnerId: string | null;
  message: string;
  players: Record<string, PlayerSnapshot>;
  boardHazards: BoardHazard[];
  modifiers: Record<string, ActiveModifier[]>;
  dealtMarker: string;
}

export interface PlayerPrivateState {
  hand: CardInstance[];
  selectedCardUid: string | null;
}

export interface PlayerAction {
  serial: number;
  playerId: string;
  cardUid: string;
  clientNonce: string;
}
