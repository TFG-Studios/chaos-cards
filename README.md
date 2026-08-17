# CHAOS CARDS

A browser-first 1v1 multiplayer card battler built with React + Vite + Tailwind CSS + Framer Motion + Playroom Kit.

## Features

- Custom Create Room / Join Room lobby using Playroom `roomCode`.
- Host-authoritative combat resolution.
- Standard attack, defense, utility and hazard cards.
- Spike Hazard knockback uses a normalized vector **away from the hazard center**.
- 4 actions per player per round.
- Automatic end-of-round modifier drop: one random buff + one random debuff per player.
- Dramatic modifier modal + screen shake.
- Hidden opponent hand UI.
- Health + shield UI.
- Responsive desktop/mobile layout.
- Rematch flow controlled by the host.

## Important networking note

This project uses Playroom Kit only, per the no-custom-backend requirement. The opponent hand is hidden in the UI, but a frontend-only game cannot provide cryptographic secrecy against a determined player using browser developer tools. For a serious competitive release, keep the deck/hand authoritative on a trusted server or redesign the information model.
