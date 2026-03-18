import { useEffect } from "react";
import { createGame } from "../game/phaserGame";

export default function GameCanvas() {
  useEffect(() => {
    const game = createGame("game-container");
    window.gtag("event", "start_game");

    return () => game.destroy(true);
  }, []);

  return <div id="game-container" />;
}
