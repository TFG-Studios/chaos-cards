import type { CardDefinition, ModifierDefinition } from "./types";

export const STARTING_HAND_SIZE = 5;
export const MAX_HAND_SIZE = 7;
export const MAX_HEALTH = 100;

export const CARD_LIBRARY: CardDefinition[] = [
  {
    id: "bonk",
    name: "Bonk",
    type: "attack",
    description: "Deal 12 damage.",
    value: 12,
    icon: "↯",
  },
  {
    id: "haymaker",
    name: "Haymaker",
    type: "attack",
    description: "Deal 22 damage. Heavy but predictable.",
    value: 22,
    icon: "✦",
  },
  {
    id: "guard",
    name: "Guard",
    type: "defense",
    description: "Gain 18 shield. Shield blocks incoming damage.",
    value: 18,
    icon: "◉",
  },
  {
    id: "medkit",
    name: "Patch Up",
    type: "utility",
    description: "Restore 10 HP. Healing is reduced by Heal Tax.",
    value: 10,
    icon: "+",
  },
  {
    id: "spike",
    name: "Spike Hazard",
    type: "hazard",
    description: "Hit the opponent for 15 and knock them away from the spikes.",
    value: 15,
    icon: "⚠",
  },
  {
    id: "mine",
    name: "Shock Mine",
    type: "hazard",
    description: "Hit for 9 now and leave a dangerous board hazard.",
    value: 9,
    icon: "⊙",
  },
  {
    id: "counter",
    name: "Counter Shell",
    type: "defense",
    description: "Gain 9 shield and reflect 6 damage on the next hit.",
    value: 9,
    icon: "◇",
  },
];

export const MODIFIER_LIBRARY: ModifierDefinition[] = [
  {
    id: "bloodrush",
    name: "Blood Rush",
    kind: "buff",
    effect: "double_damage",
    description: "Your attack damage is doubled.",
    icon: "✹",
  },
  {
    id: "fortified",
    name: "Fortified",
    kind: "buff",
    effect: "shield_boost",
    description: "Your shields gain 50% extra strength.",
    icon: "⬡",
  },
  {
    id: "hazard_master",
    name: "Hazard Master",
    kind: "buff",
    effect: "hazard_amplified",
    description: "Hazard damage and knockback are increased.",
    icon: "⌁",
  },
  {
    id: "fragile",
    name: "Fragile",
    kind: "debuff",
    effect: "fragile",
    description: "You take 20% more incoming damage.",
    icon: "⌇",
  },
  {
    id: "fogged",
    name: "Blackout",
    kind: "debuff",
    effect: "hidden_health",
    description: "Your health display is hidden from the opponent.",
    icon: "●",
  },
  {
    id: "healtax",
    name: "Heal Tax",
    kind: "debuff",
    effect: "heal_tax",
    description: "Healing received is reduced by 50%.",
    icon: "≋",
  },
];

export function createCard(card: CardDefinition, uid: string): import("./types").CardInstance {
  return { ...card, uid };
}
