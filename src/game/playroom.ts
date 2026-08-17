import { getRoomCode, insertCoin } from "playroomkit";

export async function createRoom() {
  await insertCoin({
    skipLobby: true,
    maxPlayersPerRoom: 2,
    reconnectGracePeriod: 15000,
  });
  return getRoomCode();
}

export async function joinRoom(roomCode: string) {
  await insertCoin({
    skipLobby: true,
    roomCode: roomCode.trim().toUpperCase(),
    maxPlayersPerRoom: 2,
    reconnectGracePeriod: 15000,
  });
  return getRoomCode();
}
