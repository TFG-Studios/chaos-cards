import { useState } from "react";
import LandingScreen from "./components/LandingScreen";
import GameScreen from "./components/GameScreen";

export default function App() {
  const [connected, setConnected] = useState(false);
  if (!connected) return <LandingScreen onConnected={() => setConnected(true)} />;
  return <GameScreen />;
}
